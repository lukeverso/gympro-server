import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { authenticate } from '../plugins/authenticate';

export async function workoutsRoutes(fastify: FastifyInstance) {
     fastify.get('/workouts/:id', {
          preHandler: authenticate
     }, async (request, reply) => {
          const paramsSchema = z.object({
               id: z.string().uuid()
          });

          const { id } = paramsSchema.parse(request.params);

          const workouts = await prisma.sheets.findMany({
               where: {
                    id
               },
               select: {
                    id: true,
                    objective: true,
                    active: true,
                    startDate: true,
                    endDate: true,
                    annotations: true,
                    workouts: {
                         select: {
                              focus: true
                         }
                    }
               }
          });
     });
};