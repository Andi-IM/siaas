use app_lib::db::DatabasePool;
use app_lib::db::migrations::MigrationManager;
use app_lib::db::models::{Major, Batch, Semester, Subject, Student, CurriculumSubject, StudentGrade};
use rusqlite::params;

/// Helper to set up an in-memory database and run migrations.
fn setup_test_db() -> DatabasePool {
    let pool = DatabasePool::new_in_memory().expect("Failed to create in-memory DB pool");
    let conn = pool.get_conn().expect("Failed to get connection");
    let manager = MigrationManager::new();
    manager.run(&conn).expect("Failed to run migrations");
    pool
}

#[test]
fn test_migrations_applied() {
    let pool = setup_test_db();
    let conn = pool.get_conn().unwrap();
    
    // Verify all tables defined in erdiagram.md + migration tracking are created
    let tables = vec![
        "majors", 
        "batches", 
        "semesters", 
        "subjects", 
        "students", 
        "curriculum_subjects", 
        "student_grades", 
        "schema_migrations"
    ];
    
    for table in tables {
        let count: i32 = conn.query_row(
            "SELECT count(*) FROM sqlite_master WHERE type='table' AND name=?1",
            [table],
            |row| row.get(0)
        ).unwrap();
        assert_eq!(count, 1, "Table '{}' should exist in database schema", table);
    }

    // Verify indices are created
    let indices = vec![
        "idx_students_major_id",
        "idx_curriculum_subjects_lookup",
        "idx_student_grades_student_id",
        "idx_student_grades_curriculum_subject_id"
    ];

    for idx in indices {
        let count: i32 = conn.query_row(
            "SELECT count(*) FROM sqlite_master WHERE type='index' AND name=?1",
            [idx],
            |row| row.get(0)
        ).unwrap();
        assert_eq!(count, 1, "Index '{}' should exist in database schema", idx);
    }
}

