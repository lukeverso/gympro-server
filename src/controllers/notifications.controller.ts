import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';

export async function createMultipleNotifications(request: Request, response: Response) {
     const queryParams = z.object({
          teacherId: z.string().uuid()
     });

     const { teacherId } = queryParams.parse(request.params);

     const bodyParams = z.object({
          title: z.string(),
          content: z.string()
     });

     const { content, title } = bodyParams.parse(request.body);

     try {
          const teacher = await prisma.teachers.findUnique({
               where: {
                    id: teacherId,
               },
               select: {
                    students: {
                         select: {
                              id: true,
                         },
                    },
               },
          });

          if (!teacher) {
               return response.status(404).json({
                    status: 'error',
                    message: 'Teacher not found',
               });
          };

          const studentIds = teacher.students.map((student) => student.id);

          await prisma.notifications.create({
               data: {
                    title,
                    content,
                    teacherId,
                    students: {
                         connect: studentIds.map((studentId) => ({ id: studentId })),
                    },
               },
          });

          return response.status(201).json({
               status: 'success',
               message: 'Notificação criada com sucesso!',
          });
     } catch (error) {
          console.log(error);

          return response.status(500).send({
               status: 'error',
               message: `Ocorreu um erro: ${error}`
          });
     };
};

export async function getNotificationsByTeacher(request: Request, response: Response) {
     const queryParams = z.object({
          teacherId: z.string().uuid(),
     });

     try {
          const { teacherId } = queryParams.parse(request.params);

          const teacherNotifications = await prisma.teachers.findUnique({
               where: {
                    id: teacherId,
               },
               select: {
                    notifications: {
                         select: {
                              id: true,
                              title: true,
                              content: true
                         },
                    },
               },
          });

          if (!teacherNotifications) {
               return response.status(404).json({
                    status: 'error',
                    message: 'Teacher not found',
               });
          }

          return response.status(200).json({
               status: 'success',
               notifications: teacherNotifications.notifications,
          });
     } catch (error) {
          console.error(error);

          return response.status(500).json({
               status: 'error',
               message: `Ocorreu um erro: ${error}`,
          });
     };
};

export async function createNotificationForStudent(request: Request, response: Response) {
     const queryParams = z.object({
          teacherId: z.string().uuid(),
          studentId: z.string().uuid(),
     });

     const bodyParams = z.object({
          title: z.string(),
          content: z.string(),
     });

     try {
          const { teacherId, studentId } = queryParams.parse(request.params);
          const { title, content } = bodyParams.parse(request.body);

          const teacher = await prisma.teachers.findUnique({
               where: {
                    id: teacherId,
               },
          });

          if (!teacher) {
               return response.status(404).json({
                    status: 'error',
                    message: 'Teacher not found',
               });
          }

          const student = await prisma.students.findUnique({
               where: {
                    id: studentId,
               },
          });

          if (!student) {
               return response.status(404).json({
                    status: 'error',
                    message: 'Student not found',
               });
          }

          const notification = await prisma.notifications.create({
               data: {
                    title,
                    content,
                    teacherId,
                    students: {
                         connect: { id: studentId },
                    },
               },
          });

          return response.status(201).json({
               status: 'success',
               notification,
          });
     } catch (error) {
          console.error(error);

          return response.status(500).json({
               status: 'error',
               message: `Ocorreu um erro: ${error}`,
          });
     };
};

export async function getNotificationsForStudent(request: Request, response: Response) {
     const queryParams = z.object({
          studentId: z.string().uuid(),
     });

     try {
          const { studentId } = queryParams.parse(request.params);

          const studentNotifications = await prisma.students.findUnique({
               where: {
                    id: studentId,
               },
               select: {
                    notifications: {
                         select: {
                              id: true,
                              title: true,
                              content: true
                         },
                    },
               },
          });

          if (!studentNotifications) {
               return response.status(404).json({
                    status: 'error',
                    message: 'Student not found',
               });
          }

          return response.status(200).json({
               status: 'success',
               notifications: studentNotifications.notifications,
          });
     } catch (error) {
          console.error(error);

          return response.status(500).json({
               status: 'error',
               message: `Ocorreu um erro: ${error}`,
          });
     };
};