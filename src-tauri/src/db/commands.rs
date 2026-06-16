use tauri::State;
use sea_orm::{DatabaseConnection, EntityTrait};
use crate::db::entities::{programs, majors, batches, semesters, subjects, students, curriculum_subjects, student_grades};
use crate::db::core::*;

// ==========================================
// PROGRAMS COMMANDS
// ==========================================

#[tauri::command]
pub async fn create_program(
    state: State<'_, tokio::sync::RwLock<DatabaseConnection>>,
    name: String,
) -> Result<programs::Model, String> {
    create_program_core(&*state.read().await, name).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_programs(
    state: State<'_, tokio::sync::RwLock<DatabaseConnection>>,
) -> Result<Vec<programs::Model>, String> {
    get_programs_core(&*state.read().await).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_program(
    state: State<'_, tokio::sync::RwLock<DatabaseConnection>>,
    id: String,
    name: String,
) -> Result<programs::Model, String> {
    update_program_core(&*state.read().await, &id, name).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn delete_program(
    state: State<'_, tokio::sync::RwLock<DatabaseConnection>>,
    id: String,
) -> Result<bool, String> {
    delete_program_core(&*state.read().await, &id).await.map_err(|e| e.to_string())
}

// ==========================================
// MAJORS COMMANDS
// ==========================================

#[tauri::command]
pub async fn create_major(
    state: State<'_, tokio::sync::RwLock<DatabaseConnection>>,
    code: String,
    name: String,
    program_id: Option<String>,
) -> Result<majors::Model, String> {
    create_major_core(&*state.read().await, code, name, program_id).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_majors(
    state: State<'_, tokio::sync::RwLock<DatabaseConnection>>,
) -> Result<Vec<majors::Model>, String> {
    get_majors_core(&*state.read().await).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_major(
    state: State<'_, tokio::sync::RwLock<DatabaseConnection>>,
    id: String,
    name: String,
    code: String,
    program_id: Option<String>,
) -> Result<majors::Model, String> {
    update_major_core(&*state.read().await, &id, name, code, program_id).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn delete_major(
    state: State<'_, tokio::sync::RwLock<DatabaseConnection>>,
    id: String,
) -> Result<bool, String> {
    delete_major_core(&*state.read().await, &id).await.map_err(|e| e.to_string())
}

// ==========================================
// BATCHES COMMANDS
// ==========================================

#[tauri::command]
pub async fn create_batch(
    state: State<'_, tokio::sync::RwLock<DatabaseConnection>>,
    year: i32,
) -> Result<batches::Model, String> {
    create_batch_core(&*state.read().await, year).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_batches(
    state: State<'_, tokio::sync::RwLock<DatabaseConnection>>,
) -> Result<Vec<batches::Model>, String> {
    get_batches_core(&*state.read().await).await.map_err(|e| e.to_string())
}

// ==========================================
// SEMESTERS COMMANDS
// ==========================================

#[tauri::command]
pub async fn create_semester(
    state: State<'_, tokio::sync::RwLock<DatabaseConnection>>,
    code: String,
    name: String,
    sequence: i32,
) -> Result<semesters::Model, String> {
    create_semester_core(&*state.read().await, code, name, sequence).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_semesters(
    state: State<'_, tokio::sync::RwLock<DatabaseConnection>>,
) -> Result<Vec<semesters::Model>, String> {
    get_semesters_core(&*state.read().await).await.map_err(|e| e.to_string())
}

// ==========================================
// SUBJECTS COMMANDS
// ==========================================

#[tauri::command]
pub async fn create_subject(
    state: State<'_, tokio::sync::RwLock<DatabaseConnection>>,
    code: String,
    name: String,
    category: String,
    status: String,
    transcript_group: String,
    sequence: i32,
) -> Result<subjects::Model, String> {
    create_subject_core(&*state.read().await, code, name, category, status, transcript_group, sequence).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_subjects(
    state: State<'_, tokio::sync::RwLock<DatabaseConnection>>,
) -> Result<Vec<subjects::Model>, String> {
    get_subjects_core(&*state.read().await).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_subject(
    state: State<'_, tokio::sync::RwLock<DatabaseConnection>>,
    id: String,
    name: String,
    code: String,
    category: String,
    status: String,
    transcript_group: String,
    sequence: i32,
) -> Result<subjects::Model, String> {
    update_subject_core(&*state.read().await, &id, name, code, category, status, transcript_group, sequence).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn delete_subject(
    state: State<'_, tokio::sync::RwLock<DatabaseConnection>>,
    id: String,
) -> Result<bool, String> {
    delete_subject_core(&*state.read().await, &id).await.map_err(|e| e.to_string())
}

// ==========================================
// STUDENT COMMANDS
// ==========================================

#[tauri::command]
pub async fn create_student(
    state: State<'_, tokio::sync::RwLock<DatabaseConnection>>,
    student: students::Model,
) -> Result<students::Model, String> {
    create_student_core(&*state.read().await, student).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_students(
    state: State<'_, tokio::sync::RwLock<DatabaseConnection>>,
) -> Result<Vec<students::Model>, String> {
    get_students_core(&*state.read().await).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_student(
    state: State<'_, tokio::sync::RwLock<DatabaseConnection>>,
    nis: String,
    student: students::Model,
) -> Result<students::Model, String> {
    update_student_core(&*state.read().await, &nis, student).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn delete_student(
    state: State<'_, tokio::sync::RwLock<DatabaseConnection>>,
    nis: String,
) -> Result<bool, String> {
    delete_student_core(&*state.read().await, &nis).await.map_err(|e| e.to_string())
}

// ==========================================
// CURRICULUM SUBJECTS COMMANDS
// ==========================================

#[tauri::command]
pub async fn create_curriculum_subject(
    state: State<'_, tokio::sync::RwLock<DatabaseConnection>>,
    major_id: String,
    batch_id: String,
    semester_id: String,
    subject_id: String,
) -> Result<curriculum_subjects::Model, String> {
    create_curriculum_subject_core(&*state.read().await, &major_id, &batch_id, &semester_id, &subject_id).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_curriculum_subjects(
    state: State<'_, tokio::sync::RwLock<DatabaseConnection>>,
) -> Result<Vec<curriculum_subjects::Model>, String> {
    get_curriculum_subjects_core(&*state.read().await).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_subjects_by_major(
    state: State<'_, tokio::sync::RwLock<DatabaseConnection>>,
    major_id: String,
) -> Result<Vec<MataPelajaranData>, String> {
    get_subjects_by_major_core(&*state.read().await, &major_id).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn assign_subject_to_semesters(
    state: State<'_, tokio::sync::RwLock<DatabaseConnection>>,
    major_id: String,
    subject_id: String,
    semester_sequences: Vec<i32>,
) -> Result<(), String> {
    assign_subject_to_semesters_core(&*state.read().await, &major_id, &subject_id, semester_sequences).await.map_err(|e| e.to_string())
}

// ==========================================
// STUDENT GRADES COMMANDS
// ==========================================

#[tauri::command]
pub async fn upsert_student_grade(
    state: State<'_, tokio::sync::RwLock<DatabaseConnection>>,
    student_id: String, // Can be UUID or NIS
    curriculum_subject_id: String,
    grade: f64,
) -> Result<student_grades::Model, String> {
    upsert_student_grade_core(&*state.read().await, &student_id, &curriculum_subject_id, grade).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_grades_by_filter(
    state: State<'_, tokio::sync::RwLock<DatabaseConnection>>,
    major_id: String,
    semester_sequence: i32,
) -> Result<Vec<GradeSummary>, String> {
    get_grades_by_filter_core(&*state.read().await, &major_id, semester_sequence).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn batch_upsert_grades(
    state: State<'_, tokio::sync::RwLock<DatabaseConnection>>,
    major_id: String,
    semester_sequence: i32,
    grades: Vec<GradeSummary>,
) -> Result<(), String> {
    batch_upsert_grades_core(&*state.read().await, &major_id, semester_sequence, grades).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_grades_by_student(
    state: State<'_, tokio::sync::RwLock<DatabaseConnection>>,
    student_id: String, // Can be UUID or NIS
) -> Result<Vec<StudentGradeDetail>, String> {
    get_grades_by_student_core(&*state.read().await, &student_id).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_student_grades(
    state: State<'_, tokio::sync::RwLock<DatabaseConnection>>,
) -> Result<Vec<student_grades::Model>, String> {
    get_student_grades_core(&*state.read().await).await.map_err(|e| e.to_string())
}

// ==========================================
// EXCEL IMPORT/EXPORT COMMANDS
// ==========================================

#[tauri::command]
pub async fn import_grades_from_excel(
    state: State<'_, tokio::sync::RwLock<DatabaseConnection>>,
) -> Result<String, String> {
    let db_guard = state.read().await;
    let db = &*db_guard;

    let file_path = rfd::FileDialog::new()
        .add_filter("Excel Files", &["xlsx"])
        .pick_file();

    let path = match file_path {
        Some(p) => p,
        None => return Err("Batal memilih berkas".to_string()),
    };

    import_grades_from_excel_core(db, &path).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn export_grades_to_excel(
    state: State<'_, tokio::sync::RwLock<DatabaseConnection>>,
    major_id: String,
) -> Result<String, String> {
    let db_guard = state.read().await;
    let db = &*db_guard;

    let major = majors::Entity::find_by_id(major_id.clone())
        .one(db)
        .await
        .map_err(|e| e.to_string())?
        .ok_or_else(|| "Konsentrasi Keahlian tidak ditemukan".to_string())?;

    let file_path = rfd::FileDialog::new()
        .add_filter("Excel Files", &["xlsx"])
        .set_file_name(format!("rekap_nilai_{}.xlsx", major.name.replace(" ", "_")))
        .save_file();

    let path = match file_path {
        Some(p) => p,
        None => return Err("Batal menyimpan berkas".to_string()),
    };

    export_grades_to_excel_core(db, &major_id, &path).await.map_err(|e| e.to_string())
}
