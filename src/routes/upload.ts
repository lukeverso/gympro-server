import { FastifyInstance } from 'fastify';
import multer from 'fastify-multer';
import { z } from 'zod';

import { prisma } from '../lib/prisma';
import { authenticate } from '../plugins/authenticate';
import { uploadPicture } from '../lib/upload';

const upload = multer();

interface ResultProps {
     url?: string;
}

export async function uploadRoutes(fastify: FastifyInstance) {
     fastify.addHook('onRequest', authenticate);

     fastify.post('/students/:id/upload', {
          preHandler: upload.single('file')
     }, async (request, reply) => {
          try {
               const paramsSchema = z.object({
                    id: z.string().uuid()
               });

               const { id } = paramsSchema.parse(request.params);

               const teacher = prisma.students.findUnique({
                    where: {
                         id
                    }
               });

               if (!teacher) {
                    return reply.status(400).send({
                         status: 'error',
                         message: 'Ocorreu um erro ao atualizar a foto.'
                    });
               };

               const binaryData = request.file?.buffer;

               const result: ResultProps = await uploadPicture(binaryData);

               if (result && result.url) {
                    await prisma.students.update({
                         where: {
                              id
                         },
                         data: {
                              picture: result.url
                         }
                    });

                    return reply.status(200).send({
                         status: 'success',
                         message: 'Foto atualizada com sucesso.'
                    });
               } else {
                    return reply.status(400).send({
                         status: 'error',
                         message: 'Ocorreu um erro ao atualizar a foto.'
                    });
               };
          } catch (error) {
               console.log(error);
          };
     });

     fastify.post('/teachers/:id/upload', {
          preHandler: upload.single('file')
     }, async (request, reply) => {
          try {
               const paramsSchema = z.object({
                    id: z.string().uuid()
               });

               const { id } = paramsSchema.parse(request.params);

               const teacher = prisma.teachers.findUnique({
                    where: {
                         id
                    }
               });

               if (!teacher) {
                    return reply.status(400).send({
                         status: 'error',
                         message: 'Ocorreu um erro ao atualizar a foto.'
                    });
               };

               const binaryData = request.file?.buffer;

               const result: ResultProps = await uploadPicture(binaryData);

               if (result && result.url) {
                    await prisma.teachers.update({
                         where: {
                              id
                         },
                         data: {
                              picture: result.url
                         }
                    });

                    return reply.status(200).send({
                         status: 'success',
                         message: 'Foto atualizada com sucesso.'
                    });
               } else {
                    return reply.status(400).send({
                         status: 'error',
                         message: 'Ocorreu um erro ao atualizar a foto.'
                    });
               };
          } catch (error) {
               console.log(error);
          };
     });
};
