use std::time::Instant;
use sea_orm::{EntityTrait, QueryFilter, ColumnTrait, TransactionTrait};
use app_lib::db::core::*;
use app_lib::db::entities::students;

fn make_perf_student_payload(major_id: String, index: usize) -> students::Model {
    students::Model {
        id: String::new(),
        major_id,
        full_name: format!("Siswa Uji Ke-{}", index),
        nis: format!("NIS-{:06}", index),
        nisn: format!("NISN-{:08}", index),
        place_of_birth: Some("Padang".to_string()),
        date_of_birth: Some("2008-01-01".to_string()),
        gender: Some("L".to_string()),
        religion: Some("Islam".to_string()),
        family_status: Some("Anak Kandung".to_string()),
        child_order: Some(1),
        home_address: Some("Jl. Sudirman No. 123".to_string()),
        telephone: Some("08123456789".to_string()),
        previous_school: Some("SMP Negeri 1 Padang".to_string()),
        admission_grade: Some("X".to_string()),
        admission_date: Some("2026-07-15".to_string()),
        father_name: Some("Bapak Siswa".to_string()),
        mother_name: Some("Ibu Siswa".to_string()),
        parent_address: Some("Jl. Sudirman No. 123".to_string()),
        father_occupation: Some("Wiraswasta".to_string()),
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
async fn test_database_write_and_read_performance() {
    let manifest_dir = std::path::Path::new(env!("CARGO_MANIFEST_DIR"));
    let db_path = manifest_dir.join("target/temp_perf_test.db");

    // Pastikan membersihkan file lama jika ada
    if db_path.exists() {
        let _ = std::fs::remove_file(&db_path);
    }

    // Buat database fisik kosong
    std::fs::File::create(&db_path).unwrap();

    // Hubungkan ke database fisik
    let db = app_lib::db::establish_connection(&db_path).await.expect("Failed to connect to temp physical DB");
    
    // Jalankan migrasi
    let manager = app_lib::db::migrations::MigrationManager::new();
    manager.run(&db).await.expect("Failed to run migrations");

    // Inisialisasi program dan major
    let prog = create_program_core(&db, "Teknik Komputer").await.unwrap();
    let major = create_major_core(&db, "TKJ", "Teknik Komputer dan Jaringan", Some(prog.id)).await.unwrap();

    println!("\n==================================================");
    println!("MEMULAI PENGUJIAN PERFORMA DATABASE (RUST + SQLITE)");
    println!("==================================================");

    // 1. UJI PENULISAN MASAL (BULK INSERT THROUGHPUT)
    let insert_count = 10000;
    println!("Memulai penulisan massal {} data siswa...", insert_count);
    
    let start_insert = Instant::now();
    
    // Gunakan transaksi untuk menjamin penulisan cepat SQLite
    let tx = db.begin().await.expect("Failed to begin transaction");
    
    for i in 1..=insert_count {
        let payload = make_perf_student_payload(major.id.clone(), i);
        // Panggil core create_student_core dalam transaksi
        create_student_core(&tx, payload).await.expect("Failed to insert student");
    }
    
    tx.commit().await.expect("Failed to commit transaction");
    
    let insert_duration = start_insert.elapsed();
    println!("-> SUKSES: Memasukkan {} data siswa dalam {:?}", insert_count, insert_duration);
    println!("-> Rata-rata: {:?} per record", insert_duration / insert_count as u32);

    // 2. UJI LATENSI PENCARIAN TUNGGAL (SINGLE SEARCH LATENCY)
    println!("Memulai uji latensi kueri pencarian tunggal...");
    let search_target_index = insert_count - 250; // Cari data di bagian akhir database
    let target_nis = format!("NIS-{:06}", search_target_index);
    
    let mut search_durations = Vec::new();
    let search_iterations = 100;
    
    for _ in 0..search_iterations {
        let start_search = Instant::now();
        let student = students::Entity::find()
            .filter(students::Column::Nis.eq(&target_nis))
            .one(&db)
            .await
            .expect("Failed to query student")
            .expect("Student not found in DB");
        
        assert_eq!(student.nis, target_nis);
        search_durations.push(start_search.elapsed());
    }
    
    let total_search_time: std::time::Duration = search_durations.iter().sum();
    let avg_search_latency = total_search_time / search_iterations as u32;
    
    println!("-> SUKSES: Rata-rata latensi pencarian nama/NIS (SLA < 50ms): {:?}", avg_search_latency);
    assert!(avg_search_latency.as_millis() < 50, "LATENCY WARNING: Single search latency took more than 50ms!");

    // Bersihkan file database fisik
    drop(db);
    if db_path.exists() {
        let _ = std::fs::remove_file(&db_path);
    }
    println!("==================================================\n");
}
