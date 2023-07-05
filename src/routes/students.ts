import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { authenticate } from '../plugins/authenticate';
import bcrypt from 'bcrypt';

const salt = 10;

export async function studentsRoutes(fastify: FastifyInstance) {
     // Verify if an email has been taken by a student
     fastify.get('/students/verify-email', async (request, reply) => {
          const verifyMailBody = z.object({
               email: z.string()
          });

          const { email } = verifyMailBody.parse(request.body);

          const userExists = await prisma.students.findUnique({
               where: {
                    email
               }
          });

          if (userExists) return reply.status(400).send({
               status: 'error',
               message: 'E-mail already in use.'
          });

          return reply.status(200).send({ ok: true });
     });

     // Get a list of the students
     fastify.get('/students', {
          preHandler: authenticate
     }, async (request, reply) => {
          const students = await prisma.students.findMany({
               include: {
                    address: {
                         select: {
                              city: true,
                              code: true,
                              complement: true,
                              country: true,
                              number: true,
                              street: true,
                         },
                    },
                    exercises: {
                         select: {
                              active: true,
                              objective: true,
                              exercises: true
                         },
                    },
                    measures: {
                         select: {
                              arm: true,
                              bmi: true,
                              bodyFat: true,
                              height: true,
                              hip: true,
                              thigh: true,
                              waist: true,
                              weight: true,
                              wingspan: true
                         },
                    },
                    teacher: {
                         select: {
                              name: true,
                              username: true,
                              email: true
                         },
                    }
               }
          });

          return { students };
     });

     // Get a specific student
     fastify.get('/students/:id', {
          preHandler: authenticate
     }, async (request, reply) => {
          const studentParams = z.object({
               id: z.string().uuid()
          });

          const { id } = studentParams.parse(request.params);

          const student = await prisma.students.findUnique({
               where: {
                    id
               },
               include: {
                    address: {
                         select: {
                              city: true,
                              code: true,
                              complement: true,
                              country: true,
                              number: true,
                              street: true,
                         },
                    },
                    exercises: {
                         select: {
                              active: true,
                              objective: true,
                              exercises: true
                         },
                    },
                    measures: {
                         select: {
                              arm: true,
                              bmi: true,
                              bodyFat: true,
                              height: true,
                              hip: true,
                              thigh: true,
                              waist: true,
                              weight: true,
                              wingspan: true
                         },
                    },
                    teacher: {
                         select: {
                              name: true,
                              username: true,
                              email: true
                         },
                    }
               }
          });

          return { student };
     });

     // Edit a student
     fastify.put('/students/:id', {
          preHandler: authenticate
     }, async (request, reply) => {
          try {
               const studentParams = z.object({
                    id: z.string().uuid()
               });

               const { id } = studentParams.parse(request.params);

               const studentExists = await prisma.students.findFirst({
                    where: {
                         id
                    }
               });

               if (!studentExists) return reply.status(400).send({
                    status: 'error',
                    message: 'Student not found.'
               });

               if (id !== studentExists.id) return reply.status(400).send({
                    status: 'error',
                    message: "You cannot update another user's data."
               });

               const studentSchema = z.object({
                    name: z.string(),
                    username: z.string(),
                    email: z.string().email().nullable(),
                    password: z.string(),
                    birthdate: z.string(),
                    telephone: z.string()
               });

               const studentBody = studentSchema.parse(request.body);

               const hashedPassword = await bcrypt.hash(studentBody.password, salt);

               await prisma.students.update({
                    where: {
                         id
                    },
                    data: {
                         name: studentBody.name,
                         username: studentBody.username,
                         email: studentBody.email,
                         birthdate: studentBody.birthdate,
                         telephone: studentBody.telephone,
                         password: hashedPassword
                    }
               });

               return reply.status(200).send({
                    status: 'success',
                    message: 'Student updated successfully.'
               });
          } catch (error) {
               console.log(error);

               return reply.status(500).send({
                    status: 'error',
                    message: `Ocorreu um erro: ${error}`
               });
          };
     });

     // Delete a student
     fastify.delete('/students/:id', {
          preHandler: authenticate
     }, async (request, reply) => {
          try {
               const studentParams = z.object({
                    id: z.string().uuid()
               });

               const { id } = studentParams.parse(request.body);

               const userExists = await prisma.students.findFirst({
                    where: {
                         id
                    },
               });

               if (!userExists) return reply.status(400).send({
                    status: 'error',
                    message: 'User not found.'
               });

               await prisma.students.delete({
                    where: {
                         id
                    },
               });

               return reply.status(200).send({
                    status: 'success',
                    message: 'User deleted with success.'
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