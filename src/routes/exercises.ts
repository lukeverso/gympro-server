import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { authenticate } from '../plugins/authenticate';

export async function exercisesRoutes(fastify: FastifyInstance) {
     // BUSCA A LISTA DE EXERCÍCIOS DE UM ALUNO
     fastify.get('/exercises/:id', {
          preHandler: authenticate
     }, async (request, reply) => {
          const params = z.object({
               id: z.string().uuid()
          });

          const { id } = params.parse(request.params);

          const exercises = await prisma.workouts.findUnique({
               where: {
                    id
               },
               select: {
                    active: true,
                    focus: true,
                    type: true,
                    exercises: {
                         select: {
                              id: true,
                              name: true,
                              annotations: true,
                              series: true,
                              repetitions: true,
                              weight: true,
                              restTime: true
                         }
                    }
               },
          });

          return reply.status(200).send({ exercises });
     });

     // CRIA UM EXERCÍCIO PARA UM ALUNO
     fastify.post('/exercises/:id', {
          preHandler: authenticate
     }, async (request, reply) => {
          const params = z.object({
               id: z.string().uuid()
          });

          const { id } = params.parse(request.params);

          const body = z.object({
               active: z.boolean(),
               objective: z.string(),
               type: z.string(),
               focus: z.string(),
               startDate: z.string(),
               endDate: z.string()
          });

          const {
               active,
               objective,
               type,
               focus,
               startDate,
               endDate
          } = body.parse(request.body);

          return reply.status(201).send({
               status: 'success',
               message: 'Exercise created successfully.'
          });
     });
};