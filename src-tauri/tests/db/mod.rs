mod migrations;
mod entities;
mod commands;

use app_lib::db::establish_in_memory_connection;
use app_lib::db::migrations::MigrationManager;

pub async fn setup_test_db() -> sea_orm::DatabaseConnection {
    let db = establish_in_memory_connection().await.expect("Failed to create in-memory DB");
    let manager = MigrationManager::new();
    manager.run(&db).await.expect("Failed to run migrations");
    db
}

#[tokio::test]
async fn test_establish_connection_error() {
    let bad_path = std::path::Path::new("/invalid_dir/invalid.db");
    let result = app_lib::db::establish_connection(bad_path).await;
    
    assert!(result.is_err(), "Expected connection to fail with invalid path");
}