#[test]
fn test_crud_operations() {
    let pool = setup_test_db();
    let conn = pool.get_conn().unwrap();

    let major_id = uuid::Uuid::new_v4().to_string();
    let batch_id = uuid::Uuid::new_v4().to_string();
    let semester_id = uuid::Uuid::new_v4().to_string();
    let subject_id = uuid::Uuid::new_v4().to_string();
    let student_id = uuid::Uuid::new_v4().to_string();
    let cs_id = uuid::Uuid::new_v4().to_string();
    let grade_id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Utc::now().to_rfc3339();

    // 1. CRUD: Majors
    conn.execute(
        "INSERT INTO majors (id, code, name, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5)",
        (&major_id, "TI", "Teknik Informatika", &now, &now),
    ).unwrap();

    let major: Major = conn.query_row(
        "SELECT id, code, name, created_at, updated_at FROM majors WHERE id = ?1",
        [&major_id],
        |row| Ok(Major {
            id: row.get(0)?,
            code: row.get(1)?,
            name: row.get(2)?,
            created_at: row.get(3)?,
            updated_at: row.get(4)?,
        })
    ).unwrap();
    assert_eq!(major.code, "TI");
    assert_eq!(major.name, "Teknik Informatika");

    // 2. CRUD: Batches
    conn.execute(
        "INSERT INTO batches (id, year, created_at, updated_at) VALUES (?1, ?2, ?3, ?4)",
        (&batch_id, &2026, &now, &now),
    ).unwrap();

    let batch: Batch = conn.query_row(
        "SELECT id, year, created_at, updated_at FROM batches WHERE id = ?1",
        [&batch_id],
        |row| Ok(Batch {
            id: row.get(0)?,
            year: row.get(1)?,
            created_at: row.get(2)?,
            updated_at: row.get(3)?,
        })
    ).unwrap();
    assert_eq!(batch.year, 2026);

    // 3. CRUD: Semesters
    conn.execute(
        "INSERT INTO semesters (id, code, name, sequence, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        (&semester_id, "SEM1", "Semester 1", &1, &now, &now),
    ).unwrap();

    let semester: Semester = conn.query_row(
        "SELECT id, code, name, sequence, created_at, updated_at FROM semesters WHERE id = ?1",
        [&semester_id],
        |row| Ok(Semester {
            id: row.get(0)?,
            code: row.get(1)?,
            name: row.get(2)?,
            sequence: row.get(3)?,
            created_at: row.get(4)?,
            updated_at: row.get(5)?,
        })
    ).unwrap();
    assert_eq!(semester.code, "SEM1");
    assert_eq!(semester.sequence, 1);

    // 4. CRUD: Subjects
    conn.execute(
        "INSERT INTO subjects (id, code, name, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5)",
        (&subject_id, "CS101", "Introduction to Programming", &now, &now),
    ).unwrap();

    let subject: Subject = conn.query_row(
        "SELECT id, code, name, created_at, updated_at FROM subjects WHERE id = ?1",
        [&subject_id],
        |row| Ok(Subject {
            id: row.get(0)?,
            code: row.get(1)?,
            name: row.get(2)?,
            created_at: row.get(3)?,
            updated_at: row.get(4)?,
        })
    ).unwrap();
    assert_eq!(subject.code, "CS101");
    assert_eq!(subject.name, "Introduction to Programming");

    // 5. CRUD: Students
    conn.execute(
        "INSERT INTO students (
            id, major_id, full_name, nis, nisn, place_of_birth, date_of_birth, gender,
            religion, family_status, child_order, home_address, telephone, previous_school,
            admission_grade, admission_date, father_name, mother_name, parent_address,
            father_occupation, mother_occupation, guardian_name, guardian_address,
            guardian_phone_number, guardian_occupation, diploma_number, graduation_date,
            created_at, updated_at
        ) VALUES (
            ?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16,
            ?17, ?18, ?19, ?20, ?21, ?22, ?23, ?24, ?25, ?26, ?27, ?28, ?29
        )",
        params![
            &student_id, &major_id, "John Doe", "12345", "9988776655",
            &Some("Jakarta".to_string()), &Some("2010-05-15".to_string()), &Some("M".to_string()), 
            &Some("Islam".to_string()), &Some("Anak Kandung".to_string()), &Some(1), 
            &Some("Sudirman St.".to_string()), &Some("08123456789".to_string()),
            &Some("SMP 1 Jakarta".to_string()), &Some("X".to_string()), &Some("2025-07-10".to_string()),
            &Some("Father Doe".to_string()), &Some("Mother Doe".to_string()), &Some("Sudirman St.".to_string()),
            &Some("Engineer".to_string()), &Some("Teacher".to_string()), &None::<String>,
            &None::<String>, &None::<String>, &None::<String>,
            &None::<String>, &None::<String>, &now, &now
        ]
    ).unwrap();

    let student: Student = conn.query_row(
        "SELECT id, major_id, full_name, nis, nisn, place_of_birth, date_of_birth, gender, religion FROM students WHERE id = ?1",
        [&student_id],
        |row| Ok(Student {
            id: row.get(0)?,
            major_id: row.get(1)?,
            full_name: row.get(2)?,
            nis: row.get(3)?,
            nisn: row.get(4)?,
            place_of_birth: row.get(5)?,
            date_of_birth: row.get(6)?,
            gender: row.get(7)?,
            religion: row.get(8)?,
            family_status: None,
            child_order: None,
            home_address: None,
            telephone: None,
            previous_school: None,
            admission_grade: None,
            admission_date: None,
            father_name: None,
            mother_name: None,
            parent_address: None,
            father_occupation: None,
            mother_occupation: None,
            guardian_name: None,
            guardian_address: None,
            guardian_phone_number: None,
            guardian_occupation: None,
            diploma_number: None,
            graduation_date: None,
            created_at: "".to_string(),
            updated_at: "".to_string(),
        })
    ).unwrap();
    assert_eq!(student.full_name, "John Doe");
    assert_eq!(student.nis, "12345");
    assert_eq!(student.nisn, "9988776655");
    assert_eq!(student.place_of_birth, Some("Jakarta".to_string()));
    assert_eq!(student.date_of_birth, Some("2010-05-15".to_string()));

    // 6. CRUD: Curriculum Subjects
    conn.execute(
        "INSERT INTO curriculum_subjects (id, major_id, batch_id, semester_id, subject_id, created_at, updated_at) 
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
        (&cs_id, &major_id, &batch_id, &semester_id, &subject_id, &now, &now),
    ).unwrap();

    let cs: CurriculumSubject = conn.query_row(
        "SELECT id, major_id, batch_id, semester_id, subject_id FROM curriculum_subjects WHERE id = ?1",
        [&cs_id],
        |row| Ok(CurriculumSubject {
            id: row.get(0)?,
            major_id: row.get(1)?,
            batch_id: row.get(2)?,
            semester_id: row.get(3)?,
            subject_id: row.get(4)?,
            created_at: "".to_string(),
            updated_at: "".to_string(),
        })
    ).unwrap();
    assert_eq!(cs.major_id, major_id);
    assert_eq!(cs.subject_id, subject_id);

    // 7. CRUD: Student Grades
    conn.execute(
        "INSERT INTO student_grades (id, student_id, curriculum_subject_id, grade, created_at, updated_at) 
         VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        (&grade_id, &student_id, &cs_id, &95.5, &now, &now),
    ).unwrap();

    let grade: StudentGrade = conn.query_row(
        "SELECT id, student_id, curriculum_subject_id, grade FROM student_grades WHERE id = ?1",
        [&grade_id],
        |row| Ok(StudentGrade {
            id: row.get(0)?,
            student_id: row.get(1)?,
            curriculum_subject_id: row.get(2)?,
            grade: row.get(3)?,
            created_at: "".to_string(),
            updated_at: "".to_string(),
        })
    ).unwrap();
    assert_eq!(grade.grade, 95.5);
    assert_eq!(grade.student_id, student_id);
}

