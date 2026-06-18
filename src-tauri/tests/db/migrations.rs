use super::setup_test_db;
use sea_orm::{ConnectionTrait, DbBackend, Statement};

#[tokio::test]
async fn test_migrations_applied() {
    let db = setup_test_db().await;

    // Verify all tables defined in erdiagram.md + migration tracking are created
    let tables = vec![
        "majors",
        "batches",
        "semesters",
        "subjects",
        "students",
        "curriculum_subjects",
        "student_grades",
        "schema_migrations",
    ];

    for table in tables {
        let count_res = db
            .query_one(Statement::from_string(
                DbBackend::Sqlite,
                format!(
                    "SELECT count(*) as count FROM sqlite_master WHERE type='table' AND name='{}'",
                    table
                ),
            ))
            .await
            .unwrap();

        let count: i32 = count_res.unwrap().try_get("", "count").unwrap();
        assert_eq!(
            count, 1,
            "Table '{}' should exist in database schema",
            table
        );
    }
}

#[tokio::test]
async fn migration_rollback_should_succeed() {
    use app_lib::db::establish_in_memory_connection;
    use app_lib::db::migrations::MigrationManager;

    let db = establish_in_memory_connection().await.unwrap();
    let manager = MigrationManager::new();

    // Run first
    manager.run(&db).await.unwrap();

    // Then rollback
    let result = manager.rollback(&db, 0).await;
    assert!(result.is_ok());
}
