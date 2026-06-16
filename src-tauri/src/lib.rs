use tauri::Manager;
use sea_orm::DatabaseConnection;

pub mod db;

#[tauri::command]
async fn get_app_logs(app_handle: tauri::AppHandle) -> Result<String, String> {
  let log_dir = app_handle.path().app_log_dir()
    .map_err(|e| e.to_string())?;
  
  let log_path = log_dir.join("sias.log");
  
  if !log_path.exists() {
    return Ok("No log file found.".to_string());
  }

  let file_content = std::fs::read_to_string(&log_path)
    .map_err(|e| e.to_string())?;

  let lines: Vec<&str> = file_content.lines().collect();
  let last_lines = if lines.len() > 50 {
    &lines[lines.len() - 50..]
  } else {
    &lines[..]
  };

  Ok(last_lines.join("\n"))
}

#[tauri::command]
async fn reset_database(
  app_handle: tauri::AppHandle,
  db_conn_state: tauri::State<'_, tokio::sync::RwLock<DatabaseConnection>>
) -> Result<(), String> {
  // Close the database connection to release the lock on sias.db
  let mut db_conn = db_conn_state.write().await;
  db_conn.close_by_ref().await
    .map_err(|e| e.to_string())?;

  // Resolve database path
  let app_data_dir = app_handle.path().app_data_dir()
    .map_err(|e| e.to_string())?;
  let db_path = app_data_dir.join("sias.db");

  // Delete database files (sias.db, sias.db-wal, sias.db-shm)
  let wal_path = app_data_dir.join("sias.db-wal");
  let shm_path = app_data_dir.join("sias.db-shm");
  
  // Solusi 1: Lakukan beberapa kali percobaan dengan jeda waktu karena OS (Windows) membutuhkan waktu untuk melepas file handle
  let mut deleted = false;
  for _i in 0..5 {
    tokio::time::sleep(std::time::Duration::from_millis(50)).await;
    let db_removed = std::fs::remove_file(&db_path).is_ok();
    let _ = std::fs::remove_file(&wal_path);
    let _ = std::fs::remove_file(&shm_path);
    if db_removed || !db_path.exists() {
      deleted = true;
      break;
    }
  }

  if !deleted && db_path.exists() {
    return Err("Gagal menghapus berkas basis data lama karena masih terkunci oleh sistem.".to_string());
  }

  // Create empty file again
  std::fs::File::create(&db_path)
    .map_err(|e| e.to_string())?;

  // Establish new connection
  let new_conn = db::establish_connection(&db_path).await
    .map_err(|e| e.to_string())?;

  // Run migrations
  let migration_manager = db::migrations::MigrationManager::new();
  migration_manager.run(&new_conn).await
    .map_err(|e| e.to_string())?;

  // Re-manage the database connection in Tauri
  *db_conn = new_conn;

  Ok(())
}

#[tauri::command]
async fn export_database(app_handle: tauri::AppHandle) -> Result<(), String> {
  let app_data_dir = app_handle.path().app_data_dir()
    .map_err(|e| e.to_string())?;
  let db_path = app_data_dir.join("sias.db");

  if !db_path.exists() {
    return Err("Berkas database tidak ditemukan.".to_string());
  }

  let file_path = rfd::FileDialog::new()
    .add_filter("SQLite Database", &["db"])
    .set_file_name("sias_export.db")
    .save_file();

  let dest_path = match file_path {
    Some(p) => p,
    None => return Err("Batal memilih lokasi penyimpanan".to_string()),
  };

  std::fs::copy(&db_path, &dest_path)
    .map_err(|e| e.to_string())?;

  Ok(())
}

