# Job Application Web Service

A full-stack web application that allows job applicants to submit their details and resume through a responsive form. Built with Next.js, TypeScript, and PostgreSQL.

## 🚀 Features

- Responsive job application form with file upload
- Client-side and server-side validation
- Resume file storage (PDF/DOCX support)
- PostgreSQL database integration
- Duplicate prevention (email and phone)
- Professional UI with Tailwind CSS

## 🛠 Tech Stack

- **Frontend**: Next.js with TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL
- **ORM**: Prisma
- **File Upload**: Multer
- **File Types**: PDF and DOCX support

## 📋 Prerequisites

Before running this project, make sure you have the following installed:

- Node.js (version 14 or higher)
- npm
- PostgreSQL database
- Git

## ⚙️ Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/Azaz176/job-application-web-service.git
cd job-application-web-service
```

### 2. Install dependencies
```bash
npm install
# or
yarn install
```

### 3. Environment Setup
Create a `.env` file in the root directory and add your database connection string:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/job-app"
```

Replace `username`, `password`, and `job-app` with your PostgreSQL credentials and desired database name.

### 4. Database Setup

#### Create the database
```sql
CREATE DATABASE job_applications;
```

#### Run Prisma migrations
```bash
npx prisma generate
npx prisma db push
```

### 5. Create upload directory
The application will automatically create the `resumes/` directory, but you can create it manually:
```bash
mkdir resumes
```

## 🚀 Running the Project

### Development Mode
```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:3000`

### Production Build
```bash
npm run build
npm start
# or
yarn build
yarn start
```

## 📊 Database Schema

The application uses a single `applicants` table with the following structure:

```sql
CREATE TABLE applicants (
    id SERIAL PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    linkedin TEXT,
    resume_path TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Prisma Schema
```prisma
model Applicant {
  id          Int      @id @default(autoincrement())
  full_name   String
  email       String
  phone       String
  linkedin    String?
  resume_path String?
  created_at  DateTime @default(now())
}
```

## 📁 Project Structure

```
├── components/
│   └── Form.tsx              # Main application form component
├── pages/
│   ├── api/
│   │   └── apply.ts          # API endpoint for form submission
│   ├── _app.tsx              # Next.js app configuration
│   └── index.tsx             # Home page
├── lib/
│   └── prisma.ts             # Prisma client configuration
├── prisma/
│   └── schema.prisma         # Database schema definition
├── resumes/                  # Uploaded resume files directory
├── styles/
│   └── globals.css           # Global styles and Tailwind imports
└── README.md                 # Project documentation
```

## 🔍 API Endpoints

### POST `/api/apply`
Submits a new job application.

**Request Body** (multipart/form-data):
- `fullName`: string (required)
- `email`: string (required)
- `phone`: string (required, 10 digits)
- `linkedin`: string (optional)
- `resume`: file (required, PDF/DOCX, max 5MB)

**Response**:
```json
{
  "message": "Application submitted successfully!",
  "id": 123
}
```

**Error Response**:
```json
{
  "error": "Error message description"
}
```

## ✅ Form Validation

### Client-side Validation
- Required field validation
- Email format validation (regex)
- Phone number validation (10 digits only)
- File type validation (PDF/DOCX only)
- File size validation (max 5MB)

### Server-side Validation
- All client-side validations repeated on server
- LinkedIn URL format validation (lenient)
- Duplicate email prevention
- Duplicate phone number prevention
- File type verification via MIME type

## 📝 Usage

1. Navigate to the home page at `http://localhost:3000`
2. Fill out all required fields:
   - Full Name
   - Email address
   - Phone number (10 digits)
   - LinkedIn profile (optional)
3. Upload your resume (PDF or DOCX, max 5MB)
4. Click "Submit" to submit your application
5. Receive confirmation message upon successful submission







