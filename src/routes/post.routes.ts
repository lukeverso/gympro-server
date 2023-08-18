import { Router } from 'express';
import { verifyToken } from '../lib/jwtVerify';
import multer from 'multer';

import { confirmVerificationCode, loginStudent, loginTeacher, verifyMailForStudent, verifyMailForTeacher } from '../controllers/auth.controller';
import { createExercise } from '../controllers/exercises.controller';
import { createSheet } from '../controllers/sheets.controller';
import { createStudent } from '../controllers/students.controller';
import { addStudentToTeacher, createTeacher } from '../controllers/teachers.controller';
import { uploadStudentPicture, uploadTeacherPicture } from '../controllers/upload.controller';
import { createWorkout } from '../controllers/workouts.controller';

const uploader = multer();

const postRoutes = Router();

// From AUTH
postRoutes.post('/students/login', loginStudent);
postRoutes.post('/students/verify-email', verifyMailForStudent);
postRoutes.post('/teachers/login', loginTeacher);
postRoutes.post('/teachers/verify-email', verifyMailForTeacher);
postRoutes.post('/verify-code', confirmVerificationCode);

// From EXERCISES
postRoutes.post('/exercises', verifyToken, createExercise);

// From SHEETS
postRoutes.post('/sheets', verifyToken, createSheet);

// From STUDENTS
postRoutes.post('/students', createStudent);

// From TEACHERS
postRoutes.post('/teachers', createTeacher);
postRoutes.post('/teachers/:teacher/add/:student', addStudentToTeacher);

// From UPLOADS
postRoutes.post('/students/:id/upload', verifyToken, uploader.single('file'), uploadStudentPicture);
postRoutes.post('/teachers/:id/upload', verifyToken, uploader.single('file'), uploadTeacherPicture);

// From WORKOUTS
postRoutes.post('/workouts/:id/create', verifyToken, createWorkout);

export { postRoutes };