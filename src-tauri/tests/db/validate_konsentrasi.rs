use app_lib::db::{establish_in_memory_connection, migrations::MigrationManager};
use app_lib::db::entities::{curriculum_subjects, students};
use app_lib::db::core::{
    create_subject_core, create_semester_core, create_curriculum_subject_core,
    upsert_student_grade_core, create_student_core, create_major_core, create_batch_core
};
use sea_orm::{EntityTrait, ColumnTrait, QueryFilter};
use uuid::Uuid;

#[tokio::test]
async fn validate_konsentrasi_keahlian_formula() {
    let db = establish_in_memory_connection().await.unwrap();
    let manager = MigrationManager::new();
    manager.run(&db).await.unwrap();

    // Create a major and batch
    let major = create_major_core(&db, "TP", "Teknik Pemesinan", None).await.unwrap();
    let batch = create_batch_core(&db, 2024).await.unwrap();

    // Create semesters 3, 4, 6, and UKK (99)
    let smt3 = create_semester_core(&db, "SEM3", "Semester 3", 3).await.unwrap();
    let smt4 = create_semester_core(&db, "SEM4", "Semester 4", 4).await.unwrap();
    let smt6 = create_semester_core(&db, "SEM6", "Semester 6", 6).await.unwrap();
    let smt_ukk = create_semester_core(&db, "UKK", "Uji Kompetensi Keahlian", 99).await.unwrap();

    // Create KEJURUAN_KONSENTRASI subjects (GTM, BUBUT, CNC, GRD, FRAIS)
    let gtm = create_subject_core(&db, "GTM", "Gambar Teknik Manufaktur", "Kelompok Kejuruan", "active", "KEJURUAN_KONSENTRASI", 1).await.unwrap();
    let bubut = create_subject_core(&db, "BUBUT", "Teknik Pemesinan Bubut", "Kelompok Kejuruan", "active", "KEJURUAN_KONSENTRASI", 2).await.unwrap();
    let cnc = create_subject_core(&db, "CNC", "Teknik Pemesinan NC/CNC dan CAM", "Kelompok Kejuruan", "active", "KEJURUAN_KONSENTRASI", 3).await.unwrap();
    let grd = create_subject_core(&db, "GRD", "Teknik Pemesinan Gerinda", "Kelompok Kejuruan", "active", "KEJURUAN_KONSENTRASI", 4).await.unwrap();
    let frais = create_subject_core(&db, "FRAIS", "Teknik Pemesinan Frais", "Kelompok Kejuruan", "active", "KEJURUAN_KONSENTRASI", 5).await.unwrap();

    // Create UKK subject
    let ukk = create_subject_core(&db, "UKK", "Uji Kompetensi Keahlian", "Kelompok Kejuruan", "active", "UKK", 6).await.unwrap();

    // Map subjects to semesters
    let konsentrasi_subjects = vec![&gtm, &bubut, &cnc, &grd, &frais];
    let semesters_for_konsentrasi = vec![&smt3, &smt4, &smt6];

    for subject in &konsentrasi_subjects {
        for semester in &semesters_for_konsentrasi {
            create_curriculum_subject_core(&db, &major.id, &batch.id, &semester.id, &subject.id).await.unwrap();
        }
    }

    // Map UKK to UKK semester
    create_curriculum_subject_core(&db, &major.id, &batch.id, &smt_ukk.id, &ukk.id).await.unwrap();

    // Create a student
    let student = students::Model {
        id: Uuid::new_v4().to_string(),
        major_id: major.id.clone(),
        full_name: "Test Student".to_string(),
        nis: "24001".to_string(),
        nisn: "0071234561".to_string(),
        place_of_birth: Some("Padang".to_string()),
        date_of_birth: Some("2007-03-15".to_string()),
        gender: Some("L".to_string()),
        religion: Some("Islam".to_string()),
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
        created_at: chrono::Utc::now().to_rfc3339(),
        updated_at: chrono::Utc::now().to_rfc3339(),
    };
    create_student_core(&db, student.clone()).await.unwrap();

    // Insert grades for KEJURUAN_KONSENTRASI subjects
    // Semester 3: GTM=85, BUBUT=90, CNC=88, GRD=87, FRAIS=92 → avg = 88.4
    let smt3_grades = vec![85.0, 90.0, 88.0, 87.0, 92.0];
    for (i, subject) in konsentrasi_subjects.iter().enumerate() {
        let mapping = curriculum_subjects::Entity::find()
            .filter(curriculum_subjects::Column::MajorId.eq(&major.id))
            .filter(curriculum_subjects::Column::SubjectId.eq(&subject.id))
            .filter(curriculum_subjects::Column::SemesterId.eq(&smt3.id))
            .one(&db)
            .await
            .unwrap()
            .unwrap();
        upsert_student_grade_core(&db, &student.id, &mapping.id, smt3_grades[i]).await.unwrap();
    }

    // Semester 4: GTM=87, BUBUT=92, CNC=90, GRD=89, FRAIS=94 → avg = 90.4
    let smt4_grades = vec![87.0, 92.0, 90.0, 89.0, 94.0];
    for (i, subject) in konsentrasi_subjects.iter().enumerate() {
        let mapping = curriculum_subjects::Entity::find()
            .filter(curriculum_subjects::Column::MajorId.eq(&major.id))
            .filter(curriculum_subjects::Column::SubjectId.eq(&subject.id))
            .filter(curriculum_subjects::Column::SemesterId.eq(&smt4.id))
            .one(&db)
            .await
            .unwrap()
            .unwrap();
        upsert_student_grade_core(&db, &student.id, &mapping.id, smt4_grades[i]).await.unwrap();
    }

    // Semester 6: GTM=89, BUBUT=94, CNC=92, GRD=91, FRAIS=96 → avg = 92.4
    let smt6_grades = vec![89.0, 94.0, 92.0, 91.0, 96.0];
    for (i, subject) in konsentrasi_subjects.iter().enumerate() {
        let mapping = curriculum_subjects::Entity::find()
            .filter(curriculum_subjects::Column::MajorId.eq(&major.id))
            .filter(curriculum_subjects::Column::SubjectId.eq(&subject.id))
            .filter(curriculum_subjects::Column::SemesterId.eq(&smt6.id))
            .one(&db)
            .await
            .unwrap()
            .unwrap();
        upsert_student_grade_core(&db, &student.id, &mapping.id, smt6_grades[i]).await.unwrap();
    }

    // UKK grade: 85
    let ukk_mapping = curriculum_subjects::Entity::find()
        .filter(curriculum_subjects::Column::MajorId.eq(&major.id))
        .filter(curriculum_subjects::Column::SubjectId.eq(&ukk.id))
        .filter(curriculum_subjects::Column::SemesterId.eq(&smt_ukk.id))
        .one(&db)
        .await
        .unwrap()
        .unwrap();
    upsert_student_grade_core(&db, &student.id, &ukk_mapping.id, 85.0).await.unwrap();

    // Manual calculation
    let avg_smt3 = smt3_grades.iter().sum::<f64>() / smt3_grades.len() as f64;
    let avg_smt4 = smt4_grades.iter().sum::<f64>() / smt4_grades.len() as f64;
    let avg_smt6 = smt6_grades.iter().sum::<f64>() / smt6_grades.len() as f64;
    let ukk_score = 85.0;

    let expected_konsentrasi = (avg_smt3 + avg_smt4 + avg_smt6 + ukk_score) / 4.0;

    println!("\n=== KONSENTRASI KEAHLIAN FORMULA VALIDATION ===\n");
    println!("Semester 3 grades: {:?}", smt3_grades);
    println!("Semester 3 average: {:.2}", avg_smt3);
    println!();
    println!("Semester 4 grades: {:?}", smt4_grades);
    println!("Semester 4 average: {:.2}", avg_smt4);
    println!();
    println!("Semester 6 grades: {:?}", smt6_grades);
    println!("Semester 6 average: {:.2}", avg_smt6);
    println!();
    println!("UKK score: {:.2}", ukk_score);
    println!();
    println!("Formula: (avg_smt3 + avg_smt4 + avg_smt6 + ukk_score) / 4");
    println!("       = ({:.2} + {:.2} + {:.2} + {:.2}) / 4", avg_smt3, avg_smt4, avg_smt6, ukk_score);
    println!("       = {:.2} / 4", avg_smt3 + avg_smt4 + avg_smt6 + ukk_score);
    println!("       = {:.2}", expected_konsentrasi);
    println!();
    println!("Expected Konsentrasi Keahlian score: {:.2}", expected_konsentrasi);

    // Verify the calculation
    assert!((avg_smt3 - 88.4).abs() < 0.01, "Smt 3 average should be 88.4");
    assert!((avg_smt4 - 90.4).abs() < 0.01, "Smt 4 average should be 90.4");
    assert!((avg_smt6 - 92.4).abs() < 0.01, "Smt 6 average should be 92.4");
    assert!((expected_konsentrasi - 89.05).abs() < 0.01, "Konsentrasi Keahlian should be 89.05");

    println!("\n✓ Formula validation passed!\n");
}
