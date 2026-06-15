use tauri::State;
use sea_orm::{DatabaseConnection, EntityTrait, ActiveModelTrait, Set, QueryOrder, ColumnTrait, QueryFilter};
use crate::db::entities::{
    majors, batches, semesters, subjects, students, curriculum_subjects, student_grades
};

// ==========================================
// MAJORS COMMANDS
// ==========================================

#[tauri::command]
pub async fn create_major(
    state: State<'_, DatabaseConnection>,
    code: String,
    name: String,
) -> Result<majors::Model, String> {
    let db = state.inner();
    let id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Utc::now().to_rfc3339();

    let major = majors::ActiveModel {
        id: Set(id),
        code: Set(code),
        name: Set(name),
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
) -> Result<subjects::Model, String> {
    let db = state.inner();
    let id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Utc::now().to_rfc3339();

    let subject = subjects::ActiveModel {
        id: Set(id),
        code: Set(code),
        name: Set(name),
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
    subjects::Entity::find()
        .all(db)
        .await
        .map_err(|e| e.to_string())
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
