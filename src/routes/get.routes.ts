import { Router } from 'express';
import { getExercise, getStudentExercises } from '../controllers/exercises.controller';
import { getNotificationsByTeacher, getNotificationsForStudent } from '../controllers/notifications.controller';
import { findStudentByMail, getStudentAddress, getStudentData, getStudentDetails, getStudentEmail, getStudentMeasures, getStudentMedicalHistory, getStudentName, getStudentTelephone } from '../controllers/students.controller';
import { getTeacherAddress, getTeacherDetails, getTeacherEmail, getTeacherName, getTeacherStudents, getTeacherTelephone } from '../controllers/teachers.controller';
import { getWorkoutDetails } from '../controllers/workouts.controller';
import { verifyToken } from '../lib/jwtVerify';

const getRoutes = Router();

// From EXERCISES
getRoutes.get('/exercises/:id', verifyToken, getStudentExercises);
getRoutes.get('/exercises/exercise/:id', verifyToken, getExercise);

// From NOTIFICATIONS
getRoutes.get('/notifications/teachers/:teacherId/all', verifyToken, getNotificationsByTeacher);
getRoutes.get('/notifications/students/:studentId/all', verifyToken, getNotificationsForStudent);

// From STUDENTS
getRoutes.get('/students/:id', verifyToken, getStudentData);
getRoutes.get('/students/:id/details', verifyToken, getStudentDetails);
getRoutes.get('/students/:email/search', verifyToken, findStudentByMail);
getRoutes.get('/students/:id/name', verifyToken, getStudentName);
getRoutes.get('/students/:id/email', verifyToken, getStudentEmail);
getRoutes.get('/students/:id/telephone', verifyToken, getStudentTelephone);
getRoutes.get('/students/:id/address', verifyToken, getStudentAddress);
getRoutes.get('/students/:id/measures', verifyToken, getStudentMeasures);
getRoutes.get('/students/:id/medical-history', verifyToken, getStudentMedicalHistory);

// From TEACHERS
getRoutes.get('/teachers/:id', verifyToken, getTeacherDetails);
getRoutes.get('/teachers/:id/students', verifyToken, getTeacherStudents);
getRoutes.get('/teachers/:id/name', verifyToken, getTeacherName);
getRoutes.get('/teachers/:id/email', verifyToken, getTeacherEmail);
getRoutes.get('/teachers/:id/telephone', verifyToken, getTeacherTelephone);
getRoutes.get('/teachers/:id/address', verifyToken, getTeacherAddress);

// From WORKOUTS
getRoutes.get('/workouts/:id', verifyToken, getWorkoutDetails);

export { getRoutes };