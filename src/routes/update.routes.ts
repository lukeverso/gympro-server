import { Router } from 'express';
import { updateStudentAddress, updateStudentEmail, updateStudentMeasures, updateStudentName, updateStudentStatus, updateStudentTelephone } from '../controllers/students.controller';
import { updateTeacherAddress, updateTeacherEmail, updateTeacherName, updateTeacherTelephone } from '../controllers/teachers.controller';
import { verifyToken } from '../lib/jwtVerify';

const updateRoutes = Router();

// From STUDENTS
updateRoutes.patch('/students/:id/status', verifyToken, updateStudentStatus);
updateRoutes.patch('/students/:id/name', verifyToken, updateStudentName);
updateRoutes.patch('/students/:id/email', verifyToken, updateStudentEmail);
updateRoutes.patch('/students/:id/telephone', verifyToken, updateStudentTelephone);
updateRoutes.patch('/students/:id/address', verifyToken, updateStudentAddress);
updateRoutes.patch('/students/:id/measures', verifyToken, updateStudentMeasures);

// From TEACHERS
updateRoutes.patch('/teachers/:id/name', verifyToken, updateTeacherName);
updateRoutes.patch('/teachers/:id/email', verifyToken, updateTeacherEmail);
updateRoutes.patch('/teachers/:id/telephone', verifyToken, updateTeacherTelephone);
updateRoutes.patch('/teachers/:id/address', verifyToken, updateTeacherAddress);

export { updateRoutes };