use thiserror::Error;
use serde::Serialize;

#[derive(Debug, Error, Serialize)]
#[serde(tag = "type", content = "details")]
pub enum AppError {
    /// Wraps Sea-ORM database errors (connection, query, constraint).
    #[error("Database error: {0}")]
    Database(#[serde(serialize_with = "serialize_display")] sea_orm::DbErr),

    /// Wraps I/O and file errors.
    #[error("I/O error: {0}")]
    Io(#[serde(serialize_with = "serialize_display")] std::io::Error),

    /// Business rule or input validation failure.
    #[error("{0}")]
    Validation(String),

    /// Entity lookup returned no results.
    #[error("{entity} dengan {field} '{value}' tidak ditemukan")]
    NotFound {
        entity: &'static str,
        field: &'static str,
        value: String,
    },

    /// Unique constraint would be violated.
    #[error("{entity} dengan {field} '{value}' sudah ada")]
    Duplicate {
        entity: &'static str,
        field: &'static str,
        value: String,
    },

    /// Excel import/export failures.
    #[error("{0}")]
    Excel(String),
}

fn serialize_display<S, T>(val: &T, serializer: S) -> Result<S::Ok, S::Error>
where
    S: serde::Serializer,
    T: std::fmt::Display,
{
    serializer.serialize_str(&val.to_string())
}

// Implement standard conversion from standard types to make ? operator work elegantly
impl From<sea_orm::DbErr> for AppError {
    fn from(err: sea_orm::DbErr) -> Self {
        AppError::Database(err)
    }
}

impl From<std::io::Error> for AppError {
    fn from(err: std::io::Error) -> Self {
        AppError::Io(err)
    }
}
