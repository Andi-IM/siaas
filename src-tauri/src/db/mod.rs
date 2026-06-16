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
    
    // Execute SQLite configuration pragmas
    db.execute(Statement::from_string(DbBackend::Sqlite, "PRAGMA foreign_keys = ON;".to_string())).await?;
    db.execute(Statement::from_string(DbBackend::Sqlite, "PRAGMA journal_mode = WAL;".to_string())).await?;
    db.execute(Statement::from_string(DbBackend::Sqlite, "PRAGMA synchronous = NORMAL;".to_string())).await?;

    Ok(db)
}

/// Establishes an in-memory SQLite connection for testing and runs PRAGMAs.
pub async fn establish_in_memory_connection() -> Result<DatabaseConnection, sea_orm::DbErr> {
    let url = "sqlite::memory:";
    let db = Database::connect(url).await?;
    
    // Execute SQLite configuration pragmas
    db.execute(Statement::from_string(DbBackend::Sqlite, "PRAGMA foreign_keys = ON;".to_string())).await?;
    db.execute(Statement::from_string(DbBackend::Sqlite, "PRAGMA journal_mode = WAL;".to_string())).await?;
    db.execute(Statement::from_string(DbBackend::Sqlite, "PRAGMA synchronous = NORMAL;".to_string())).await?;

    Ok(db)
}
