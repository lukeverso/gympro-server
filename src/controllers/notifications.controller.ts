import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';

export async function getStudentNotifications(request: Request, response: Response) {
     const requestParams = z.object({
          id: z.string().uuid()
     });

     const { id } = requestParams.parse(request.params);
     
     try {
          const notifications = await prisma.students.findUnique({
               where: {
                    id
               },
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