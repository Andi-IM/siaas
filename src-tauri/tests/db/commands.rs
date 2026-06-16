use super::setup_test_db;
use app_lib::db::core::*;
use app_lib::db::entities::{students, curriculum_subjects};
use sea_orm::{EntityTrait, QueryFilter, ColumnTrait};

// ==========================================
// PROGRAM TESTS
// ==========================================

#[tokio::test]
async fn program_lifecycle_should_work() {
    let db = setup_test_db().await;

    // Create
    let prog = create_program_core(&db, "Teknik Komputer")
        .await
        .expect("Failed to create program");
    assert_eq!(prog.name, "Teknik Komputer");

    // List
    let progs = get_programs_core(&db)
        .await
        .expect("Failed to get programs");
    assert!(!progs.is_empty());

    // Update
    let updated_prog = update_program_core(&db, &prog.id, "Teknik Komputer Updated")
        .await
        .expect("Failed to update program");
    assert_eq!(updated_prog.name, "Teknik Komputer Updated");

    // Delete
    let delete_res = delete_program_core(&db, &prog.id)
        .await
        .expect("Failed to delete program");
    assert!(delete_res);
}

#[tokio::test]
async fn duplicate_program_creation_should_fail() {
    let db = setup_test_db().await;
    
    create_program_core(&db, "Teknik Sipil").await.unwrap();
    let dup_prog = create_program_core(&db, "Teknik Sipil").await;
    
    assert!(dup_prog.is_err(), "Expected duplicate program creation to fail");
}

// ==========================================
// MAJOR TESTS
// ==========================================

#[tokio::test]
async fn major_lifecycle_should_work() {
    let db = setup_test_db().await;
    let prog = create_program_core(&db, "Program Test").await.unwrap();

    // Create
    let major = create_major_core(
        &db,
        "TK",
        "Teknik Komputer dan Jaringan",
        Some(prog.id.clone()),
    )
    .await
    .expect("Failed to create major");
    assert_eq!(major.code, "TK");

    // List
    let majors_list = get_majors_core(&db)
        .await
        .expect("Failed to get majors");
    assert!(!majors_list.is_empty());

    // Update
    let updated_major = update_major_core(
        &db,
        &major.id,
        "Teknik Komputer Jaringan",
        "TKJ",
        Some(prog.id),
    )
    .await
    .expect("Failed to update major");
    assert_eq!(updated_major.code, "TKJ");

    // Delete
    let delete_res = delete_major_core(&db, &major.id)
        .await
        .expect("Failed to delete major");
    assert!(delete_res);
}

// ==========================================
// BATCH & SEMESTER TESTS
// ==========================================

#[tokio::test]
async fn batch_and_semester_creation_should_work() {
    let db = setup_test_db().await;

    let batch = create_batch_core(&db, 2026)
        .await
        .expect("Failed to create batch");
    assert_eq!(batch.year, 2026);

    let semester = create_semester_core(&db, "SEM1", "Ganjil I", 1)
        .await
        .expect("Failed to create semester");
    assert_eq!(semester.sequence, 1);

    let semesters_list = get_semesters_core(&db)
        .await
        .expect("Failed to get semesters");
    assert_eq!(semesters_list.len(), 1);
}

// ==========================================
// SUBJECT TESTS
// ==========================================

#[tokio::test]
async fn subject_lifecycle_should_work() {
    let db = setup_test_db().await;

    // Create
    let subject = create_subject_core(
        &db,
        "MAT01",
        "Matematika Dasar",
        "Kelompok A",
        "active",
        1,
    )
    .await
    .expect("Failed to create subject");
    assert_eq!(subject.code, "MAT01");

    // Update
    let updated_subject = update_subject_core(
        &db,
        &subject.id,
        "Matematika Dasar Lanjut",
        "MAT01-U",
        "Kelompok A",
        "active",
        2,
    )
    .await
    .expect("Failed to update subject");
    assert_eq!(updated_subject.name, "Matematika Dasar Lanjut");

    // Delete
    let delete_res = delete_subject_core(&db, &subject.id)
        .await
        .expect("Failed to delete subject");
    assert!(delete_res);
}

// ==========================================
// STUDENT TESTS
// ==========================================

