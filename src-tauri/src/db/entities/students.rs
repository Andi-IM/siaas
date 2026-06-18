use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

/// SeaORM Entity representing the `students` table.
///
/// This table holds a comprehensive student record containing administrative fields
/// (including personal details, admission data, parent info, guardian info, and graduation status)
/// as specified in the Academic Administrative Core schema.
#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq, Serialize, Deserialize)]
#[sea_orm(table_name = "students")]
pub struct Model {
    /// Unique identifier for the student (UUIDv4 format).
    #[sea_orm(primary_key, auto_increment = false, type = "Text")]
    pub id: String,

    /// Foreign key referencing the major (department) this student belongs to.
    pub major_id: String,

    /// Full name of the student.
    pub full_name: String,

    /// NIS (Nomor Induk Siswa) - School-level student registration number. Must be unique.
    #[sea_orm(unique)]
    pub nis: String,

    /// NISN (Nomor Induk Siswa Nasional) - National student registration number. Must be unique.
    #[sea_orm(unique)]
    pub nisn: String,

    /// City or place where the student was born.
    pub place_of_birth: Option<String>,

    /// Birthday of the student (ISO 8601 YYYY-MM-DD format).
    pub date_of_birth: Option<String>,

    /// Gender code (e.g., "M" or "F").
    pub gender: Option<String>,

    /// Religious belief of the student.
    pub religion: Option<String>,

    /// Status within the family (e.g., Anak Kandung, Anak Angkat).
    pub family_status: Option<String>,

    /// Birth order of the student in the family (e.g., 1 for first child).
    pub child_order: Option<i32>,

    /// Current home address of the student.
    pub home_address: Option<String>,

    /// Contact telephone number of the student.
    pub telephone: Option<String>,

    /// Name of the student's previous school (typically junior high).
    pub previous_school: Option<String>,

    /// Student's grade level on admission (e.g., "X", "XI").
    pub admission_grade: Option<String>,

    /// Date the student was officially admitted to the school.
    pub admission_date: Option<String>,

    /// Name of the student's father.
    pub father_name: Option<String>,

    /// Name of the student's mother.
    pub mother_name: Option<String>,

    /// Current residential address of the student's parents.
    pub parent_address: Option<String>,

    /// Profession or occupation of the student's father.
    pub father_occupation: Option<String>,

    /// Profession or occupation of the student's mother.
    pub mother_occupation: Option<String>,

    /// Name of the student's guardian.
    pub guardian_name: Option<String>,

    /// Residential address of the guardian.
    pub guardian_address: Option<String>,

    /// Contact phone number of the guardian.
    pub guardian_phone_number: Option<String>,

    /// Occupation of the guardian.
    pub guardian_occupation: Option<String>,

    /// Official certificate or diploma number received upon graduation.
    pub diploma_number: Option<String>,

    /// Official graduation date from the school.
    pub graduation_date: Option<String>,

    /// Timestamp of when the student record was created.
    pub created_at: String,

    /// Timestamp of the last student record update.
    pub updated_at: String,
}

/// Relations mapped for the `students` entity.
#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    /// Many-to-one relationship linking a student back to their Major.
    /// Restricted delete is enforced: A major cannot be deleted if active students refer to it.
    #[sea_orm(
        belongs_to = "super::majors::Entity",
        from = "Column::MajorId",
        to = "super::majors::Column::Id",
        on_update = "NoAction",
        on_delete = "Restrict"
    )]
    Majors,

    /// One-to-many relationship linking a student to their grades.
    #[sea_orm(has_many = "super::student_grades::Entity")]
    StudentGrades,
}

impl Related<super::majors::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Majors.def()
    }
}

impl Related<super::student_grades::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::StudentGrades.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}
