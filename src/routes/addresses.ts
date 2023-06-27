import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { authenticate } from '../plugins/authenticate';

export async function addressesRoutes(fastify: FastifyInstance) {
     fastify.get('/addresses', async (request, reply) => {
          const addresses = await prisma.address.findMany({
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

     fastify.post('/addresses', async (request, reply) => {
          try {
               const studentBody = z.object({
                    studentId: z.string().uuid(),
                    street: z.string(),
                    number: z.string(),
                    complement: z.string(),
                    code: z.string(),
                    city: z.string(),
                    country: z.string()
               });

               const studentData = studentBody.parse(request.body);

               await prisma.address.create({
                    data: {
                         studentId: studentData.studentId,
                         street: studentData.street,
                         number: studentData.number,
                         complement: studentData.complement,
                         code: studentData.code,
                         city: studentData.city,
                         country: studentData.country
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

     fastify.put('/addresses/:id', async (request, reply) => {
          const studentParams = z.object({
               id: z.string().uuid()
          });

          const studentParamsData = studentParams.parse(request.params);

          const studentBody = z.object({
               studentId: z.string().uuid(),
               street: z.string(),
               number: z.string(),
               complement: z.string(),
               code: z.string(),
               city: z.string(),
               country: z.string()
          });

          const studentData = studentBody.parse(request.body);
     });
};