fn make_test_student_payload(major_id: String) -> students::Model {
    students::Model {
        id: String::new(),
        major_id,
        full_name: "Budi Santoso".to_string(),
        nis: "12345".to_string(),
        nisn: "0012345".to_string(),
        place_of_birth: Some("Jakarta".to_string()),
        date_of_birth: Some("2008-05-15".to_string()),
        gender: Some("L".to_string()),
        religion: Some("Islam".to_string()),
        family_status: Some("Anak Kandung".to_string()),
        child_order: Some(1),
        home_address: Some("Jl. Sudirman 10".to_string()),
        telephone: Some("0812345678".to_string()),
        previous_school: Some("SMPN 1".to_string()),
        admission_grade: Some("X".to_string()),
        admission_date: Some("2026-07-10".to_string()),
        father_name: Some("Father Budi".to_string()),
        mother_name: Some("Mother Budi".to_string()),
        parent_address: Some("Jl. Sudirman 10".to_string()),
        father_occupation: Some("Swasta".to_string()),
        mother_occupation: Some("PNS".to_string()),
        guardian_name: None,
        guardian_address: None,
        guardian_phone_number: None,
        guardian_occupation: None,
        diploma_number: None,
        graduation_date: None,
        created_at: String::new(),
        updated_at: String::new(),
    }
}

#[tokio::test]
async fn student_creation_should_succeed() {
    let db = setup_test_db().await;
    let major = create_major_core(&db, "M1", "Major 1", None).await.unwrap();
    let student_payload = make_test_student_payload(major.id);

    let created_student = create_student_core(&db, student_payload)
        .await
        .expect("Failed to create student");
    assert_eq!(created_student.full_name, "Budi Santoso");
    assert_eq!(created_student.nis, "12345");
}

#[tokio::test]
async fn student_update_should_succeed() {
    let db = setup_test_db().await;
    let major = create_major_core(&db, "M1", "Major 1", None).await.unwrap();
    let student_payload = make_test_student_payload(major.id);
    let created_student = create_student_core(&db, student_payload).await.unwrap();

    let mut update_payload = created_student.clone();
    update_payload.full_name = "Budi Santoso Updated".to_string();
    let updated_student = update_student_core(
        &db,
        &created_student.nis,
        update_payload,
    )
    .await
    .expect("Failed to update student");
    assert_eq!(updated_student.full_name, "Budi Santoso Updated");
}

#[tokio::test]
async fn student_deletion_should_succeed() {
    let db = setup_test_db().await;
    let major = create_major_core(&db, "M1", "Major 1", None).await.unwrap();
    let student_payload = make_test_student_payload(major.id);
    let created_student = create_student_core(&db, student_payload).await.unwrap();

    let delete_res = delete_student_core(&db, &created_student.nis)
        .await
        .expect("Failed to delete student");
    assert!(delete_res);
}

#[tokio::test]
async fn student_deletion_non_existent_should_return_false() {
    let db = setup_test_db().await;
    let not_found_delete = delete_student_core(&db, "invalid-nis").await;
    assert!(!not_found_delete.unwrap());
}

// ==========================================
// CURRICULUM & GRADE TESTS
// ==========================================

async fn setup_curriculum_and_grade_test_env(db: &sea_orm::DatabaseConnection) -> (
    app_lib::db::entities::majors::Model,
    app_lib::db::entities::batches::Model,
    app_lib::db::entities::semesters::Model,
    app_lib::db::entities::subjects::Model,
    students::Model
) {
    let prog = create_program_core(db, "P1").await.unwrap();
    let major = create_major_core(db, "M1", "Major 1", Some(prog.id)).await.unwrap();
    let batch = create_batch_core(db, 2024).await.unwrap();
    let semester = create_semester_core(db, "S1", "Sem 1", 1).await.unwrap();
    let subject = create_subject_core(db, "SUB1", "Subj 1", "A", "active", 1).await.unwrap();
    let student = create_student_core(db, students::Model {
        id: "".into(),
        nis: "S001".into(),
        full_name: "S1".into(),
        major_id: major.id.clone(),
        nisn: "".into(),
        place_of_birth: None,
        date_of_birth: None,
        gender: None,
        religion: None,
        family_status: None,
        child_order: None,
        home_address: None,
        telephone: None,
        previous_school: None,
        admission_grade: None,
        admission_date: None,
        father_name: None,
        mother_name: None,
        parent_address: None,
        father_occupation: None,
        mother_occupation: None,
        guardian_name: None,
        guardian_address: None,
        guardian_phone_number: None,
        guardian_occupation: None,
        diploma_number: None,
        graduation_date: None,
        created_at: "".into(),
        updated_at: "".into(),
    }).await.unwrap();
    (major, batch, semester, subject, student)
}

