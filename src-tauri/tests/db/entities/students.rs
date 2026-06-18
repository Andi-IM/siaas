use crate::db::setup_test_db;
use app_lib::db::entities::{majors, students};
use sea_orm::{ActiveModelTrait, EntityTrait, Set};

#[tokio::test]
async fn test_students_crud() {
    let db = setup_test_db().await;
    let major_id = uuid::Uuid::new_v4().to_string();
    let student_id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Utc::now().to_rfc3339();

    // Setup Major dependency
    majors::ActiveModel {
        id: Set(major_id.clone()),
        code: Set("TI".to_string()),
        name: Set("Teknik Informatika".to_string()),
        program_id: Set(None),
        created_at: Set(now.clone()),
        updated_at: Set(now.clone()),
    }
    .insert(&db)
    .await
    .unwrap();

    // Create
    students::ActiveModel {
        id: Set(student_id.clone()),
        major_id: Set(major_id.clone()),
        full_name: Set("John Doe".to_string()),
        nis: Set("12345".to_string()),
        nisn: Set("9988776655".to_string()),
        place_of_birth: Set(Some("Jakarta".to_string())),
        date_of_birth: Set(Some("2010-05-15".to_string())),
        gender: Set(Some("M".to_string())),
        religion: Set(Some("Islam".to_string())),
        family_status: Set(Some("Anak Kandung".to_string())),
        child_order: Set(Some(1)),
        home_address: Set(Some("Sudirman St.".to_string())),
        telephone: Set(Some("08123456789".to_string())),
        previous_school: Set(Some("SMP 1 Jakarta".to_string())),
        admission_grade: Set(Some("X".to_string())),
        admission_date: Set(Some("2025-07-10".to_string())),
        father_name: Set(Some("Father Doe".to_string())),
        mother_name: Set(Some("Mother Doe".to_string())),
        parent_address: Set(Some("Sudirman St.".to_string())),
        father_occupation: Set(Some("Engineer".to_string())),
        mother_occupation: Set(Some("Teacher".to_string())),
        guardian_name: Set(None),
        guardian_address: Set(None),
        guardian_phone_number: Set(None),
        guardian_occupation: Set(None),
        diploma_number: Set(None),
        graduation_date: Set(None),
        created_at: Set(now.clone()),
        updated_at: Set(now.clone()),
    }
    .insert(&db)
    .await
    .unwrap();

    // Read
    let student = students::Entity::find_by_id(student_id.clone())
        .one(&db)
        .await
        .unwrap()
        .unwrap();
    assert_eq!(student.full_name, "John Doe");

    // Update
    let mut active: students::ActiveModel = student.into();
    active.full_name = Set("John Doe Updated".to_string());
    active.update(&db).await.unwrap();

    let updated = students::Entity::find_by_id(student_id.clone())
        .one(&db)
        .await
        .unwrap()
        .unwrap();
    assert_eq!(updated.full_name, "John Doe Updated");

    // Delete
    students::Entity::delete_by_id(student_id.clone())
        .exec(&db)
        .await
        .unwrap();
    let deleted = students::Entity::find_by_id(student_id.clone())
        .one(&db)
        .await
        .unwrap();
    assert!(deleted.is_none());
}
