use crate::db::setup_test_db;
use app_lib::db::entities::programs;
use sea_orm::{EntityTrait, ActiveModelTrait, Set};

#[tokio::test]
async fn test_programs_crud() {
    let db = setup_test_db().await;
    let id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Utc::now().to_rfc3339();

    // Create
    programs::ActiveModel {
        id: Set(id.clone()),
        name: Set("Teknik Mesin".to_string()),
        created_at: Set(now.clone()),
        updated_at: Set(now.clone()),
    }.insert(&db).await.unwrap();

    // Read
    let program = programs::Entity::find_by_id(id.clone()).one(&db).await.unwrap().unwrap();
    assert_eq!(program.name, "Teknik Mesin");

    // Update
    let mut active: programs::ActiveModel = program.into();
    active.name = Set("Teknik Mesin Updated".to_string());
    active.update(&db).await.unwrap();

    let updated = programs::Entity::find_by_id(id.clone()).one(&db).await.unwrap().unwrap();
    assert_eq!(updated.name, "Teknik Mesin Updated");

    // Delete
    programs::Entity::delete_by_id(id.clone()).exec(&db).await.unwrap();
    let deleted = programs::Entity::find_by_id(id.clone()).one(&db).await.unwrap();
    assert!(deleted.is_none());
}
