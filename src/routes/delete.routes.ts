import { Router } from 'express';
import { deleteExercise } from '../controllers/exercises.controller';
import { deleteStudent } from '../controllers/students.controller';
import { deleteTeacher } from '../controllers/teachers.controller';
import { deleteWorkout } from '../controllers/workouts.controller';

const deleteRoutes = Router();

// From EXERCISES
deleteRoutes.delete('/exercises/:id/delete', deleteExercise);

// From STUDENTS
deleteRoutes.delete('/students/:id', deleteStudent);

// From TEACHERS
deleteRoutes.delete('/teachers/:id', deleteTeacher);

// From WORKOUTS
deleteRoutes.delete('/workouts/:id/delete', deleteWorkout);

export { deleteRoutes };