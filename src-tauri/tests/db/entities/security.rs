use crate::db::setup_test_db;
use app_lib::db::entities::{batches, curriculum_subjects, majors, semesters, students, subjects};
use sea_orm::{ActiveModelTrait, EntityTrait, Set};

#[tokio::test]
async fn test_foreign_key_constraints() {
    let db = setup_test_db().await;

    let major_id = uuid::Uuid::new_v4().to_string();
    let batch_id = uuid::Uuid::new_v4().to_string();
    let semester_id = uuid::Uuid::new_v4().to_string();
    let subject_id = uuid::Uuid::new_v4().to_string();
    let student_id = uuid::Uuid::new_v4().to_string();
    let cs_id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Utc::now().to_rfc3339();

    // Populate lookup data
    majors::ActiveModel {
        id: Set(major_id.clone()),
        code: Set("TI".to_string()),
        name: Set("TI".to_string()),
        program_id: Set(None),
        created_at: Set(now.clone()),
        updated_at: Set(now.clone()),
    }
    .insert(&db)
    .await
    .unwrap();

    batches::ActiveModel {
        id: Set(batch_id.clone()),
        year: Set(2026),
        created_at: Set(now.clone()),
        updated_at: Set(now.clone()),
    }
    .insert(&db)
    .await
    .unwrap();

    semesters::ActiveModel {
        id: Set(semester_id.clone()),
        code: Set("S1".to_string()),
        name: Set("S1".to_string()),
        sequence: Set(1),
        created_at: Set(now.clone()),
        updated_at: Set(now.clone()),
    }
    .insert(&db)
    .await
    .unwrap();

    subjects::ActiveModel {
        id: Set(subject_id.clone()),
        code: Set("C1".to_string()),
        name: Set("C1".to_string()),
        category: Set("G".to_string()),
        status: Set("active".to_string()),
        transcript_group: Set("UMUM".to_string()),
        sequence: Set(1),
        created_at: Set(now.clone()),
        updated_at: Set(now.clone()),
    }
    .insert(&db)
    .await
    .unwrap();

    students::ActiveModel {
        id: Set(student_id.clone()),
        major_id: Set(major_id.clone()),
        full_name: Set("Jane".to_string()),
        nis: Set("54321".to_string()),
        nisn: Set("1122334455".to_string()),
        created_at: Set(now.clone()),
        updated_at: Set(now.clone()),
        ..Default::default()
    }
    .insert(&db)
    .await
    .unwrap();

    curriculum_subjects::ActiveModel {
        id: Set(cs_id.clone()),
        major_id: Set(major_id.clone()),
        batch_id: Set(batch_id.clone()),
        semester_id: Set(semester_id.clone()),
        subject_id: Set(subject_id.clone()),
        created_at: Set(now.clone()),
        updated_at: Set(now.clone()),
    }
    .insert(&db)
    .await
    .unwrap();

    // Verify RESTRICT constraint on majors
    let delete_result = majors::Entity::delete_by_id(major_id.clone())
        .exec(&db)
        .await;
    assert!(delete_result.is_err());

    // Verify CASCADE constraint
    students::Entity::delete_by_id(student_id.clone())
        .exec(&db)
        .await
        .unwrap();
    majors::Entity::delete_by_id(major_id.clone())
        .exec(&db)
        .await
        .unwrap();

    let cs_opt = curriculum_subjects::Entity::find_by_id(cs_id.clone())
        .one(&db)
        .await
        .unwrap();
    assert!(cs_opt.is_none());
}

#[tokio::test]
async fn test_sql_injection_prevention() {
    let db = setup_test_db().await;
    let major_id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Utc::now().to_rfc3339();

    majors::ActiveModel {
        id: Set(major_id.clone()),
        code: Set("TI".to_string()),
        name: Set("TI".to_string()),
        program_id: Set(None),
        created_at: Set(now.clone()),
        updated_at: Set(now.clone()),
    }
    .insert(&db)
    .await
    .unwrap();

    let malicious_id = "'; DROP TABLE majors; --";
    let malicious_nis = "12345'; DROP TABLE students; --";

    let insert_result = students::ActiveModel {
        id: Set(malicious_id.to_string()),
        major_id: Set(major_id.clone()),
        full_name: Set("H".to_string()),
        nis: Set(malicious_nis.to_string()),
        nisn: Set("999".to_string()),
        created_at: Set(now.clone()),
        updated_at: Set(now.clone()),
        ..Default::default()
    }
    .insert(&db)
    .await;
    assert!(insert_result.is_ok());

    let major_count = majors::Entity::find_by_id(major_id.clone())
        .one(&db)
        .await
        .unwrap();
    assert!(major_count.is_some());

    let inserted_student = students::Entity::find_by_id(malicious_id.to_string())
        .one(&db)
        .await
        .unwrap()
        .unwrap();
    assert_eq!(inserted_student.nis, malicious_nis);
}
