import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { authenticate } from '../plugins/authenticate';

export async function addressesRoutes(fastify: FastifyInstance) {
     fastify.get('/addresses', async (request, reply) => {
          const addresses = await prisma.address.findMany({
               include: {
                    user: true
               }
          });

          return { addresses };
     });
};