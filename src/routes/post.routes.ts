import { Router } from 'express';

import { confirmVerificationCode, loginStudent, loginTeacher, verifyMailForStudent, verifyMailForTeacher } from '../controllers/auth.controller';
import { createExercise } from '../controllers/exercises.controller';
import { createSheet } from '../controllers/sheets.controller';
import { createStudent } from '../controllers/students.controller';
import { createTeacher } from '../controllers/teachers.controller';
import { uploadStudentPicture, uploadTeacherPicture } from '../controllers/upload.controller';
import { createWorkout } from '../controllers/workouts.controller';

const postRoutes = Router();

// From AUTH
postRoutes.post('/students/login', loginStudent);
postRoutes.post('/students/verify-email', verifyMailForStudent);
postRoutes.post('/teachers/login', loginTeacher);
postRoutes.post('/teachers/verify-email', verifyMailForTeacher);
postRoutes.post('/verify-code', confirmVerificationCode);

// From EXERCISES
postRoutes.post('/exercises', createExercise);

// From SHEETS
postRoutes.post('/sheets', createSheet);

// From STUDENTS
postRoutes.post('/students', createStudent);

// From TEACHERS
postRoutes.post('/teachers', createTeacher);

// From UPLOADS
postRoutes.post('/students/:id/upload', uploadStudentPicture);
postRoutes.post('/teachers/:id/upload', uploadTeacherPicture);

// From WORKOUTS
postRoutes.post('/workouts/:id/create', createWorkout);

export { postRoutes };