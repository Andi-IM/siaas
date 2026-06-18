use std::path::PathBuf;
use tauri::AppHandle;

/// Abstraksi untuk penyediaan path database.
/// Memungkinkan isolasi antara lingkungan development dan production.
pub trait DbPathProvider: Send + Sync {
    fn get_db_path(&self, app_handle: &AppHandle) -> Result<PathBuf, String>;
}

/// Provider standar yang menggunakan conditional compilation.
pub struct AppPathProvider;

impl DbPathProvider for AppPathProvider {
    fn get_db_path(&self, _app_handle: &AppHandle) -> Result<PathBuf, String> {
        #[cfg(debug_assertions)]
        {
            // Saat DEBUG: Gunakan database di folder executable (target/debug)
            let exe_path = std::env::current_exe()
                .map_err(|e| format!("Gagal mendapatkan path executable: {}", e))?;
            let exe_dir = exe_path.parent()
                .ok_or_else(|| "Gagal mendapatkan direktori executable".to_string())?;
            Ok(exe_dir.join("sias_dev.db"))
        }
        #[cfg(not(debug_assertions))]
        {
            use tauri::Manager;
            // Saat RELEASE: Gunakan folder AppData standar
            let app_data_dir = _app_handle.path().app_data_dir()
                .map_err(|e| e.to_string())?;
            Ok(app_data_dir.join("sias.db"))
        }
    }
}
