---
name: formula-validation-test
description: Create integration tests that manually compute and validate complex aggregation formulas against database state
source: auto-skill
extracted_at: '2026-06-16T17:09:58.492Z'
---

When implementing complex aggregation formulas (e.g., weighted averages, multi-step calculations), create a dedicated integration test that manually computes the expected result and validates it against the actual implementation. This catches formula errors that unit tests miss.

## When to use

- Aggregation formulas with multiple components (e.g., `(avg_smt3 + avg_smt4 + avg_smt6 + ukk) / 4`)
- Business logic that depends on database state (grades, scores, mappings)
- Formulas where the calculation order matters (e.g., average of averages vs. average of all values)
- Any feature where incorrect calculation would have real-world consequences (transcripts, grades, financial reports)

## Procedure

### Step 1: Create a dedicated test file

Create `tests/db/validate_<feature>.rs` with a descriptive test name:

```rust
#[tokio::test]
async fn validate_<feature>_formula() {
    // Setup, computation, assertion
}
```

Register it in `tests/db/mod.rs`:
```rust
mod validate_<feature>;
```

### Step 2: Set up test data with known values

Create entities with **explicit, easy-to-verify values**:

```rust
// Use round numbers or obvious patterns
let smt3_grades = vec![85.0, 90.0, 88.0, 87.0, 92.0]; // avg = 88.4
let smt4_grades = vec![87.0, 92.0, 90.0, 89.0, 94.0]; // avg = 90.4
let smt6_grades = vec![89.0, 94.0, 92.0, 91.0, 96.0]; // avg = 92.4
let ukk_score = 85.0;
```

Avoid random values — you need to manually verify the expected result.

### Step 3: Import required SeaORM traits

Common compilation errors and fixes:

```rust
// Missing trait imports cause "is not an iterator" errors
use sea_orm::{EntityTrait, ColumnTrait, QueryFilter};

// Missing module imports
use app_lib::db::entities::{curriculum_subjects, students};
```

If you see `Entity::find()` errors, add `EntityTrait`. If `.filter()` fails, add `QueryFilter`. If `.eq()` fails, add `ColumnTrait`.

### Step 4: Wrap Option fields correctly

SeaORM models use `Option<T>` for nullable fields. Wrap string values:

```rust
// WRONG
place_of_birth: "Padang".to_string(),

// CORRECT
place_of_birth: Some("Padang".to_string()),
```

### Step 5: Compute expected result manually

```rust
let avg_smt3 = smt3_grades.iter().sum::<f64>() / smt3_grades.len() as f64;
let avg_smt4 = smt4_grades.iter().sum::<f64>() / smt4_grades.len() as f64;
let avg_smt6 = smt6_grades.iter().sum::<f64>() / smt6_grades.len() as f64;

let expected = (avg_smt3 + avg_smt4 + avg_smt6 + ukk_score) / 4.0;
```

Print the calculation steps for debugging:

```rust
println!("Formula: (avg_smt3 + avg_smt4 + avg_smt6 + ukk_score) / 4");
println!("       = ({:.2} + {:.2} + {:.2} + {:.2}) / 4", avg_smt3, avg_smt4, avg_smt6, ukk_score);
println!("       = {:.2}", expected);
```

### Step 6: Assert with tolerance

Floating-point comparisons need epsilon tolerance:

```rust
assert!((actual - expected).abs() < 0.01, "Result should be {:.2}", expected);
```

### Step 7: Run with `--nocapture` to see output

```bash
cargo test validate_<feature>_formula -- --nocapture
```

## Common pitfalls

1. **Missing trait imports**: SeaORM requires explicit trait imports for query methods. The error messages are cryptic ("is not an iterator") — always add `EntityTrait`, `ColumnTrait`, `QueryFilter` together.

2. **Option field mismatches**: SeaORM models use `Option<T>` for nullable columns. Check the entity definition before constructing model instances.

3. **Integer division**: Use `as f64` when dividing counts: `sum / count as f64`, not `sum / count`.

4. **Formula order**: Verify whether the formula is "average of averages" or "average of all values". These produce different results when group sizes differ.

## Example output

```
=== KONSENTRASI KEAHLIAN FORMULA VALIDATION ===

Semester 3 grades: [85.0, 90.0, 88.0, 87.0, 92.0]
Semester 3 average: 88.40

Semester 4 grades: [87.0, 92.0, 90.0, 89.0, 94.0]
Semester 4 average: 90.40

Semester 6 grades: [89.0, 94.0, 92.0, 91.0, 96.0]
Semester 6 average: 92.40

UKK score: 85.00

Formula: (avg_smt3 + avg_smt4 + avg_smt6 + ukk_score) / 4
       = (88.40 + 90.40 + 92.40 + 85.00) / 4
       = 356.20 / 4
       = 89.05

Expected Konsentrasi Keahlian score: 89.05

✓ Formula validation passed!
```

## Why this matters

- **Catches formula errors early**: A wrong formula in production affects all students. Manual verification with known values catches errors before deployment.
- **Documents the calculation**: The test serves as executable documentation of how the formula works.
- **Regression protection**: If someone changes the formula later, the test catches unintended changes.
- **Builds confidence**: When the user provides a reference image with specific values, you can verify your implementation matches exactly.
