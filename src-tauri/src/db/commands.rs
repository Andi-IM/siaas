use tauri::State;
use sea_orm::{DatabaseConnection, EntityTrait};
use crate::db::entities::{programs, majors, batches, semesters, subjects, students, curriculum_subjects, student_grades};
use crate::db::core::*;

// ==========================================
// PROGRAMS COMMANDS
// ==========================================

#[tauri::command]
pub async fn create_program(
    state: State<'_, DatabaseConnection>,
    name: String,
) -> Result<programs::Model, String> {
    create_program_core(state.inner(), name).await
}

#[tauri::command]
pub async fn get_programs(
    state: State<'_, DatabaseConnection>,
) -> Result<Vec<programs::Model>, String> {
    get_programs_core(state.inner()).await
}

#[tauri::command]
pub async fn update_program(
    state: State<'_, DatabaseConnection>,
    id: String,
    name: String,
) -> Result<programs::Model, String> {
    update_program_core(state.inner(), &id, name).await
}

#[tauri::command]
pub async fn delete_program(
    state: State<'_, DatabaseConnection>,
    id: String,
) -> Result<bool, String> {
    delete_program_core(state.inner(), &id).await
}

// ==========================================
// MAJORS COMMANDS
// ==========================================

#[tauri::command]
pub async fn create_major(
    state: State<'_, DatabaseConnection>,
    code: String,
    name: String,
    program_id: Option<String>,
) -> Result<majors::Model, String> {
    create_major_core(state.inner(), code, name, program_id).await
}

#[tauri::command]
pub async fn get_majors(
    state: State<'_, DatabaseConnection>,
) -> Result<Vec<majors::Model>, String> {
    get_majors_core(state.inner()).await
}

#[tauri::command]
pub async fn update_major(
    state: State<'_, DatabaseConnection>,
    id: String,
    name: String,
    code: String,
    program_id: Option<String>,
) -> Result<majors::Model, String> {
    update_major_core(state.inner(), &id, name, code, program_id).await
}

#[tauri::command]
pub async fn delete_major(
    state: State<'_, DatabaseConnection>,
    id: String,
) -> Result<bool, String> {
    delete_major_core(state.inner(), &id).await
}

// ==========================================
// BATCHES COMMANDS
// ==========================================

#[tauri::command]
pub async fn create_batch(
    state: State<'_, DatabaseConnection>,
    year: i32,
) -> Result<batches::Model, String> {
    create_batch_core(state.inner(), year).await
}

#[tauri::command]
pub async fn get_batches(
    state: State<'_, DatabaseConnection>,
) -> Result<Vec<batches::Model>, String> {
    get_batches_core(state.inner()).await
}

// ==========================================
// SEMESTERS COMMANDS
// ==========================================

#[tauri::command]
pub async fn create_semester(
    state: State<'_, DatabaseConnection>,
    code: String,
    name: String,
    sequence: i32,
) -> Result<semesters::Model, String> {
    create_semester_core(state.inner(), code, name, sequence).await
}

#[tauri::command]
pub async fn get_semesters(
    state: State<'_, DatabaseConnection>,
) -> Result<Vec<semesters::Model>, String> {
    get_semesters_core(state.inner()).await
}

// ==========================================
// SUBJECTS COMMANDS
// ==========================================

#[tauri::command]
pub async fn create_subject(
    state: State<'_, DatabaseConnection>,
    code: String,
    name: String,
    category: String,
    status: String,
    sequence: i32,
) -> Result<subjects::Model, String> {
    create_subject_core(state.inner(), code, name, category, status, sequence).await
}

#[tauri::command]
pub async fn get_subjects(
    state: State<'_, DatabaseConnection>,
) -> Result<Vec<subjects::Model>, String> {
    get_subjects_core(state.inner()).await
}

#[tauri::command]
pub async fn update_subject(
    state: State<'_, DatabaseConnection>,
    id: String,
    name: String,
    code: String,
    category: String,
    status: String,
    sequence: i32,
) -> Result<subjects::Model, String> {
    update_subject_core(state.inner(), &id, name, code, category, status, sequence).await
}

#[tauri::command]
pub async fn delete_subject(
    state: State<'_, DatabaseConnection>,
    id: String,
) -> Result<bool, String> {
    delete_subject_core(state.inner(), &id).await
}

// ==========================================
// STUDENT COMMANDS
// ==========================================

