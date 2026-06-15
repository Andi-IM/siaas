use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

/// SeaORM Entity representing the `majors` table.
/// 
/// A major represents an academic department or specialization path in the school system 
/// (e.g., Teknik Informatika, Akuntansi). It is linked to student records and curriculum subjects.
#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq, Serialize, Deserialize)]
#[sea_orm(table_name = "majors")]
pub struct Model {
    /// Unique identifier for the major (UUIDv4 format).
    #[sea_orm(primary_key, auto_increment = false, type = "Text")]
    pub id: String,

    /// Unique administrative code (e.g., "TI", "AK", "AP").
    #[sea_orm(unique)]
    pub code: String,

    /// Descriptive name of the major (e.g., "Teknik Informatika").
    pub name: String,

    /// Optional link to a parent Program Keahlian.
    pub program_id: Option<String>,

    /// Timestamp of when the major was registered.
    pub created_at: String,

    /// Timestamp of the last major record update.
    pub updated_at: String,
}

/// Relations mapped for the `majors` entity.
#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    /// Many-to-one relationship linking a major back to its parent program.
    #[sea_orm(
        belongs_to = "super::programs::Entity",
        from = "Column::ProgramId",
        to = "super::programs::Column::Id",
        on_update = "NoAction",
        on_delete = "SetNull"
    )]
    Programs,

    /// One-to-many relationship linking a major to many students registered under it.
    #[sea_orm(has_many = "super::students::Entity")]
    Students,

    /// One-to-many relationship linking a major to curriculum subject mappings.
    #[sea_orm(has_many = "super::curriculum_subjects::Entity")]
    CurriculumSubjects,
}

impl Related<super::programs::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Programs.def()
    }
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
