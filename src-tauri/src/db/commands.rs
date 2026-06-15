use tauri::State;
use rusqlite::params;
use crate::db::DatabasePool;
use crate::db::models::{Major, Batch, Semester, Subject, Student, CurriculumSubject, StudentGrade};

// ==========================================
// MAJORS COMMANDS
// ==========================================

#[tauri::command]
pub fn create_major(state: State<DatabasePool>, code: String, name: String) -> Result<Major, String> {
    let conn = state.get_conn().map_err(|e| e.to_string())?;
    let id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Utc::now().to_rfc3339();

    conn.execute(
        "INSERT INTO majors (id, code, name, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5)",
        (&id, &code, &name, &now, &now),
    ).map_err(|e| e.to_string())?;

    Ok(Major {
        id,
        code,
        name,
        created_at: now.clone(),
        updated_at: now,
    })
}

#[tauri::command]
pub fn get_majors(state: State<DatabasePool>) -> Result<Vec<Major>, String> {
    let conn = state.get_conn().map_err(|e| e.to_string())?;
    let mut stmt = conn.prepare("SELECT id, code, name, created_at, updated_at FROM majors")
        .map_err(|e| e.to_string())?;

    let majors = stmt.query_map([], |row| {
        Ok(Major {
            id: row.get(0)?,
            code: row.get(1)?,
            name: row.get(2)?,
            created_at: row.get(3)?,
            updated_at: row.get(4)?,
        })
    }).map_err(|e| e.to_string())?
      .collect::<Result<Vec<_>, _>>()
      .map_err(|e| e.to_string())?;

    Ok(majors)
}

// ==========================================
// BATCHES COMMANDS
// ==========================================

#[tauri::command]
pub fn create_batch(state: State<DatabasePool>, year: i32) -> Result<Batch, String> {
    let conn = state.get_conn().map_err(|e| e.to_string())?;
    let id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Utc::now().to_rfc3339();

    conn.execute(
        "INSERT INTO batches (id, year, created_at, updated_at) VALUES (?1, ?2, ?3, ?4)",
        (&id, &year, &now, &now),
    ).map_err(|e| e.to_string())?;

    Ok(Batch {
        id,
        year,
        created_at: now.clone(),
        updated_at: now,
    })
}

#[tauri::command]
pub fn get_batches(state: State<DatabasePool>) -> Result<Vec<Batch>, String> {
    let conn = state.get_conn().map_err(|e| e.to_string())?;
    let mut stmt = conn.prepare("SELECT id, year, created_at, updated_at FROM batches")
        .map_err(|e| e.to_string())?;

    let batches = stmt.query_map([], |row| {
        Ok(Batch {
            id: row.get(0)?,
            year: row.get(1)?,
            created_at: row.get(2)?,
            updated_at: row.get(3)?,
        })
    }).map_err(|e| e.to_string())?
      .collect::<Result<Vec<_>, _>>()
      .map_err(|e| e.to_string())?;

    Ok(batches)
}

// ==========================================
// SEMESTERS COMMANDS
// ==========================================

#[tauri::command]
pub fn create_semester(state: State<DatabasePool>, code: String, name: String, sequence: i32) -> Result<Semester, String> {
    let conn = state.get_conn().map_err(|e| e.to_string())?;
    let id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Utc::now().to_rfc3339();

    conn.execute(
        "INSERT INTO semesters (id, code, name, sequence, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        (&id, &code, &name, &sequence, &now, &now),
    ).map_err(|e| e.to_string())?;

    Ok(Semester {
        id,
        code,
        name,
        sequence,
        created_at: now.clone(),
        updated_at: now,
    })
}

#[tauri::command]
pub fn get_semesters(state: State<DatabasePool>) -> Result<Vec<Semester>, String> {
    let conn = state.get_conn().map_err(|e| e.to_string())?;
    let mut stmt = conn.prepare("SELECT id, code, name, sequence, created_at, updated_at FROM semesters ORDER BY sequence")
        .map_err(|e| e.to_string())?;

    let semesters = stmt.query_map([], |row| {
        Ok(Semester {
            id: row.get(0)?,
            code: row.get(1)?,
            name: row.get(2)?,
            sequence: row.get(3)?,
            created_at: row.get(4)?,
            updated_at: row.get(5)?,
        })
    }).map_err(|e| e.to_string())?
      .collect::<Result<Vec<_>, _>>()
      .map_err(|e| e.to_string())?;

    Ok(semesters)
}

