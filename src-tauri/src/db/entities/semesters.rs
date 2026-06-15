use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

/// SeaORM Entity representing the `semesters` table.
/// 
/// Semesters represent the academic terms or levels within the school curriculum 
/// (e.g., Semester 1, Semester 2). They have sequence indices to maintain ordering.
#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq, Serialize, Deserialize)]
#[sea_orm(table_name = "semesters")]
pub struct Model {
    /// Unique identifier for the semester (UUIDv4 format).
    #[sea_orm(primary_key, auto_increment = false, type = "Text")]
    pub id: String,

    /// Unique code identifier for the semester (e.g., "SEM-1", "ODD-2026").
    #[sea_orm(unique)]
    pub code: String,

    /// Descriptive name of the semester (e.g., "Semester 1").
    pub name: String,

    /// Ordering sequence index of the semester. Must be unique to maintain chronological progression.
    #[sea_orm(unique)]
    pub sequence: i32,

    /// Timestamp of when the semester record was created.
    pub created_at: String,

    /// Timestamp of the last semester record update.
    pub updated_at: String,
}

/// Relations mapped for the `semesters` entity.
#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    /// One-to-many relationship linking a semester to curriculum subjects assigned to it.
    #[sea_orm(has_many = "super::curriculum_subjects::Entity")]
    CurriculumSubjects,
}

impl Related<super::curriculum_subjects::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::CurriculumSubjects.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}
