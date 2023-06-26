import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { authenticate } from '../plugins/authenticate';

export async function measuresRoutes(fastify: FastifyInstance) {
     fastify.get('/measures', async (request, reply) => {
          const measures = await prisma.measures.findMany({
               include: {
                    user: true
               }
          });

          return { measures };
     });
};