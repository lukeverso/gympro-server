import { Router } from 'express';
import { updateStudentAddress, updateStudentEmail, updateStudentMeasures, updateStudentName, updateStudentStatus, updateStudentTelephone } from '../controllers/students.controller';
import { updateTeacherAddress, updateTeacherEmail, updateTeacherName, updateTeacherTelephone } from '../controllers/teachers.controller';

const updateRoutes = Router();

// From STUDENTS
updateRoutes.patch('/students/:id/status', updateStudentStatus);
updateRoutes.patch('/students/:id/name', updateStudentName);
updateRoutes.patch('/students/:id/email', updateStudentEmail);
updateRoutes.patch('/students/:id/telephone', updateStudentTelephone);
updateRoutes.patch('/students/:id/address', updateStudentAddress);
updateRoutes.patch('/students/:id/measures', updateStudentMeasures);

// From TEACHERS
updateRoutes.patch('/teachers/:id/name', updateTeacherName);
updateRoutes.patch('/teachers/:id/email', updateTeacherEmail);
updateRoutes.patch('/teachers/:id/telephone', updateTeacherTelephone);
updateRoutes.patch('/teachers/:id/address', updateTeacherAddress);

export { updateRoutes };