#[tauri::command]
async fn import_database(
  app_handle: tauri::AppHandle,
  db_conn_state: tauri::State<'_, tokio::sync::RwLock<DatabaseConnection>>
) -> Result<(), String> {
  let file_path = rfd::FileDialog::new()
    .add_filter("SQLite Database", &["db"])
    .pick_file();

  let src_path = match file_path {
    Some(p) => p,
    None => return Err("Batal memilih berkas database".to_string()),
  };

  // Close the database connection to release the lock on sias.db
  let mut db_conn = db_conn_state.write().await;
  db_conn.close_by_ref().await
    .map_err(|e| e.to_string())?;

  // Resolve database path
  let app_data_dir = app_handle.path().app_data_dir()
    .map_err(|e| e.to_string())?;
  let db_path = app_data_dir.join("sias.db");
  let wal_path = app_data_dir.join("sias.db-wal");
  let shm_path = app_data_dir.join("sias.db-shm");

  // Solusi 1: Lakukan beberapa kali percobaan dengan jeda waktu karena OS (Windows) membutuhkan waktu untuk melepas file handle
  let mut deleted = false;
  for _i in 0..5 {
    tokio::time::sleep(std::time::Duration::from_millis(50)).await;
    let db_removed = std::fs::remove_file(&db_path).is_ok();
    let _ = std::fs::remove_file(&wal_path);
    let _ = std::fs::remove_file(&shm_path);
    if db_removed || !db_path.exists() {
      deleted = true;
      break;
    }
  }

  if !deleted && db_path.exists() {
    return Err("Gagal menghapus berkas basis data lama karena masih terkunci oleh sistem.".to_string());
  }

  // Copy imported file to sias.db
  std::fs::copy(&src_path, &db_path)
    .map_err(|e| e.to_string())?;

  // Establish new connection
  let new_conn = db::establish_connection(&db_path).await
    .map_err(|e| e.to_string())?;

  // Run migrations
  let migration_manager = db::migrations::MigrationManager::new();
  migration_manager.run(&new_conn).await
    .map_err(|e| e.to_string())?;

  // Re-manage the database connection in Tauri
  *db_conn = new_conn;

  Ok(())
}

#[tauri::command]
fn get_app_version(app_handle: tauri::AppHandle) -> String {
  app_handle.package_info().version.to_string()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_updater::Builder::new().build())
    .setup(|app| {
      // Initialize logging in both debug and release to enable diagnostics
      app.handle().plugin(
        tauri_plugin_log::Builder::default()
          .level(log::LevelFilter::Info)
          .build(),
      )?;

      // Resolve application data directory and create if it doesn't exist
      let app_data_dir = app.path().app_data_dir()?;
      std::fs::create_dir_all(&app_data_dir)?;
      let db_path = app_data_dir.join("sias.db");
      if !db_path.exists() {
        std::fs::File::create(&db_path)?;
      }

      // Clean up stale WAL/SHM files from a previous crashed session.
      // These files can cause "database is locked" (code: 5) on startup
      // because SQLite WAL recovery conflicts with new connection setup.
      let _ = std::fs::remove_file(app_data_dir.join("sias.db-wal"));
      let _ = std::fs::remove_file(app_data_dir.join("sias.db-shm"));
      
      // Backup database before running migrations
      if let Err(e) = db::backup_database(&db_path) {
          log::warn!("Failed to backup database: {}", e);
      }
      
      // Initialize database connection and run migrations using Tauri's async runtime
      let db_conn = tauri::async_runtime::block_on(async {
          let conn = db::establish_connection(&db_path).await
              .map_err(|e| tauri::Error::from(std::io::Error::other(e.to_string())))?;
          
          let migration_manager = db::migrations::MigrationManager::new();
          migration_manager.run(&conn).await
              .map_err(|e| tauri::Error::from(std::io::Error::other(e.to_string())))?;
          
          Ok::<DatabaseConnection, tauri::Error>(conn)
      })?;

      // Manage database connection in Tauri state
      app.manage(tokio::sync::RwLock::new(db_conn));

      Ok(())
    })
    .invoke_handler(tauri::generate_handler![
        get_app_logs,
        reset_database,
        export_database,
        import_database,
        get_app_version,
        db::commands::create_program,
        db::commands::get_programs,
        db::commands::update_program,
        db::commands::delete_program,
        db::commands::create_major,
        db::commands::get_majors,
        db::commands::update_major,
        db::commands::delete_major,
        db::commands::create_batch,
        db::commands::get_batches,
        db::commands::create_semester,
        db::commands::get_semesters,
        db::commands::create_subject,
        db::commands::get_subjects,
        db::commands::update_subject,
        db::commands::delete_subject,
        db::commands::create_student,
        db::commands::get_students,
        db::commands::update_student,
        db::commands::delete_student,
        db::commands::create_curriculum_subject,
        db::commands::get_curriculum_subjects,
        db::commands::get_subjects_by_major,
        db::commands::assign_subject_to_semesters,
        db::commands::upsert_student_grade,
        db::commands::batch_upsert_grades,
        db::commands::get_grades_by_filter,
        db::commands::get_grades_by_student,
        db::commands::get_student_grades,
        db::commands::import_grades_from_excel,
        db::commands::export_grades_to_excel
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
