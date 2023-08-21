import { Router } from 'express';
import { getStudentExercises } from '../controllers/exercises.controller';
import { getStudentNotifications } from '../controllers/notifications.controller';
import { findStudentByMail, getStudentAddress, getStudentData, getStudentDetails, getStudentEmail, getStudentMeasures, getStudentName, getStudentTelephone } from '../controllers/students.controller';
import { getTeacherAddress, getTeacherDetails, getTeacherEmail, getTeacherName, getTeacherStudents, getTeacherTelephone } from '../controllers/teachers.controller';
import { getWorkoutDetails } from '../controllers/workouts.controller';
import { verifyToken } from '../lib/jwtVerify';

const getRoutes = Router();

// From EXERCISES
getRoutes.get('/exercises/:id', verifyToken, getStudentExercises);

// From NOTIFICATIONS
getRoutes.get('/notifications/:id', verifyToken, getStudentNotifications);

// From STUDENTS
getRoutes.get('/students/:id', verifyToken, getStudentData);
getRoutes.get('/students/:id/details', verifyToken, getStudentDetails);
getRoutes.get('/students/:email/search', verifyToken, findStudentByMail);
getRoutes.get('/students/:id/name', verifyToken, getStudentName);
getRoutes.get('/students/:id/email', verifyToken, getStudentEmail);
getRoutes.get('/students/:id/telephone', verifyToken, getStudentTelephone);
getRoutes.get('/students/:id/address', verifyToken, getStudentAddress);
getRoutes.get('/students/:id/measures', verifyToken, getStudentMeasures);

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