import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { uploadPicture } from '../lib/cloudinary';
import multer from 'multer';

const upload = multer();

interface ResultProps {
     url?: string;
};

export async function uploadStudentPicture(request: Request, response: Response) {
     const paramsSchema = z.object({
          id: z.string().uuid()
     });

     const { id } = paramsSchema.parse(request.params);

     try {
          const student = await prisma.students.findUnique({
               where: {
                    id
               }
          });

          if (!student) {
               return response.status(400).send({
                    status: 'error',
                    message: 'Ocorreu um erro ao atualizar a foto.'
               });
          };

          if (!request.file) {
               return response.status(400).send({
                    status: 'error',
                    message: 'Nenhum arquivo de imagem foi enviado.'
               });
          };

          const binaryData = request.file.buffer;

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

               return response.status(200).send({
                    status: 'success',
                    message: 'Foto atualizada com sucesso.'
               });
          } else {
               return response.status(400).send({
                    status: 'error',
                    message: 'Ocorreu um erro ao atualizar a foto.'
               });
          }
     } catch (error) {
          console.log(error);

          return response.status(500).send({
               status: 'error',
               message: `Ocorreu um erro: ${error}`
          });
     };
};

export async function uploadTeacherPicture(request: Request, response: Response) {
     const paramsSchema = z.object({
          id: z.string().uuid()
     });

     const { id } = paramsSchema.parse(request.params);

     try {
          const teacher = await prisma.teachers.findUnique({
               where: {
                    id
               }
          });

          if (!teacher) {
               return response.status(400).send({
                    status: 'error',
                    message: 'Ocorreu um erro ao atualizar a foto.'
               });
          }

          if (!request.file) {
               return response.status(400).send({
                    status: 'error',
                    message: 'Nenhum arquivo de imagem foi enviado.'
               });
          }

          const binaryData = request.file.buffer;

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

               return response.status(200).send({
                    status: 'success',
                    message: 'Foto atualizada com sucesso.'
               });
          } else {
               return response.status(400).send({
                    status: 'error',
                    message: 'Ocorreu um erro ao atualizar a foto.'
               });
          }
     } catch (error) {
          console.log(error);

          return response.status(500).send({
               status: 'error',
               message: `Ocorreu um erro: ${error}`
          });
     };
};