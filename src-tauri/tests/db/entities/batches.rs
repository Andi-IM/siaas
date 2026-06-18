use crate::db::setup_test_db;
use app_lib::db::entities::batches;
use sea_orm::{ActiveModelTrait, EntityTrait, Set};

#[tokio::test]
async fn test_batches_crud() {
    let db = setup_test_db().await;
    let id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Utc::now().to_rfc3339();

    // Create
    batches::ActiveModel {
        id: Set(id.clone()),
        year: Set(2026),
        created_at: Set(now.clone()),
        updated_at: Set(now.clone()),
    }
    .insert(&db)
    .await
    .unwrap();

    // Read
    let batch = batches::Entity::find_by_id(id.clone())
        .one(&db)
        .await
        .unwrap()
        .unwrap();
    assert_eq!(batch.year, 2026);

    // Update
    let mut active: batches::ActiveModel = batch.into();
    active.year = Set(2027);
    active.update(&db).await.unwrap();

    let updated = batches::Entity::find_by_id(id.clone())
        .one(&db)
        .await
        .unwrap()
        .unwrap();
    assert_eq!(updated.year, 2027);

    // Delete
    batches::Entity::delete_by_id(id.clone())
        .exec(&db)
        .await
        .unwrap();
    let deleted = batches::Entity::find_by_id(id.clone())
        .one(&db)
        .await
        .unwrap();
    assert!(deleted.is_none());
}
