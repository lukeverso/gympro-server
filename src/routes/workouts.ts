import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { authenticate } from '../plugins/authenticate';

export async function workoutsRoutes(fastify: FastifyInstance) {
     fastify.get('/me/:id', {
          preHandler: authenticate
     }, async (request, reply) => {
          const requestParams = z.object({
               id: z.string()
          });

          const { id } = requestParams.parse(request.params);

          const response = await prisma.students.findUnique({
               where: {
                    id
               },
               select: {
                    name: true,
                    sheets: {
                         select: {
                              id: true,
                              active: true,
                              annotations: true,
                              objective: true,
                              startDate: true,
                              endDate: true,
                              workouts: {
                                   select: {
                                        id: true,
                                        focus: true,
                                        active: true,
                                        type: true
                                   }
                              }
                         }
                    }
               }
          });

          return reply.status(200).send({ response });
     });
};