import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { authenticate } from '../plugins/authenticate';

export async function teachersRoutes(fastify: FastifyInstance) {
     fastify.get('/teachers', async (request, reply) => {
          const teachers = await prisma.teacher.findMany({
               include: {
                    students: true
               }
          });

          return { teachers };
     });
};