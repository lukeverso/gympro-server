import { Router } from 'express';
import { verifyToken } from '../lib/jwtVerify';
import multer from 'multer';

import { confirmVerificationCode, loginStudent, loginTeacher, verifyMailForStudent, verifyMailForTeacher } from '../controllers/auth.controller';
import { createExercise } from '../controllers/exercises.controller';
import { createSheet } from '../controllers/sheets.controller';
import { allowEditMedicalHistory, createStudent, fillMedicalHistorySheet, updateStudentMeasures } from '../controllers/students.controller';
import { addStudentToTeacher, createTeacher } from '../controllers/teachers.controller';
import { uploadStudentPicture, uploadTeacherPicture } from '../controllers/upload.controller';
import { createWorkout } from '../controllers/workouts.controller';
import { createMultipleNotifications, createNotificationForStudent } from '../controllers/notifications.controller';

const uploader = multer();

const postRoutes = Router();

// From AUTH
postRoutes.post('/students/login', loginStudent);
postRoutes.post('/students/verify-email', verifyMailForStudent);
postRoutes.post('/teachers/login', loginTeacher);
postRoutes.post('/teachers/verify-email', verifyMailForTeacher);
postRoutes.post('/verify-code', confirmVerificationCode);

// From EXERCISES
postRoutes.post('/exercises/:workoutsId/create', verifyToken, createExercise);

// From NOTIFICATIONS
postRoutes.post('/notifications/:teacherId/multiple', verifyToken, createMultipleNotifications);
postRoutes.post('/notifications/:teacherId/student/:studentId', verifyToken, createNotificationForStudent);

// From SHEETS
postRoutes.post('/sheets/:id/create', verifyToken, createSheet);

// From STUDENTS
postRoutes.post('/students', createStudent);
postRoutes.post('/students/:studentId/medical-history', verifyToken, fillMedicalHistorySheet);
postRoutes.post('/students/:studentId/medical-history/update', verifyToken, allowEditMedicalHistory);
postRoutes.post('/students/:id/measures', verifyToken, updateStudentMeasures);

// From TEACHERS
postRoutes.post('/teachers', createTeacher);
postRoutes.post('/teachers/:teacher/add/:student', verifyToken, addStudentToTeacher);

// From UPLOADS
postRoutes.post('/students/:id/upload', verifyToken, uploader.single('file'), uploadStudentPicture);
postRoutes.post('/teachers/:id/upload', verifyToken, uploader.single('file'), uploadTeacherPicture);

// From WORKOUTS
postRoutes.post('/workouts/:id/create', verifyToken, createWorkout);

export { postRoutes };