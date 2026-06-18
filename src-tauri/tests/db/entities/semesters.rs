use crate::db::setup_test_db;
use app_lib::db::entities::semesters;
use sea_orm::{ActiveModelTrait, EntityTrait, Set};

#[tokio::test]
async fn test_semesters_crud() {
    let db = setup_test_db().await;
    let id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Utc::now().to_rfc3339();

    // Create
    semesters::ActiveModel {
        id: Set(id.clone()),
        code: Set("SEM1".to_string()),
        name: Set("Semester 1".to_string()),
        sequence: Set(1),
        created_at: Set(now.clone()),
        updated_at: Set(now.clone()),
    }
    .insert(&db)
    .await
    .unwrap();

    // Read
    let semester = semesters::Entity::find_by_id(id.clone())
        .one(&db)
        .await
        .unwrap()
        .unwrap();
    assert_eq!(semester.code, "SEM1");
    assert_eq!(semester.sequence, 1);

    // Update
    let mut active: semesters::ActiveModel = semester.into();
    active.name = Set("Semester One".to_string());
    active.update(&db).await.unwrap();

    let updated = semesters::Entity::find_by_id(id.clone())
        .one(&db)
        .await
        .unwrap()
        .unwrap();
    assert_eq!(updated.name, "Semester One");

    // Delete
    semesters::Entity::delete_by_id(id.clone())
        .exec(&db)
        .await
        .unwrap();
    let deleted = semesters::Entity::find_by_id(id.clone())
        .one(&db)
        .await
        .unwrap();
    assert!(deleted.is_none());
}