#[tokio::test]
async fn grade_upsert_should_succeed() {
    let db = setup_test_db().await;
    let (major, batch, semester, subject, student) = setup_curriculum_and_grade_test_env(&db).await;

    // 1. Create Curriculum Mapping
    let _cs = create_curriculum_subject_core(&db, &major.id, &batch.id, &semester.id, &subject.id)
        .await
        .unwrap();

    // 2. Assign multiple semesters
    assign_subject_to_semesters_core(&db, &major.id, &subject.id, vec![1, 2])
        .await
        .unwrap();

    // Fetch the new mapping for semester sequence 1 (semester 1)
    let cs_new = curriculum_subjects::Entity::find()
        .filter(curriculum_subjects::Column::MajorId.eq(&major.id))
        .filter(curriculum_subjects::Column::SemesterId.eq(&semester.id))
        .filter(curriculum_subjects::Column::SubjectId.eq(&subject.id))
        .one(&db)
        .await
        .unwrap()
        .expect("New mapping should have been created by assign_subject_to_semesters_core");

    // 3. Upsert Grade
    let grade = upsert_student_grade_core(&db, &student.nis, &cs_new.id, 95.0)
        .await
        .unwrap();
    assert_eq!(grade.grade, 95.0);
}

#[tokio::test]
async fn grade_batch_upsert_should_succeed() {
    let db = setup_test_db().await;
    let (major, _batch, _semester, subject, student) = setup_curriculum_and_grade_test_env(&db).await;

    // Assign multiple semesters
    assign_subject_to_semesters_core(&db, &major.id, &subject.id, vec![1, 2])
        .await
        .unwrap();

    // Batch Upsert
    let batch_gs = GradeSummary {
        student_id: student.nis.clone(),
        subject_id: subject.id.clone(),
        grade: 88.0,
    };
    batch_upsert_grades_core(&db, &major.id, 1, vec![batch_gs])
        .await
        .unwrap();

    // Fetch and Verify
    let student_grades = get_grades_by_student_core(&db, &student.nis).await.unwrap();
    assert_eq!(student_grades[0].grade, 88.0);
}

#[tokio::test]
async fn grade_retrieval_by_student_should_succeed() {
    let db = setup_test_db().await;
    let (major, _batch, semester, subject, student) = setup_curriculum_and_grade_test_env(&db).await;

    // Assign semesters
    assign_subject_to_semesters_core(&db, &major.id, &subject.id, vec![1])
        .await
        .unwrap();

    let cs = curriculum_subjects::Entity::find()
        .filter(curriculum_subjects::Column::MajorId.eq(&major.id))
        .filter(curriculum_subjects::Column::SemesterId.eq(&semester.id))
        .filter(curriculum_subjects::Column::SubjectId.eq(&subject.id))
        .one(&db)
        .await
        .unwrap()
        .unwrap();

    let _ = upsert_student_grade_core(&db, &student.nis, &cs.id, 92.5)
        .await
        .unwrap();

    let student_grades = get_grades_by_student_core(&db, &student.nis).await.unwrap();
    assert_eq!(student_grades.len(), 1);
    assert_eq!(student_grades[0].grade, 92.5);
}

// ==========================================
// EXCEL TESTS
// ==========================================

async fn setup_excel_test_env(db: &sea_orm::DatabaseConnection) -> app_lib::db::entities::majors::Model {
    let prog = create_program_core(db, "Teknik Mesin").await.unwrap();
    let major = create_major_core(db, "TP", "TEKNIK PEMESINAN", Some(prog.id)).await.unwrap();
    
    for seq in 1..=6 {
        create_semester_core(db, format!("S{}", seq), format!("Sem {}", seq), seq).await.unwrap();
    }

    let codes = vec!["PAPB", "PPKn", "B.IND", "PJOK", "SEJ", "SENBUD", "MULOK", "MTK", "B.ING", "TI", "IPAS", "DDK", "GTM", "BUBUT", "GRD", "FRAIS", "CNC", "MAPIL", "PKWU", "PKL"];
    for code in codes {
        create_subject_core(db, code, code, "A", "active", 1).await.unwrap();
    }
    major
}

#[tokio::test]
async fn excel_import_should_succeed() {
    let db = setup_test_db().await;
    let _major = setup_excel_test_env(&db).await;

    let manifest_dir = std::path::Path::new(env!("CARGO_MANIFEST_DIR"));
    let import_path = manifest_dir.join("tests/test_excel.xlsx");
    
    let result = import_grades_from_excel_core(&db, &import_path).await;
    assert!(result.is_ok());
}

#[tokio::test]
async fn excel_export_should_succeed() {
    let db = setup_test_db().await;
    let major = setup_excel_test_env(&db).await;

    let manifest_dir = std::path::Path::new(env!("CARGO_MANIFEST_DIR"));
    let import_path = manifest_dir.join("tests/test_excel.xlsx");
    
    let import_result = import_grades_from_excel_core(&db, &import_path).await;
    assert!(import_result.is_ok());

    // Export test
    let export_path = manifest_dir.join("tests/test_excel_output_isolated.xlsx");
    let export_result = export_grades_to_excel_core(&db, &major.id, &export_path).await;
    assert!(export_result.is_ok());

    if export_path.exists() {
        let _ = std::fs::remove_file(export_path);
    }
}

