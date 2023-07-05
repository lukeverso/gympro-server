import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { authenticate } from '../plugins/authenticate';

export async function addressesRoutes(fastify: FastifyInstance) {
     fastify.get('/addresses/:id', {
          preHandler: authenticate
     }, async (request, reply) => {
          const param = z.object({
               id: z.string().uuid()
          });

          const { id } = param.parse(request.params);

          const addresses = await prisma.addresses.findUnique({
               where: {
                    id
               },
               select: {
                    city: true,
                    code: true,
                    complement: true,
                    country: true,
                    number: true,
                    street: true,
                    student: {
                         select: {
                              name: true,
                              username: true
                         },
                    },
               },
          });

          return { addresses };
     });

     fastify.put('/addresses/:id', {
          preHandler: authenticate
     }, async (request, reply) => {
          const studentParams = z.object({
               id: z.string().uuid()
          });

          const studentParamsData = studentParams.parse(request.params);

          const addressesSchema = z.object({
               studentId: z.string().uuid(),
               street: z.string(),
               number: z.string(),
               complement: z.string(),
               code: z.string(),
               city: z.string(),
               country: z.string()
          });

          const addressesBody = addressesSchema.parse(request.body);
     });
};