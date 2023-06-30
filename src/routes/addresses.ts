import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { authenticate } from '../plugins/authenticate';

export async function addressesRoutes(fastify: FastifyInstance) {
     fastify.get('/addresses', {
          preHandler: authenticate
     }, async (request, reply) => {
          const addresses = await prisma.addresses.findMany({
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

     fastify.post('/addresses', {
          preHandler: authenticate
     }, async (request, reply) => {
          try {
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

               await prisma.addresses.create({
                    data: {
                         studentId: addressesBody.studentId,
                         street: addressesBody.street,
                         number: addressesBody.number,
                         complement: addressesBody.complement,
                         code: addressesBody.code,
                         city: addressesBody.city,
                         country: addressesBody.country
                    }
               });

               return reply.status(201).send({
                    status: 'success',
                    message: 'Endereço criado com sucesso!'
               });
          } catch (error) {
               console.log(error);

               return reply.status(500).send({
                    status: 'error',
                    message: `Ocorreu um erro: ${error}`
               });
          };
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