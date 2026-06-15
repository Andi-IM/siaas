use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

/// SeaORM Entity representing the `curriculum_subjects` table.
/// 
/// This is a junction table mapping Majors, Batches, Semesters, and Subjects 
/// together to construct the school's curriculum map. It enforces a composite 
/// unique constraint to prevent duplicate curriculum subject assignments.
#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq, Serialize, Deserialize)]
#[sea_orm(table_name = "curriculum_subjects")]
pub struct Model {
    /// Unique identifier for the curriculum mapping (UUIDv4 format).
    #[sea_orm(primary_key, auto_increment = false, type = "Text")]
    pub id: String,

    /// Major (department) associated with this curriculum mapping.
    pub major_id: String,

    /// Academic year batch associated with this curriculum mapping.
    pub batch_id: String,

    /// Semester level associated with this curriculum mapping.
    pub semester_id: String,

    /// Subject course associated with this curriculum mapping.
    pub subject_id: String,

    /// Timestamp of when this curriculum entry was created.
    pub created_at: String,

    /// Timestamp of the last update to this curriculum entry.
    pub updated_at: String,
}

/// Relations mapped for the `curriculum_subjects` entity.
/// All relationships are configured to cascade delete: if a parent (Major, Batch, Semester, Subject) 
/// is deleted, the corresponding curriculum mapping is automatically removed.
#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    /// Many-to-one relationship mapping back to the Major entity.
    #[sea_orm(
        belongs_to = "super::majors::Entity",
        from = "Column::MajorId",
        to = "super::majors::Column::Id",
        on_update = "NoAction",
        on_delete = "Cascade"
    )]
    Majors,

    /// Many-to-one relationship mapping back to the Batch entity.
    #[sea_orm(
        belongs_to = "super::batches::Entity",
        from = "Column::BatchId",
        to = "super::batches::Column::Id",
        on_update = "NoAction",
        on_delete = "Cascade"
    )]
    Batches,

    /// Many-to-one relationship mapping back to the Semester entity.
    #[sea_orm(
        belongs_to = "super::semesters::Entity",
        from = "Column::SemesterId",
        to = "super::semesters::Column::Id",
        on_update = "NoAction",
        on_delete = "Cascade"
    )]
    Semesters,

    /// Many-to-one relationship mapping back to the Subject entity.
    #[sea_orm(
        belongs_to = "super::subjects::Entity",
        from = "Column::SubjectId",
        to = "super::subjects::Column::Id",
        on_update = "NoAction",
        on_delete = "Cascade"
    )]
    Subjects,

    /// One-to-many relationship linking a curriculum subject to student grades.
    #[sea_orm(has_many = "super::student_grades::Entity")]
    StudentGrades,
}

impl Related<super::majors::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Majors.def()
    }
}

impl Related<super::batches::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Batches.def()
    }
}

impl Related<super::semesters::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Semesters.def()
    }
}

impl Related<super::subjects::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Subjects.def()
    }
}

impl Related<super::student_grades::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::StudentGrades.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}
