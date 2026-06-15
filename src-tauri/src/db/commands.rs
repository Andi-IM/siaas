use tauri::State;
use sea_orm::{DatabaseConnection, EntityTrait, ActiveModelTrait, Set, QueryOrder, ColumnTrait, QueryFilter};
use crate::db::entities::{
    programs, majors, batches, semesters, subjects, students, curriculum_subjects, student_grades
};

// ==========================================
// PROGRAMS COMMANDS
// ==========================================

#[tauri::command]
pub async fn create_program(
    state: State<'_, DatabaseConnection>,
    name: String,
) -> Result<programs::Model, String> {
    let db = state.inner();
    let id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Utc::now().to_rfc3339();

    let program = programs::ActiveModel {
        id: Set(id),
        name: Set(name),
        created_at: Set(now.clone()),
        updated_at: Set(now),
    };

    let result = program.insert(db).await.map_err(|e| e.to_string())?;
    Ok(result)
}

#[tauri::command]
pub async fn get_programs(
    state: State<'_, DatabaseConnection>,
) -> Result<Vec<programs::Model>, String> {
    let db = state.inner();
    programs::Entity::find()
        .all(db)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_program(
    state: State<'_, DatabaseConnection>,
    id: String,
    name: String,
) -> Result<programs::Model, String> {
    let db = state.inner();
    let existing = programs::Entity::find_by_id(id)
        .one(db)
        .await
        .map_err(|e| e.to_string())?
        .ok_or_else(|| "Program not found".to_string())?;

    let now = chrono::Utc::now().to_rfc3339();
    let mut active: programs::ActiveModel = existing.into();
    active.name = Set(name);
    active.updated_at = Set(now);

    let updated = active.update(db).await.map_err(|e| e.to_string())?;
    Ok(updated)
}

#[tauri::command]
pub async fn delete_program(
    state: State<'_, DatabaseConnection>,
    id: String,
) -> Result<bool, String> {
    let db = state.inner();
    let res = programs::Entity::delete_by_id(id).exec(db).await.map_err(|e| e.to_string())?;
    Ok(res.rows_affected > 0)
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
    let db = state.inner();
    let id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Utc::now().to_rfc3339();

    let major = majors::ActiveModel {
        id: Set(id),
        code: Set(code),
        name: Set(name),
        program_id: Set(program_id),
        created_at: Set(now.clone()),
        updated_at: Set(now),
    };

    let result = major.insert(db).await.map_err(|e| e.to_string())?;
    Ok(result)
}

#[tauri::command]
pub async fn get_majors(
    state: State<'_, DatabaseConnection>,
) -> Result<Vec<majors::Model>, String> {
    let db = state.inner();
    majors::Entity::find()
        .all(db)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_major(
    state: State<'_, DatabaseConnection>,
    id: String,
    name: String,
    code: String,
    program_id: Option<String>,
) -> Result<majors::Model, String> {
    let db = state.inner();
    let existing = majors::Entity::find_by_id(id)
        .one(db)
        .await
        .map_err(|e| e.to_string())?
        .ok_or_else(|| "Major not found".to_string())?;

    let now = chrono::Utc::now().to_rfc3339();
    let mut active: majors::ActiveModel = existing.into();
    active.name = Set(name);
    active.code = Set(code);
    active.program_id = Set(program_id);
    active.updated_at = Set(now);

    let updated = active.update(db).await.map_err(|e| e.to_string())?;
    Ok(updated)
}

#[tauri::command]
pub async fn delete_major(
    state: State<'_, DatabaseConnection>,
    id: String,
) -> Result<bool, String> {
    let db = state.inner();
    let res = majors::Entity::delete_by_id(id).exec(db).await.map_err(|e| e.to_string())?;
    Ok(res.rows_affected > 0)
}

// ==========================================
// BATCHES COMMANDS
// ==========================================

#[tauri::command]
pub async fn create_batch(
    state: State<'_, DatabaseConnection>,
    year: i32,
) -> Result<batches::Model, String> {
    let db = state.inner();
    let id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Utc::now().to_rfc3339();

    let batch = batches::ActiveModel {
        id: Set(id),
        year: Set(year),
        created_at: Set(now.clone()),
        updated_at: Set(now),
    };

    let result = batch.insert(db).await.map_err(|e| e.to_string())?;
    Ok(result)
}

#[tauri::command]
pub async fn get_batches(
    state: State<'_, DatabaseConnection>,
) -> Result<Vec<batches::Model>, String> {
    let db = state.inner();
    batches::Entity::find()
        .all(db)
        .await
        .map_err(|e| e.to_string())
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
    let db = state.inner();
    let id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Utc::now().to_rfc3339();

    let semester = semesters::ActiveModel {
        id: Set(id),
        code: Set(code),
        name: Set(name),
        sequence: Set(sequence),
        created_at: Set(now.clone()),
        updated_at: Set(now),
    };

    let result = semester.insert(db).await.map_err(|e| e.to_string())?;
    Ok(result)
}

#[tauri::command]
pub async fn get_semesters(
    state: State<'_, DatabaseConnection>,
) -> Result<Vec<semesters::Model>, String> {
    let db = state.inner();
    semesters::Entity::find()
        .order_by_asc(semesters::Column::Sequence)
        .all(db)
        .await
        .map_err(|e| e.to_string())
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
    let db = state.inner();
    let id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Utc::now().to_rfc3339();

    let subject = subjects::ActiveModel {
        id: Set(id),
        code: Set(code),
        name: Set(name),
        category: Set(category),
        status: Set(status),
        sequence: Set(sequence),
        created_at: Set(now.clone()),
        updated_at: Set(now),
    };

    let result = subject.insert(db).await.map_err(|e| e.to_string())?;
    Ok(result)
}

#[tauri::command]
pub async fn get_subjects(
    state: State<'_, DatabaseConnection>,
) -> Result<Vec<subjects::Model>, String> {
    let db = state.inner();
    let list = subjects::Entity::find()
        .all(db)
        .await
        .map_err(|e| e.to_string())?;
    
    let mut sorted = list;
    sorted.sort_by(|a, b| {
        let w_a = get_category_weight(&a.category);
        let w_b = get_category_weight(&b.category);
        
        match w_a.cmp(&w_b) {
            std::cmp::Ordering::Equal => a.sequence.cmp(&b.sequence),
            other => other,
        }
    });
    
    Ok(sorted)
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
    let db = state.inner();
    let existing = subjects::Entity::find_by_id(id)
        .one(db)
        .await
        .map_err(|e| e.to_string())?
        .ok_or_else(|| "Subject not found".to_string())?;

    let now = chrono::Utc::now().to_rfc3339();
    let mut active: subjects::ActiveModel = existing.into();
    active.name = Set(name);
    active.code = Set(code);
    active.category = Set(category);
    active.status = Set(status);
    active.sequence = Set(sequence);
    active.updated_at = Set(now);

    let updated = active.update(db).await.map_err(|e| e.to_string())?;
    Ok(updated)
}

#[tauri::command]
pub async fn delete_subject(
    state: State<'_, DatabaseConnection>,
    id: String,
) -> Result<bool, String> {
    let db = state.inner();
    let res = subjects::Entity::delete_by_id(id).exec(db).await.map_err(|e| e.to_string())?;
    Ok(res.rows_affected > 0)
}

// ==========================================
// STUDENTS COMMANDS
// ==========================================

#[tauri::command]
pub async fn create_student(
    state: State<'_, DatabaseConnection>,
    mut student: students::Model,
) -> Result<students::Model, String> {
    let db = state.inner();
    
    if student.id.is_empty() {
        student.id = uuid::Uuid::new_v4().to_string();
    }
    
    let now = chrono::Utc::now().to_rfc3339();
    student.created_at = now.clone();
    student.updated_at = now;

    let active_student = students::ActiveModel {
        id: Set(student.id.clone()),
        major_id: Set(student.major_id),
        full_name: Set(student.full_name),
        nis: Set(student.nis),
        nisn: Set(student.nisn),
        place_of_birth: Set(student.place_of_birth),
        date_of_birth: Set(student.date_of_birth),
        gender: Set(student.gender),
        religion: Set(student.religion),
        family_status: Set(student.family_status),
        child_order: Set(student.child_order),
        home_address: Set(student.home_address),
        telephone: Set(student.telephone),
        previous_school: Set(student.previous_school),
        admission_grade: Set(student.admission_grade),
        admission_date: Set(student.admission_date),
        father_name: Set(student.father_name),
        mother_name: Set(student.mother_name),
        parent_address: Set(student.parent_address),
        father_occupation: Set(student.father_occupation),
        mother_occupation: Set(student.mother_occupation),
        guardian_name: Set(student.guardian_name),
        guardian_address: Set(student.guardian_address),
        guardian_phone_number: Set(student.guardian_phone_number),
        guardian_occupation: Set(student.guardian_occupation),
        diploma_number: Set(student.diploma_number),
        graduation_date: Set(student.graduation_date),
        created_at: Set(student.created_at),
        updated_at: Set(student.updated_at),
    };

    let result = active_student.insert(db).await.map_err(|e| e.to_string())?;
    Ok(result)
}

#[tauri::command]
pub async fn get_students(
    state: State<'_, DatabaseConnection>,
) -> Result<Vec<students::Model>, String> {
    let db = state.inner();
    students::Entity::find()
        .all(db)
        .await
        .map_err(|e| e.to_string())
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
    let db = state.inner();
    let id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Utc::now().to_rfc3339();

    let cs = curriculum_subjects::ActiveModel {
        id: Set(id),
        major_id: Set(major_id),
        batch_id: Set(batch_id),
        semester_id: Set(semester_id),
        subject_id: Set(subject_id),
        created_at: Set(now.clone()),
        updated_at: Set(now),
    };

    let result = cs.insert(db).await.map_err(|e| e.to_string())?;
    Ok(result)
}

#[tauri::command]
pub async fn get_curriculum_subjects(
    state: State<'_, DatabaseConnection>,
) -> Result<Vec<curriculum_subjects::Model>, String> {
    let db = state.inner();
    curriculum_subjects::Entity::find()
        .all(db)
        .await
        .map_err(|e| e.to_string())
}

#[derive(serde::Serialize, serde::Deserialize)]
pub struct MataPelajaranData {
    pub id: String,
    pub name: String,
    pub code: String,
    pub kategori: String,
    pub sequence: i32,
    pub semesters: Vec<i32>,
    pub status: String,
}

fn get_category_weight(cat: &str) -> i32 {
    match cat {
        "Kelompok Umum" => 1,
        "Kelompok Kejuruan" => 2,
        _ => 99,
    }
}

#[tauri::command]
pub async fn get_subjects_by_major(
    state: State<'_, DatabaseConnection>,
    major_id: String,
) -> Result<Vec<MataPelajaranData>, String> {
    let db = state.inner();
    
    // This is a simplified version. Ideally we'd join and group by subject.
    // For now, let's fetch all curriculum_subjects for this major and then the subjects.
    let mappings = curriculum_subjects::Entity::find()
        .filter(curriculum_subjects::Column::MajorId.eq(major_id))
        .all(db)
        .await
        .map_err(|e| e.to_string())?;

    let mut result_map: std::collections::HashMap<String, MataPelajaranData> = std::collections::HashMap::new();

    for m in mappings {
        let subject = subjects::Entity::find_by_id(m.subject_id.clone())
            .one(db)
            .await
            .map_err(|e| e.to_string())?
            .ok_or_else(|| format!("Subject {} not found", m.subject_id))?;

        let semester = semesters::Entity::find_by_id(m.semester_id)
            .one(db)
            .await
            .map_err(|e| e.to_string())?
            .ok_or_else(|| "Semester not found".to_string())?;

        let entry = result_map.entry(m.subject_id.clone()).or_insert(MataPelajaranData {
            id: subject.id,
            name: subject.name,
            code: subject.code,
            kategori: subject.category,
            sequence: subject.sequence,
            semesters: Vec::new(),
            status: subject.status,
        });
        
        if !entry.semesters.contains(&semester.sequence) {
            entry.semesters.push(semester.sequence);
            entry.semesters.sort();
        }
    }

    let mut final_list: Vec<MataPelajaranData> = result_map.into_values().collect();
    
    // Sort by category weight first, then by sequence
    final_list.sort_by(|a, b| {
        let w_a = get_category_weight(&a.kategori);
        let w_b = get_category_weight(&b.kategori);
        
        match w_a.cmp(&w_b) {
            std::cmp::Ordering::Equal => a.sequence.cmp(&b.sequence),
            other => other,
        }
    });

    Ok(final_list)
}

#[tauri::command]
pub async fn assign_subject_to_semesters(
    state: State<'_, DatabaseConnection>,
    major_id: String,
    subject_id: String,
    semester_sequences: Vec<i32>,
) -> Result<(), String> {
    let db = state.inner();
    let now = chrono::Utc::now().to_rfc3339();

    // 1. Get or Create a default Batch (needed for curriculum_subjects)
    let batch = batches::Entity::find()
        .one(db)
        .await
        .map_err(|e| e.to_string())?;
    
    let batch_id = match batch {
        Some(b) => b.id,
        None => {
            let id = uuid::Uuid::new_v4().to_string();
            let new_batch = batches::ActiveModel {
                id: Set(id.clone()),
                year: Set(2024), // Default year
                created_at: Set(now.clone()),
                updated_at: Set(now.clone()),
            };
            new_batch.insert(db).await.map_err(|e| e.to_string())?;
            id
        }
    };

    // 2. Remove existing mappings for this subject and major
    curriculum_subjects::Entity::delete_many()
        .filter(curriculum_subjects::Column::MajorId.eq(major_id.clone()))
        .filter(curriculum_subjects::Column::SubjectId.eq(subject_id.clone()))
        .exec(db)
        .await
        .map_err(|e| e.to_string())?;

    // 3. Add new mappings
    for seq in semester_sequences {
        let semester = semesters::Entity::find()
            .filter(semesters::Column::Sequence.eq(seq))
            .one(db)
            .await
            .map_err(|e| e.to_string())?;
        
        let semester_id = match semester {
            Some(s) => s.id,
            None => {
                let id = uuid::Uuid::new_v4().to_string();
                let new_sem = semesters::ActiveModel {
                    id: Set(id.clone()),
                    code: Set(format!("S{}", seq)),
                    name: Set(format!("Semester {}", seq)),
                    sequence: Set(seq),
                    created_at: Set(now.clone()),
                    updated_at: Set(now.clone()),
                };
                new_sem.insert(db).await.map_err(|e| e.to_string())?;
                id
            }
        };

        let mapping = curriculum_subjects::ActiveModel {
            id: Set(uuid::Uuid::new_v4().to_string()),
            major_id: Set(major_id.clone()),
            batch_id: Set(batch_id.clone()),
            semester_id: Set(semester_id),
            subject_id: Set(subject_id.clone()),
            created_at: Set(now.clone()),
            updated_at: Set(now.clone()),
        };
        mapping.insert(db).await.map_err(|e| e.to_string())?;
    }

    Ok(())
}

// ==========================================
// STUDENT GRADES COMMANDS
// ==========================================

#[tauri::command]
pub async fn create_student_grade(
    state: State<'_, DatabaseConnection>,
    student_id: String,
    curriculum_subject_id: String,
    grade: f64,
) -> Result<student_grades::Model, String> {
    let db = state.inner();
    let id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Utc::now().to_rfc3339();

    let sg = student_grades::ActiveModel {
        id: Set(id),
        student_id: Set(student_id),
        curriculum_subject_id: Set(curriculum_subject_id),
        grade: Set(grade),
        created_at: Set(now.clone()),
        updated_at: Set(now),
    };

    let result = sg.insert(db).await.map_err(|e| e.to_string())?;
    Ok(result)
}

#[tauri::command]
pub async fn get_student_grades(
    state: State<'_, DatabaseConnection>,
) -> Result<Vec<student_grades::Model>, String> {
    let db = state.inner();
    student_grades::Entity::find()
        .all(db)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_student(
    state: State<'_, DatabaseConnection>,
    nis: String,
    student: students::Model,
) -> Result<students::Model, String> {
    let db = state.inner();

    let existing = students::Entity::find()
        .filter(students::Column::Nis.eq(nis))
        .one(db)
        .await
        .map_err(|e| e.to_string())?
        .ok_or_else(|| "Student not found".to_string())?;

    let now = chrono::Utc::now().to_rfc3339();
    let mut active: students::ActiveModel = existing.into();
    
    active.major_id = Set(student.major_id);
    active.full_name = Set(student.full_name);
    active.nisn = Set(student.nisn);
    active.place_of_birth = Set(student.place_of_birth);
    active.date_of_birth = Set(student.date_of_birth);
    active.gender = Set(student.gender);
    active.religion = Set(student.religion);
    active.family_status = Set(student.family_status);
    active.child_order = Set(student.child_order);
    active.home_address = Set(student.home_address);
    active.telephone = Set(student.telephone);
    active.previous_school = Set(student.previous_school);
    active.admission_grade = Set(student.admission_grade);
    active.admission_date = Set(student.admission_date);
    active.father_name = Set(student.father_name);
    active.mother_name = Set(student.mother_name);
    active.parent_address = Set(student.parent_address);
    active.father_occupation = Set(student.father_occupation);
    active.mother_occupation = Set(student.mother_occupation);
    active.guardian_name = Set(student.guardian_name);
    active.guardian_address = Set(student.guardian_address);
    active.guardian_phone_number = Set(student.guardian_phone_number);
    active.guardian_occupation = Set(student.guardian_occupation);
    active.diploma_number = Set(student.diploma_number);
    active.graduation_date = Set(student.graduation_date);
    active.updated_at = Set(now);

    let updated = active.update(db).await.map_err(|e| e.to_string())?;
    Ok(updated)
}

#[tauri::command]
pub async fn delete_student(
    state: State<'_, DatabaseConnection>,
    nis: String,
) -> Result<bool, String> {
    let db = state.inner();
    
    let student = students::Entity::find()
        .filter(students::Column::Nis.eq(nis))
        .one(db)
        .await
        .map_err(|e| e.to_string())?;

    match student {
        Some(s) => {
            let res = students::Entity::delete_by_id(s.id).exec(db).await.map_err(|e| e.to_string())?;
            Ok(res.rows_affected > 0)
        }
        None => Ok(false)
    }
}
