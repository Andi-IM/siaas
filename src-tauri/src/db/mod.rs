use std::path::Path;
use std::sync::Arc;
use r2d2::{Pool, PooledConnection};
use r2d2_sqlite::SqliteConnectionManager;
use rusqlite::OpenFlags;

pub mod migrations;
pub mod models;
pub mod commands;

pub type DbConnection = PooledConnection<SqliteConnectionManager>;

#[derive(Clone)]
pub struct DatabasePool {
    pub pool: Arc<Pool<SqliteConnectionManager>>,
}

impl DatabasePool {
    /// Initializes a new SQLite database connection pool at the specified path.
    pub fn new(path: &Path) -> Result<Self, r2d2::Error> {
        let manager = SqliteConnectionManager::file(path)
            .with_flags(
                OpenFlags::SQLITE_OPEN_READ_WRITE
                | OpenFlags::SQLITE_OPEN_CREATE
                | OpenFlags::SQLITE_OPEN_NO_MUTEX
            )
            .with_init(|conn| {
                conn.execute_batch("
                    PRAGMA foreign_keys = ON;
                    PRAGMA journal_mode = WAL;
                    PRAGMA synchronous = NORMAL;
                    PRAGMA busy_timeout = 5000;
                    PRAGMA temp_store = MEMORY;
                    PRAGMA cache_size = -64000;
                ")
            });

        let pool = Pool::builder()
            .max_size(10)
            .min_idle(Some(2))
            .build(manager)?;

        Ok(Self {
            pool: Arc::new(pool),
        })
    }

    /// Initializes a new in-memory SQLite database connection pool, primarily for unit/integration testing.
    pub fn new_in_memory() -> Result<Self, r2d2::Error> {
        let manager = SqliteConnectionManager::memory()
            .with_flags(
                OpenFlags::SQLITE_OPEN_READ_WRITE
                | OpenFlags::SQLITE_OPEN_CREATE
                | OpenFlags::SQLITE_OPEN_NO_MUTEX
            )
            .with_init(|conn| {
                conn.execute_batch("
                    PRAGMA foreign_keys = ON;
                    PRAGMA journal_mode = WAL;
                    PRAGMA synchronous = NORMAL;
                    PRAGMA busy_timeout = 5000;
                    PRAGMA temp_store = MEMORY;
                    PRAGMA cache_size = -64000;
                ")
            });

        let pool = Pool::builder()
            .max_size(10)
            .min_idle(Some(2))
            .build(manager)?;

        Ok(Self {
            pool: Arc::new(pool),
        })
    }

    /// Retrieves a connection from the pool.
    pub fn get_conn(&self) -> Result<DbConnection, r2d2::Error> {
        self.pool.get()
    }
}
