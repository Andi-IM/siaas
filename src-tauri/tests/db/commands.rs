use super::setup_test_db;
use app_lib::db::core::*;
use app_lib::db::entities::{students, student_grades};
use sea_orm::{EntityTrait, QueryFilter, ColumnTrait};

#[tokio::test]
async fn test_tauri_commands() {
    // 1. Setup database connection
    let db = setup_test_db().await;

    // 2. Test Program Commands
    let prog = create_program_core(&db, "Teknik Komputer".to_string())
        .await
        .expect("Failed to create program");
    assert_eq!(prog.name, "Teknik Komputer");

    let progs = get_programs_core(&db)
        .await
        .expect("Failed to get programs");
    assert!(!progs.is_empty());

    let updated_prog = update_program_core(&db, prog.id.clone(), "Teknik Komputer Updated".to_string())
        .await
        .expect("Failed to update program");
    assert_eq!(updated_prog.name, "Teknik Komputer Updated");

    // 3. Test Major Commands
    let major = create_major_core(
        &db,
        "TK".to_string(),
        "Teknik Komputer dan Jaringan".to_string(),
        Some(prog.id.clone()),
    )
    .await
    .expect("Failed to create major");
    assert_eq!(major.code, "TK");

    let majors_list = get_majors_core(&db)
        .await
        .expect("Failed to get majors");
    assert!(!majors_list.is_empty());

    let updated_major = update_major_core(
        &db,
        major.id.clone(),
        "Teknik Komputer Jaringan".to_string(),
        "TKJ".to_string(),
        Some(prog.id.clone()),
    )
    .await
    .expect("Failed to update major");
    assert_eq!(updated_major.code, "TKJ");

    // 4. Test Batch and Semester Commands
    let batch = create_batch_core(&db, 2026)
        .await
        .expect("Failed to create batch");
    assert_eq!(batch.year, 2026);

    let batches_list = get_batches_core(&db)
        .await
        .expect("Failed to get batches");
    assert!(!batches_list.is_empty());

    let semester = create_semester_core(&db, "SEM1".to_string(), "Ganjil I".to_string(), 1)
        .await
        .expect("Failed to create semester");
    assert_eq!(semester.sequence, 1);

    let semesters_list = get_semesters_core(&db)
        .await
        .expect("Failed to get semesters");
    assert!(!semesters_list.is_empty());

    // 5. Test Subject Commands
    let subject = create_subject_core(
        &db,
        "MAT01".to_string(),
        "Matematika Dasar".to_string(),
        "Kelompok A".to_string(),
        "active".to_string(),
        1,
    )
    .await
    .expect("Failed to create subject");
    assert_eq!(subject.code, "MAT01");

    let subjects_list = get_subjects_core(&db)
        .await
        .expect("Failed to get subjects");
    assert!(!subjects_list.is_empty());

    let updated_subject = update_subject_core(
        &db,
        subject.id.clone(),
        "Matematika Dasar Lanjut".to_string(),
        "MAT01-U".to_string(),
        "Kelompok A".to_string(),
        "active".to_string(),
        2,
    )
    .await
    .expect("Failed to update subject");
    assert_eq!(updated_subject.name, "Matematika Dasar Lanjut");

    // 6. Test Student Commands
    let student_payload = students::Model {
        id: String::new(),
        major_id: major.id.clone(),
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
    };

    let created_student = create_student_core(&db, student_payload.clone())
        .await
        .expect("Failed to create student");
    assert_eq!(created_student.full_name, "Budi Santoso");

    let students_list = get_students_core(&db)
        .await
        .expect("Failed to get students");
    assert!(!students_list.is_empty());

    let mut update_payload = created_student.clone();
    update_payload.full_name = "Budi Santoso Updated".to_string();
    let updated_student = update_student_core(
        &db,
        created_student.nis.clone(),
        update_payload,
    )
    .await
    .expect("Failed to update student");
    assert_eq!(updated_student.full_name, "Budi Santoso Updated");

    // 7. Test Curriculum and Subject Assignments
    let cs = create_curriculum_subject_core(
        &db,
        major.id.clone(),
        batch.id.clone(),
        semester.id.clone(),
        updated_subject.id.clone(),
    )
    .await
    .expect("Failed to create curriculum subject");
    assert_eq!(cs.subject_id, updated_subject.id);

    let cs_list = get_curriculum_subjects_core(&db)
        .await
        .expect("Failed to get curriculum subjects");
    assert!(!cs_list.is_empty());

    let subjs_by_major = get_subjects_by_major_core(&db, major.id.clone())
        .await
        .expect("Failed to get subjects by major");
    assert!(!subjs_by_major.is_empty());

    assign_subject_to_semesters_core(
        &db,
        major.id.clone(),
        updated_subject.id.clone(),
        vec![1],
    )
    .await
    .expect("Failed to assign subject to semesters");

    // Fetch the updated curriculum subjects to get the active ID
    let updated_cs_list = get_curriculum_subjects_core(&db)
        .await
        .expect("Failed to get curriculum subjects after assignment");
    let active_cs_id = updated_cs_list[0].id.clone();

    // 8. Test Grades Commands
    let grade_model = upsert_student_grade_core(
        &db,
        created_student.id.clone(),
        active_cs_id,
        88.5,
    )
    .await
    .expect("Failed to upsert student grade");
    assert_eq!(grade_model.grade, 88.5);

    let all_grades = get_student_grades_core(&db)
        .await
        .expect("Failed to get student grades");
    assert!(!all_grades.is_empty());

    let student_grade_details = get_grades_by_student_core(&db, created_student.nis.clone())
        .await
        .expect("Failed to get grades by student (NIS)");
    assert!(!student_grade_details.is_empty());
    assert_eq!(student_grade_details[0].grade, 88.5);

    let grades_by_filter = get_grades_by_filter_core(&db, major.id.clone(), 1)
        .await
        .expect("Failed to get grades by filter");
    assert!(!grades_by_filter.is_empty());

    let batch_gs = GradeSummary {
        student_id: created_student.id.clone(),
        subject_id: updated_subject.id.clone(),
        grade: 92.0,
    };
    batch_upsert_grades_core(&db, major.id.clone(), 1, vec![batch_gs])
        .await
        .expect("Failed to batch upsert grades");

    let student_grade_details_updated = get_grades_by_student_core(&db, created_student.id.clone())
        .await
        .expect("Failed to get grades by student (UUID)");
    assert_eq!(student_grade_details_updated[0].grade, 92.0);

    // 9. Excel Import/Export Code Path Testing (direct core calls to avoid file picker popups)
    let manifest_dir = std::path::Path::new(env!("CARGO_MANIFEST_DIR"));
    let import_path = manifest_dir.join("tests/test_excel.xlsx");
    let export_path = manifest_dir.join("tests/test_excel_output.xlsx");
    let _ = import_grades_from_excel_core(&db, &import_path).await;
    let _ = export_grades_to_excel_core(&db, major.id.clone(), &export_path).await;

    if export_path.exists() {
        let _ = std::fs::remove_file(export_path);
    }

    // 10. Test Delete Commands
    let delete_student_res = delete_student_core(&db, created_student.nis.clone())
        .await
        .expect("Failed to delete student");
    assert!(delete_student_res);

    let delete_subject_res = delete_subject_core(&db, updated_subject.id.clone())
        .await
        .expect("Failed to delete subject");
    assert!(delete_subject_res);

    let delete_major_res = delete_major_core(&db, major.id.clone())
        .await
        .expect("Failed to delete major");
    assert!(delete_major_res);

    let delete_prog_res = delete_program_core(&db, prog.id.clone())
        .await
        .expect("Failed to delete program");
    assert!(delete_prog_res);

    // 11. Test Unhappy Paths (Not Found & Duplication)
    let not_found_update = update_program_core(&db, "invalid-id".to_string(), "New Name".to_string()).await;
    assert!(not_found_update.is_err(), "Expected error when updating non-existent program");
    
    let not_found_delete = delete_student_core(&db, "invalid-nis".to_string()).await;
    assert_eq!(not_found_delete.unwrap(), false, "Expected false when deleting non-existent student");

    let _prog_sipil = create_program_core(&db, "Teknik Sipil".to_string()).await.unwrap();
    let dup_prog = create_program_core(&db, "Teknik Sipil".to_string()).await;
    assert!(dup_prog.is_err(), "Expected duplicate program creation to fail");
}

