use sea_orm::{Database, DatabaseConnection, ConnectOptions, ConnectionTrait, Statement, DbBackend};
use std::path::Path;
use std::time::Duration;

pub mod entities;
pub mod migrations;
pub mod commands;
pub mod core;
pub mod error;

/// Establishes an async connection to the SQLite database file and executes PRAGMAs to enable WAL mode, foreign keys, and normal synchronous writes.
pub async fn establish_connection(path: &Path) -> Result<DatabaseConnection, sea_orm::DbErr> {
    let path_str = path.to_string_lossy().replace("\\", "/");
    let url = format!("sqlite:{}", path_str);

    let mut opt = ConnectOptions::new(url);
    opt.max_connections(10)
        .min_connections(2)
        .connect_timeout(Duration::from_secs(5))
        .acquire_timeout(Duration::from_secs(5))
        .idle_timeout(Duration::from_secs(5))
        .max_lifetime(Duration::from_secs(5));

    let db = Database::connect(opt).await?;
    configure_sqlite_pragmas(&db).await?;
    Ok(db)
}

/// Establishes an in-memory SQLite connection for testing and runs PRAGMAs.
pub async fn establish_in_memory_connection() -> Result<DatabaseConnection, sea_orm::DbErr> {
    let url = "sqlite::memory:";
    let db = Database::connect(url).await?;
    configure_sqlite_pragmas(&db).await?;
    Ok(db)
}

/// Executes common SQLite configuration pragmas (WAL mode, foreign keys, normal synchronous writes).
async fn configure_sqlite_pragmas(db: &DatabaseConnection) -> Result<(), sea_orm::DbErr> {
    db.execute(Statement::from_string(DbBackend::Sqlite, "PRAGMA foreign_keys = ON;".to_string())).await?;
    db.execute(Statement::from_string(DbBackend::Sqlite, "PRAGMA journal_mode = WAL;".to_string())).await?;
    db.execute(Statement::from_string(DbBackend::Sqlite, "PRAGMA synchronous = NORMAL;".to_string())).await?;
    Ok(())
}

/// Backups the database before running migrations, retaining the last 5 backups.
pub fn backup_database(db_path: &Path) -> std::io::Result<()> {
    if !db_path.exists() {
        return Ok(());
    }

    let backup_dir = db_path.parent().unwrap().join("backup");
    if !backup_dir.exists() {
        std::fs::create_dir_all(&backup_dir)?;
    }

    let timestamp = chrono::Local::now().format("%Y%m%d_%H%M%S");
    let backup_file_name = format!("sias_backup_{}.db", timestamp);
    let backup_path = backup_dir.join(backup_file_name);
    
    std::fs::copy(db_path, &backup_path)?;

    let mut backups: Vec<_> = std::fs::read_dir(&backup_dir)?
        .filter_map(Result::ok)
        .filter(|e| {
            let p = e.path();
            p.is_file() && p.file_name().unwrap_or_default().to_string_lossy().starts_with("sias_backup_")
        })
        .collect();

    backups.sort_by_key(|e| e.metadata().and_then(|m| m.modified()).ok());

    if backups.len() > 5 {
        for old_backup in backups.iter().take(backups.len() - 5) {
            let _ = std::fs::remove_file(old_backup.path());
        }
    }

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use sea_orm::{MockDatabase, DbErr};

    #[tokio::test]
    async fn test_configure_sqlite_pragmas_failure() {
        let db = MockDatabase::new(sea_orm::DatabaseBackend::Sqlite)
            .append_exec_errors(vec![
                DbErr::Query(sea_orm::RuntimeErr::Internal("Mocked failure".to_string()))
            ])
            .into_connection();

        let result = configure_sqlite_pragmas(&db).await;
        assert!(result.is_err());
    }
}