#[tokio::test]
async fn invalid_excel_import_should_fail() {
    let db = setup_test_db().await;
    let path = std::path::Path::new("non_existent.xlsx");
    let result = import_grades_from_excel_core(&db, path).await;
    assert!(result.is_err());
}

#[tokio::test]
async fn upsert_grade_invalid_value_should_fail() {
    let db = setup_test_db().await;
    let (major, batch, semester, subject, student) = setup_curriculum_and_grade_test_env(&db).await;

    let cs = create_curriculum_subject_core(&db, &major.id, &batch.id, &semester.id, &subject.id)
        .await
        .unwrap();

    // Try too high
    let result_high = upsert_student_grade_core(&db, &student.nis, &cs.id, 105.0).await;
    assert!(result_high.is_err());
    assert_eq!(result_high.unwrap_err(), "Nilai harus berada di antara 0 dan 100");

    // Try too low
    let result_low = upsert_student_grade_core(&db, &student.nis, &cs.id, -5.0).await;
    assert!(result_low.is_err());
    assert_eq!(result_low.unwrap_err(), "Nilai harus berada di antara 0 dan 100");
}

#[tokio::test]
async fn batch_upsert_grades_invalid_value_should_fail() {
    let db = setup_test_db().await;
    let (major, _batch, _semester, subject, student) = setup_curriculum_and_grade_test_env(&db).await;

    assign_subject_to_semesters_core(&db, &major.id, &subject.id, vec![1])
        .await
        .unwrap();

    // Grade too high
    let batch_gs_high = GradeSummary {
        student_id: student.nis.clone(),
        subject_id: subject.id.clone(),
        grade: 150.0,
    };
    let result_high = batch_upsert_grades_core(&db, &major.id, 1, vec![batch_gs_high]).await;
    assert!(result_high.is_err());
    assert_eq!(result_high.unwrap_err(), "Nilai harus berada di antara 0 dan 100");

    // Grade too low
    let batch_gs_low = GradeSummary {
        student_id: student.nis.clone(),
        subject_id: subject.id.clone(),
        grade: -1.0,
    };
    let result_low = batch_upsert_grades_core(&db, &major.id, 1, vec![batch_gs_low]).await;
    assert!(result_low.is_err());
    assert_eq!(result_low.unwrap_err(), "Nilai harus berada di antara 0 dan 100");
}

#[tokio::test]
async fn import_excel_invalid_structure_should_fail() {
    let db = setup_test_db().await;
    let _major = setup_excel_test_env(&db).await;

    use rust_xlsxwriter::Workbook;
    let mut workbook = Workbook::new();
    let worksheet = workbook.add_worksheet();
    
    // Write less than 8 rows to trigger the "Berkas Excel tidak valid (minimal harus 8 baris)" error
    worksheet.write_string(0, 0, "Short Excel").unwrap();

    let manifest_dir = std::path::Path::new(env!("CARGO_MANIFEST_DIR"));
    let temp_path = manifest_dir.join("tests/temp_malformed.xlsx");
    workbook.save(&temp_path).unwrap();

    let result = import_grades_from_excel_core(&db, &temp_path).await;
    assert!(result.is_err());
    assert_eq!(result.unwrap_err(), "Berkas Excel tidak valid (minimal harus 8 baris)");

    if temp_path.exists() {
        let _ = std::fs::remove_file(temp_path);
    }
}

#[tokio::test]
async fn import_excel_invalid_header_should_fail() {
    let db = setup_test_db().await;
    let _major = setup_excel_test_env(&db).await;

    use rust_xlsxwriter::Workbook;
    let mut workbook = Workbook::new();
    let worksheet = workbook.add_worksheet();
    
    // Write 10 rows to establish a valid height >= 8
    for r in 0..10 {
        worksheet.write_string(r, 0, "Dummy").unwrap();
    }
    // Write an invalid format into A3 (row 2, col 0)
    worksheet.write_string(2, 0, "INVALID FORMAT").unwrap();

    let manifest_dir = std::path::Path::new(env!("CARGO_MANIFEST_DIR"));
    let temp_path = manifest_dir.join("tests/temp_invalid_header.xlsx");
    workbook.save(&temp_path).unwrap();

    let result = import_grades_from_excel_core(&db, &temp_path).await;
    assert!(result.is_err());
    assert_eq!(
        result.unwrap_err(),
        "Nama Konsentrasi Keahlian tidak ditemukan di sel A3 (format harus 'KONSENTRASI KEAHLIAN : NAMA')"
    );

    if temp_path.exists() {
        let _ = std::fs::remove_file(temp_path);
    }
}
