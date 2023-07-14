import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { authenticate } from '../plugins/authenticate';

export async function notificationsRoutes(fastify: FastifyInstance) {
     fastify.get('/notifications/:id', {
          preHandler: authenticate
     }, async (request, reply) => {
          try {
               const requestParams = z.object({
                    id: z.string()
               });

               const { id } = requestParams.parse(request.params);

               const notifications = await prisma.students.findMany({
                    where: {
                         id
                    },
                    select: {
                         gym: {
                              select: {
                                   notifications: {
                                        select: {
                                             id: true,
                                             title: true,
                                             expanded: true,
                                             content: true
                                        }
                                   }
                              }
                         }
                    }
               });

               return reply.status(200).send({ notifications });
          } catch (error) {
               console.log(error);

               return reply.status(500).send({
                    status: 'error',
                    message: `Ocorreu um erro: ${error}`
               });
          };
     });
};