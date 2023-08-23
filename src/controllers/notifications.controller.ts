import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';

export async function getStudentNotifications(request: Request, response: Response) {
     const requestParams = z.object({
          id: z.string().uuid()
     });

     const { id } = requestParams.parse(request.params);

     try {
          const student = await prisma.students.findUnique({
               where: {
                    id
               }
          });

          if (!student) {
               return response.status(404).send({
                    status: 'error',
                    message: 'Student not found'
               });
          }

          const notifications = await prisma.notifications.findMany({
               where: {
                    studentsId: id
               },
               select: {
                    id: true,
                    title: true,
                    content: true,
                    expanded: true
               }
          });

          return response.status(200).send(notifications);
     } catch (error) {
          console.log(error);

          return response.status(500).send({
               status: 'error',
               message: `Ocorreu um erro: ${error}`
          });
     };
};