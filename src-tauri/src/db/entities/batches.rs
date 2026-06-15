use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

/// SeaORM Entity representing the `batches` table.
/// 
/// A batch represents a student admission intake year group (e.g., 2024, 2025). 
/// It organizes the subjects that belong to the curriculum corresponding to that year.
#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq, Serialize, Deserialize)]
#[sea_orm(table_name = "batches")]
pub struct Model {
    /// Unique identifier for the batch (UUIDv4 format).
    #[sea_orm(primary_key, auto_increment = false, type = "Text")]
    pub id: String,

    /// The academic year of the batch (e.g., 2026). Must be unique.
    #[sea_orm(unique)]
    pub year: i32,

    /// Timestamp of when the batch was created.
    pub created_at: String,

    /// Timestamp of the last batch record update.
    pub updated_at: String,
}

/// Relations mapped for the `batches` entity.
#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    /// One-to-many relationship linking a batch to curriculum subjects assigned to it.
    #[sea_orm(has_many = "super::curriculum_subjects::Entity")]
    CurriculumSubjects,
}

impl Related<super::curriculum_subjects::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::CurriculumSubjects.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}