// ==========================================
// SUBJECTS COMMANDS
// ==========================================

#[tauri::command]
pub fn create_subject(state: State<DatabasePool>, code: String, name: String) -> Result<Subject, String> {
    let conn = state.get_conn().map_err(|e| e.to_string())?;
    let id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Utc::now().to_rfc3339();

    conn.execute(
        "INSERT INTO subjects (id, code, name, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5)",
        (&id, &code, &name, &now, &now),
    ).map_err(|e| e.to_string())?;

    Ok(Subject {
        id,
        code,
        name,
        created_at: now.clone(),
        updated_at: now,
    })
}

#[tauri::command]
pub fn get_subjects(state: State<DatabasePool>) -> Result<Vec<Subject>, String> {
    let conn = state.get_conn().map_err(|e| e.to_string())?;
    let mut stmt = conn.prepare("SELECT id, code, name, created_at, updated_at FROM subjects")
        .map_err(|e| e.to_string())?;

    let subjects = stmt.query_map([], |row| {
        Ok(Subject {
            id: row.get(0)?,
            code: row.get(1)?,
            name: row.get(2)?,
            created_at: row.get(3)?,
            updated_at: row.get(4)?,
        })
    }).map_err(|e| e.to_string())?
      .collect::<Result<Vec<_>, _>>()
      .map_err(|e| e.to_string())?;

    Ok(subjects)
}

// ==========================================
// STUDENTS COMMANDS
// ==========================================

#[tauri::command]
pub fn create_student(state: State<DatabasePool>, mut student: Student) -> Result<Student, String> {
    let conn = state.get_conn().map_err(|e| e.to_string())?;
    
    if student.id.is_empty() {
        student.id = uuid::Uuid::new_v4().to_string();
    }
    
    let now = chrono::Utc::now().to_rfc3339();
    student.created_at = now.clone();
    student.updated_at = now;

    conn.execute(
        "INSERT INTO students (
            id, major_id, full_name, nis, nisn, place_of_birth, date_of_birth, gender,
            religion, family_status, child_order, home_address, telephone, previous_school,
            admission_grade, admission_date, father_name, mother_name, parent_address,
            father_occupation, mother_occupation, guardian_name, guardian_address,
            guardian_phone_number, guardian_occupation, diploma_number, graduation_date,
            created_at, updated_at
        ) VALUES (
            ?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16,
            ?17, ?18, ?19, ?20, ?21, ?22, ?23, ?24, ?25, ?26, ?27, ?28, ?29
        )",
        params![
            &student.id, &student.major_id, &student.full_name, &student.nis, &student.nisn,
            &student.place_of_birth, &student.date_of_birth, &student.gender, &student.religion,
            &student.family_status, &student.child_order, &student.home_address, &student.telephone,
            &student.previous_school, &student.admission_grade, &student.admission_date,
            &student.father_name, &student.mother_name, &student.parent_address,
            &student.father_occupation, &student.mother_occupation, &student.guardian_name,
            &student.guardian_address, &student.guardian_phone_number, &student.guardian_occupation,
            &student.diploma_number, &student.graduation_date, &student.created_at, &student.updated_at
        ]
    ).map_err(|e| e.to_string())?;

    Ok(student)
}

