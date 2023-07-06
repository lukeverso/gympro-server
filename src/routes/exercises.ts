import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { authenticate } from '../plugins/authenticate';

export async function exercisesRoutes(fastify: FastifyInstance) {
     // Get a student's exercises
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
                              series: true,
                              weight: true
                         },
                    },
               },
          });

          return { exercises };
     });

     // Create an exercise for a student
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

          await prisma.workouts.create({
               data: {
                    active,
                    objective,
                    type,
                    focus,
                    startDate,
                    endDate,
                    student: {
                         connect: {
                              id
                         }
                    }
               }
          });

          return reply.status(201).send({
               status: 'success',
               message: 'Exercise created successfully.'
          });
     });
};