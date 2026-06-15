use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Major {
    pub id: String,
    pub code: String,
    pub name: String,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Batch {
    pub id: String,
    pub year: i32,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Semester {
    pub id: String,
    pub code: String,
    pub name: String,
    pub sequence: i32,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Subject {
    pub id: String,
    pub code: String,
    pub name: String,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Student {
    pub id: String,
    pub major_id: String,
    pub full_name: String,
    pub nis: String,
    pub nisn: String,
    pub place_of_birth: Option<String>,
    pub date_of_birth: Option<String>,
    pub gender: Option<String>,
    pub religion: Option<String>,
    pub family_status: Option<String>,
    pub child_order: Option<i32>,
    pub home_address: Option<String>,
    pub telephone: Option<String>,
    pub previous_school: Option<String>,
    pub admission_grade: Option<String>,
    pub admission_date: Option<String>,
    pub father_name: Option<String>,
    pub mother_name: Option<String>,
    pub parent_address: Option<String>,
    pub father_occupation: Option<String>,
    pub mother_occupation: Option<String>,
    pub guardian_name: Option<String>,
    pub guardian_address: Option<String>,
    pub guardian_phone_number: Option<String>,
    pub guardian_occupation: Option<String>,
    pub diploma_number: Option<String>,
    pub graduation_date: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CurriculumSubject {
    pub id: String,
    pub major_id: String,
    pub batch_id: String,
    pub semester_id: String,
    pub subject_id: String,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StudentGrade {
    pub id: String,
    pub student_id: String,
    pub curriculum_subject_id: String,
    pub grade: f64,
    pub created_at: String,
    pub updated_at: String,
}
