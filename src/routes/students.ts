import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { authenticate } from '../plugins/authenticate';
import bcrypt from 'bcrypt';

const salt = 10;

export async function studentsRoutes(fastify: FastifyInstance) {
     fastify.get('/students', {
          preHandler: authenticate
     }, async (request, reply) => {
          const students = await prisma.student.findMany({
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

     // fastify.get('/students/:id', {
     //      preHandler: authenticate
     // }, async (request, reply) => {
     //      const studentParams = z.object({
     //           id: z.string().uuid()
     //      });

     //      const { id } = studentParams.parse(request.params);

     //      const student = await prisma.student.findUnique({
     //           where: {
     //                id
     //           },
     //           include: {
     //                address: {
     //                     select: {
     //                          city: true,
     //                          code: true,
     //                          complement: true,
     //                          country: true,
     //                          number: true,
     //                          street: true,
     //                     },
     //                },
     //                exercises: {
     //                     select: {
     //                          active: true,
     //                          objective: true,
     //                          exercises: true
     //                     },
     //                },
     //                measures: {
     //                     select: {
     //                          arm: true,
     //                          bmi: true,
     //                          bodyFat: true,
     //                          height: true,
     //                          hip: true,
     //                          thigh: true,
     //                          waist: true,
     //                          weight: true,
     //                          wingspan: true
     //                     },
     //                },
     //                teacher: {
     //                     select: {
     //                          name: true,
     //                          username: true,
     //                          email: true
     //                     },
     //                }
     //           }
     //      });

     //      return { student };
     // });

     fastify.post('/students', async (request, reply) => {
          try {
               const studentSchema = z.object({
                    name: z.string(),
                    username: z.string(),
                    email: z.string().email(),
                    password: z.string(),
                    birthdate: z.string(),
                    telephone: z.string(),
               });

               const studentBody = studentSchema.parse(request.body);

               const studentExists = await prisma.student.findFirst({
                    where: {
                         OR: [
                              {
                                   username: studentBody.username
                              },
                              {
                                   email: studentBody.email
                              },
                         ],
                    },
               });

               if (studentExists) return reply.status(400).send({
                    status: 'error',
                    message: 'Student already exists.'
               });

               const hashedPassword = await bcrypt.hash(studentBody.password, salt);

               const student = await prisma.student.create({
                    data: {
                         name: studentBody.name,
                         username: studentBody.username,
                         email: studentBody.email,
                         password: hashedPassword,
                         birthdate: studentBody.birthdate,
                         telephone: studentBody.telephone
                    }
               });

               return reply.status(201).send({
                    status: 'success',
                    message: 'Aluno criado com sucesso',
                    student
               });
          } catch (error) {
               console.log(error);

               return reply.status(500).send({
                    status: 'error',
                    message: `Ocorreu um erro: ${error}`
               });
          };
     });

     fastify.put('/students/:id', {
          preHandler: authenticate
     }, async (request, reply) => {
          try {
               const studentParams = z.object({
                    id: z.string().uuid()
               });

               const { id } = studentParams.parse(request.params);

               const studentExists = await prisma.student.findFirst({
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

               await prisma.student.update({
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

     fastify.delete('/students/:id', {
          preHandler: authenticate
     }, async (request, reply) => {
          try {
               const studentParams = z.object({
                    id: z.string().uuid()
               });

               const { id } = studentParams.parse(request.body);

               const userExists = await prisma.student.findFirst({
                    where: {
                         id
                    },
               });

               if (!userExists) return reply.status(400).send({
                    status: 'error',
                    message: 'User not found.'
               });

               await prisma.student.delete({
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