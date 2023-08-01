import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { authenticate } from '../plugins/authenticate';

export async function sheetsRoutes(fastify: FastifyInstance) {
     fastify.post('/sheets/:id', {
          preHandler: authenticate,
     }, async (request, reply) => {
          try {
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

               const student = await prisma.students.findUnique({
                    where: {
                         id,
                    },
               });

               if (!student) {
                    return reply.status(400).send({
                         status: 'error',
                         message: 'Aluno não encontrado.',
                    });
               }

               // Recuperar todas as fichas existentes do mesmo aluno
               const previousSheets = await prisma.sheets.findMany({
                    where: {
                         student: {
                              id,
                         },
                    },
               });

               // Atualizar o campo 'active' para 'false' em todas as fichas existentes
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

               // Criar a nova folha com o campo 'active' definido como 'true'
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

               return reply.status(201).send({
                    status: 'success',
                    message: 'Ficha de treino criada com sucesso.',
                    sheet: newSheet,
               });
          } catch (error) {
               console.log(error);
          }
     });
};