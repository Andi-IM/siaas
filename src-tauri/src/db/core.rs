use sea_orm::{DatabaseConnection, EntityTrait, ActiveModelTrait, Set, QueryOrder, ColumnTrait, QueryFilter};
use crate::db::entities::{
    programs, majors, batches, semesters, subjects, students, curriculum_subjects, student_grades
};

// ==========================================
// PROGRAMS CORE LOGIC
// ==========================================

pub async fn create_program_core(
    db: &DatabaseConnection,
    name: String,
) -> Result<programs::Model, String> {
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

pub async fn get_programs_core(
    db: &DatabaseConnection,
) -> Result<Vec<programs::Model>, String> {
    programs::Entity::find()
        .all(db)
        .await
        .map_err(|e| e.to_string())
}

pub async fn update_program_core(
    db: &DatabaseConnection,
    id: String,
    name: String,
) -> Result<programs::Model, String> {
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

pub async fn delete_program_core(
    db: &DatabaseConnection,
    id: String,
) -> Result<bool, String> {
    let res = programs::Entity::delete_by_id(id).exec(db).await.map_err(|e| e.to_string())?;
    Ok(res.rows_affected > 0)
}

// ==========================================
// MAJORS CORE LOGIC
// ==========================================

pub async fn create_major_core(
    db: &DatabaseConnection,
    code: String,
    name: String,
    program_id: Option<String>,
) -> Result<majors::Model, String> {
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

pub async fn get_majors_core(
    db: &DatabaseConnection,
) -> Result<Vec<majors::Model>, String> {
    majors::Entity::find()
        .all(db)
        .await
        .map_err(|e| e.to_string())
}

pub async fn update_major_core(
    db: &DatabaseConnection,
    id: String,
    name: String,
    code: String,
    program_id: Option<String>,
) -> Result<majors::Model, String> {
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

pub async fn delete_major_core(
    db: &DatabaseConnection,
    id: String,
) -> Result<bool, String> {
    let res = majors::Entity::delete_by_id(id).exec(db).await.map_err(|e| e.to_string())?;
    Ok(res.rows_affected > 0)
}

// ==========================================
// BATCHES CORE LOGIC
// ==========================================

pub async fn create_batch_core(
    db: &DatabaseConnection,
    year: i32,
) -> Result<batches::Model, String> {
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

pub async fn get_batches_core(
    db: &DatabaseConnection,
) -> Result<Vec<batches::Model>, String> {
    batches::Entity::find()
        .all(db)
        .await
        .map_err(|e| e.to_string())
}

// ==========================================
// SEMESTERS CORE LOGIC
// ==========================================

pub async fn create_semester_core(
    db: &DatabaseConnection,
    code: String,
    name: String,
    sequence: i32,
) -> Result<semesters::Model, String> {
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

pub async fn get_semesters_core(
    db: &DatabaseConnection,
) -> Result<Vec<semesters::Model>, String> {
    semesters::Entity::find()
        .order_by_asc(semesters::Column::Sequence)
        .all(db)
        .await
        .map_err(|e| e.to_string())
}

// ==========================================
// SUBJECTS CORE LOGIC
// ==========================================

pub fn get_category_weight(cat: &str) -> i32 {
    match cat {
        "Kelompok Umum" => 1,
        "Kelompok Kejuruan" => 2,
        _ => 99,
    }
}

pub async fn create_subject_core(
    db: &DatabaseConnection,
    code: String,
    name: String,
    category: String,
    status: String,
    sequence: i32,
) -> Result<subjects::Model, String> {
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

pub async fn get_subjects_core(
    db: &DatabaseConnection,
) -> Result<Vec<subjects::Model>, String> {
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

pub async fn update_subject_core(
    db: &DatabaseConnection,
    id: String,
    name: String,
    code: String,
    category: String,
    status: String,
    sequence: i32,
) -> Result<subjects::Model, String> {
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

pub async fn delete_subject_core(
    db: &DatabaseConnection,
    id: String,
) -> Result<bool, String> {
    let res = subjects::Entity::delete_by_id(id).exec(db).await.map_err(|e| e.to_string())?;
    Ok(res.rows_affected > 0)
}

// ==========================================
// STUDENT CORE LOGIC
// ==========================================

pub async fn create_student_core(
    db: &DatabaseConnection,
    mut student: students::Model,
) -> Result<students::Model, String> {
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

pub async fn get_students_core(
    db: &DatabaseConnection,
) -> Result<Vec<students::Model>, String> {
    students::Entity::find()
        .all(db)
        .await
        .map_err(|e| e.to_string())
}

pub async fn update_student_core(
    db: &DatabaseConnection,
    nis: String,
    student: students::Model,
) -> Result<students::Model, String> {
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

pub async fn delete_student_core(
    db: &DatabaseConnection,
    nis: String,
) -> Result<bool, String> {
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

// ==========================================
// CURRICULUM SUBJECTS CORE LOGIC
// ==========================================

pub async fn create_curriculum_subject_core(
    db: &DatabaseConnection,
    major_id: String,
    batch_id: String,
    semester_id: String,
    subject_id: String,
) -> Result<curriculum_subjects::Model, String> {
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

pub async fn get_curriculum_subjects_core(
    db: &DatabaseConnection,
) -> Result<Vec<curriculum_subjects::Model>, String> {
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

pub async fn get_subjects_by_major_core(
    db: &DatabaseConnection,
    major_id: String,
) -> Result<Vec<MataPelajaranData>, String> {
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

pub async fn assign_subject_to_semesters_core(
    db: &DatabaseConnection,
    major_id: String,
    subject_id: String,
    semester_sequences: Vec<i32>,
) -> Result<(), String> {
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
// STUDENT GRADES CORE LOGIC
// ==========================================

pub async fn upsert_student_grade_core(
    db: &DatabaseConnection,
    student_id: String, // Can be UUID or NIS
    curriculum_subject_id: String,
    grade: f64,
) -> Result<student_grades::Model, String> {
    if grade < 0.0 || grade > 100.0 {
        return Err("Nilai harus berada di antara 0 dan 100".to_string());
    }

    // Resolve student UUID from ID or NIS
    let student = students::Entity::find()
        .filter(
            students::Column::Id.eq(student_id.clone())
                .or(students::Column::Nis.eq(student_id.clone()))
        )
        .one(db)
        .await
        .map_err(|e| e.to_string())?
        .ok_or_else(|| "Student not found".to_string())?;

    let now = chrono::Utc::now().to_rfc3339();

    // Check if entry already exists
    let existing = student_grades::Entity::find()
        .filter(student_grades::Column::StudentId.eq(student.id.clone()))
        .filter(student_grades::Column::CurriculumSubjectId.eq(curriculum_subject_id.clone()))
        .one(db)
        .await
        .map_err(|e| e.to_string())?;

    match existing {
        Some(record) => {
            let mut active: student_grades::ActiveModel = record.into();
            active.grade = Set(grade);
            active.updated_at = Set(now);
            let updated = active.update(db).await.map_err(|e| e.to_string())?;
            Ok(updated)
        }
        None => {
            let id = uuid::Uuid::new_v4().to_string();
            let new_grade = student_grades::ActiveModel {
                id: Set(id),
                student_id: Set(student.id),
                curriculum_subject_id: Set(curriculum_subject_id),
                grade: Set(grade),
                created_at: Set(now.clone()),
                updated_at: Set(now),
            };
            let result = new_grade.insert(db).await.map_err(|e| e.to_string())?;
            Ok(result)
        }
    }
}

#[derive(serde::Serialize, serde::Deserialize)]
pub struct GradeSummary {
    pub student_id: String,
    pub subject_id: String,
    pub grade: f64,
}

pub async fn get_grades_by_filter_core(
    db: &DatabaseConnection,
    major_id: String,
    semester_sequence: i32,
) -> Result<Vec<GradeSummary>, String> {
    // 1. Find all curriculum_subject IDs for this major/semester
    let semester = semesters::Entity::find()
        .filter(semesters::Column::Sequence.eq(semester_sequence))
        .one(db)
        .await
        .map_err(|e| e.to_string())?
        .ok_or_else(|| "Semester not found".to_string())?;

    let mappings = curriculum_subjects::Entity::find()
        .filter(curriculum_subjects::Column::MajorId.eq(major_id))
        .filter(curriculum_subjects::Column::SemesterId.eq(semester.id))
        .all(db)
        .await
        .map_err(|e| e.to_string())?;

    let mapping_ids: Vec<String> = mappings.iter().map(|m| m.id.clone()).collect();
    let mut results = Vec::new();

    if mapping_ids.is_empty() {
        return Ok(results);
    }

    // 2. Fetch all grades matching these curriculum_subject IDs
    let grades = student_grades::Entity::find()
        .filter(student_grades::Column::CurriculumSubjectId.is_in(mapping_ids))
        .all(db)
        .await
        .map_err(|e| e.to_string())?;

    // Fetch all students to map their UUIDs to NIS
    let students_list = students::Entity::find()
        .all(db)
        .await
        .map_err(|e| e.to_string())?;
    
    let mut student_id_to_nis = std::collections::HashMap::new();
    for s in students_list {
        student_id_to_nis.insert(s.id, s.nis);
    }

    for g in grades {
        // Find back the subject_id from mapping
        if let Some(m) = mappings.iter().find(|m| m.id == g.curriculum_subject_id) {
            if let Some(nis) = student_id_to_nis.get(&g.student_id) {
                results.push(GradeSummary {
                    student_id: nis.clone(), // Return NIS instead of UUID
                    subject_id: m.subject_id.clone(),
                    grade: g.grade,
                });
            }
        }
    }

    Ok(results)
}

pub async fn batch_upsert_grades_core(
    db: &DatabaseConnection,
    major_id: String,
    semester_sequence: i32,
    grades: Vec<GradeSummary>,
) -> Result<(), String> {
    let now = chrono::Utc::now().to_rfc3339();

    // 1. Resolve Semester
    let semester = semesters::Entity::find()
        .filter(semesters::Column::Sequence.eq(semester_sequence))
        .one(db)
        .await
        .map_err(|e| e.to_string())?
        .ok_or_else(|| "Semester not found".to_string())?;

    // 2. Resolve Mappings for this Major/Semester
    let mappings = curriculum_subjects::Entity::find()
        .filter(curriculum_subjects::Column::MajorId.eq(major_id))
        .filter(curriculum_subjects::Column::SemesterId.eq(semester.id))
        .all(db)
        .await
        .map_err(|e| e.to_string())?;

    for g in grades {
        if g.grade < 0.0 || g.grade > 100.0 {
            return Err("Nilai harus berada di antara 0 dan 100".to_string());
        }

        // Resolve student UUID from ID or NIS
        let student = students::Entity::find()
            .filter(
                students::Column::Id.eq(g.student_id.clone())
                    .or(students::Column::Nis.eq(g.student_id.clone()))
            )
            .one(db)
            .await
            .map_err(|e| e.to_string())?
            .ok_or_else(|| format!("Student not found for id/nis {}", g.student_id))?;

        // Find the curriculum_subject_id for this subject
        let mapping = mappings.iter()
            .find(|m| m.subject_id == g.subject_id)
            .ok_or_else(|| format!("Mapping not found for subject {}", g.subject_id))?;

        // Perform upsert
        let existing = student_grades::Entity::find()
            .filter(student_grades::Column::StudentId.eq(student.id.clone()))
            .filter(student_grades::Column::CurriculumSubjectId.eq(mapping.id.clone()))
            .one(db)
            .await
            .map_err(|e| e.to_string())?;

        match existing {
            Some(record) => {
                let mut active: student_grades::ActiveModel = record.into();
                active.grade = Set(g.grade);
                active.updated_at = Set(now.clone());
                active.update(db).await.map_err(|e| e.to_string())?;
            }
            None => {
                let id = uuid::Uuid::new_v4().to_string();
                let new_grade = student_grades::ActiveModel {
                    id: Set(id),
                    student_id: Set(student.id),
                    curriculum_subject_id: Set(mapping.id.clone()),
                    grade: Set(g.grade),
                    created_at: Set(now.clone()),
                    updated_at: Set(now.clone()),
                };
                new_grade.insert(db).await.map_err(|e| e.to_string())?;
            }
        }
    }

    Ok(())
}

#[derive(serde::Serialize, serde::Deserialize)]
pub struct StudentGradeDetail {
    pub subject_id: String,
    pub subject_name: String,
    pub subject_code: String,
    pub category: String,
    pub sequence: i32,
    pub semester_sequence: i32,
    pub grade: f64,
}

pub async fn get_grades_by_student_core(
    db: &DatabaseConnection,
    student_id: String, // Can be UUID or NIS
) -> Result<Vec<StudentGradeDetail>, String> {
    // Resolve student UUID from ID or NIS
    let student = students::Entity::find()
        .filter(
            students::Column::Id.eq(student_id.clone())
                .or(students::Column::Nis.eq(student_id.clone()))
        )
        .one(db)
        .await
        .map_err(|e| e.to_string())?
        .ok_or_else(|| "Student not found".to_string())?;

    // 1. Fetch all grades for student
    let grades = student_grades::Entity::find()
        .filter(student_grades::Column::StudentId.eq(student.id))
        .all(db)
        .await
        .map_err(|e| e.to_string())?;

    let mut results = Vec::new();

    for g in grades {
        // 2. Resolve mapping info
        let mapping = curriculum_subjects::Entity::find_by_id(g.curriculum_subject_id)
            .one(db)
            .await
            .map_err(|e| e.to_string())?
            .ok_or_else(|| "Curriculum mapping not found".to_string())?;

        // 3. Resolve subject info
        let subject = subjects::Entity::find_by_id(mapping.subject_id)
            .one(db)
            .await
            .map_err(|e| e.to_string())?
            .ok_or_else(|| "Subject not found".to_string())?;

        // 4. Resolve semester info
        let semester = semesters::Entity::find_by_id(mapping.semester_id)
            .one(db)
            .await
            .map_err(|e| e.to_string())?
            .ok_or_else(|| "Semester not found".to_string())?;

        results.push(StudentGradeDetail {
            subject_id: subject.id,
            subject_name: subject.name,
            subject_code: subject.code,
            category: subject.category,
            sequence: subject.sequence,
            semester_sequence: semester.sequence,
            grade: g.grade,
        });
    }

    Ok(results)
}

pub async fn get_student_grades_core(
    db: &DatabaseConnection,
) -> Result<Vec<student_grades::Model>, String> {
    student_grades::Entity::find()
        .all(db)
        .await
        .map_err(|e| e.to_string())
}

// ==========================================
// EXCEL CORE LOGIC
// ==========================================

pub struct SubjectColumn {
    pub subject_id: String,
    pub subject_code: String,
    pub semester_sequence: i32,
    pub mapping_id: String,
    pub sequence: i32,
    pub category: String,
}

pub async fn import_grades_from_excel_core(
    db: &DatabaseConnection,
    path: &std::path::Path,
) -> Result<String, String> {
    // 2. Open Workbook using calamine
    use calamine::{Reader, open_workbook_auto, Data};
    let mut excel = open_workbook_auto(path)
        .map_err(|e| format!("Gagal membuka berkas Excel: {}", e))?;

    let sheet_name = excel.sheet_names().first()
        .ok_or_else(|| "Berkas Excel tidak memiliki sheet".to_string())?
        .clone();

    let range = excel.worksheet_range(&sheet_name)
        .map_err(|e| format!("Gagal memproses sheet: {}", e))?;

    if range.height() < 8 {
        return Err("Berkas Excel tidak valid (minimal harus 8 baris)".to_string());
    }

    // 3. Parse Major name from cell A3 (row index 2, col index 0)
    let major_val = range.get_value((2, 0))
        .ok_or_else(|| "Sel A3 tidak ditemukan".to_string())?;

    let major_info = match major_val {
        Data::String(s) => s.trim().to_string(),
        _ => return Err("Format sel A3 harus berupa teks (KONSENTRASI KEAHLIAN : NAMA)".to_string()),
    };

    let parts: Vec<&str> = major_info.split(':').collect();
    if parts.len() < 2 {
        return Err("Nama Konsentrasi Keahlian tidak ditemukan di sel A3 (format harus 'KONSENTRASI KEAHLIAN : NAMA')".to_string());
    }
    let major_name = parts[1].trim();

    // Find major in database (case-insensitive)
    let all_majors = majors::Entity::find()
        .all(db)
        .await
        .map_err(|e| e.to_string())?;

    let major = all_majors.into_iter()
        .find(|m| m.name.eq_ignore_ascii_case(major_name))
        .ok_or_else(|| format!("Konsentrasi Keahlian '{}' tidak ditemukan di database", major_name))?;

    // Find or create default batch
    let batch_id = match batches::Entity::find().one(db).await.map_err(|e| e.to_string())? {
        Some(b) => b.id,
        None => {
            let id = uuid::Uuid::new_v4().to_string();
            let now = chrono::Utc::now().to_rfc3339();
            let new_batch = batches::ActiveModel {
                id: Set(id.clone()),
                year: Set(2024),
                created_at: Set(now.clone()),
                updated_at: Set(now),
            };
            new_batch.insert(db).await.map_err(|e| e.to_string())?;
            id
        }
    };

    // Cache subjects and semesters
    let subjects_list = subjects::Entity::find()
        .all(db)
        .await
        .map_err(|e| e.to_string())?;

    let semesters_list = semesters::Entity::find()
        .all(db)
        .await
        .map_err(|e| e.to_string())?;

    // 4. Dynamically build column mappings from Excel Row 5 (Semester) and Row 6 (Subject Code)
    struct DynamicColumnMap {
        col_idx: usize,
        semester: i32,
        subject_id: String,
    }

    let mut dynamic_maps = Vec::new();
    let mut current_semester = 1;
    let width = range.width();

    for col in 6..width {
        // Read semester header in Row 5 (index 4) if present
        if let Some(val) = range.get_value((4, col as u32)) {
            let sem_name = match val {
                Data::String(s) => s.trim().to_uppercase(),
                _ => String::new(),
            };
            if !sem_name.is_empty() {
                if sem_name.contains("SEMESTER 1") { current_semester = 1; }
                else if sem_name.contains("SEMESTER 2") { current_semester = 2; }
                else if sem_name.contains("SEMESTER 3") { current_semester = 3; }
                else if sem_name.contains("SEMESTER 4") { current_semester = 4; }
                else if sem_name.contains("SMT 5") || sem_name.contains("SEMESTER 5") { current_semester = 5; }
                else if sem_name.contains("SEMESTER 6") { current_semester = 6; }
                else if sem_name.contains("UKK") { current_semester = 0; } // Skip UKK column
            }
        }

        if current_semester == 0 {
            continue; // Skip UKK column
        }

        // Read subject code in Row 6 (index 5)
        let code = match range.get_value((5, col as u32)) {
            Some(Data::String(s)) => s.trim().to_string(),
            Some(Data::Int(i)) => i.to_string(),
            _ => String::new(),
        };

        if code.is_empty() {
            continue;
        }

        // Find subject in subjects_list by code (case-insensitive)
        let subject = subjects_list.iter()
            .find(|sub| sub.code.eq_ignore_ascii_case(&code));

        if let Some(sub) = subject {
            dynamic_maps.push(DynamicColumnMap {
                col_idx: col as usize,
                semester: current_semester,
                subject_id: sub.id.clone(),
            });
        }
    }

    let mut import_count = 0;
    let total_rows = range.height();

    // 5. Process student rows starting from index 7 (row 8)
    for r in 7..total_rows {
        // Read columns
        let name = match range.get_value((r as u32, 1)) {
            Some(Data::String(s)) => s.trim().to_string(),
            _ => String::new(),
        };
        let tempat_lahir = match range.get_value((r as u32, 2)) {
            Some(Data::String(s)) => s.trim().to_string(),
            Some(Data::Int(i)) => i.to_string(),
            _ => String::new(),
        };
        let tanggal_lahir = match range.get_value((r as u32, 3)) {
            Some(Data::String(s)) => s.trim().to_string(),
            Some(Data::Int(i)) => i.to_string(),
            Some(Data::Float(f)) => f.to_string(),
            _ => String::new(),
        };
        let nis = match range.get_value((r as u32, 4)) {
            Some(Data::String(s)) => s.trim().to_string(),
            Some(Data::Int(i)) => i.to_string(),
            Some(Data::Float(f)) => f.to_string(),
            _ => String::new(),
        };
        let nisn = match range.get_value((r as u32, 5)) {
            Some(Data::String(s)) => s.trim().to_string(),
            Some(Data::Int(i)) => i.to_string(),
            Some(Data::Float(f)) => f.to_string(),
            _ => String::new(),
        };

        if name.is_empty() || nis.is_empty() {
            continue;
        }

        // Find or create student
        let student = match students::Entity::find()
            .filter(students::Column::Nis.eq(nis.clone()))
            .one(db)
            .await
            .map_err(|e| e.to_string())?
        {
            Some(s) => s,
            None => {
                let id = uuid::Uuid::new_v4().to_string();
                let now = chrono::Utc::now().to_rfc3339();
                let new_student = students::ActiveModel {
                    id: Set(id.clone()),
                    major_id: Set(major.id.clone()),
                    full_name: Set(name.clone()),
                    nis: Set(nis.clone()),
                    nisn: Set(nisn.clone()),
                    place_of_birth: Set(Some(tempat_lahir)),
                    date_of_birth: Set(Some(tanggal_lahir)),
                    created_at: Set(now.clone()),
                    updated_at: Set(now),
                    ..Default::default()
                };
                new_student.insert(db).await.map_err(|e| e.to_string())?
            }
        };

        // Import grades for this student using dynamic mapping
        for m in &dynamic_maps {
            let cell_val = match range.get_value((r as u32, m.col_idx as u32)) {
                Some(v) => v,
                None => continue,
            };

            let grade_val: f64 = match cell_val {
                Data::Float(f) => *f,
                Data::Int(i) => *i as f64,
                Data::String(s) => match s.trim().parse::<f64>() {
                    Ok(v) => v,
                    Err(_) => continue,
                },
                _ => continue,
            };

            if grade_val < 0.0 || grade_val > 100.0 {
                continue;
            }

            // Find semester
            let semester = match semesters_list.iter().find(|sem| sem.sequence == m.semester) {
                Some(sem) => sem,
                None => continue,
            };

            // Find or create curriculum mapping
            let mapping = match curriculum_subjects::Entity::find()
                .filter(curriculum_subjects::Column::MajorId.eq(major.id.clone()))
                .filter(curriculum_subjects::Column::SemesterId.eq(semester.id.clone()))
                .filter(curriculum_subjects::Column::SubjectId.eq(m.subject_id.clone()))
                .one(db)
                .await
                .map_err(|e| e.to_string())?
            {
                Some(map) => map,
                None => {
                    let id = uuid::Uuid::new_v4().to_string();
                    let now = chrono::Utc::now().to_rfc3339();
                    let new_mapping = curriculum_subjects::ActiveModel {
                        id: Set(id.clone()),
                        major_id: Set(major.id.clone()),
                        batch_id: Set(batch_id.clone()),
                        semester_id: Set(semester.id.clone()),
                        subject_id: Set(m.subject_id.clone()),
                        created_at: Set(now.clone()),
                        updated_at: Set(now),
                    };
                    new_mapping.insert(db).await.map_err(|e| e.to_string())?
                }
            };

            // Upsert grade
            let existing = student_grades::Entity::find()
                .filter(student_grades::Column::StudentId.eq(student.id.clone()))
                .filter(student_grades::Column::CurriculumSubjectId.eq(mapping.id.clone()))
                .one(db)
                .await
                .map_err(|e| e.to_string())?;

            match existing {
                Some(record) => {
                    let mut active: student_grades::ActiveModel = record.into();
                    active.grade = Set(grade_val);
                    active.updated_at = Set(chrono::Utc::now().to_rfc3339());
                    active.update(db).await.map_err(|e| e.to_string())?;
                }
                None => {
                    let id = uuid::Uuid::new_v4().to_string();
                    let now = chrono::Utc::now().to_rfc3339();
                    let new_grade = student_grades::ActiveModel {
                        id: Set(id),
                        student_id: Set(student.id.clone()),
                        curriculum_subject_id: Set(mapping.id),
                        grade: Set(grade_val),
                        created_at: Set(now.clone()),
                        updated_at: Set(now),
                    };
                    new_grade.insert(db).await.map_err(|e| e.to_string())?;
                }
            }
        }
        import_count += 1;
    }

    Ok(format!("Berhasil mengimpor {} data siswa beserta nilainya dari berkas Excel untuk Konsentrasi Keahlian '{}'", import_count, major.name))
}

fn populate_excel(
    worksheet: &mut rust_xlsxwriter::Worksheet,
    program_name: &str,
    major_name: &str,
    students_list: &[students::Model],
    columns_to_export: &[SubjectColumn],
    grades: &[student_grades::Model],
) -> Result<(), rust_xlsxwriter::XlsxError> {
    use rust_xlsxwriter::{Format, Color, FormatBorder, FormatAlign};

    // 1. Define custom formats to match reference.xlsx exactly
    let title_format = Format::new()
        .set_font_name("Aptos Narrow")
        .set_font_size(11)
        .set_bold()
        .set_background_color(Color::RGB(0xFFDE75))
        .set_align(FormatAlign::Center)
        .set_align(FormatAlign::VerticalCenter);

    let header_no_nama_format = Format::new()
        .set_font_name("Aptos Narrow")
        .set_font_size(9)
        .set_bold()
        .set_background_color(Color::RGB(0xCFECF7))
        .set_align(FormatAlign::Center)
        .set_align(FormatAlign::VerticalCenter)
        .set_border(FormatBorder::Thin);

    let header_tempat_tanggal_format = Format::new()
        .set_font_name("Aptos Narrow")
        .set_font_size(9)
        .set_bold()
        .set_background_color(Color::RGB(0xCFECF7))
        .set_align(FormatAlign::Center)
        .set_align(FormatAlign::VerticalCenter)
        .set_border(FormatBorder::Thin);

    let header_nis_nisn_format = Format::new()
        .set_font_name("Aptos Narrow")
        .set_font_size(9)
        .set_bold()
        .set_background_color(Color::RGB(0xB8DCAB))
        .set_align(FormatAlign::Center)
        .set_align(FormatAlign::VerticalCenter)
        .set_border(FormatBorder::Thin);

    let header_semester_format = Format::new()
        .set_font_name("Aptos Narrow")
        .set_font_size(9)
        .set_bold()
        .set_background_color(Color::RGB(0xD1E1D3))
        .set_align(FormatAlign::Center)
        .set_align(FormatAlign::VerticalCenter)
        .set_border(FormatBorder::Thin);

    let header_sem5_format = Format::new()
        .set_font_name("Aptos Narrow")
        .set_font_size(9)
        .set_bold()
        .set_background_color(Color::RGB(0xE5FDFF))
        .set_align(FormatAlign::Center)
        .set_align(FormatAlign::VerticalCenter)
        .set_border(FormatBorder::Thin);

    let header_subject_s1_format = Format::new()
        .set_font_name("Aptos Narrow")
        .set_font_size(9)
        .set_bold()
        .set_background_color(Color::RGB(0xFDFDFD))
        .set_align(FormatAlign::Center)
        .set_align(FormatAlign::VerticalCenter)
        .set_border(FormatBorder::Thin);

    let header_subject_s2_format = Format::new()
        .set_font_name("Aptos Narrow")
        .set_font_size(9)
        .set_bold()
        .set_background_color(Color::RGB(0xDCEDD5))
        .set_align(FormatAlign::Center)
        .set_align(FormatAlign::VerticalCenter)
        .set_border(FormatBorder::Thin);

    let num_row_format = Format::new()
        .set_font_name("Aptos Narrow")
        .set_font_size(9)
        .set_background_color(Color::RGB(0xFFFFCC))
        .set_align(FormatAlign::Center)
        .set_align(FormatAlign::VerticalCenter)
        .set_border(FormatBorder::Thin);

    let row_no_format = Format::new()
        .set_font_name("Times New Roman")
        .set_font_size(9)
        .set_background_color(Color::RGB(0xFFFFCC))
        .set_align(FormatAlign::Center)
        .set_align(FormatAlign::VerticalCenter)
        .set_border(FormatBorder::Thin);

    let row_student_format = Format::new()
        .set_font_name("Times New Roman")
        .set_font_size(9)
        .set_background_color(Color::RGB(0xFFFFCC))
        .set_align(FormatAlign::Left)
        .set_align(FormatAlign::VerticalCenter)
        .set_border(FormatBorder::Thin);

    let row_date_format = Format::new()
        .set_font_name("Times New Roman")
        .set_font_size(9)
        .set_background_color(Color::RGB(0xFFFFCC))
        .set_align(FormatAlign::Center)
        .set_align(FormatAlign::VerticalCenter)
        .set_border(FormatBorder::Thin);

    let row_nis_format = Format::new()
        .set_font_name("Times New Roman")
        .set_font_size(9)
        .set_background_color(Color::RGB(0xFFFFCC))
        .set_align(FormatAlign::Center)
        .set_align(FormatAlign::VerticalCenter)
        .set_border(FormatBorder::Thin);

    let grade_s1_format = Format::new()
        .set_font_name("Aptos Narrow")
        .set_font_size(9)
        .set_background_color(Color::RGB(0xFFFFCC))
        .set_align(FormatAlign::Center)
        .set_align(FormatAlign::VerticalCenter)
        .set_border(FormatBorder::Thin);

    let grade_s2_format = Format::new()
        .set_font_name("Aptos Narrow")
        .set_font_size(9)
        .set_background_color(Color::RGB(0xECD5E9))
        .set_align(FormatAlign::Center)
        .set_align(FormatAlign::VerticalCenter)
        .set_border(FormatBorder::Thin);

    // 2. Set Row Heights for Headers
    worksheet.set_row_height(0, 20.0)?;
    worksheet.set_row_height(1, 20.0)?;
    worksheet.set_row_height(2, 20.0)?;
    worksheet.set_row_height(4, 25.0)?;
    worksheet.set_row_height(5, 25.0)?;
    worksheet.set_row_height(6, 18.0)?;

    // 3. Set Column Widths to match reference.xlsx exactly
    worksheet.set_column_width(0, 4.57)?;
    worksheet.set_column_width(1, 24.43)?;
    worksheet.set_column_width(2, 11.29)?;
    worksheet.set_column_width(3, 16.71)?;
    worksheet.set_column_width(4, 7.57)?;
    worksheet.set_column_width(5, 9.29)?;
    
    let ukk_col = 6 + columns_to_export.len();
    for col in 6..=ukk_col {
        worksheet.set_column_width(col as u16, 6.29)?;
    }

    // 4. Write Titles
    worksheet.write_with_format(0, 0, "REKAP DATA HASIL BELAJAR SMKN 1 SUMATERA BARAT", &title_format)?;
    worksheet.write_with_format(1, 0, format!("PROGRAM STUDI : {}", program_name.to_uppercase()), &title_format)?;
    worksheet.write_with_format(2, 0, format!("KONSENTRASI KEAHLIAN : {}", major_name.to_uppercase()), &title_format)?;

    // 5. Merge static headers
    worksheet.merge_range(4, 0, 5, 0, "NO", &header_no_nama_format)?;
    worksheet.merge_range(4, 1, 5, 1, "NAMA", &header_no_nama_format)?;
    worksheet.merge_range(4, 2, 4, 3, "Tempat dan tanggal lahir", &header_tempat_tanggal_format)?;
    worksheet.write_with_format(5, 2, "Tempat", &header_tempat_tanggal_format)?;
    worksheet.write_with_format(5, 3, "Tanggal", &header_tempat_tanggal_format)?;
    worksheet.merge_range(4, 4, 5, 4, "NIS", &header_nis_nisn_format)?;
    worksheet.merge_range(4, 5, 5, 5, "NISN", &header_nis_nisn_format)?;

    // 6. Dynamically write and merge semester sub-blocks
    let mut i = 0;
    while i < columns_to_export.len() {
        let semester = columns_to_export[i].semester_sequence;
        let mut j = i;
        while j < columns_to_export.len() && columns_to_export[j].semester_sequence == semester {
            j += 1;
        }
        
        let start_col = 6 + i;
        let end_col = 6 + j - 1;
        
        let (sem_label, sem_format) = if semester == 5 {
            ("SMT 5".to_string(), &header_sem5_format)
        } else {
            (format!("SEMESTER {}", semester), &header_semester_format)
        };
        
        if start_col == end_col {
            worksheet.write_with_format(4, start_col as u16, &sem_label, sem_format)?;
        } else {
            worksheet.merge_range(4, start_col as u16, 4, end_col as u16, &sem_label, sem_format)?;
        }
        
        for col_idx in start_col..=end_col {
            let col_spec = &columns_to_export[col_idx - 6];
            let sub_format = if semester % 2 == 1 {
                &header_subject_s1_format
            } else {
                &header_subject_s2_format
            };
            worksheet.write_with_format(5, col_idx as u16, &col_spec.subject_code, sub_format)?;
        }
        
        i = j;
    }

    // 7. Write UKK column at the end
    worksheet.merge_range(4, ukk_col as u16, 5, ukk_col as u16, "UKK", &header_semester_format)?;

    // 8. Write row numbers row (Row 7)
    for col in 0..=ukk_col {
        worksheet.write_with_format(6, col as u16, (col + 1) as i32, &num_row_format)?;
    }

    // 9. Populate Student rows (Row 8+)
    for (s_idx, s) in students_list.iter().enumerate() {
        let r = 7 + s_idx;
        worksheet.set_row_height(r as u32, 20.0)?;
        
        worksheet.write_with_format(r as u32, 0, (s_idx + 1) as i32, &row_no_format)?;
        worksheet.write_with_format(r as u32, 1, &s.full_name, &row_student_format)?;
        worksheet.write_with_format(r as u32, 2, s.place_of_birth.as_deref().unwrap_or(""), &row_student_format)?;
        worksheet.write_with_format(r as u32, 3, s.date_of_birth.as_deref().unwrap_or(""), &row_date_format)?;
        worksheet.write_with_format(r as u32, 4, &s.nis, &row_nis_format)?;
        worksheet.write_with_format(r as u32, 5, &s.nisn, &row_nis_format)?;

        for (c_idx, col_spec) in columns_to_export.iter().enumerate() {
            let col = 6 + c_idx;
            let grade_fmt = if col_spec.semester_sequence % 2 == 1 {
                &grade_s1_format
            } else {
                &grade_s2_format
            };
            
            if let Some(g) = grades.iter().find(|g| g.student_id == s.id && g.curriculum_subject_id == col_spec.mapping_id) {
                worksheet.write_with_format(r as u32, col as u16, g.grade, grade_fmt)?;
            } else {
                worksheet.write_blank(r as u32, col as u16, grade_fmt)?;
            }
        }
        
        worksheet.write_blank(r as u32, ukk_col as u16, &grade_s2_format)?;
    }

    Ok(())
}

pub async fn export_grades_to_excel_core(
    db: &DatabaseConnection,
    major_id: String,
    path: &std::path::Path,
) -> Result<String, String> {
    // 1. Fetch Major
    let major = majors::Entity::find_by_id(major_id)
        .one(db)
        .await
        .map_err(|e| e.to_string())?
        .ok_or_else(|| "Konsentrasi Keahlian tidak ditemukan".to_string())?;

    // 2. Fetch Program Name
    let program_name = if let Some(prog_id) = &major.program_id {
        programs::Entity::find_by_id(prog_id.clone())
            .one(db)
            .await
            .map_err(|e| e.to_string())?
            .map(|p| p.name)
            .unwrap_or_else(|| "TEKNIK MESIN".to_string())
    } else {
        "TEKNIK MESIN".to_string()
    };

    // 4. Fetch data from DB
    let students_list = students::Entity::find()
        .filter(students::Column::MajorId.eq(major.id.clone()))
        .all(db)
        .await
        .map_err(|e| e.to_string())?;

    let mappings = curriculum_subjects::Entity::find()
        .filter(curriculum_subjects::Column::MajorId.eq(major.id.clone()))
        .all(db)
        .await
        .map_err(|e| e.to_string())?;

    let student_ids: Vec<String> = students_list.iter().map(|s| s.id.clone()).collect();
    let grades = if student_ids.is_empty() {
        Vec::new()
    } else {
        student_grades::Entity::find()
            .filter(student_grades::Column::StudentId.is_in(student_ids))
            .all(db)
            .await
            .map_err(|e| e.to_string())?
    };

    let subjects_list = subjects::Entity::find()
        .all(db)
        .await
        .map_err(|e| e.to_string())?;

    let semesters_list = semesters::Entity::find()
        .all(db)
        .await
        .map_err(|e| e.to_string())?;

    // 5. Build dynamically sorted list of subject columns to export based on major's active mappings in the DB
    let mut columns_to_export = Vec::new();

    for map in &mappings {
        let subject = match subjects_list.iter().find(|s| s.id == map.subject_id) {
            Some(s) => s,
            None => continue,
        };
        let semester = match semesters_list.iter().find(|sem| sem.id == map.semester_id) {
            Some(sem) => sem,
            None => continue,
        };
        columns_to_export.push(SubjectColumn {
            subject_id: subject.id.clone(),
            subject_code: subject.code.clone(),
            semester_sequence: semester.sequence,
            mapping_id: map.id.clone(),
            sequence: subject.sequence,
            category: subject.category.clone(),
        });
    }

    // Sort: Semester sequence first, then category weight (Common first, Vocational second), then subject sequence
    columns_to_export.sort_by(|a, b| {
        match a.semester_sequence.cmp(&b.semester_sequence) {
            std::cmp::Ordering::Equal => {
                let weight_a = if a.category == "Kelompok Umum" { 1 } else { 2 };
                let weight_b = if b.category == "Kelompok Umum" { 1 } else { 2 };
                match weight_a.cmp(&weight_b) {
                    std::cmp::Ordering::Equal => a.sequence.cmp(&b.sequence),
                    other => other,
                }
            }
            other => other,
        }
    });

    // 6. Create Excel Workbook using rust_xlsxwriter
    use rust_xlsxwriter::Workbook;
    let mut workbook = Workbook::new();
    let worksheet = workbook.add_worksheet();

    populate_excel(
        worksheet,
        &program_name,
        &major.name,
        &students_list,
        &columns_to_export,
        &grades,
    ).map_err(|e| format!("Gagal mengisi data Excel: {}", e))?;

    workbook.save(path)
        .map_err(|e| format!("Gagal menyimpan berkas Excel: {}", e))?;

    Ok(format!("Berhasil mengekspor data ke {:?}", path.file_name().unwrap_or_default()))
}
