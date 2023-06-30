import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { authenticate } from '../plugins/authenticate';

export async function exercisesRoutes(fastify: FastifyInstance) {
     fastify.get('/exercises/:id', {
          preHandler: authenticate
     }, async (request, reply) => {
          const exercisesParams = z.object({
               id: z.string().uuid()
          });

          const { id } = exercisesParams.parse(request.params);

          const exercises = await prisma.workouts.findUnique({
               where: {
                    studentId: id
               },
               select: {
                    active: true,
                    annotations: true,
                    endDate: true,
                    objective: true,
                    startDate: true,
                    student: {
                         select: {
                              name: true,
                              username: true
                         },
                    },
                    exercises: {
                         select: {
                              annotations: true,
                              exercise: true,
                              finished: true,
                              name: true,
                              repetitions: true,
                              restTime: true,
                              series: true
                         },
                    },
               },
          });

          return { exercises };
     });

     fastify.post('/exercises', {
          preHandler: authenticate
     }, async (request, reply) => {
          const exercisesBody = z.object({
               active: z.boolean(),
               objective: z.string(),
               type: z.string(),
               focus: z.string(),
               startDate: z.string(),
               endDate: z.string(),
               studentId: z.string().uuid(),
          });

          const {
               active,
               objective,
               type,
               focus,
               startDate,
               endDate,
               studentId,
          } = exercisesBody.parse(request.body);

          await prisma.workouts.create({
               data: {
                    active,
                    objective,
                    type,
                    focus,
                    startDate,
                    endDate,
                    studentId,
               }
          });

          return reply.status(201).send({
               status: 'success',
               message: 'Exercise created successfully.'
          });
     });
};