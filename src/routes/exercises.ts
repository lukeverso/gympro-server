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

          const exercises = await prisma.exercise.findUnique({
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
                              type: true,
                              list: true
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
               endDate: z.string(),
               startDate: z.string(),
               studentId: z.string().uuid(),
               list: z.string(),
               type: z.string()
          });

          const {
               active,
               objective,
               endDate,
               startDate,
               studentId
          } = exercisesBody.parse(request.body);

          await prisma.exercise.create({
               data: {
                    active,
                    objective,
                    endDate,
                    startDate,
                    studentId
               }
          });

          return reply.status(201).send({
               status: 'success',
               message: 'Exercise created successfully.'
          });
     });
};