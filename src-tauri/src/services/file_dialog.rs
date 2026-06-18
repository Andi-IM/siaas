use serde::{Deserialize, Serialize};
use std::path::PathBuf;

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct SelectedFile {
    pub path: String,
    pub name: String,
}

pub trait FileDialogService: Send + Sync {
    fn pick_file(&self, title: &str, filters: Vec<(String, Vec<String>)>) -> Option<SelectedFile>;
    fn save_file(
        &self,
        title: &str,
        filters: Vec<(String, Vec<String>)>,
        default_name: Option<String>,
    ) -> Option<SelectedFile>;
}

pub struct NativeFileDialog;

impl FileDialogService for NativeFileDialog {
    fn pick_file(&self, _title: &str, filters: Vec<(String, Vec<String>)>) -> Option<SelectedFile> {
        let mut dialog = rfd::FileDialog::new();
        for (name, exts) in filters {
            let exts_refs: Vec<&str> = exts.iter().map(|s| s.as_str()).collect();
            dialog = dialog.add_filter(name, &exts_refs);
        }

        let path = dialog.pick_file()?;
        Some(SelectedFile {
            name: path.file_name()?.to_string_lossy().to_string(),
            path: path.to_string_lossy().to_string(),
        })
    }

    fn save_file(
        &self,
        _title: &str,
        filters: Vec<(String, Vec<String>)>,
        default_name: Option<String>,
    ) -> Option<SelectedFile> {
        let mut dialog = rfd::FileDialog::new();
        for (name, exts) in filters {
            let exts_refs: Vec<&str> = exts.iter().map(|s| s.as_str()).collect();
            dialog = dialog.add_filter(name, &exts_refs);
        }

        if let Some(name) = default_name {
            dialog = dialog.set_file_name(name);
        }

        let path = dialog.save_file()?;
        Some(SelectedFile {
            name: path.file_name()?.to_string_lossy().to_string(),
            path: path.to_string_lossy().to_string(),
        })
    }
}

pub struct MockFileDialog {
    pub mock_path: Option<PathBuf>,
}

impl FileDialogService for MockFileDialog {
    fn pick_file(
        &self,
        _title: &str,
        _filters: Vec<(String, Vec<String>)>,
    ) -> Option<SelectedFile> {
        self.mock_path.as_ref().map(|p| SelectedFile {
            name: p
                .file_name()
                .unwrap_or_default()
                .to_string_lossy()
                .to_string(),
            path: p.to_string_lossy().to_string(),
        })
    }

    fn save_file(
        &self,
        _title: &str,
        _filters: Vec<(String, Vec<String>)>,
        _default_name: Option<String>,
    ) -> Option<SelectedFile> {
        self.mock_path.as_ref().map(|p| SelectedFile {
            name: p
                .file_name()
                .unwrap_or_default()
                .to_string_lossy()
                .to_string(),
            path: p.to_string_lossy().to_string(),
        })
    }
}
