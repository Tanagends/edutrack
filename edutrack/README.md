# EduTrack — Smart Student Management System

**Advanced MERN Stack Development | Review 1**
Aditya University · Tanatswa Hilary Gendere · 24B11CS529

---

## Stack

| Layer    | Technology                                           |
|----------|------------------------------------------------------|
| Frontend | React 18, Vite, React Router v6, Tailwind CSS        |
| Backend  | Node.js, Express 4, Socket.IO                        |
| Database | MongoDB (Mongoose ODM)                               |
| Auth     | JWT (jsonwebtoken + bcryptjs)                        |
| Email    | Nodemailer                                           |
| QR       | qrcode (server-side base64 generation)               |

---

## Quick Start (WSL2)

```bash
# 1. Run setup (once)
bash setup.sh

# 2. Edit .env
nano ~/projects/edutrack/server/.env

# 3. Start MongoDB
sudo service mongodb start

# 4. Terminal 1 — Backend
cd ~/projects/edutrack/server && npm run dev

# 5. Terminal 2 — Frontend
cd ~/projects/edutrack/client && npm run dev

# 6. Open http://localhost:5173
```

---

## Project Structure

```
edutrack/
├── server/
│   ├── server.js               # Express + Socket.IO entry
│   ├── config/db.js            # MongoDB connection
│   ├── middleware/
│   │   ├── auth.js             # protect + authorise middleware
│   │   └── errorHandler.js     # global error handler
│   ├── models/
│   │   ├── User.js             # All roles (admin/faculty/student)
│   │   ├── Student.js          # Student academic profile
│   │   ├── Course.js           # Course definition
│   │   ├── Enrollment.js       # Student ↔ Course link
│   │   ├── AttendanceSession.js # QR session per class
│   │   ├── AttendanceRecord.js  # Individual scan record
│   │   └── Grade.js            # Assessments + computed grade
│   ├── controllers/            # Business logic (one file per feature)
│   ├── routes/                 # Express routers (one file per feature)
│   ├── sockets/notifications.js # Socket.IO room management
│   └── utils/mailer.js         # Nodemailer email helper
└── client/
    └── src/
        ├── api/axios.js        # Axios instance + JWT interceptor
        ├── context/AuthContext # Global auth state
        ├── components/         # Sidebar, ProtectedRoute, StatCard
        ├── layouts/            # AdminLayout, FacultyLayout, StudentLayout
        └── pages/
            ├── auth/           # Login, Register
            ├── admin/          # Dashboard, Students, Courses, Analytics, Risk
            ├── faculty/        # Dashboard, Attendance, Grades, Risk
            └── student/        # Dashboard, Attendance, Grades
```

---

## API Reference

### Auth
| Method | Route              | Access  |
|--------|--------------------|---------|
| POST   | /api/auth/register | Public  |
| POST   | /api/auth/login    | Public  |
| GET    | /api/auth/me       | Private |

### Students
| Method | Route              | Access         |
|--------|--------------------|----------------|
| GET    | /api/students      | Admin, Faculty |
| GET    | /api/students/:id  | All            |
| PUT    | /api/students/:id  | Admin          |
| DELETE | /api/students/:id  | Admin          |

### Courses
| Method | Route                    | Access         |
|--------|--------------------------|----------------|
| GET    | /api/courses             | All            |
| POST   | /api/courses             | Admin          |
| PUT    | /api/courses/:id         | Admin          |
| DELETE | /api/courses/:id         | Admin          |
| POST   | /api/courses/:id/enroll  | Admin          |

### Attendance
| Method | Route                              | Access         |
|--------|------------------------------------|----------------|
| POST   | /api/attendance/session            | Faculty        |
| POST   | /api/attendance/mark               | Student        |
| GET    | /api/attendance/summary/:courseId  | All            |
| GET    | /api/attendance/sessions/:courseId | Faculty, Admin |

### Grades
| Method | Route                          | Access         |
|--------|--------------------------------|----------------|
| POST   | /api/grades/assess             | Faculty        |
| GET    | /api/grades/course/:id/all     | Faculty, Admin |
| GET    | /api/grades/:courseId          | All            |

### Risk & Analytics
| Method | Route                    | Access         |
|--------|--------------------------|----------------|
| GET    | /api/risk                | Admin, Faculty |
| POST   | /api/risk/notify         | Admin, Faculty |
| GET    | /api/analytics/overview  | Admin          |
| GET    | /api/analytics/attendance| Admin, Faculty |
| GET    | /api/analytics/grades    | Admin, Faculty |

---

## Grading Scale (Aditya University)

| Range   | Grade |
|---------|-------|
| 90–100  | O     |
| 80–89   | A+    |
| 70–79   | A     |
| 60–69   | B+    |
| 50–59   | B     |
| 40–49   | C     |
| < 40    | F     |

---

## Feature Roadmap

- [x] JWT Auth (Admin / Faculty / Student roles)
- [x] Student & Course CRUD
- [x] QR-based session attendance
- [x] Grade management with weighted scoring
- [x] Academic Risk Intelligence engine
- [x] Real-time Socket.IO notifications
- [x] Nodemailer risk alert emails
- [x] Analytics dashboard with Chart.js
- [ ] Camera QR scanner (html5-qrcode)
- [ ] Bulk student enrollment via CSV
- [ ] PDF report export
