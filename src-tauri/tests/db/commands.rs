use super::setup_test_db;
use app_lib::db::core::*;
use app_lib::db::entities::{curriculum_subjects, students};
use sea_orm::{ColumnTrait, EntityTrait, QueryFilter};

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

    assert!(
        dup_prog.is_err(),
        "Expected duplicate program creation to fail"
    );
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
    let majors_list = get_majors_core(&db).await.expect("Failed to get majors");
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
        "UMUM",
        1,
    )
    .await
    .expect("Failed to create subject");
    assert_eq!(subject.code, "MAT01");
    assert_eq!(subject.transcript_group, "UMUM");

    // Update
    let updated_subject = update_subject_core(
        &db,
        &subject.id,
        SubjectParams {
            name: "Matematika Dasar Lanjut".to_string(),
            code: "MAT01-U".to_string(),
            category: "Kelompok A".to_string(),
            status: "active".to_string(),
            transcript_group: "KEJURUAN_UMUM".to_string(),
            sequence: 2,
        },
    )
    .await
    .expect("Failed to update subject");
    assert_eq!(updated_subject.name, "Matematika Dasar Lanjut");
    assert_eq!(updated_subject.transcript_group, "KEJURUAN_UMUM");

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
    let updated_student = update_student_core(&db, &created_student.nis, update_payload)
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

