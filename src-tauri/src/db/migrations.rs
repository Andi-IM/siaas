use sea_orm::{ConnectionTrait, DatabaseConnection, DbErr, Statement, DbBackend, TransactionTrait};

pub struct MigrationManager {
    migrations: Vec<Migration>,
}

struct Migration {
    version: i32,
    name: &'static str,
    up: &'static str,
    down: &'static str,
}

impl MigrationManager {
    pub fn new() -> Self {
        Self {
            migrations: vec![
                Migration {
                    version: 1,
                    name: "create_majors_table",
                    up: "CREATE TABLE majors (
                        id TEXT PRIMARY KEY,
                        code TEXT NOT NULL UNIQUE,
                        name TEXT NOT NULL,
                        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
                    );",
                    down: "DROP TABLE IF EXISTS majors;",
                },
                Migration {
                    version: 2,
                    name: "create_batches_table",
                    up: "CREATE TABLE batches (
                        id TEXT PRIMARY KEY,
                        year INTEGER NOT NULL UNIQUE,
                        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
                    );",
                    down: "DROP TABLE IF EXISTS batches;",
                },
                Migration {
                    version: 3,
                    name: "create_semesters_table",
                    up: "CREATE TABLE semesters (
                        id TEXT PRIMARY KEY,
                        code TEXT NOT NULL UNIQUE,
                        name TEXT NOT NULL,
                        sequence INTEGER NOT NULL UNIQUE,
                        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
                    );",
                    down: "DROP TABLE IF EXISTS semesters;",
                },
                Migration {
                    version: 4,
                    name: "create_subjects_table",
                    up: "CREATE TABLE subjects (
                        id TEXT PRIMARY KEY,
                        code TEXT NOT NULL UNIQUE,
                        name TEXT NOT NULL,
                        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
                    );",
                    down: "DROP TABLE IF EXISTS subjects;",
                },
                Migration {
                    version: 5,
                    name: "create_students_table",
                    up: "CREATE TABLE students (
                        id TEXT PRIMARY KEY,
                        major_id TEXT NOT NULL,
                        full_name TEXT NOT NULL,
                        nis TEXT NOT NULL UNIQUE,
                        nisn TEXT NOT NULL UNIQUE,
                        place_of_birth TEXT,
                        date_of_birth TEXT,
                        gender TEXT,
                        religion TEXT,
                        family_status TEXT,
                        child_order INTEGER,
                        home_address TEXT,
                        telephone TEXT,
                        previous_school TEXT,
                        admission_grade TEXT,
                        admission_date TEXT,
                        father_name TEXT,
                        mother_name TEXT,
                        parent_address TEXT,
                        father_occupation TEXT,
                        mother_occupation TEXT,
                        guardian_name TEXT,
                        guardian_address TEXT,
                        guardian_phone_number TEXT,
                        guardian_occupation TEXT,
                        diploma_number TEXT,
                        graduation_date TEXT,
                        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY(major_id) REFERENCES majors(id) ON DELETE RESTRICT
                    );",
                    down: "DROP TABLE IF EXISTS students;",
                },
                Migration {
                    version: 6,
                    name: "create_curriculum_subjects_table",
                    up: "CREATE TABLE curriculum_subjects (
                        id TEXT PRIMARY KEY,
                        major_id TEXT NOT NULL,
                        batch_id TEXT NOT NULL,
                        semester_id TEXT NOT NULL,
                        subject_id TEXT NOT NULL,
                        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY(major_id) REFERENCES majors(id) ON DELETE CASCADE,
                        FOREIGN KEY(batch_id) REFERENCES batches(id) ON DELETE CASCADE,
                        FOREIGN KEY(semester_id) REFERENCES semesters(id) ON DELETE CASCADE,
                        FOREIGN KEY(subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
                        UNIQUE(major_id, batch_id, semester_id, subject_id)
                    );",
                    down: "DROP TABLE IF EXISTS curriculum_subjects;",
                },
                Migration {
                    version: 7,
                    name: "create_student_grades_table",
                    up: "CREATE TABLE student_grades (
                        id TEXT PRIMARY KEY,
                        student_id TEXT NOT NULL,
                        curriculum_subject_id TEXT NOT NULL,
                        grade REAL NOT NULL,
                        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE,
                        FOREIGN KEY(curriculum_subject_id) REFERENCES curriculum_subjects(id) ON DELETE CASCADE,
                        UNIQUE(student_id, curriculum_subject_id)
                    );",
                    down: "DROP TABLE IF EXISTS student_grades;",
                },
                Migration {
                    version: 8,
                    name: "create_indexes",
                    up: "CREATE INDEX idx_students_major_id ON students(major_id);
                         CREATE INDEX idx_curriculum_subjects_lookup ON curriculum_subjects(major_id, batch_id, semester_id, subject_id);
                         CREATE INDEX idx_student_grades_student_id ON student_grades(student_id);
                         CREATE INDEX idx_student_grades_curriculum_subject_id ON student_grades(curriculum_subject_id);",
                    down: "DROP INDEX IF EXISTS idx_students_major_id;
                           DROP INDEX IF EXISTS idx_curriculum_subjects_lookup;
                           DROP INDEX IF EXISTS idx_student_grades_student_id;
                           DROP INDEX IF EXISTS idx_student_grades_curriculum_subject_id;",
                },
                Migration {
                    version: 9,
                    name: "create_programs_table",
                    up: "CREATE TABLE programs (
                        id TEXT PRIMARY KEY,
                        name TEXT NOT NULL UNIQUE,
                        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
                    );
                    ALTER TABLE majors ADD COLUMN program_id TEXT REFERENCES programs(id) ON DELETE SET NULL;",
                    down: "ALTER TABLE majors DROP COLUMN program_id;
                           DROP TABLE IF EXISTS programs;",
                },
                Migration {
                    version: 10,
                    name: "add_category_and_status_to_subjects",
                    up: "ALTER TABLE subjects ADD COLUMN category TEXT NOT NULL DEFAULT 'Kelompok Umum';
                         ALTER TABLE subjects ADD COLUMN status TEXT NOT NULL DEFAULT 'active';",
                    down: "ALTER TABLE subjects DROP COLUMN category;
                           ALTER TABLE subjects DROP COLUMN status;",
                },
                Migration {
                    version: 11,
                    name: "add_sequence_to_subjects",
                    up: "ALTER TABLE subjects ADD COLUMN sequence INTEGER NOT NULL DEFAULT 0;",
                    down: "ALTER TABLE subjects DROP COLUMN sequence;",
                },
            ],
        }
    }

    /// Runs all pending database migrations asynchronously.
    pub async fn run(&self, db: &DatabaseConnection) -> Result<(), DbErr> {
        db.execute(Statement::from_string(
            DbBackend::Sqlite,
            "CREATE TABLE IF NOT EXISTS schema_migrations (
                version INTEGER PRIMARY KEY,
                name TEXT NOT NULL,
                applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )".to_string()
        )).await?;

        let query_res = db.query_one(Statement::from_string(
            DbBackend::Sqlite,
            "SELECT COALESCE(MAX(version), 0) as version FROM schema_migrations".to_string()
        )).await?;

        let current_version: i32 = match query_res {
            Some(res) => res.try_get::<i32>("", "version").unwrap_or(0),
            None => 0,
        };

        for migration in &self.migrations {
            if migration.version > current_version {
                println!("Running migration {}: {}", migration.version, migration.name);

                let txn = db.begin().await?;
                txn.execute(Statement::from_string(DbBackend::Sqlite, migration.up.to_string())).await?;
                
                let insert_stmt = Statement::from_sql_and_values(
                    DbBackend::Sqlite,
                    "INSERT INTO schema_migrations (version, name) VALUES (?, ?)",
                    vec![migration.version.into(), migration.name.into()]
                );
                txn.execute(insert_stmt).await?;
                txn.commit().await?;
            }
        }

        Ok(())
    }

    /// Rolls back migrations to the target version.
    pub async fn rollback(&self, db: &DatabaseConnection, target_version: i32) -> Result<(), DbErr> {
        let query_res = db.query_one(Statement::from_string(
            DbBackend::Sqlite,
            "SELECT COALESCE(MAX(version), 0) as version FROM schema_migrations".to_string()
        )).await?;

        let current_version: i32 = match query_res {
            Some(res) => res.try_get::<i32>("", "version").unwrap_or(0),
            None => 0,
        };

        for migration in self.migrations.iter().rev() {
            if migration.version > target_version && migration.version <= current_version {
                println!("Rolling back migration {}: {}", migration.version, migration.name);

                let txn = db.begin().await?;
                txn.execute(Statement::from_string(DbBackend::Sqlite, migration.down.to_string())).await?;

                let delete_stmt = Statement::from_sql_and_values(
                    DbBackend::Sqlite,
                    "DELETE FROM schema_migrations WHERE version = ?",
                    vec![migration.version.into()]
                );
                txn.execute(delete_stmt).await?;
                txn.commit().await?;
            }
        }

        Ok(())
    }
}
