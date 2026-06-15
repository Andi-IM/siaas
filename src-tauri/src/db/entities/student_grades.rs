use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

/// SeaORM Entity representing the `student_grades` table.
/// 
/// This table stores the academic grade a student receives in a specific curriculum subject.
/// It enforces a composite unique constraint linking one student to one curriculum subject entry.
#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "student_grades")]
pub struct Model {
    /// Unique identifier for the grade entry (UUIDv4 format).
    #[sea_orm(primary_key, auto_increment = false, type = "Text")]
    pub id: String,

    /// Foreign key referencing the student who receives the grade.
    pub student_id: String,

    /// Foreign key referencing the curriculum subject being evaluated.
    pub curriculum_subject_id: String,

    /// Numerical grade value (e.g., 95.5). Stored as a floating-point real.
    #[sea_orm(type = "Double")]
    pub grade: f64,

    /// Timestamp of when the grade record was created.
    pub created_at: String,

    /// Timestamp of the last grade update.
    pub updated_at: String,
}

/// Relations mapped for the `student_grades` entity.
/// All relationships are configured to cascade delete: if the student or the curriculum subject 
/// is deleted, the corresponding grade entry is automatically removed.
#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    /// Many-to-one relationship mapping back to the Student entity.
    #[sea_orm(
        belongs_to = "super::students::Entity",
        from = "Column::StudentId",
        to = "super::students::Column::Id",
        on_update = "NoAction",
        on_delete = "Cascade"
    )]
    Students,

    /// Many-to-one relationship mapping back to the CurriculumSubject entity.
    #[sea_orm(
        belongs_to = "super::curriculum_subjects::Entity",
        from = "Column::CurriculumSubjectId",
        to = "super::curriculum_subjects::Column::Id",
        on_update = "NoAction",
        on_delete = "Cascade"
    )]
    CurriculumSubjects,
}

impl Related<super::students::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Students.def()
    }
}

impl Related<super::curriculum_subjects::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::CurriculumSubjects.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}
