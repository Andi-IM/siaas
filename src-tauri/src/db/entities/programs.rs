use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

/// SeaORM Entity representing the `programs` table.
/// 
/// A program represents a broad vocational field of study (e.g., Teknik Mesin, Bisnis dan Manajemen).
/// It contains multiple specific concentrations (Majors).
#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq, Serialize, Deserialize)]
#[sea_orm(table_name = "programs")]
pub struct Model {
    /// Unique identifier for the program (UUIDv4 format).
    #[sea_orm(primary_key, auto_increment = false, type = "Text")]
    pub id: String,

    /// Descriptive name of the program (e.g., "Teknik Mesin").
    #[sea_orm(unique)]
    pub name: String,

    /// Timestamp of when the program was registered.
    pub created_at: String,

    /// Timestamp of the last program record update.
    pub updated_at: String,
}

/// Relations mapped for the `programs` entity.
#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    /// One-to-many relationship linking a program to its concentrations (majors).
    #[sea_orm(has_many = "super::majors::Entity")]
    Majors,
}

impl Related<super::majors::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Majors.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}
