import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { authenticate } from '../plugins/authenticate';

export async function exercisesRoutes(fastify: FastifyInstance) {
     fastify.get('/exercises', async (request, reply) => {
          const exercises = await prisma.exercise.findMany({
               include: {
                    exercises: true,
                    user: true
               }
          });

          return { exercises };
     });
};