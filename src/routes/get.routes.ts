import { Router } from 'express';
import { getStudentExercises } from '../controllers/exercises.controller';
import { getStudentNotifications } from '../controllers/notifications.controller';
import { findStudentByMail, getStudentAddress, getStudentData, getStudentDetails, getStudentEmail, getStudentMeasures, getStudentName, getStudentTelephone } from '../controllers/students.controller';
import { getTeacherAddress, getTeacherDetails, getTeacherEmail, getTeacherName, getTeacherStudents, getTeacherTelephone } from '../controllers/teachers.controller';
import { getWorkoutDetails } from '../controllers/workouts.controller';

const getRoutes = Router();

// From EXERCISES
getRoutes.get('/exercises/:id', getStudentExercises);

// From NOTIFICATIONS
getRoutes.get('/notifications/:id', getStudentNotifications);

// From STUDENTS
getRoutes.get('/students/:id', getStudentData);
getRoutes.get('/students/:email/search', findStudentByMail);
getRoutes.get('/students/:id/name', getStudentName);
getRoutes.get('/students/:id/email', getStudentEmail);
getRoutes.get('/students/:id/telephone', getStudentTelephone);
getRoutes.get('/students/:id/address', getStudentAddress);
getRoutes.get('/students/:id/measures', getStudentMeasures);

// From TEACHERS
getRoutes.get('/teachers/:id', getTeacherDetails);
getRoutes.get('/teachers/:id/students', getTeacherStudents);
getRoutes.get('/teachers/:id/name', getTeacherName);
getRoutes.get('/teachers/:id/email', getTeacherEmail);
getRoutes.get('/teachers/:id/telephone', getTeacherTelephone);
getRoutes.get('/teachers/:id/address', getTeacherAddress);

// From WORKOUTS
getRoutes.get('/workouts/:id', getWorkoutDetails);

export { getRoutes };