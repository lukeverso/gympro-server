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

     // CRIA UM EXERCÍCIO EM UM TREINO
     fastify.post('/exercises/:workoutId', {
          preHandler: authenticate,
     }, async (request, reply) => {
          try {
               const bodySchema = z.object({
                    name: z.string(),
                    series: z.number().int(),
                    repetitions: z.number().int(),
                    restTime: z.number().int(),
                    weight: z.string().nullable(),
                    annotations: z.string().nullable(),
               });

               const paramsSchema = z.object({
                    workoutId: z.string().uuid()
               });

               const {
                    name,
                    series,
                    repetitions,
                    restTime,
                    weight,
                    annotations
               } = bodySchema.parse(request.body);

               const { workoutId } = paramsSchema.parse(request.params);

               // Verificar se o workout associado (exerciseId) existe
               const existingWorkout = await prisma.workouts.findUnique({
                    where: {
                         id: workoutId,
                    },
               });

               if (!existingWorkout) {
                    return reply.status(404).send({
                         status: 'error',
                         message: 'Workout not found.',
                    });
               };

               await prisma.exercises.create({
                    data: {
                         finished: false,
                         name,
                         repetitions,
                         restTime,
                         series,
                         annotations
                    }
               });

               return reply.status(201).send({
                    status: 'success',
                    message: 'Exercise created successfully.'
               });
          } catch (error) {
               console.log(error);

               return reply.status(500).send({
                    status: 'error',
                    message: `An error occurred: ${error}`,
               });
          }
     });

};