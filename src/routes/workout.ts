import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { authenticate } from '../plugins/authenticate';

export async function workoutRoutes(fastify: FastifyInstance) {
     fastify.get('/workouts/:id', {
          preHandler: authenticate
     }, async (request, reply) => {
          const requestParams = z.object({
               id: z.string()
          });

          const { id } = requestParams.parse(request.params);

          const workouts = await prisma.workouts.findUnique({
               where: {
                    studentId: id
               }
          });
     });
};