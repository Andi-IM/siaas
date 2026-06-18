use tauri::State;
use sea_orm::{DatabaseConnection, EntityTrait, QueryFilter, ColumnTrait};
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

#[cfg(debug_assertions)]
#[tauri::command]
pub async fn import_grades_from_excel_test(
    state: State<'_, tokio::sync::RwLock<DatabaseConnection>>,
    path: String,
) -> Result<String, String> {
    let db_guard = state.read().await;
    let db = &*db_guard;
    let path_buf = std::path::PathBuf::from(path);
    import_grades_from_excel_core(db, &path_buf).await.map_err(|e| e.to_string())
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

#[cfg(debug_assertions)]
#[tauri::command]
pub async fn export_grades_to_excel_test(
    state: State<'_, tokio::sync::RwLock<DatabaseConnection>>,
    major_id: String,
    path: String,
) -> Result<String, String> {
    let db_guard = state.read().await;
    let db = &*db_guard;
    let path_buf = std::path::PathBuf::from(path);
    export_grades_to_excel_core(db, &major_id, &path_buf).await.map_err(|e| e.to_string())
}

// ==========================================
// PDF TRANSCRIPT EXPORT
// ==========================================

#[derive(serde::Deserialize)]
pub struct TranscriptPdfData {
    pub nis: String,
    pub student_name: String,
    pub nisn: String,
    pub place_of_birth: String,
    pub date_of_birth: String,
    pub school_name: String,
    pub concentration: String,
    pub subjects: Vec<TranscriptSubjectData>,
    pub semester_averages: Vec<f64>,
    pub overall_average: f64,
}

#[derive(serde::Deserialize)]
pub struct TranscriptSubjectData {
    pub no: i32,
    pub name: String,
    pub category: String,
    pub scores: [Option<f64>; 6],
    pub average: f64,
}

pub fn generate_transcript_pdf(data: &TranscriptPdfData, path: &std::path::Path) -> Result<String, String> {
    use printpdf::*;
    use std::io::BufWriter;

    // A4 portrait
    let (doc, _page1, layer1) = PdfDocument::new(
        "Transkrip Nilai",
        Mm(210.0),
        Mm(297.0),
        "Layer 1",
    );
    let current_layer = doc.get_page(_page1).get_layer(layer1);
    let font = doc.add_builtin_font(BuiltinFont::Helvetica)
        .map_err(|e| format!("Font error: {}", e))?;
    let font_bold = doc.add_builtin_font(BuiltinFont::HelveticaBold)
        .map_err(|e| format!("Font error: {}", e))?;

    fn mm(v: f64) -> Mm { Mm(v) }

    fn draw_text(
        layer: &PdfLayerReference,
        text: &str,
        font_size: f64,
        x: f64,
        y: f64,
        font: &IndirectFontRef,
    ) {
        layer.use_text(text, font_size, mm(x), mm(y), font);
    }

    fn draw_shape(layer: &PdfLayerReference, points: &[(f64, f64)], is_closed: bool, has_fill: bool, has_stroke: bool) {
        let line = Line {
            points: points.iter().map(|(x, y)| (Point::new(mm(*x), mm(*y)), false)).collect(),
            is_closed,
            has_fill,
            has_stroke,
            is_clipping_path: false,
        };
        layer.add_shape(line);
    }

    fn draw_line(layer: &PdfLayerReference, x1: f64, y1: f64, x2: f64, y2: f64) {
        draw_shape(layer, &[(x1, y1), (x2, y2)], false, false, true);
    }

    fn draw_rect_filled(
        layer: &PdfLayerReference,
        x: f64, y: f64, w: f64, h: f64,
        fill_color: Color,
        stroke: bool,
    ) {
        layer.set_fill_color(fill_color);
        draw_shape(layer, &[(x, y), (x + w, y), (x + w, y + h), (x, y + h)], true, true, stroke);
    }

    fn draw_cell(
        layer: &PdfLayerReference,
        font: &IndirectFontRef,
        text: &str,
        x: f64, y: f64, w: f64, h: f64,
        font_size: f64,
        align_center: bool,
        _bold: bool,
    ) {
        draw_line(layer, x, y, x + w, y);
        draw_line(layer, x, y + h, x + w, y + h);
        draw_line(layer, x, y, x, y + h);
        draw_line(layer, x + w, y, x + w, y + h);

        if !text.is_empty() {
            let tx = if align_center { x + w / 2.0 } else { x + 1.5 };
            draw_text(layer, text, font_size, tx, y + h - font_size * 0.4, font);
        }
    }

    fn draw_gray_cell(layer: &PdfLayerReference, x: f64, y: f64, w: f64, h: f64) {
        draw_rect_filled(
            layer, x, y, w, h,
            Color::Rgb(Rgb::new(0.65, 0.65, 0.65, None)),
            true,
        );
    }

    let page_h: f64 = 297.0;
    let page_w: f64 = 210.0;
    let margin_top: f64 = 10.0;
    let margin_left: f64 = 15.0;
    let row_h: f64 = 6.0;
    let header_h: f64 = 7.0;

    let col_no_w: f64 = 10.0;
    let col_name_w: f64 = 70.0;
    let col_sem_w: f64 = 14.0;
    let col_avg_w: f64 = 18.0;

    let mut y = page_h - margin_top;

    // TITLE
    draw_text(&current_layer, "TRANSKRIP NILAI", 12.0, (page_w - 40.0) / 2.0, y, &font_bold);
    y -= 6.0;
    draw_text(&current_layer, "SEKOLAH MENENGAH KEJURUAN PROGRAM 3 TAHUN", 10.0, (page_w - 75.0) / 2.0, y, &font_bold);
    y -= 10.0;

    // STUDENT INFO
    let info_x = margin_left;
    let label_w: f64 = 38.0;

    draw_text(&current_layer, "Nama", 9.0, info_x, y, &font);
    draw_text(&current_layer, ":", 9.0, info_x + label_w - 3.0, y, &font);
    draw_text(&current_layer, &data.student_name, 9.0, info_x + label_w + 3.0, y, &font_bold);
    y -= 4.5;

    draw_text(&current_layer, "Tempat / Tanggal Lahir", 9.0, info_x, y, &font);
    draw_text(&current_layer, ":", 9.0, info_x + label_w - 3.0, y, &font);
    draw_text(&current_layer, &format!("{}, {}", data.place_of_birth, data.date_of_birth), 9.0, info_x + label_w + 3.0, y, &font);
    y -= 4.5;

    draw_text(&current_layer, "NIS / NISN", 9.0, info_x, y, &font);
    draw_text(&current_layer, ":", 9.0, info_x + label_w - 3.0, y, &font);
    draw_text(&current_layer, &format!("{} / {}", data.nis, data.nisn), 9.0, info_x + label_w + 3.0, y, &font);
    y -= 4.5;

    draw_text(&current_layer, "Nama Sekolah", 9.0, info_x, y, &font);
    draw_text(&current_layer, ":", 9.0, info_x + label_w - 3.0, y, &font);
    draw_text(&current_layer, &data.school_name, 9.0, info_x + label_w + 3.0, y, &font);
    y -= 4.5;

    draw_text(&current_layer, "Konsentrasi Keahlian", 9.0, info_x, y, &font);
    draw_text(&current_layer, ":", 9.0, info_x + label_w - 3.0, y, &font);
    draw_text(&current_layer, &data.concentration, 9.0, info_x + label_w + 3.0, y, &font);
    y -= 7.0;

    // TABLE HEADER
    let table_x = margin_left;
    let mut cx = table_x;

    draw_cell(&current_layer, &font_bold, "No", cx, y, col_no_w, header_h, 7.0, true, true);
    cx += col_no_w;
    draw_cell(&current_layer, &font_bold, "MATA PELAJARAN", cx, y, col_name_w, header_h, 7.0, true, true);
    cx += col_name_w;

    let kelas_x_w = col_sem_w * 2.0;
    let kelas_x_x = cx;
    draw_cell(&current_layer, &font_bold, "KELAS X", cx, y, kelas_x_w, header_h, 7.0, true, true);
    cx += col_sem_w;
    draw_line(&current_layer, cx, y, cx, y + header_h);
    draw_cell(&current_layer, &font, "SMT 1", cx, y, col_sem_w, header_h, 7.0, true, false);
    cx += col_sem_w;
    draw_line(&current_layer, cx, y, cx, y + header_h);
    draw_cell(&current_layer, &font, "SMT 2", cx, y, col_sem_w, header_h, 7.0, true, false);
    cx += col_sem_w;
    draw_line(&current_layer, kelas_x_x + kelas_x_w, y, kelas_x_x + kelas_x_w, y + header_h);

    let kelas_xi_w = col_sem_w * 2.0;
    let kelas_xi_x = cx;
    draw_cell(&current_layer, &font_bold, "KELAS XI", cx, y, kelas_xi_w, header_h, 7.0, true, true);
    cx += col_sem_w;
    draw_line(&current_layer, cx, y, cx, y + header_h);
    draw_cell(&current_layer, &font, "SMT 3", cx, y, col_sem_w, header_h, 7.0, true, false);
    cx += col_sem_w;
    draw_line(&current_layer, cx, y, cx, y + header_h);
    draw_cell(&current_layer, &font, "SMT 4", cx, y, col_sem_w, header_h, 7.0, true, false);
    cx += col_sem_w;
    draw_line(&current_layer, kelas_xi_x + kelas_xi_w, y, kelas_xi_x + kelas_xi_w, y + header_h);

    let kelas_xii_w = col_sem_w * 2.0;
    let kelas_xii_x = cx;
    draw_cell(&current_layer, &font_bold, "KELAS XII", cx, y, kelas_xii_w, header_h, 7.0, true, true);
    cx += col_sem_w;
    draw_line(&current_layer, cx, y, cx, y + header_h);
    draw_cell(&current_layer, &font, "SMT 5", cx, y, col_sem_w, header_h, 7.0, true, false);
    cx += col_sem_w;
    draw_line(&current_layer, cx, y, cx, y + header_h);
    draw_cell(&current_layer, &font, "SMT 6", cx, y, col_sem_w, header_h, 7.0, true, false);
    cx += col_sem_w;
    draw_line(&current_layer, kelas_xii_x + kelas_xii_w, y, kelas_xii_x + kelas_xii_w, y + header_h);

    draw_cell(&current_layer, &font_bold, "RATA-RATA NILAI", cx, y, col_avg_w, header_h, 6.5, true, true);
    y -= header_h;

    // TABLE BODY
    let total_w = col_no_w + col_name_w + col_sem_w * 6.0 + col_avg_w;
    let mut current_category = String::new();

    for subject in &data.subjects {
        if subject.category != current_category {
            current_category = subject.category.clone();
            let cat_label = if current_category == "Kelompok Umum" {
                "A. Kelompok Umum"
            } else {
                "B. Kelompok Kejuruan"
            };
            draw_rect_filled(&current_layer, table_x, y, total_w, row_h,
                Color::Rgb(Rgb::new(0.85, 0.85, 0.85, None)), true);
            draw_text(&current_layer, cat_label, 8.0, table_x + 2.0, y + row_h - 4.0, &font_bold);
            draw_line(&current_layer, table_x, y, table_x + total_w, y);
            draw_line(&current_layer, table_x, y + row_h, table_x + total_w, y + row_h);
            y -= row_h;
        }

        cx = table_x;
        draw_cell(&current_layer, &font, &subject.no.to_string(), cx, y, col_no_w, row_h, 7.0, true, false);
        cx += col_no_w;
        draw_cell(&current_layer, &font, &subject.name, cx, y, col_name_w, row_h, 7.0, false, false);
        cx += col_name_w;

        for score in subject.scores.iter() {
            match score {
                Some(val) => {
                    draw_cell(&current_layer, &font, &format!("{:.1}", val), cx, y, col_sem_w, row_h, 7.0, true, false);
                }
                None => {
                    draw_gray_cell(&current_layer, cx, y, col_sem_w, row_h);
                }
            }
            cx += col_sem_w;
        }

        draw_cell(&current_layer, &font_bold, &format!("{:.2}", subject.average), cx, y, col_avg_w, row_h, 7.0, true, true);
        y -= row_h;
    }

    // RATA-RATA FOOTER
    cx = table_x;
    draw_cell(&current_layer, &font_bold, "RATA-RATA", cx, y, col_no_w + col_name_w, row_h, 7.5, true, true);
    cx += col_no_w + col_name_w;

    for avg in &data.semester_averages {
        draw_cell(&current_layer, &font_bold, &format!("{:.2}", avg), cx, y, col_sem_w, row_h, 7.5, true, true);
        cx += col_sem_w;
    }

    draw_cell(&current_layer, &font_bold, &format!("{:.2}", data.overall_average), cx, y, col_avg_w, row_h, 7.5, true, true);
    y -= row_h + 5.0;

    // SIGNATURE BLOCK
    let sig_x = page_w - margin_left - 50.0;
    draw_text(&current_layer, "Padang, 14 Juni 2026", 9.0, sig_x, y, &font);
    y -= 4.5;
    draw_text(&current_layer, "Kepala Sekolah,", 9.0, sig_x, y, &font);
    y -= 14.0;
    draw_text(&current_layer, "Zulkifli, S.Pd", 9.0, sig_x, y, &font_bold);
    y -= 4.0;
    draw_text(&current_layer, "NIP. 19670430 199802 1 001", 9.0, sig_x, y, &font);

    let file = std::fs::File::create(path).map_err(|e| format!("Gagal membuat file: {}", e))?;
    let mut writer = BufWriter::new(file);
    doc.save(&mut writer).map_err(|e| format!("Gagal menyimpan PDF: {}", e))?;
    Ok("Berhasil menyimpan transkrip PDF.".to_string())
}

#[tauri::command]
pub async fn export_transcript_pdf(
    state: State<'_, tokio::sync::RwLock<DatabaseConnection>>,
    nis: String,
) -> Result<String, String> {
    let db_guard = state.read().await;
    let db = &*db_guard;

    let student = students::Entity::find()
        .filter(students::Column::Nis.eq(&nis))
        .one(db)
        .await
        .map_err(|e| e.to_string())?
        .ok_or_else(|| "Siswa tidak ditemukan".to_string())?;

    let grade_details = get_grades_by_student_core(db, &nis).await.map_err(|e| e.to_string())?;

    let major = majors::Entity::find_by_id(&student.major_id)
        .one(db)
        .await
        .map_err(|e| e.to_string())?
        .ok_or_else(|| "Konsentrasi tidak ditemukan".to_string())?;

    let mut umum_subjects: Vec<TranscriptSubjectData> = Vec::new();
    let mut kejuruan_subjects: Vec<TranscriptSubjectData> = Vec::new();

    struct SubjectAccumulator {
        name: String, sequence: i32, scores: [Option<f64>; 6], total: f64, count: i32,
    }
    let mut seen: std::collections::BTreeMap<String, SubjectAccumulator> = std::collections::BTreeMap::new();

    for gd in &grade_details {
        if gd.semester_sequence < 1 || gd.semester_sequence > 6 { continue; }
        let idx = (gd.semester_sequence - 1) as usize;
        let key = format!("{}|{}", gd.category, gd.subject_id);
        let entry = seen.entry(key).or_insert(SubjectAccumulator {
            name: gd.subject_name.clone(), sequence: gd.sequence,
            scores: [None; 6], total: 0.0, count: 0,
        });
        entry.scores[idx] = Some(gd.grade);
        entry.total += gd.grade;
        entry.count += 1;
    }

    for (_, acc) in seen {
        let avg = if acc.count > 0 { acc.total / acc.count as f64 } else { 0.0 };
        let cat = if acc.sequence <= 7 { "Kelompok Umum" } else { "Kelompok Kejuruan" };
        let s = TranscriptSubjectData { no: acc.sequence, name: acc.name, category: cat.to_string(), scores: acc.scores, average: avg };
        if s.category == "Kelompok Umum" { umum_subjects.push(s); } else { kejuruan_subjects.push(s); }
    }

    umum_subjects.sort_by_key(|s| s.no);
    kejuruan_subjects.sort_by_key(|s| s.no);
    let mut all = umum_subjects;
    all.extend(kejuruan_subjects);

    let mut u_no = 0; let mut k_no = 0;
    for s in &mut all {
        if s.category == "Kelompok Umum" { u_no += 1; s.no = u_no; } else { k_no += 1; s.no = k_no; }
    }

    let mut sem_t = [0.0_f64; 6]; let mut sem_c = [0_i32; 6];
    for gd in &grade_details {
        if gd.semester_sequence >= 1 && gd.semester_sequence <= 6 {
            let idx = (gd.semester_sequence - 1) as usize;
            sem_t[idx] += gd.grade; sem_c[idx] += 1;
        }
    }
    let sa: Vec<f64> = (0..6).map(|i| if sem_c[i] > 0 { sem_t[i] / sem_c[i] as f64 } else { 0.0 }).collect();
    let ot: f64 = sa.iter().sum();
    let oc = sa.iter().filter(|&&v| v > 0.0).count();
    let oa = if oc > 0 { ot / oc as f64 } else { 0.0 };

    let file_path = rfd::FileDialog::new()
        .add_filter("PDF Files", &["pdf"])
        .set_file_name(format!("transkrip_{}.pdf", student.nis))
        .save_file();

    let path = match file_path {
        Some(p) => p,
        None => return Err("Batal menyimpan berkas".to_string()),
    };

    let data = TranscriptPdfData {
        nis: student.nis, student_name: student.full_name,
        nisn: student.nisn,
        place_of_birth: student.place_of_birth.unwrap_or_default(),
        date_of_birth: student.date_of_birth.unwrap_or_default(),
        school_name: "SMK NEGERI 1 SUMATERA BARAT".to_string(),
        concentration: major.name, subjects: all, semester_averages: sa, overall_average: oa,
    };

    generate_transcript_pdf(&data, &path)
}

#[cfg(debug_assertions)]
#[tauri::command]
pub async fn export_transcript_pdf_test(
    state: State<'_, tokio::sync::RwLock<DatabaseConnection>>,
    nis: String,
    path: String,
) -> Result<String, String> {
    let db_guard = state.read().await;
    let db = &*db_guard;

    let student = students::Entity::find()
        .filter(students::Column::Nis.eq(&nis))
        .one(db)
        .await
        .map_err(|e| e.to_string())?
        .ok_or_else(|| "Siswa tidak ditemukan".to_string())?;

    let grade_details = get_grades_by_student_core(db, &nis).await.map_err(|e| e.to_string())?;
    let major = majors::Entity::find_by_id(&student.major_id)
        .one(db).await.map_err(|e| e.to_string())?
        .ok_or_else(|| "Konsentrasi tidak ditemukan".to_string())?;

    let mut umum: Vec<TranscriptSubjectData> = Vec::new();
    let mut kejuruan: Vec<TranscriptSubjectData> = Vec::new();

    struct Acc { name: String, seq: i32, scores: [Option<f64>; 6], total: f64, count: i32 }
    let mut seen: std::collections::BTreeMap<String, Acc> = std::collections::BTreeMap::new();

    for gd in &grade_details {
        if gd.semester_sequence < 1 || gd.semester_sequence > 6 { continue; }
        let idx = (gd.semester_sequence - 1) as usize;
        let key = format!("{}|{}", gd.category, gd.subject_id);
        let e = seen.entry(key).or_insert(Acc { name: gd.subject_name.clone(), seq: gd.sequence, scores: [None; 6], total: 0.0, count: 0 });
        e.scores[idx] = Some(gd.grade); e.total += gd.grade; e.count += 1;
    }

    for (_, a) in seen {
        let avg = if a.count > 0 { a.total / a.count as f64 } else { 0.0 };
        let cat = if a.seq <= 7 { "Kelompok Umum" } else { "Kelompok Kejuruan" };
        let s = TranscriptSubjectData { no: a.seq, name: a.name, category: cat.to_string(), scores: a.scores, average: avg };
        if s.category == "Kelompok Umum" { umum.push(s); } else { kejuruan.push(s); }
    }

    umum.sort_by_key(|s| s.no); kejuruan.sort_by_key(|s| s.no);
    let mut all = umum; all.extend(kejuruan);
    let mut u = 0; let mut k = 0;
    for s in &mut all { if s.category == "Kelompok Umum" { u += 1; s.no = u; } else { k += 1; s.no = k; } }

    let mut st = [0.0_f64; 6]; let mut sc = [0_i32; 6];
    for gd in &grade_details {
        if gd.semester_sequence >= 1 && gd.semester_sequence <= 6 {
            let idx = (gd.semester_sequence - 1) as usize; st[idx] += gd.grade; sc[idx] += 1;
        }
    }
    let sa: Vec<f64> = (0..6).map(|i| if sc[i] > 0 { st[i] / sc[i] as f64 } else { 0.0 }).collect();
    let ot: f64 = sa.iter().sum(); let oc = sa.iter().filter(|&&v| v > 0.0).count();
    let oa = if oc > 0 { ot / oc as f64 } else { 0.0 };

    let data = TranscriptPdfData {
        nis: student.nis, student_name: student.full_name, nisn: student.nisn,
        place_of_birth: student.place_of_birth.unwrap_or_default(),
        date_of_birth: student.date_of_birth.unwrap_or_default(),
        school_name: "SMK NEGERI 1 SUMATERA BARAT".to_string(),
        concentration: major.name, subjects: all, semester_averages: sa, overall_average: oa,
    };

    generate_transcript_pdf(&data, &std::path::PathBuf::from(path))
}
