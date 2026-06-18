use crate::db::setup_test_db;
use app_lib::db::entities::subjects;
use sea_orm::{ActiveModelTrait, EntityTrait, Set};

#[tokio::test]
async fn test_subjects_crud() {
    let db = setup_test_db().await;
    let id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Utc::now().to_rfc3339();

    // Create
    subjects::ActiveModel {
        id: Set(id.clone()),
        code: Set("CS101".to_string()),
        name: Set("Introduction to Programming".to_string()),
        category: Set("Kelompok Umum".to_string()),
        status: Set("active".to_string()),
        transcript_group: Set("UMUM".to_string()),
        sequence: Set(1),
        created_at: Set(now.clone()),
        updated_at: Set(now.clone()),
    }
    .insert(&db)
    .await
    .unwrap();

    // Read
    let subject = subjects::Entity::find_by_id(id.clone())
        .one(&db)
        .await
        .unwrap()
        .unwrap();
    assert_eq!(subject.code, "CS101");

    // Update
    let mut active: subjects::ActiveModel = subject.into();
    active.name = Set("Intro to Programming".to_string());
    active.update(&db).await.unwrap();

    let updated = subjects::Entity::find_by_id(id.clone())
        .one(&db)
        .await
        .unwrap()
        .unwrap();
    assert_eq!(updated.name, "Intro to Programming");

    // Delete
    subjects::Entity::delete_by_id(id.clone())
        .exec(&db)
        .await
        .unwrap();
    let deleted = subjects::Entity::find_by_id(id.clone())
        .one(&db)
        .await
        .unwrap();
    assert!(deleted.is_none());
}
