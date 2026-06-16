use super::setup_test_db;
use app_lib::db::entities::{majors, batches, semesters, subjects, students, curriculum_subjects, student_grades};
use sea_orm::{EntityTrait, ActiveModelTrait, Set, QueryFilter, ColumnTrait};

#[tokio::test]
async fn test_crud_operations() {
    let db = setup_test_db().await;

    let major_id = uuid::Uuid::new_v4().to_string();
    let batch_id = uuid::Uuid::new_v4().to_string();
    let semester_id = uuid::Uuid::new_v4().to_string();
    let subject_id = uuid::Uuid::new_v4().to_string();
    let student_id = uuid::Uuid::new_v4().to_string();
    let cs_id = uuid::Uuid::new_v4().to_string();
    let grade_id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Utc::now().to_rfc3339();

    // 1. CRUD: Majors
    majors::ActiveModel {
        id: Set(major_id.clone()),
        code: Set("TI".to_string()),
        name: Set("Teknik Informatika".to_string()),
        program_id: Set(None),
        created_at: Set(now.clone()),
        updated_at: Set(now.clone()),
    }.insert(&db).await.unwrap();

    let major = majors::Entity::find_by_id(major_id.clone()).one(&db).await.unwrap().unwrap();
    assert_eq!(major.code, "TI");
    assert_eq!(major.name, "Teknik Informatika");

    // 2. CRUD: Batches
    batches::ActiveModel {
        id: Set(batch_id.clone()),
        year: Set(2026),
        created_at: Set(now.clone()),
        updated_at: Set(now.clone()),
    }.insert(&db).await.unwrap();

    let batch = batches::Entity::find_by_id(batch_id.clone()).one(&db).await.unwrap().unwrap();
    assert_eq!(batch.year, 2026);

    // 3. CRUD: Semesters
    semesters::ActiveModel {
        id: Set(semester_id.clone()),
        code: Set("SEM1".to_string()),
        name: Set("Semester 1".to_string()),
        sequence: Set(1),
        created_at: Set(now.clone()),
        updated_at: Set(now.clone()),
    }.insert(&db).await.unwrap();

    let semester = semesters::Entity::find_by_id(semester_id.clone()).one(&db).await.unwrap().unwrap();
    assert_eq!(semester.code, "SEM1");
    assert_eq!(semester.sequence, 1);

    // 4. CRUD: Subjects
    subjects::ActiveModel {
        id: Set(subject_id.clone()),
        code: Set("CS101".to_string()),
        name: Set("Introduction to Programming".to_string()),
        category: Set("Kelompok Umum".to_string()),
        status: Set("active".to_string()),
        sequence: Set(1),
        created_at: Set(now.clone()),
        updated_at: Set(now.clone()),
    }.insert(&db).await.unwrap();

    let subject = subjects::Entity::find_by_id(subject_id.clone()).one(&db).await.unwrap().unwrap();
    assert_eq!(subject.code, "CS101");
    assert_eq!(subject.name, "Introduction to Programming");

    // 5. CRUD: Students
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
    }.insert(&db).await.unwrap();

    let student = students::Entity::find_by_id(student_id.clone()).one(&db).await.unwrap().unwrap();
    assert_eq!(student.full_name, "John Doe");
    assert_eq!(student.nis, "12345");
    assert_eq!(student.nisn, "9988776655");
    assert_eq!(student.place_of_birth, Some("Jakarta".to_string()));
    assert_eq!(student.date_of_birth, Some("2010-05-15".to_string()));

    // 6. CRUD: Curriculum Subjects
    curriculum_subjects::ActiveModel {
        id: Set(cs_id.clone()),
        major_id: Set(major_id.clone()),
        batch_id: Set(batch_id.clone()),
        semester_id: Set(semester_id.clone()),
        subject_id: Set(subject_id.clone()),
        created_at: Set(now.clone()),
        updated_at: Set(now.clone()),
    }.insert(&db).await.unwrap();

    let cs = curriculum_subjects::Entity::find_by_id(cs_id.clone()).one(&db).await.unwrap().unwrap();
    assert_eq!(cs.major_id, major_id);
    assert_eq!(cs.subject_id, subject_id);

    // 7. CRUD: Student Grades
    student_grades::ActiveModel {
        id: Set(grade_id.clone()),
        student_id: Set(student_id.clone()),
        curriculum_subject_id: Set(cs_id.clone()),
        grade: Set(95.5),
        created_at: Set(now.clone()),
        updated_at: Set(now.clone()),
    }.insert(&db).await.unwrap();

    let grade = student_grades::Entity::find_by_id(grade_id.clone()).one(&db).await.unwrap().unwrap();
    assert_eq!(grade.grade, 95.5);
    assert_eq!(grade.student_id, student_id);

    // 8. Update Student via SeaORM
    let mut active_student: students::ActiveModel = student.into();
    active_student.full_name = Set("John Doe Updated".to_string());
    active_student.update(&db).await.unwrap();

    let updated_student = students::Entity::find_by_id(student_id.clone()).one(&db).await.unwrap().unwrap();
    assert_eq!(updated_student.full_name, "John Doe Updated");

    // 9. Delete Student via SeaORM
    students::Entity::delete_by_id(student_id.clone()).exec(&db).await.unwrap();
    let deleted_student = students::Entity::find_by_id(student_id.clone()).one(&db).await.unwrap();
    assert!(deleted_student.is_none());
}

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
        name: Set("Intro Programming".to_string()),
        category: Set("Kelompok Umum".to_string()),
        status: Set("active".to_string()),
        sequence: Set(1),
        created_at: Set(now.clone()),
        updated_at: Set(now.clone()),
    }.insert(&db).await.unwrap();

    // Insert Student (referencing major_id)
    students::ActiveModel {
        id: Set(student_id.clone()),
        major_id: Set(major_id.clone()),
        full_name: Set("Jane Doe".to_string()),
        nis: Set("54321".to_string()),
        nisn: Set("1122334455".to_string()),
        place_of_birth: Set(None),
        date_of_birth: Set(None),
        gender: Set(None),
        religion: Set(None),
        family_status: Set(None),
        child_order: Set(None),
        home_address: Set(None),
        telephone: Set(None),
        previous_school: Set(None),
        admission_grade: Set(None),
        admission_date: Set(None),
        father_name: Set(None),
        mother_name: Set(None),
        parent_address: Set(None),
        father_occupation: Set(None),
        mother_occupation: Set(None),
        guardian_name: Set(None),
        guardian_address: Set(None),
        guardian_phone_number: Set(None),
        guardian_occupation: Set(None),
        diploma_number: Set(None),
        graduation_date: Set(None),
        created_at: Set(now.clone()),
        updated_at: Set(now.clone()),
    }.insert(&db).await.unwrap();

    // Insert Curriculum Subject
    curriculum_subjects::ActiveModel {
        id: Set(cs_id.clone()),
        major_id: Set(major_id.clone()),
        batch_id: Set(batch_id.clone()),
        semester_id: Set(semester_id.clone()),
        subject_id: Set(subject_id.clone()),
        created_at: Set(now.clone()),
        updated_at: Set(now.clone()),
    }.insert(&db).await.unwrap();

    // Verify RESTRICT constraint on majors.
    // Deleting major should FAIL because it is referenced by a student (RESTRICT).
    let delete_result = majors::Entity::delete_by_id(major_id.clone()).exec(&db).await;
    assert!(
        delete_result.is_err(),
        "Should not allow deleting a Major referenced by active Students (ON DELETE RESTRICT)"
    );

    // Verify CASCADE constraint on curriculum_subjects.
    // First, let's remove the student to resolve the restrict constraint on major
    students::Entity::delete_by_id(student_id.clone()).exec(&db).await.unwrap();

    // Now deleting the major should succeed
    majors::Entity::delete_by_id(major_id.clone()).exec(&db).await.unwrap();

    // Because of CASCADE, the curriculum_subjects record referencing that major should have been automatically deleted.
    let cs_opt = curriculum_subjects::Entity::find_by_id(cs_id.clone()).one(&db).await.unwrap();
    assert!(
        cs_opt.is_none(),
        "Curriculum subject should be deleted via cascade when its Major is deleted"
    );
}