async fn setup_curriculum_and_grade_test_env(
    db: &sea_orm::DatabaseConnection,
) -> (
    app_lib::db::entities::majors::Model,
    app_lib::db::entities::batches::Model,
    app_lib::db::entities::semesters::Model,
    app_lib::db::entities::subjects::Model,
    students::Model,
) {
    let prog = create_program_core(db, "P1").await.unwrap();
    let major = create_major_core(db, "M1", "Major 1", Some(prog.id))
        .await
        .unwrap();
    let batch = create_batch_core(db, 2024).await.unwrap();
    let semester = create_semester_core(db, "S1", "Sem 1", 1).await.unwrap();
    let subject = create_subject_core(db, "SUB1", "Subj 1", "A", "active", "UMUM", 1)
        .await
        .unwrap();
    let student = create_student_core(
        db,
        students::Model {
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
        },
    )
    .await
    .unwrap();
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
    let (major, _batch, _semester, subject, student) =
        setup_curriculum_and_grade_test_env(&db).await;

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
    let (major, _batch, semester, subject, student) =
        setup_curriculum_and_grade_test_env(&db).await;

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

async fn setup_excel_test_env(
    db: &sea_orm::DatabaseConnection,
) -> app_lib::db::entities::majors::Model {
    let prog = create_program_core(db, "Teknik Mesin").await.unwrap();
    let major = create_major_core(db, "TP", "TEKNIK PEMESINAN", Some(prog.id))
        .await
        .unwrap();

    for seq in 1..=6 {
        create_semester_core(db, format!("S{}", seq), format!("Sem {}", seq), seq)
            .await
            .unwrap();
    }

    let codes = vec![
        "PAPB", "PPKn", "B.IND", "PJOK", "SEJ", "SENBUD", "MULOK", "MTK", "B.ING", "TI", "IPAS",
        "DDK", "GTM", "BUBUT", "GRD", "FRAIS", "CNC", "MAPIL", "PKWU", "PKL",
    ];
    for code in codes {
        create_subject_core(db, code, code, "A", "active", "UMUM", 1)
            .await
            .unwrap();
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
    assert_eq!(
        result_high.unwrap_err().to_string(),
        "Nilai harus berada di antara 0 dan 100"
    );

    // Try too low
    let result_low = upsert_student_grade_core(&db, &student.nis, &cs.id, -5.0).await;
    assert!(result_low.is_err());
    assert_eq!(
        result_low.unwrap_err().to_string(),
        "Nilai harus berada di antara 0 dan 100"
    );
}

#[tokio::test]
async fn batch_upsert_grades_invalid_value_should_fail() {
    let db = setup_test_db().await;
    let (major, _batch, _semester, subject, student) =
        setup_curriculum_and_grade_test_env(&db).await;

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
    assert_eq!(
        result_high.unwrap_err().to_string(),
        "Nilai harus berada di antara 0 dan 100"
    );

    // Grade too low
    let batch_gs_low = GradeSummary {
        student_id: student.nis.clone(),
        subject_id: subject.id.clone(),
        grade: -1.0,
    };
    let result_low = batch_upsert_grades_core(&db, &major.id, 1, vec![batch_gs_low]).await;
    assert!(result_low.is_err());
    assert_eq!(
        result_low.unwrap_err().to_string(),
        "Nilai harus berada di antara 0 dan 100"
    );
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
    assert_eq!(
        result.unwrap_err().to_string(),
        "Berkas Excel tidak valid (minimal harus 8 baris)"
    );

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
        result.unwrap_err().to_string(),
        "Nama Konsentrasi Keahlian tidak ditemukan di sel A3 (format harus 'KONSENTRASI KEAHLIAN : NAMA')"
    );

    if temp_path.exists() {
        let _ = std::fs::remove_file(temp_path);
    }
}

// ==========================================
// ADDITIONAL COVERAGE TESTS
// ==========================================

use app_lib::db::error::AppError;

#[test]
fn category_weight_should_return_correct_values() {
    assert_eq!(get_category_weight("Kelompok Umum"), 1);
    assert_eq!(get_category_weight("Kelompok Kejuruan"), 2);
    assert_eq!(get_category_weight("Unknown Category"), 99);
    assert_eq!(get_category_weight(""), 99);
}

#[tokio::test]
async fn get_batches_should_return_all_batches() {
    let db = setup_test_db().await;
    create_batch_core(&db, 2024).await.unwrap();
    create_batch_core(&db, 2025).await.unwrap();

    let batches = get_batches_core(&db).await.unwrap();
    assert_eq!(batches.len(), 2);
}

#[tokio::test]
async fn get_students_should_return_all_students() {
    let db = setup_test_db().await;
    let major = create_major_core(&db, "TKJ", "Teknik Komputer", None)
        .await
        .unwrap();

    let mut s1 = make_test_student_payload(major.id.clone());
    s1.nis = "001".into();
    s1.nisn = "0011".into();
    s1.full_name = "Budi".into();

    let mut s2 = make_test_student_payload(major.id.clone());
    s2.nis = "002".into();
    s2.nisn = "0022".into();
    s2.full_name = "Ani".into();

    create_student_core(&db, s1).await.unwrap();
    create_student_core(&db, s2).await.unwrap();

    let students = get_students_core(&db).await.unwrap();
    assert!(students.len() >= 2);
    let names: Vec<&str> = students.iter().map(|s| s.full_name.as_str()).collect();
    assert!(names.contains(&"Budi"));
    assert!(names.contains(&"Ani"));
}

#[tokio::test]
async fn get_subjects_should_return_sorted_by_category_weight_then_sequence() {
    let db = setup_test_db().await;
    // Create subjects in random order
    create_subject_core(
        &db,
        "KJ1",
        "Kejuruan 1",
        "Kelompok Kejuruan",
        "active",
        "KEJURUAN_UMUM",
        1,
    )
    .await
    .unwrap();
    create_subject_core(&db, "UM2", "Umum 2", "Kelompok Umum", "active", "UMUM", 2)
        .await
        .unwrap();
    create_subject_core(&db, "UM1", "Umum 1", "Kelompok Umum", "active", "UMUM", 1)
        .await
        .unwrap();
    create_subject_core(
        &db,
        "KJ2",
        "Kejuruan 2",
        "Kelompok Kejuruan",
        "active",
        "KEJURUAN_UMUM",
        2,
    )
    .await
    .unwrap();

    let subjects = get_subjects_core(&db).await.unwrap();
    assert_eq!(subjects.len(), 4);
    // Verify sort order: Umum (weight=1) before Kejuruan (weight=2), then by sequence
    assert_eq!(subjects[0].code, "UM1");
    assert_eq!(subjects[1].code, "UM2");
    assert_eq!(subjects[2].code, "KJ1");
    assert_eq!(subjects[3].code, "KJ2");
}

#[tokio::test]
async fn get_curriculum_subjects_should_return_all_mappings() {
    let db = setup_test_db().await;
    let (major, batch, semester, subject, _) = setup_curriculum_and_grade_test_env(&db).await;
    let cs = create_curriculum_subject_core(&db, &major.id, &batch.id, &semester.id, &subject.id)
        .await
        .unwrap();

    let all_cs = get_curriculum_subjects_core(&db).await.unwrap();
    assert!(!all_cs.is_empty());
    assert!(all_cs.iter().any(|c| c.id == cs.id));
}

#[tokio::test]
async fn get_subjects_by_major_should_group_semesters_and_sort() {
    let db = setup_test_db().await;
    let prog = create_program_core(&db, "P1").await.unwrap();
    let major = create_major_core(&db, "RPL", "Rekayasa Perangkat Lunak", Some(prog.id))
        .await
        .unwrap();

    // Create semesters 1 and 2
    create_semester_core(&db, "S1", "Semester 1", 1)
        .await
        .unwrap();
    create_semester_core(&db, "S2", "Semester 2", 2)
        .await
        .unwrap();

    // Create 2 subjects: one mapped to 2 semesters, one to 1
    let subj_a = create_subject_core(&db, "A", "Subject A", "Kelompok Umum", "active", "UMUM", 1)
        .await
        .unwrap();
    let subj_b = create_subject_core(
        &db,
        "B",
        "Subject B",
        "Kelompok Kejuruan",
        "active",
        "KEJURUAN_UMUM",
        1,
    )
    .await
    .unwrap();

    // Assign subj_a to semesters 1 and 2, subj_b to semester 1
    assign_subject_to_semesters_core(&db, &major.id, &subj_a.id, vec![1, 2])
        .await
        .unwrap();
    assign_subject_to_semesters_core(&db, &major.id, &subj_b.id, vec![1])
        .await
        .unwrap();

    let result = get_subjects_by_major_core(&db, &major.id).await.unwrap();

    assert_eq!(result.len(), 2);
    // Sorted: Umum (A) before Kejuruan (B)
    assert_eq!(result[0].code, "A");
    assert_eq!(result[0].transcript_group, "UMUM");
    assert_eq!(result[0].semesters, vec![1, 2]);
    assert_eq!(result[1].code, "B");
    assert_eq!(result[1].transcript_group, "KEJURUAN_UMUM");
    assert_eq!(result[1].semesters, vec![1]);
}

#[tokio::test]
async fn get_student_grades_should_return_all_grades() {
    let db = setup_test_db().await;
    let (major, batch, semester, subject, student) = setup_curriculum_and_grade_test_env(&db).await;

    let cs = create_curriculum_subject_core(&db, &major.id, &batch.id, &semester.id, &subject.id)
        .await
        .unwrap();

    upsert_student_grade_core(&db, &student.nis, &cs.id, 85.0)
        .await
        .unwrap();

    let grades = get_student_grades_core(&db).await.unwrap();
    assert_eq!(grades.len(), 1);
    assert_eq!(grades[0].grade, 85.0);
}

#[tokio::test]
async fn get_grades_by_filter_should_return_matching_grades() {
    let db = setup_test_db().await;
    let (major, batch, semester, subject, student) = setup_curriculum_and_grade_test_env(&db).await;

    let cs = create_curriculum_subject_core(&db, &major.id, &batch.id, &semester.id, &subject.id)
        .await
        .unwrap();

    upsert_student_grade_core(&db, &student.nis, &cs.id, 90.0)
        .await
        .unwrap();

    let grades = get_grades_by_filter_core(&db, &major.id, 1).await.unwrap();
    assert!(!grades.is_empty());
    assert_eq!(grades[0].grade, 90.0);
}

#[tokio::test]
async fn get_grades_by_filter_with_no_matching_semester_should_return_error() {
    let db = setup_test_db().await;
    let prog = create_program_core(&db, "P1").await.unwrap();
    let major = create_major_core(&db, "TKJ", "Test", Some(prog.id))
        .await
        .unwrap();

    let result = get_grades_by_filter_core(&db, &major.id, 999).await;
    assert!(result.is_err()); // Semester 999 not found
}

#[tokio::test]
async fn update_program_nonexistent_should_return_not_found() {
    let db = setup_test_db().await;
    let result = update_program_core(&db, "nonexistent-id", "New Name").await;
    assert!(matches!(
        result,
        Err(AppError::NotFound {
            entity: "Program",
            ..
        })
    ));
}

#[tokio::test]
async fn update_major_nonexistent_should_return_not_found() {
    let db = setup_test_db().await;
    let result = update_major_core(&db, "nonexistent-id", "New", "NEW", None).await;
    assert!(matches!(
        result,
        Err(AppError::NotFound {
            entity: "Major",
            ..
        })
    ));
}

#[tokio::test]
async fn update_subject_nonexistent_should_return_not_found() {
    let db = setup_test_db().await;
    let result = update_subject_core(
        &db,
        "nonexistent-id",
        SubjectParams {
            name: "N".to_string(),
            code: "N".to_string(),
            category: "N".to_string(),
            status: "active".to_string(),
            transcript_group: "UMUM".to_string(),
            sequence: 1,
        },
    )
    .await;
    assert!(matches!(
        result,
        Err(AppError::NotFound {
            entity: "Subject",
            ..
        })
    ));
}

#[tokio::test]
async fn update_student_nonexistent_should_return_not_found() {
    let db = setup_test_db().await;
    let dummy = make_test_student_payload("dummy".to_string());
    let result = update_student_core(&db, "nonexistent-nis", dummy).await;
    assert!(matches!(
        result,
        Err(AppError::NotFound {
            entity: "Student",
            ..
        })
    ));
}