#[tauri::command]
pub fn get_students(state: State<DatabasePool>) -> Result<Vec<Student>, String> {
    let conn = state.get_conn().map_err(|e| e.to_string())?;
    let mut stmt = conn.prepare("
        SELECT id, major_id, full_name, nis, nisn, place_of_birth, date_of_birth, gender,
               religion, family_status, child_order, home_address, telephone, previous_school,
               admission_grade, admission_date, father_name, mother_name, parent_address,
               father_occupation, mother_occupation, guardian_name, guardian_address,
               guardian_phone_number, guardian_occupation, diploma_number, graduation_date,
               created_at, updated_at 
        FROM students
    ").map_err(|e| e.to_string())?;

    let students = stmt.query_map([], |row| {
        Ok(Student {
            id: row.get(0)?,
            major_id: row.get(1)?,
            full_name: row.get(2)?,
            nis: row.get(3)?,
            nisn: row.get(4)?,
            place_of_birth: row.get(5)?,
            date_of_birth: row.get(6)?,
            gender: row.get(7)?,
            religion: row.get(8)?,
            family_status: row.get(9)?,
            child_order: row.get(10)?,
            home_address: row.get(11)?,
            telephone: row.get(12)?,
            previous_school: row.get(13)?,
            admission_grade: row.get(14)?,
            admission_date: row.get(15)?,
            father_name: row.get(16)?,
            mother_name: row.get(17)?,
            parent_address: row.get(18)?,
            father_occupation: row.get(19)?,
            mother_occupation: row.get(20)?,
            guardian_name: row.get(21)?,
            guardian_address: row.get(22)?,
            guardian_phone_number: row.get(23)?,
            guardian_occupation: row.get(24)?,
            diploma_number: row.get(25)?,
            graduation_date: row.get(26)?,
            created_at: row.get(27)?,
            updated_at: row.get(28)?,
        })
    }).map_err(|e| e.to_string())?
      .collect::<Result<Vec<_>, _>>()
      .map_err(|e| e.to_string())?;

    Ok(students)
}

// ==========================================
// CURRICULUM SUBJECTS COMMANDS
// ==========================================

#[tauri::command]
pub fn create_curriculum_subject(
    state: State<DatabasePool>,
    major_id: String,
    batch_id: String,
    semester_id: String,
    subject_id: String,
) -> Result<CurriculumSubject, String> {
    let conn = state.get_conn().map_err(|e| e.to_string())?;
    let id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Utc::now().to_rfc3339();

    conn.execute(
        "INSERT INTO curriculum_subjects (id, major_id, batch_id, semester_id, subject_id, created_at, updated_at) 
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
        (&id, &major_id, &batch_id, &semester_id, &subject_id, &now, &now),
    ).map_err(|e| e.to_string())?;

    Ok(CurriculumSubject {
        id,
        major_id,
        batch_id,
        semester_id,
        subject_id,
        created_at: now.clone(),
        updated_at: now,
    })
}

#[tauri::command]
pub fn get_curriculum_subjects(state: State<DatabasePool>) -> Result<Vec<CurriculumSubject>, String> {
    let conn = state.get_conn().map_err(|e| e.to_string())?;
    let mut stmt = conn.prepare("SELECT id, major_id, batch_id, semester_id, subject_id, created_at, updated_at FROM curriculum_subjects")
        .map_err(|e| e.to_string())?;

    let items = stmt.query_map([], |row| {
        Ok(CurriculumSubject {
            id: row.get(0)?,
            major_id: row.get(1)?,
            batch_id: row.get(2)?,
            semester_id: row.get(3)?,
            subject_id: row.get(4)?,
            created_at: row.get(5)?,
            updated_at: row.get(6)?,
        })
    }).map_err(|e| e.to_string())?
      .collect::<Result<Vec<_>, _>>()
      .map_err(|e| e.to_string())?;

    Ok(items)
}

// ==========================================
// STUDENT GRADES COMMANDS
// ==========================================

#[tauri::command]
pub fn create_student_grade(
    state: State<DatabasePool>,
    student_id: String,
    curriculum_subject_id: String,
    grade: f64,
) -> Result<StudentGrade, String> {
    let conn = state.get_conn().map_err(|e| e.to_string())?;
    let id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Utc::now().to_rfc3339();

    conn.execute(
        "INSERT INTO student_grades (id, student_id, curriculum_subject_id, grade, created_at, updated_at) 
         VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        (&id, &student_id, &curriculum_subject_id, &grade, &now, &now),
    ).map_err(|e| e.to_string())?;

    Ok(StudentGrade {
        id,
        student_id,
        curriculum_subject_id,
        grade,
        created_at: now.clone(),
        updated_at: now,
    })
}

#[tauri::command]
pub fn get_student_grades(state: State<DatabasePool>) -> Result<Vec<StudentGrade>, String> {
    let conn = state.get_conn().map_err(|e| e.to_string())?;
    let mut stmt = conn.prepare("SELECT id, student_id, curriculum_subject_id, grade, created_at, updated_at FROM student_grades")
        .map_err(|e| e.to_string())?;

    let items = stmt.query_map([], |row| {
        Ok(StudentGrade {
            id: row.get(0)?,
            student_id: row.get(1)?,
            curriculum_subject_id: row.get(2)?,
            grade: row.get(3)?,
            created_at: row.get(4)?,
            updated_at: row.get(5)?,
        })
    }).map_err(|e| e.to_string())?
      .collect::<Result<Vec<_>, _>>()
      .map_err(|e| e.to_string())?;

    Ok(items)
}
