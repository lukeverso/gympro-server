import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { authenticate } from '../plugins/authenticate';
import bcrypt from 'bcrypt';

const salt = 10;

export async function teachersRoutes(fastify: FastifyInstance) {
     // List all teachers
     fastify.get('/teachers', async (request, reply) => {
          const teachers = await prisma.teachers.findMany();

          return { teachers };
     });

     // List a specific teacher
     fastify.get('/teachers/:id', {
          preHandler: authenticate
     }, async (request, reply) => {
          const params = z.object({
               id: z.string().uuid()
          });

          const { id } = params.parse(request.params);

          const teacher = await prisma.teachers.findUnique({
               where: {
                    id
               },
               select: {
                    name: true,
                    username: true,
                    birthdate: true,
                    email: true,
                    telephone: true,
                    status: true,
                    students: {
                         select: {
                              name: true,
                              username: true,
                              birthdate: true,
                              email: true,
                              telephone: true,
                              status: true,
                         }
                    }
               }
          });

          if (!teacher) return reply.status(400).send({
               status: 'error',
               message: 'Personal não encontrado.'
          });

          return { teacher };
     });

     // Edit a specific teacher
     fastify.put('/teachers/:id', async (request, reply) => {
          try {
               const params = z.object({
                    id: z.string().uuid()
               });

               const { id } = params.parse(request.params);

               const teacherExists = await prisma.teachers.findFirst({
                    where: {
                         id
                    }
               });

               if (!teacherExists) return reply.status(400).send({
                    status: 'error',
                    message: 'Teacher not found.'
               });

               const body = z.object({
                    name: z.string(),
                    username: z.string(),
                    email: z.string().email(),
                    password: z.string(),
                    birthdate: z.string(),
                    telephone: z.string()
               });

               const teacher = body.parse(request.body);

               const hashedPassword = await bcrypt.hash(teacher.password, salt);

               await prisma.teachers.update({
                    where: {
                         id
                    },
                    data: {
                         name: teacher.name,
                         username: teacher.username,
                         email: teacher.email,
                         birthdate: teacher.birthdate,
                         telephone: teacher.telephone,
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

     // Delete a specific teacher
     fastify.delete('/teachers/:id', async (request, reply) => {
          try {
               const params = z.object({
                    id: z.string().uuid()
               });

               const { id } = params.parse(request.body);

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

     // Add a student
     fastify.post('/teachers/add/:studentId', async (request, reply) => {
          const params = z.object({
               studentId: z.string().uuid()
          });

          const { studentId } = params.parse(request.params);

          const body = z.object({
               teacherId: z.string().uuid()
          });

          const { teacherId } = body.parse(request.body);

          const teacher = await prisma.teachers.findUnique({
               where: {
                    id: teacherId
               }
          });

          if (!teacher) return reply.status(400).send({
               status: 'error',
               message: 'Teacher not found.'
          });

          await prisma.teachers.update({
               where: {
                    id: teacher.id
               },
               data: {
                    students: {
                         connect: {
                              id: studentId
                         }
                    }
               }
          });

          return reply.status(200).send({
               status: 'success',
               message: 'Student added successfully.'
          });
     });
};