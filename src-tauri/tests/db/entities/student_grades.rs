use crate::db::setup_test_db;
use app_lib::db::entities::{majors, batches, semesters, subjects, curriculum_subjects, students, student_grades};
use sea_orm::{EntityTrait, ActiveModelTrait, Set};

#[tokio::test]
async fn test_student_grades_crud() {
    let db = setup_test_db().await;
    let major_id = uuid::Uuid::new_v4().to_string();
    let batch_id = uuid::Uuid::new_v4().to_string();
    let semester_id = uuid::Uuid::new_v4().to_string();
    let subject_id = uuid::Uuid::new_v4().to_string();
    let cs_id = uuid::Uuid::new_v4().to_string();
    let student_id = uuid::Uuid::new_v4().to_string();
    let grade_id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Utc::now().to_rfc3339();

    // Setup dependencies (deep tree)
    majors::ActiveModel {
        id: Set(major_id.clone()), code: Set("TI".to_string()), name: Set("TI".to_string()), program_id: Set(None),
        created_at: Set(now.clone()), updated_at: Set(now.clone()),
    }.insert(&db).await.unwrap();

    batches::ActiveModel {
        id: Set(batch_id.clone()), year: Set(2026), created_at: Set(now.clone()), updated_at: Set(now.clone()),
    }.insert(&db).await.unwrap();

    semesters::ActiveModel {
        id: Set(semester_id.clone()), code: Set("S1".to_string()), name: Set("S1".to_string()), sequence: Set(1),
        created_at: Set(now.clone()), updated_at: Set(now.clone()),
    }.insert(&db).await.unwrap();

    subjects::ActiveModel {
        id: Set(subject_id.clone()), code: Set("C1".to_string()), name: Set("C1".to_string()), category: Set("G".to_string()),
        status: Set("active".to_string()), sequence: Set(1), created_at: Set(now.clone()), updated_at: Set(now.clone()),
    }.insert(&db).await.unwrap();

    curriculum_subjects::ActiveModel {
        id: Set(cs_id.clone()), major_id: Set(major_id.clone()), batch_id: Set(batch_id.clone()),
        semester_id: Set(semester_id.clone()), subject_id: Set(subject_id.clone()),
        created_at: Set(now.clone()), updated_at: Set(now.clone()),
    }.insert(&db).await.unwrap();

    students::ActiveModel {
        id: Set(student_id.clone()), major_id: Set(major_id.clone()), full_name: Set("J".to_string()),
        nis: Set("1".to_string()), nisn: Set("1".to_string()), created_at: Set(now.clone()), updated_at: Set(now.clone()),
        ..Default::default()
    }.insert(&db).await.unwrap();

    // Create
    student_grades::ActiveModel {
        id: Set(grade_id.clone()),
        student_id: Set(student_id.clone()),
        curriculum_subject_id: Set(cs_id.clone()),
        grade: Set(95.5),
        created_at: Set(now.clone()),
        updated_at: Set(now.clone()),
    }.insert(&db).await.unwrap();

    // Read
    let grade = student_grades::Entity::find_by_id(grade_id.clone()).one(&db).await.unwrap().unwrap();
    assert_eq!(grade.grade, 95.5);

    // Update
    let mut active: student_grades::ActiveModel = grade.into();
    active.grade = Set(100.0);
    active.update(&db).await.unwrap();

    let updated = student_grades::Entity::find_by_id(grade_id.clone()).one(&db).await.unwrap().unwrap();
    assert_eq!(updated.grade, 100.0);

    // Delete
    student_grades::Entity::delete_by_id(grade_id.clone()).exec(&db).await.unwrap();
    let deleted = student_grades::Entity::find_by_id(grade_id.clone()).one(&db).await.unwrap();
    assert!(deleted.is_none());
}