#[tauri::command]
pub async fn create_student(
    state: State<'_, DatabaseConnection>,
    student: students::Model,
) -> Result<students::Model, String> {
    create_student_core(state.inner(), student).await
}

#[tauri::command]
pub async fn get_students(
    state: State<'_, DatabaseConnection>,
) -> Result<Vec<students::Model>, String> {
    get_students_core(state.inner()).await
}

#[tauri::command]
pub async fn update_student(
    state: State<'_, DatabaseConnection>,
    nis: String,
    student: students::Model,
) -> Result<students::Model, String> {
    update_student_core(state.inner(), &nis, student).await
}

#[tauri::command]
pub async fn delete_student(
    state: State<'_, DatabaseConnection>,
    nis: String,
) -> Result<bool, String> {
    delete_student_core(state.inner(), &nis).await
}

// ==========================================
// CURRICULUM SUBJECTS COMMANDS
// ==========================================

#[tauri::command]
pub async fn create_curriculum_subject(
    state: State<'_, DatabaseConnection>,
    major_id: String,
    batch_id: String,
    semester_id: String,
    subject_id: String,
) -> Result<curriculum_subjects::Model, String> {
    create_curriculum_subject_core(state.inner(), &major_id, &batch_id, &semester_id, &subject_id).await
}

#[tauri::command]
pub async fn get_curriculum_subjects(
    state: State<'_, DatabaseConnection>,
) -> Result<Vec<curriculum_subjects::Model>, String> {
    get_curriculum_subjects_core(state.inner()).await
}

#[tauri::command]
pub async fn get_subjects_by_major(
    state: State<'_, DatabaseConnection>,
    major_id: String,
) -> Result<Vec<MataPelajaranData>, String> {
    get_subjects_by_major_core(state.inner(), &major_id).await
}

#[tauri::command]
pub async fn assign_subject_to_semesters(
    state: State<'_, DatabaseConnection>,
    major_id: String,
    subject_id: String,
    semester_sequences: Vec<i32>,
) -> Result<(), String> {
    assign_subject_to_semesters_core(state.inner(), &major_id, &subject_id, semester_sequences).await
}

// ==========================================
// STUDENT GRADES COMMANDS
// ==========================================

#[tauri::command]
pub async fn upsert_student_grade(
    state: State<'_, DatabaseConnection>,
    student_id: String, // Can be UUID or NIS
    curriculum_subject_id: String,
    grade: f64,
) -> Result<student_grades::Model, String> {
    upsert_student_grade_core(state.inner(), &student_id, &curriculum_subject_id, grade).await
}

#[tauri::command]
pub async fn get_grades_by_filter(
    state: State<'_, DatabaseConnection>,
    major_id: String,
    semester_sequence: i32,
) -> Result<Vec<GradeSummary>, String> {
    get_grades_by_filter_core(state.inner(), &major_id, semester_sequence).await
}

#[tauri::command]
pub async fn batch_upsert_grades(
    state: State<'_, DatabaseConnection>,
    major_id: String,
    semester_sequence: i32,
    grades: Vec<GradeSummary>,
) -> Result<(), String> {
    batch_upsert_grades_core(state.inner(), &major_id, semester_sequence, grades).await
}

#[tauri::command]
pub async fn get_grades_by_student(
    state: State<'_, DatabaseConnection>,
    student_id: String, // Can be UUID or NIS
) -> Result<Vec<StudentGradeDetail>, String> {
    get_grades_by_student_core(state.inner(), &student_id).await
}

#[tauri::command]
pub async fn get_student_grades(
    state: State<'_, DatabaseConnection>,
) -> Result<Vec<student_grades::Model>, String> {
    get_student_grades_core(state.inner()).await
}

// ==========================================
// EXCEL IMPORT/EXPORT COMMANDS
// ==========================================

#[tauri::command]
pub async fn import_grades_from_excel(
    state: State<'_, DatabaseConnection>,
) -> Result<String, String> {
    let db = state.inner();

    let file_path = rfd::FileDialog::new()
        .add_filter("Excel Files", &["xlsx"])
        .pick_file();

    let path = match file_path {
        Some(p) => p,
        None => return Err("Batal memilih berkas".to_string()),
    };

    import_grades_from_excel_core(db, &path).await
}

#[tauri::command]
pub async fn export_grades_to_excel(
    state: State<'_, DatabaseConnection>,
    major_id: String,
) -> Result<String, String> {
    let db = state.inner();

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

    export_grades_to_excel_core(db, &major_id, &path).await
}
