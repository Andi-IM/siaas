# Visual Identity Guidelines (Brand Guidelines) — SIAAS

This guideline defines the rules and visual implementation for the **SIAAS** (Sistem Informasi Administrasi Akademik Siswa) logo to ensure its consistent integration into the digital UI/UX ecosystem. In alignment with the product's core values, all visual elements must reflect a **Reliable, Precise, and Authoritative** brand personality.

---

## 1. Anatomy & Meaning of Logo Elements

The SIAAS logo combines functional elements of administrative systems and academic values:
* **Gear:** Symbolizes automation, smooth administrative processes, and operational efficiency.
* **Book (Cover & Paper):** Represents the digital transformation of the traditional physical record book (*Buku Induk*), symbolizing structured, secure, and authentic student academic data.

---

## 2. Logo Color Mapping

To maintain institutional identity consistency, all components within the logo must strictly utilize the formal color mapping derived directly from the `DESIGN.md` color token system:

| Logo Component | Visual Role | Color Token | HEX Value |
| :--- | :--- | :--- | :--- |
| **Main Gear** | System Structural Element | `primary` | `#00236F` |
| **Book Cover** | Academic Frame Element | `primary` | `#00236F` |
| **Book Paper** | Content / Data Element | `secondary` | `#505F76` |
| **System Name Text** | Primary Information Legibility | `on-surface` | `#191C1E` |

---

## 3. Logo Typography Rules

When the logo is displayed alongside the full system/institution name (*logo lockup*), the typography must adhere to the following standards:
* **Font Family:** Inter
* **Main Text ("SIAAS"):** Bold (700), `on-surface` color (`#191C1E`).
* **Descriptive Text ("Sistem Informasi Administrasi Akademik Siswa"):** Regular (400) or Medium (500), `on-surface-variant` color (`#444651`).
* *Note:* The use of decorative, script, or serif fonts is strictly prohibited to ensure maximum legibility on data-dense screens.

---

## 4. Logo Interface Implementation (UI Compliance)

### A. Safe Zone / Padding
The logo must be surrounded by a clear space free from any other visual elements (text, borders, or imagery) to maintain its visual integrity. The minimum required safe zone is **`16px`** (matching the layout's standard `gutter-width`) on all outer sides of the logo.

### B. Scalability & Minimum Size
* **Desktop & Web Applications (Sidebar / Top Bar):** The logo must be displayed in its full format along with the system name text (*Full Lockup*) with a minimum vertical height of **`32px`**.
* **Favicons & Mini App Icons (Size < 48px):** All written text must be removed. The interface is only permitted to display the *logomark* (the gear and book icon alone) to ensure details remain sharp and visible.

### C. Background Contrast
* **Light Backgrounds (`surface` / `#F7F9FB` or `surface-container-lowest` / `#FFFFFF`):** Use the full-color version of the logo according to the color mapping table above.
* **Dark Backgrounds (Main Sidebar / `tertiary` / `#222A3E`):** The system name text element must be switched to contrast sharply using the `on-tertiary` (`#FFFFFF`) or `inverse-on-surface` (`#EFF1F3`) tokens. The book paper element may use a lighter opacity if its native contrast drops significantly.

---

## 5. Usage Restrictions (Don'ts)

To preserve institutional trust and design precision, the following actions **are strictly prohibited**:
1.  **Do not** distort the logo's aspect ratio (stretching or compressing the logo horizontally or vertically).
2.  **Do not** replace the logo's colors with any palette outside the official token system (e.g., using decorative green or yellow on the gear). Semantic colors like red (`error`) are strictly reserved for system status indicators, never for logo decoration.
3.  **Do not** apply heavy drop shadows, pastel gradients, or any playful visual effects (*consumer-cute aesthetics*).
4.  **Do not** place the full-color logo directly on top of complex background images without enclosing it inside a solid white card block container (`#FFFFFF`).