import { Router } from 'express';
import { deleteExercise } from '../controllers/exercises.controller';
import { deleteStudent } from '../controllers/students.controller';
import { deleteTeacher } from '../controllers/teachers.controller';
import { deleteWorkout } from '../controllers/workouts.controller';
import { verifyToken } from '../lib/jwtVerify';
import { deleteNotification } from '../controllers/notifications.controller';

const deleteRoutes = Router();

// From EXERCISES
deleteRoutes.delete('/exercises/:id/delete', verifyToken, deleteExercise);

// From NOTIFICATIONS
deleteRoutes.delete('/notifications/:id/delete', verifyToken, deleteNotification);

// From STUDENTS
deleteRoutes.delete('/students/:id', verifyToken, deleteStudent);

// From TEACHERS
deleteRoutes.delete('/teachers/:id', verifyToken, deleteTeacher);

// From WORKOUTS
deleteRoutes.delete('/workouts/:id/delete', verifyToken, deleteWorkout);

export { deleteRoutes };