use crate::db::setup_test_db;
use app_lib::db::entities::majors;
use sea_orm::{ActiveModelTrait, EntityTrait, Set};

#[tokio::test]
async fn test_majors_crud() {
    let db = setup_test_db().await;
    let id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Utc::now().to_rfc3339();

    // Create
    majors::ActiveModel {
        id: Set(id.clone()),
        code: Set("TI".to_string()),
        name: Set("Teknik Informatika".to_string()),
        program_id: Set(None),
        created_at: Set(now.clone()),
        updated_at: Set(now.clone()),
    }
    .insert(&db)
    .await
    .unwrap();

    // Read
    let major = majors::Entity::find_by_id(id.clone())
        .one(&db)
        .await
        .unwrap()
        .unwrap();
    assert_eq!(major.code, "TI");
    assert_eq!(major.name, "Teknik Informatika");

    // Update
    let mut active: majors::ActiveModel = major.into();
    active.name = Set("TI Updated".to_string());
    active.update(&db).await.unwrap();

    let updated = majors::Entity::find_by_id(id.clone())
        .one(&db)
        .await
        .unwrap()
        .unwrap();
    assert_eq!(updated.name, "TI Updated");

    // Delete
    majors::Entity::delete_by_id(id.clone())
        .exec(&db)
        .await
        .unwrap();
    let deleted = majors::Entity::find_by_id(id.clone())
        .one(&db)
        .await
        .unwrap();
    assert!(deleted.is_none());
}