#[tokio::test]
async fn test_sql_injection_prevention() {
    let db = setup_test_db().await;

    let major_id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Utc::now().to_rfc3339();

    majors::ActiveModel {
        id: Set(major_id.clone()),
        code: Set("TI".to_string()),
        name: Set("Teknik Informatika".to_string()),
        program_id: Set(None),
        created_at: Set(now.clone()),
        updated_at: Set(now.clone()),
    }.insert(&db).await.unwrap();

    // Malicious inputs attempting SQL Injection
    let malicious_id = "'; DROP TABLE majors; --";
    let malicious_nis = "12345'; DROP TABLE students; --";
    let malicious_nisn = "9999999999";

    // Attempt insert using SeaORM active models (which use parameterized queries)
    let insert_result = students::ActiveModel {
        id: Set(malicious_id.to_string()),
        major_id: Set(major_id.clone()),
        full_name: Set("Hacker Name".to_string()),
        nis: Set(malicious_nis.to_string()),
        nisn: Set(malicious_nisn.to_string()),
        place_of_birth: Set(None),
        date_of_birth: Set(None),
        gender: Set(None),
        religion: Set(None),
        family_status: Set(None),
        child_order: Set(None),
        home_address: Set(None),
        telephone: Set(None),
        previous_school: Set(None),
        admission_grade: Set(None),
        admission_date: Set(None),
        father_name: Set(None),
        mother_name: Set(None),
        parent_address: Set(None),
        father_occupation: Set(None),
        mother_occupation: Set(None),
        guardian_name: Set(None),
        guardian_address: Set(None),
        guardian_phone_number: Set(None),
        guardian_occupation: Set(None),
        diploma_number: Set(None),
        graduation_date: Set(None),
        created_at: Set(now.clone()),
        updated_at: Set(now.clone()),
    }.insert(&db).await;
    assert!(insert_result.is_ok(), "Parameterized insert should succeed even with malicious input characters");

    // Verify the majors table still exists and data remains intact
    let major_count = majors::Entity::find_by_id(major_id.clone()).one(&db).await.unwrap();
    assert!(major_count.is_some(), "Majors table was dropped or altered by SQL injection!");

    // Verify the student was inserted with the literal malicious values
    let inserted_student = students::Entity::find_by_id(malicious_id.to_string()).one(&db).await.unwrap().unwrap();
    assert_eq!(inserted_student.nis, malicious_nis, "Malicious characters were parsed or modified instead of treated as literal text");
}
