import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';

export async function createSheet(request: Request, response: Response) {
     const bodySchema = z.object({
          objective: z.string(),
          startDate: z.string(),
          endDate: z.string(),
          annotations: z.string().nullable(),
     });

     const paramsSchema = z.object({
          id: z.string().uuid(),
     });

     const { objective, startDate, endDate, annotations } = bodySchema.parse(
          request.body
     );

     const { id } = paramsSchema.parse(request.params);

     try {
          const student = await prisma.students.findUnique({
               where: {
                    id,
               },
          });

          if (!student) {
               return response.status(400).send({
                    status: 'error',
                    message: 'Aluno não encontrado.',
               });
          }

          const previousSheets = await prisma.sheets.findMany({
               where: {
                    student: {
                         id,
                    },
               },
          });

          await prisma.sheets.updateMany({
               where: {
                    id: {
                         in: previousSheets.map((sheet) => sheet.id),
                    },
               },
               data: {
                    active: false,
               },
          });

          const newSheet = await prisma.sheets.create({
               data: {
                    active: true,
                    objective,
                    startDate,
                    endDate,
                    annotations,
                    student: {
                         connect: {
                              id,
                         },
                    },
               },
          });

          return response.status(201).send({
               status: 'success',
               message: 'Ficha de treino criada com sucesso.',
               sheet: newSheet,
          });
     } catch (error) {
          console.log(error);
     }
};