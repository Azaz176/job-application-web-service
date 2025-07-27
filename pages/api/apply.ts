import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure upload directory exists - CHANGED: Now using 'resumes/' instead of 'public/resumes/'
const uploadDir = path.join(process.cwd(), 'resumes');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
      // Sanitize filename and add timestamp
      const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
      cb(null, `${Date.now()}-${sanitizedName}`);
    }
  }),
  limits: { 
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1 // Only allow 1 file
  },
  fileFilter: (req, file, cb) => {
    // Validate file type
    const allowedMimeTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and DOCX files are allowed'));
    }
  }
});

export const config = {
  api: { bodyParser: false }
};

// Validation functions
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(phone);
};

const validateLinkedIn = (linkedin: string): boolean => {
  if (!linkedin) return true; // Optional field
  // Very lenient validation - just check if it contains linkedin.com/in/
  return linkedin.toLowerCase().includes('linkedin.com/in/');
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Handle file upload
    await new Promise<void>((resolve, reject) => {
      upload.single('resume')(req as any, res as any, (err: any) => {
        if (err) {
          console.error('Upload error:', err);
          if (err.code === 'LIMIT_FILE_SIZE') {
            res.status(400).json({ error: 'File size too large. Maximum 5MB allowed.' });
          } else if (err.message === 'Only PDF and DOCX files are allowed') {
            res.status(400).json({ error: err.message });
          } else {
            res.status(500).json({ error: 'File upload failed' });
          }
          return reject(err);
        }
        resolve();
      });
    });

    // Extract form data
    const { fullName, email, phone, linkedin } = (req as any).body;
    const uploadedFile = (req as any).file;

    // Validation
    if (!fullName?.trim()) {
      return res.status(400).json({ error: 'Full name is required' });
    }

    if (!email?.trim()) {
      return res.status(400).json({ error: 'Email is required' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (!phone?.trim()) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    if (!validatePhone(phone)) {
      return res.status(400).json({ error: 'Phone number must be exactly 10 digits' });
    }

    if (linkedin && !validateLinkedIn(linkedin)) {
      return res.status(400).json({ error: 'Invalid LinkedIn URL format' });
    }

    if (!uploadedFile) {
      return res.status(400).json({ error: 'Resume file is required' });
    }

    // Check for duplicate email
    const existingApplicantByEmail = await prisma.applicant.findFirst({
      where: { email }
    });

    if (existingApplicantByEmail) {
      // Delete uploaded file if duplicate email
      fs.unlinkSync(uploadedFile.path);
      return res.status(400).json({ error: 'An application with this email already exists' });
    }

    // Check for duplicate phone number
    const existingApplicantByPhone = await prisma.applicant.findFirst({
      where: { phone }
    });

    if (existingApplicantByPhone) {
      // Delete uploaded file if duplicate phone
      fs.unlinkSync(uploadedFile.path);
      return res.status(400).json({ error: 'An application with this phone number already exists' });
    }

    // Save to database - CHANGED: Now using relative path without /public
    const resumePath = `resumes/${uploadedFile.filename}`;
    
    const newApplicant = await prisma.applicant.create({
      data: {
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        linkedin: linkedin?.trim() || null,
        resume_path: resumePath
      }
    });

    console.log('New application created:', { id: newApplicant.id, email });

    return res.status(200).json({ 
      message: 'Application submitted successfully!',
      id: newApplicant.id
    });

  } catch (error) {
    console.error('API error:', error);
    
    // Clean up uploaded file if database error occurs
    if ((req as any).file) {
      try {
        fs.unlinkSync((req as any).file.path);
      } catch (cleanupError) {
        console.error('File cleanup error:', cleanupError);
      }
    }

    return res.status(500).json({ error: 'Internal server error' });
  }
}