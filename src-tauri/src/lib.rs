use tauri::Manager;

pub mod db;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }

      // Resolve application data directory and create if it doesn't exist
      let app_data_dir = app.path().app_data_dir()?;
      std::fs::create_dir_all(&app_data_dir)?;
      let db_path = app_data_dir.join("sias.db");
      
      // Initialize database pool
      let db_pool = db::DatabasePool::new(&db_path)
          .map_err(|e| tauri::Error::from(std::io::Error::new(std::io::ErrorKind::Other, e.to_string())))?;

      // Run database migrations
      {
          let conn = db_pool.get_conn()
              .map_err(|e| tauri::Error::from(std::io::Error::new(std::io::ErrorKind::Other, e.to_string())))?;
          let migration_manager = db::migrations::MigrationManager::new();
          migration_manager.run(&conn)
              .map_err(|e| tauri::Error::from(std::io::Error::new(std::io::ErrorKind::Other, e.to_string())))?;
      }

      // Manage database pool in Tauri state
      app.manage(db_pool);

      Ok(())
    })
    .invoke_handler(tauri::generate_handler![
        db::commands::create_major,
        db::commands::get_majors,
        db::commands::create_batch,
        db::commands::get_batches,
        db::commands::create_semester,
        db::commands::get_semesters,
        db::commands::create_subject,
        db::commands::get_subjects,
        db::commands::create_student,
        db::commands::get_students,
        db::commands::create_curriculum_subject,
        db::commands::get_curriculum_subjects,
        db::commands::create_student_grade,
        db::commands::get_student_grades
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
