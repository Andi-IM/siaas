use sea_orm::{Database, DatabaseConnection, ConnectOptions, ConnectionTrait, Statement, DbBackend};
use std::path::Path;
use std::time::Duration;

pub mod entities;
pub mod migrations;
pub mod commands;
pub mod core;

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
