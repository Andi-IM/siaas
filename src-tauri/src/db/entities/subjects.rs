use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

/// SeaORM Entity representing the `subjects` table.
/// 
/// A subject represents an academic course of study offered by the school (e.g., Matematika, Fisika).
/// It is referenced within the curriculum mapping.
#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq, Serialize, Deserialize)]
#[sea_orm(table_name = "subjects")]
pub struct Model {
    /// Unique identifier for the subject (UUIDv4 format).
    #[sea_orm(primary_key, auto_increment = false, type = "Text")]
    pub id: String,

    /// Unique course code identifying the subject (e.g., "MAT-101", "FIS-102").
    #[sea_orm(unique)]
    pub code: String,

    /// Friendly name of the subject (e.g., "Matematika Wajib").
    pub name: String,

    /// Timestamp of when the subject record was created.
    pub created_at: String,

    /// Timestamp of the last subject record update.
    pub updated_at: String,
}

/// Relations mapped for the `subjects` entity.
#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    /// One-to-many relationship linking a subject to curriculum subject mappings it belongs to.
    #[sea_orm(has_many = "super::curriculum_subjects::Entity")]
    CurriculumSubjects,
}

impl Related<super::curriculum_subjects::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::CurriculumSubjects.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}
