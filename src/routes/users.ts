import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { authenticate } from '../plugins/authenticate';

export async function usersRoutes(fastify: FastifyInstance) {
     // List all users
     fastify.get('/users', async (request, reply) => {
          const users = await prisma.user.findMany({
               include: {
                    Address: true,
                    Exercise: true,
                    Measures: true,
                    Teacher: true
               }
          });

          return { users };
     });
};