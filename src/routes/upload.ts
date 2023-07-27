import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma';
import { authenticate } from '../plugins/authenticate';
import cloudinary from 'cloudinary';
import { z } from 'zod';

cloudinary.v2.config({
     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
     api_key: process.env.CLOUDINARY_API_KEY,
     api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function uploadRoutes(fastify: FastifyInstance) {
     fastify.post('/students/:id/upload', {
          preHandler: authenticate
     }, async (request, reply) => {
          try {
               const paramsSchema = z.object({
                    id: z.string()
               });

               const { id } = paramsSchema.parse(request.params);

               const upload = await request.file({
                    limits: {
                         fileSize: 10_485_760 // 10mb
                    }
               });

               if (!upload) return reply.status(400).send('No file uploaded.');

               const mimeTypeRegex = /^(image)\/[a-zA-Z]+/;
               const isValidFileFormat = mimeTypeRegex.test(upload.mimetype);

               if (!isValidFileFormat) return reply.status(400).send('Invalid file format.');

               const data = new Date().getTime();
               const filename = `${data}-${upload.filename}`;
               const fileBuffer = await upload.toBuffer();

               // Wrap the cloudinary.v2.uploader.upload_stream() in a Promise
               const cloudUpload: any = await new Promise((resolve, reject) => {
                    cloudinary.v2.uploader.upload_stream(
                         { public_id: filename, folder: 'profiles' },
                         (error: any, result: any) => {
                              if (error) {
                                   console.log(error);
                                   reject('An error occurred while uploading the file.');
                              } else {
                                   resolve(result);
                              }
                         }
                    ).end(fileBuffer);
               });

               console.log(cloudUpload);

               return reply.status(200).send({
                    success: true,
                    file: cloudUpload.secure_url,
               });
          } catch (error) {
               console.log(error);
               return reply.status(500).send('An error occurred while uploading the file.');
          };
     });

     fastify.post('/teachers/:id/upload', async (request, reply) => {
          try {
               const paramsSchema = z.object({
                    id: z.string()
               });

               const { id } = paramsSchema.parse(request.params);
               
               const upload = await request.file({
                    limits: {
                         fileSize: 10_485_760 // 10mb
                    }
               });

               if (!upload) return reply.status(400).send('No file uploaded.');

               const mimeTypeRegex = /^(image)\/[a-zA-Z]+/;
               const isValidFileFormat = mimeTypeRegex.test(upload.mimetype);

               if (!isValidFileFormat) return reply.status(400).send('Invalid file format.');

               const data = new Date().getTime();
               const filename = `${data}-${upload.filename}`;
               const fileBuffer = await upload.toBuffer();

               // Wrap the cloudinary.v2.uploader.upload_stream() in a Promise
               const cloudUpload: any = await new Promise((resolve, reject) => {
                    cloudinary.v2.uploader.upload_stream(
                         { public_id: filename, folder: 'profiles' },
                         (error: any, result: any) => {
                              if (error) {
                                   console.log(error);
                                   reject('An error occurred while uploading the file.');
                              } else {
                                   resolve(result);
                              }
                         }
                    ).end(fileBuffer);
               });

               console.log(cloudUpload);

               await prisma.teachers.update({
                    where: {
                         id
                    },
                    data: {
                         picture: cloudUpload.secure_url
                    }
               });

               return reply.status(200).send({
                    status: 'success',
                    message: 'Foto de perfil alterada com sucesso.'
               });
          } catch (error) {
               console.log(error);
               return reply.status(500).send('An error occurred while uploading the file.');
          };
     });
};