#[tokio::test]
async fn test_import_excel_file() {
    // 1. Setup database connection
    let db = setup_test_db().await;

    // Seed Semesters 1 to 6
    for seq in 1..=6 {
        create_semester_core(
            &db,
            format!("SEM{}", seq),
            format!("Semester {}", seq),
            seq,
        )
        .await
        .unwrap();
    }

    // Seed Program and Major
    let prog = create_program_core(&db, "Teknik Mesin".to_string()).await.unwrap();
    let major = create_major_core(
        &db,
        "TP".to_string(),
        "TEKNIK PEMESINAN".to_string(),
        Some(prog.id),
    )
    .await
    .unwrap();

    // Seed all Subject Codes expected in the spreadsheet
    let codes = vec![
        "PAPB", "PPKn", "B.IND", "PJOK", "SEJ", "SENBUD", "MULOK", "MTK", "B.ING", 
        "TI", "IPAS", "DDK", "GTM", "BUBUT", "GRD", "FRAIS", "CNC", "MAPIL", "PKWU", "PKL"
    ];
    for code in codes {
        create_subject_core(
            &db,
            code.to_string(),
            format!("Subject {}", code),
            "Kelompok A".to_string(),
            "active".to_string(),
            1,
        )
        .await
        .unwrap();
    }

    // 2. Call the core production function directly on test_excel.xlsx
    let manifest_dir = std::path::Path::new(env!("CARGO_MANIFEST_DIR"));
    let path = manifest_dir.join("tests/test_excel.xlsx");
    let result = import_grades_from_excel_core(&db, &path).await;
    assert!(result.is_ok(), "Failed to import grades from Excel: {:?}", result.err());

    // 3. Assert that the student was created
    let imported_student = students::Entity::find()
        .filter(students::Column::Nis.eq("10310780".to_string()))
        .one(&db)
        .await
        .unwrap()
        .expect("Imported student should exist in database");

    assert_eq!(imported_student.full_name, "Andika Teguh Perkasa Putra");

    // Assert that grades were imported
    let imported_grades = student_grades::Entity::find()
        .filter(student_grades::Column::StudentId.eq(imported_student.id))
        .all(&db)
        .await
        .unwrap();

    assert!(!imported_grades.is_empty(), "Student grades should be imported");

    // 4. Verify export core functionality by exporting it back to a temporary file
    let export_path = manifest_dir.join("tests/test_excel_output.xlsx");
    let export_result = export_grades_to_excel_core(&db, major.id, &export_path).await;
    assert!(export_result.is_ok(), "Failed to export grades to Excel: {:?}", export_result.err());

    // Clean up exported file if it exists
    if export_path.exists() {
        let _ = std::fs::remove_file(export_path);
    }

    // 5. Test Unhappy Path (Invalid Excel File)
    let invalid_path = manifest_dir.join("tests/does_not_exist_file.xlsx");
    let invalid_result = import_grades_from_excel_core(&db, &invalid_path).await;
    assert!(invalid_result.is_err(), "Expected error when importing from invalid path");
}