#[test]
fn test_foreign_key_constraints() {
    let pool = setup_test_db();
    let conn = pool.get_conn().unwrap();

    let major_id = uuid::Uuid::new_v4().to_string();
    let batch_id = uuid::Uuid::new_v4().to_string();
    let semester_id = uuid::Uuid::new_v4().to_string();
    let subject_id = uuid::Uuid::new_v4().to_string();
    let student_id = uuid::Uuid::new_v4().to_string();
    let cs_id = uuid::Uuid::new_v4().to_string();

    // Populate lookup data
    conn.execute(
        "INSERT INTO majors (id, code, name) VALUES (?1, ?2, ?3)",
        (&major_id, "TI", "Teknik Informatika"),
    ).unwrap();
    conn.execute(
        "INSERT INTO batches (id, year) VALUES (?1, ?2)",
        (&batch_id, &2026),
    ).unwrap();
    conn.execute(
        "INSERT INTO semesters (id, code, name, sequence) VALUES (?1, ?2, ?3, ?4)",
        (&semester_id, "SEM1", "Semester 1", &1),
    ).unwrap();
    conn.execute(
        "INSERT INTO subjects (id, code, name) VALUES (?1, ?2, ?3)",
        (&subject_id, "CS101", "Intro Programming"),
    ).unwrap();

    // Insert Student (referencing major_id)
    conn.execute(
        "INSERT INTO students (id, major_id, full_name, nis, nisn) VALUES (?1, ?2, ?3, ?4, ?5)",
        (&student_id, &major_id, "Jane Doe", "54321", "1122334455"),
    ).unwrap();

    // Insert Curriculum Subject (referencing majors, batches, semesters, subjects)
    conn.execute(
        "INSERT INTO curriculum_subjects (id, major_id, batch_id, semester_id, subject_id) 
         VALUES (?1, ?2, ?3, ?4, ?5)",
        (&cs_id, &major_id, &batch_id, &semester_id, &subject_id),
    ).unwrap();

    // Verify RESTRICT constraint on majors.
    // Deleting major should FAIL because it is referenced by a student (RESTRICT).
    let delete_result = conn.execute("DELETE FROM majors WHERE id = ?1", [&major_id]);
    assert!(
        delete_result.is_err(),
        "Should not allow deleting a Major referenced by active Students (ON DELETE RESTRICT)"
    );

    // Verify CASCADE constraint on curriculum_subjects.
    // First, let's remove the student to resolve the restrict constraint on major
    conn.execute("DELETE FROM students WHERE id = ?1", [&student_id]).unwrap();

    // Now deleting the major should succeed
    conn.execute("DELETE FROM majors WHERE id = ?1", [&major_id]).unwrap();

    // Because of CASCADE, the curriculum_subjects record referencing that major should have been automatically deleted.
    let count: i32 = conn.query_row(
        "SELECT count(*) FROM curriculum_subjects WHERE id = ?1",
        [&cs_id],
        |row| row.get(0)
    ).unwrap();
    assert_eq!(
        count, 0,
        "Curriculum subject should be deleted via cascade when its Major is deleted"
    );
}

#[test]
fn test_sql_injection_prevention() {
    let pool = setup_test_db();
    let conn = pool.get_conn().unwrap();

    let major_id = uuid::Uuid::new_v4().to_string();
    conn.execute(
        "INSERT INTO majors (id, code, name) VALUES (?1, ?2, ?3)",
        (&major_id, "TI", "Teknik Informatika"),
    ).unwrap();

    // Malicious inputs attempting SQL Injection
    let malicious_id = "'; DROP TABLE majors; --";
    let malicious_nis = "12345'; DROP TABLE students; --";
    let malicious_nisn = "9999999999";

    // Attempt insert using parameterized queries. The operation should succeed, but the SQL injection should NOT execute.
    let insert_result = conn.execute(
        "INSERT INTO students (id, major_id, full_name, nis, nisn) VALUES (?1, ?2, ?3, ?4, ?5)",
        (malicious_id, &major_id, "Hacker Name", malicious_nis, malicious_nisn),
    );
    assert!(insert_result.is_ok(), "Parameterized insert should succeed even with malicious input characters");

    // Verify the majors table still exists and data remains intact
    let major_count: i32 = conn.query_row(
        "SELECT count(*) FROM majors WHERE id = ?1",
        [&major_id],
        |row| row.get(0)
    ).unwrap();
    assert_eq!(major_count, 1, "Majors table was dropped or altered by SQL injection!");

    // Verify the student was inserted with the literal malicious values
    let inserted_nis: String = conn.query_row(
        "SELECT nis FROM students WHERE id = ?1",
        [malicious_id],
        |row| row.get(0)
    ).unwrap();
    assert_eq!(inserted_nis, malicious_nis, "Malicious characters were parsed or modified instead of being treated as literal text");
}
