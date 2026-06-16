use crate::db::setup_test_db;
use app_lib::db::entities::{majors, batches, semesters, subjects, curriculum_subjects};
use sea_orm::{EntityTrait, ActiveModelTrait, Set};

#[tokio::test]
async fn test_curriculum_subjects_crud() {
    let db = setup_test_db().await;
    let major_id = uuid::Uuid::new_v4().to_string();
    let batch_id = uuid::Uuid::new_v4().to_string();
    let semester_id = uuid::Uuid::new_v4().to_string();
    let subject_id = uuid::Uuid::new_v4().to_string();
    let cs_id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Utc::now().to_rfc3339();

    // Setup dependencies
    majors::ActiveModel {
        id: Set(major_id.clone()),
        code: Set("TI".to_string()),
        name: Set("Teknik Informatika".to_string()),
        program_id: Set(None),
        created_at: Set(now.clone()),
        updated_at: Set(now.clone()),
    }.insert(&db).await.unwrap();

    batches::ActiveModel {
        id: Set(batch_id.clone()),
        year: Set(2026),
        created_at: Set(now.clone()),
        updated_at: Set(now.clone()),
    }.insert(&db).await.unwrap();

    semesters::ActiveModel {
        id: Set(semester_id.clone()),
        code: Set("SEM1".to_string()),
        name: Set("Semester 1".to_string()),
        sequence: Set(1),
        created_at: Set(now.clone()),
        updated_at: Set(now.clone()),
    }.insert(&db).await.unwrap();

    subjects::ActiveModel {
        id: Set(subject_id.clone()),
        code: Set("CS101".to_string()),
        name: Set("Intro".to_string()),
        category: Set("General".to_string()),
        status: Set("active".to_string()),
        transcript_group: Set("UMUM".to_string()),
        sequence: Set(1),
        created_at: Set(now.clone()),
        updated_at: Set(now.clone()),
    }.insert(&db).await.unwrap();

    // Create
    curriculum_subjects::ActiveModel {
        id: Set(cs_id.clone()),
        major_id: Set(major_id.clone()),
        batch_id: Set(batch_id.clone()),
        semester_id: Set(semester_id.clone()),
        subject_id: Set(subject_id.clone()),
        created_at: Set(now.clone()),
        updated_at: Set(now.clone()),
    }.insert(&db).await.unwrap();

    // Read
    let cs = curriculum_subjects::Entity::find_by_id(cs_id.clone()).one(&db).await.unwrap().unwrap();
    assert_eq!(cs.major_id, major_id);

    // Delete
    curriculum_subjects::Entity::delete_by_id(cs_id.clone()).exec(&db).await.unwrap();
    let deleted = curriculum_subjects::Entity::find_by_id(cs_id.clone()).one(&db).await.unwrap();
    assert!(deleted.is_none());
}
