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

pub fn mock_state<'a, T: Send + Sync + 'static>(val: &'a T) -> tauri::State<'a, T> {
    unsafe { std::mem::transmute(val) }
}
