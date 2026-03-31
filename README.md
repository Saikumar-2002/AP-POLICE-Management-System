# Police Station Hierarchy Management System

A production-grade full-stack application for managing hierarchical police units (Zone → Range → District → Circle → Police Station).

## 🌟 Features

- **Interactive Hierarchy Tree:** Visualize complex nested units (Ministry down to Station level)
- **Role-Based Access Control:** Separate features for Admin (Full access + Excel upload), Manager (CRUD), and Viewer (Read-only)
- **Bulk Excel Import:** Upload `.xlsx` or `.csv` files to auto-build massive hierarchy trees mapping parent/child relationships
- **CRUD Unit Management:** Full interface to create, edit, search, and delete units without breaking the tree
- **Premium UI:** Dark theme, glassmorphism design, and micro-animations built with React + Vite

---

## 🏗 System Architecture

### Frontend
- **Framework:** React 18 + Vite
- **Styling:** Vanilla CSS (Dark Mode Design System)
- **State Management:** Zustand
- **Routing:** React Router v6
- **HTTP Client:** Axios

### Backend
- **Framework:** Node.js + Express
- **Database:** SQLite (local development) / PostgreSQL ready (production)
- **Excel Parsing:** SheetJS (`xlsx`)
- **File Uploads:** Multer
- **Authentication:** JWT + bcrypt

---

## 🗄 Database Schema (PostgreSQL/SQLite)

The system uses a self-referencing table design to handle infinite levels of hierarchy.

```sql
CREATE TABLE police_units (
  id INTEGER PRIMARY KEY,
  unit_code TEXT UNIQUE NOT NULL,    -- e.g., AP001 (used for Excel mapping)
  legacy_reference TEXT,             -- Older mapping IDs if applicable
  name TEXT NOT NULL,                -- e.g., Vijayawada Zone
  unit_type TEXT NOT NULL,           -- zone, range, district, circle, station, etc.
  parent_id INTEGER NULL,            -- Self-referential foreign key
  ministry TEXT,
  department TEXT,
  is_virtual INTEGER DEFAULT 0       -- Boolean flag for logical units
);

CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'viewer',        -- admin, manager, viewer
  unit_id INTEGER                    -- Foreign key mapping user to a specific unit
);
```

### Excel Data Mapping Strategy
1. **Upload:** User provides an Excel file with `unitCode` and `parentUnitCode` columns.
2. **Upsert:** Backend processes the file taking the `unitCode` as the unique identifier.
3. **Pass 1:** Inserts or updates all units, ignoring the hierarchical relationship structure initially.
4. **Pass 2:** Cycles through the uploaded units again. It searches the database for the `parentUnitCode` and updates the child's `parent_id` foreign key.

---

## 🚀 Setup & Run Instructions

### 1. Prerequisites
- Node.js (v18+)
- npm or yarn

### 2. Backend Setup
```bash
cd backend
npm install
npm start
```
*Note: The backend runs on `http://localhost:3001`. It will automatically generate `database.sqlite` and seed default users on the first run.*

### 3. Frontend Setup
Open a new terminal.
```bash
cd frontend
npm install
npm run dev
```
*Note: The frontend runs on `http://localhost:5173` and proxies API requests to the backend.*

---

## 🔐 Default Demo Accounts

| Role      | Username  | Password    |
|-----------|-----------|-------------|
| **Admin** | `admin`   | `admin123`  |
| **Manager**| `manager`| `manager123`|
| **Viewer**| `viewer`  | `viewer123` |

---

## 📡 API Documentation

### **Authentication**
- `POST /api/auth/login` - Returns JWT token + User Info

### **Units**
- `GET /api/units` - Retrieve a flat, alphabetical listing of units
- `GET /api/units/tree` - Retrive recursive hierarchy tree and unit group statistics
- `GET /api/units/:id` - Fetch single unit
- `POST /api/units` - Create new unit (Admin/Manager only)
- `PUT /api/units/:id` - Update unit (Admin/Manager only)
- `DELETE /api/units/:id` - Delete unit (Admin/Manager only)

### **Upload**
- `POST /api/upload/excel` - Expects `multipart/form-data` with a `file` field containing the `.xlsx` document. Returns statistics on successful row insertions and array of failure details (Admin only).

---

## 📈 Assumptions, Trade-offs & Limitations

1. **Database Selection:** We utilize SQLite locally using `better-sqlite3` to ensure zero setup for development. The schema and transactions are designed to easily be migrated to PostgreSQL later.
2. **Infinite Recursion Protection:** The UI will prevent a user assigning a Parent ID that already acts as a descendant, bypassing circular referential issues.
3. **Excel Sizing:** `SheetJS` loads datasets into RAM. While efficient for tens of thousands of rows, truly massive datasets (1M+ rows) should be handled via streams instead.

---

## ☁️ Deployment Strategy

1. **Frontend:** 
   - Deploy on **Vercel** or **Netlify**.
   - Create a build via `npm run build` and route output to `dist`.
   - Ensure environment variables are set pointing to backend URL.

2. **Backend:**
   - Deploy to **Render** or **Railway**.
   - Set environment variables (`PORT`, `JWT_SECRET`, `DATABASE_URL`).

3. **Database:**
   - Set up Managed PostgreSQL on **Render DB** or **Supabase**.
   - Migrate schema (convert `AUTOINCREMENT` to `SERIAL`).
