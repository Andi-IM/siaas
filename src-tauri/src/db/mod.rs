use sea_orm::{DatabaseConnection, SqlxSqliteConnector};
use sqlx::sqlite::{SqliteConnectOptions, SqliteJournalMode, SqlitePoolOptions, SqliteSynchronous};
use std::path::Path;
use std::str::FromStr;
use std::time::Duration;

pub mod entities;
pub mod migrations;
pub mod commands;
pub mod core;
pub mod error;

/// Establishes an async connection pool to the SQLite database file.
///
/// Uses SQLx's `SqliteConnectOptions` to configure WAL mode, foreign keys, and
/// synchronous mode at the **driver level** (per-connection), rather than as a
/// manual PRAGMA sent through the pool after creation.
///
/// This is critical because `PRAGMA journal_mode = WAL` requires **exclusive access**
/// (no other connections may be open). Sending it through a pool that already has
/// multiple idle connections causes (code: 5) "database is locked" errors.
/// By embedding WAL in `SqliteConnectOptions`, each connection sets it atomically
/// on open, which is safe and race-free.
pub async fn establish_connection(path: &Path) -> Result<DatabaseConnection, sea_orm::DbErr> {
    let path_str = path.to_string_lossy().replace("\\", "/");
    let url = format!("sqlite:{}", path_str);

    let connect_opts = SqliteConnectOptions::from_str(&url)
        .map_err(|e| sea_orm::DbErr::Conn(sea_orm::RuntimeErr::Internal(e.to_string())))?
        .journal_mode(SqliteJournalMode::Wal)
        .foreign_keys(true)
        .synchronous(SqliteSynchronous::Normal)
        .create_if_missing(false);

    let pool = SqlitePoolOptions::new()
        .max_connections(10)
        .min_connections(1)
        .acquire_timeout(Duration::from_secs(10))
        .idle_timeout(Duration::from_secs(10))
        .max_lifetime(Duration::from_secs(30))
        .connect_with(connect_opts)
        .await
        .map_err(|e| sea_orm::DbErr::Conn(sea_orm::RuntimeErr::Internal(e.to_string())))?;

    Ok(SqlxSqliteConnector::from_sqlx_sqlite_pool(pool))
}

/// Establishes an in-memory SQLite connection for testing.
pub async fn establish_in_memory_connection() -> Result<DatabaseConnection, sea_orm::DbErr> {
    let connect_opts = SqliteConnectOptions::from_str("sqlite::memory:")
        .map_err(|e| sea_orm::DbErr::Conn(sea_orm::RuntimeErr::Internal(e.to_string())))?
        .foreign_keys(true)
        .synchronous(SqliteSynchronous::Normal)
        .create_if_missing(true);

    let pool = SqlitePoolOptions::new()
        .max_connections(5)
        .connect_with(connect_opts)
        .await
        .map_err(|e| sea_orm::DbErr::Conn(sea_orm::RuntimeErr::Internal(e.to_string())))?;

    Ok(SqlxSqliteConnector::from_sqlx_sqlite_pool(pool))
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

    #[tokio::test]
    async fn test_establish_in_memory_connection() {
        let result = establish_in_memory_connection().await;
        assert!(result.is_ok(), "In-memory connection should succeed");
    }
}
