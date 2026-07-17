# Medicflow - Hospital Management System (HMS)

Medicflow is a premium, portfolio-grade **Hospital Management System (HMS)** built with a modern decoupled stack: a high-performance **NestJS backend** powered by **Sequelize ORM** and **MySQL**, and a sleek **Next.js frontend** utilising **React** and **Tailwind CSS**. 

The system implements Role-Based Access Control (RBAC) across six dedicated portals, syncing clinical departments in real-time.

---

## 🏛️ System Architecture

```mermaid
graph TD
    subgraph Client Layer [Frontend - Next.js & React]
        Login["Unified Login Portal"]
        Admin["Admin Portal"]
        Reception["Reception Desk"]
        MO["Medical Officer Triage"]
        Doctor["Doctor Desk"]
        Lab["Laboratory Portal"]
        US["Ultrasound Sonography"]
    end

    subgraph Service Layer [Backend - NestJS API]
        Auth["Auth Service (JWT)"]
        Users["Users Module"]
        Patients["Patients Module"]
        Appts["Appointments & Queue"]
        Vitals["Vitals Module"]
        Consults["Consultations & Prescriptions"]
        LabSvc["Lab requests Module"]
        USSvc["Ultrasound requests Module"]
        BillSvc["Billing & Cashier Module"]
    end

    subgraph Storage Layer [Database]
        DB[(MySQL Database)]
    end

    Login --> Auth
    Admin --> Users
    Reception --> Patients & Appts & BillSvc
    MO --> Vitals & Appts
    Doctor --> Consults & Appts & LabSvc & USSvc
    Lab --> LabSvc
    US --> USSvc

    Auth --> DB
    Users --> DB
    Patients --> DB
    Appts --> DB
    Vitals --> DB
    Consults --> DB
    LabSvc --> DB
    USSvc --> DB
    BillSvc --> DB
```

---

## 🏥 Clinical Patient Lifecycle Flowchart

The system models the patient journey from check-in to payment settlement with clear separation of duties:

```mermaid
sequenceDiagram
    autonumber
    actor R as Receptionist
    actor MO as Medical Officer
    actor D as Medical Doctor
    actor L as Lab Technician
    actor US as Sonographer

    Note over R: 1. Patient Registration & Check-in
    R->>R: Register Patient Profile (Generates unique MRN e.g. PAT-10001)
    R->>R: Book Appointment (Assigns target Doctor & generates Unpaid Invoice)
    R->>R: Trigger "Check In" (Enters Patient into Triage Queue)

    Note over MO: 2. Vitals Triage
    MO->>MO: Select Patient from Triage Queue
    MO->>MO: Record BP, Pulse, Temperature, SpO2, Weight & Height
    MO->>MO: Click "Submit Vitals" (Forwards patient to Doctor Queue)

    Note over D: 3. Consultation Workbench
    D->>D: Load Patient from Doctor Queue (Inspects triage vitals)
    D->>D: Enter Chief Complaints, Diagnosis, Clinical Notes
    D->>D: Prescribe medicines on dynamic prescription pad
    D->>D: Check boxes to request Lab Tests & Ultrasound Scans
    D->>D: Click "Finalize & Submit" (Completes consult)

    Note over L: 4. Laboratory Diagnostics
    L->>L: Select pending blood/urine tests, input findings & release report

    Note over US: 5. Ultrasound Sonography
    US->>US: Select pending scan type, write observations & complete scan

    Note over R: 6. Checkout & Billing Payment
    R->>R: View outstanding invoice in Cashier Tab
    R->>R: Select Payment Method (Cash / Card / Insurance)
    R->>R: Finalize transaction & output patient receipt slip
```

---

## 🔑 Seed User Logins

The backend automatically seeds a default user for each hospital role on its first boot. You can use the **Quick Test Access** clickable grid on the login screen to fill in these credentials instantly:

| Role Portal | Username | Password | Dashboard URL | Main Capabilities |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | `admin` | `admin123` | `/admin` | Manage user profiles (CRUD), toggle accounts, system metrics |
| **Receptionist** | `reception` | `reception123` | `/reception` | Register patients, schedule appointments, cashier checkout |
| **Medical Officer** | `mo` | `mo123` | `/mo` | Take triage vitals, forward patients to doctors |
| **Doctor** | `doctor` | `doctor123` | `/doctor` | Write clinical diagnostics notes, prescriptions, request scans |
| **Lab Technician** | `lab` | `lab123` | `/laboratory` | Review lab orders, submit blood/pathology results |
| **Sonographer** | `ultrasound` | `ultrasound123` | `/ultrasound` | Log ultrasound findings, attach sonogram images |

---

## 🚀 Setting Up the Application

### Prerequisites
1. Install **Node.js** (v18+ recommended) and **npm**.
2. Run a local **MySQL** server instance on port `3306`.
3. Create an empty database in MySQL:
   ```sql
   CREATE DATABASE hospital_management_system;
   ```

### 1. Backend Setup (NestJS)
1. Go into the backend directory:
   ```bash
   cd backend
   ```
2. Configure credentials in [backend/.env](file:///d:/Projects/NodeJS/Hospital_Management_System/backend/.env) if your local MySQL settings differ:
   ```env
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=hospital_management_system
   JWT_SECRET=hms_super_secret_jwt_key_2026_antigravity
   PORT=3001
   ```
3. Run the development server:
   ```bash
   npm run start:dev
   ```
   *The database schema tables will automatically migrate and populate user seeds.*

### 2. Frontend Setup (Next.js)
1. Go into the frontend directory:
   ```bash
   cd frontend
   ```
2. Run the development server:
   ```bash
   npm run dev
   ```
3. Open [http://localhost:3000](http://localhost:3000) in your browser to start testing.
