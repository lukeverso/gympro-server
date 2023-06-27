import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { authenticate } from '../plugins/authenticate';

export async function exercisesRoutes(fastify: FastifyInstance) {
     fastify.get('/exercises', async (request, reply) => {
          const exercises = await prisma.exercise.findMany({
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
};