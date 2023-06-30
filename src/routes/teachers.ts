import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { authenticate } from '../plugins/authenticate';
import bcrypt from 'bcrypt';

const salt = 10;

export async function teachersRoutes(fastify: FastifyInstance) {
     fastify.get('/teachers', async (request, reply) => {
          const teachers = await prisma.teachers.findMany({
               select: {
                    id: true,
                    name: true,
                    email: true,
                    birthdate: true,
                    telephone: true,
                    username: true,
                    students: {
                         select: {
                              name: true,
                              email: true,
                              username: true,
                              birthdate: true
                         },
                    },
               },
          });

          return { teachers };
     });

     fastify.get('/teachers/:id', {
          preHandler: authenticate
     }, async (request, reply) => {
          const teacherParams = z.object({
               id: z.string().uuid()
          });

          const { id } = teacherParams.parse(request.params);

          const teacher = await prisma.teachers.findUnique({
               where: {
                    id
               }
          });

          return { teacher };
     });

     fastify.post('/teachers', async (request, reply) => {
          try {
               const teacherBody = z.object({
                    name: z.string(),
                    username: z.string(),
                    email: z.string().email().nullable(),
                    password: z.string(),
                    birthdate: z.string(),
                    telephone: z.string()
               });

               const teacherData = teacherBody.parse(request.body);

               const teacherExists = await prisma.teachers.findFirst({
                    where: {
                         OR: [
                              { username: teacherData.username },
                              { email: teacherData.email },
                         ],
                    },
               });

               if (teacherExists) return reply.status(400).send({
                    status: 'error',
                    message: 'A teacher with the provided e-mail or username already exists.'
               });

               const hashedPassword = await bcrypt.hash(teacherData.password, salt);

               await prisma.teachers.create({
                    data: {
                         name: teacherData.name,
                         username: teacherData.username,
                         email: teacherData.email,
                         birthdate: teacherData.birthdate,
                         telephone: teacherData.telephone,
                         password: hashedPassword
                    },
               });

               return reply.status(201).send({
                    status: 'success',
                    message: 'Teacher created successfully!'
               });
          } catch (error) {
               console.log(error);

               return reply.status(500).send({
                    status: 'error',
                    message: `Ocorreu um erro: ${error}`
               });
          }
     });

     fastify.put('/teachers/:id', async (request, reply) => {
          try {
               const teachersParams = z.object({
                    id: z.string().uuid()
               });

               const { id } = teachersParams.parse(request.params);

               const teacherExists = await prisma.teachers.findFirst({
                    where: {
                         id
                    }
               });

               if (!teacherExists) return reply.status(400).send({
                    status: 'error',
                    message: 'Teacher not found.'
               });

               const teacherBody = z.object({
                    name: z.string(),
                    username: z.string(),
                    email: z.string().email().nullable(),
                    password: z.string(),
                    birthdate: z.string(),
                    telephone: z.string()
               });

               const teacherData = teacherBody.parse(request.body);

               const hashedPassword = await bcrypt.hash(teacherData.password, salt);

               await prisma.teachers.update({
                    where: {
                         id
                    },
                    data: {
                         name: teacherData.name,
                         username: teacherData.username,
                         email: teacherData.email,
                         birthdate: teacherData.birthdate,
                         telephone: teacherData.telephone,
                         password: hashedPassword
                    }
               });

               return reply.status(200).send({
                    status: 'success',
                    message: 'Teacher updated successfully!'
               });
          } catch (error) {
               console.log(error);

               return reply.status(500).send({
                    status: 'error',
                    message: `Ocorreu um erro: ${error}`
               });
          };
     });

     fastify.delete('/teacher/:id', async (request, reply) => {
          try {
               const teacherParams = z.object({
                    id: z.string().uuid()
               });

               const { id } = teacherParams.parse(request.body);

               const teacherExists = await prisma.teachers.findFirst({
                    where: {
                         id
                    },
               });

               if (!teacherExists) return reply.status(400).send({
                    status: 'error',
                    message: 'Teacher not found.'
               });

               await prisma.teachers.delete({
                    where: {
                         id
                    },
               });

               return reply.status(200).send({
                    status: 'success',
                    message: 'Teacher deleted with success.'
               });
          } catch (error) {
               console.log(error);

               return reply.status(500).send({
                    status: 'error',
                    message: `Ocorreu um erro: ${error}`
               });
          };
     });
};