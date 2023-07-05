import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import bcrypt from 'bcrypt';

const salt = 10;

export async function authenticationRoutes(fastify: FastifyInstance) {
     // Create a student
     fastify.post('/students', async (request, reply) => {
          try {
               const studentSchema = z.object({
                    name: z.string(),
                    username: z.string(),
                    email: z.string().email(),
                    password: z.string(),
                    birthdate: z.string(),
                    telephone: z.string(),
                    street: z.string(),
                    number: z.string(),
                    complement: z.string().nullable(),
                    code: z.string(),
                    city: z.string(),
                    country: z.string(),
               });

               const studentBody = studentSchema.parse(request.body);

               const studentExists = await prisma.students.findFirst({
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

               const student = await prisma.students.create({
                    data: {
                         name: studentBody.name,
                         username: studentBody.username,
                         email: studentBody.email,
                         password: hashedPassword,
                         birthdate: studentBody.birthdate,
                         telephone: studentBody.telephone,
                         status: true,
                         address: {
                              create: {
                                   street: studentBody.street,
                                   number: studentBody.number,
                                   complement: studentBody.complement,
                                   code: studentBody.code,
                                   city: studentBody.city,
                                   country: studentBody.country
                              }
                         }
                    }
               });

               const token = fastify.jwt.sign({
                    email: student.email,
                    username: student.username
               }, {
                    sub: student.id,
                    expiresIn: '7 days'
               });

               return reply.status(201).send({
                    status: 'success',
                    message: 'Aluno criado com sucesso',
                    student: {
                         id: student.id,
                         name: student.name,
                         email: student.email
                    },
                    token
               });
          } catch (error) {
               console.log(error);

               return reply.status(500).send({
                    status: 'error',
                    message: `Ocorreu um erro: ${error}`
               });
          };
     });

     // Create a student
     fastify.post('/teachers', async (request, reply) => {
          try {
               const teacherSchema = z.object({
                    name: z.string(),
                    username: z.string(),
                    email: z.string().email(),
                    password: z.string(),
                    birthdate: z.string(),
                    telephone: z.string(),
                    street: z.string(),
                    number: z.string(),
                    complement: z.string().nullable(),
                    code: z.string(),
                    city: z.string(),
                    country: z.string(),
               });

               const teacherBody = teacherSchema.parse(request.body);

               const teacherExists = await prisma.teachers.findFirst({
                    where: {
                         OR: [
                              {
                                   username: teacherBody.username
                              },
                              {
                                   email: teacherBody.email
                              },
                         ],
                    },
               });

               if (teacherExists) return reply.status(400).send({
                    status: 'error',
                    message: 'Teacher already exists.'
               });

               const hashedPassword = await bcrypt.hash(teacherBody.password, salt);

               const teacher = await prisma.teachers.create({
                    data: {
                         name: teacherBody.name,
                         username: teacherBody.username,
                         email: teacherBody.email,
                         password: hashedPassword,
                         birthdate: teacherBody.birthdate,
                         telephone: teacherBody.telephone,
                         status: true,
                         address: {
                              create: {
                                   street: teacherBody.street,
                                   number: teacherBody.number,
                                   complement: teacherBody.complement,
                                   code: teacherBody.code,
                                   city: teacherBody.city,
                                   country: teacherBody.country
                              }
                         }
                    }
               });

               const token = fastify.jwt.sign({
                    email: teacher.email,
                    username: teacher.username
               }, {
                    sub: teacher.id,
                    expiresIn: '7 days'
               });

               return reply.status(201).send({
                    status: 'success',
                    message: 'Aluno criado com sucesso',
                    teacher: {
                         id: teacher.id,
                         name: teacher.name,
                         email: teacher.email
                    },
                    token
               });
          } catch (error) {
               console.log(error);

               return reply.status(500).send({
                    status: 'error',
                    message: `Ocorreu um erro: ${error}`
               });
          };
     });

     // Login student
     fastify.post('/login/students', async (request, reply) => {
          const loginBody = z.object({
               email: z.string(),
               password: z.string()
          });

          const { email, password } = loginBody.parse(request.body);

          const studentExists = await prisma.students.findFirst({
               where: {
                    email
               },
          });

          if (!studentExists) return reply.status(400).send({
               status: 'error',
               message: 'User not found.'
          });

          const passwordMatch = await bcrypt.compare(password, studentExists.password);

          if (!passwordMatch) return reply.status(400).send({
               status: 'error',
               message: 'Passwords do not match.'
          });

          const token = fastify.jwt.sign({
               email: studentExists.email,
               username: studentExists.username
          }, {
               sub: studentExists.id,
               expiresIn: '7 days'
          });

          return reply.status(200).send({
               token,
               message: 'Authenticated successfully.'
          });
     });

     // Login teacher
     fastify.post('/login/teachers', async (request, reply) => {
          const loginBody = z.object({
               email: z.string(),
               password: z.string()
          });

          const { email, password } = loginBody.parse(request.body);

          const teacherExists = await prisma.teachers.findFirst({
               where: {
                    email
               },
          });

          if (!teacherExists) return reply.status(400).send({
               status: 'error',
               message: 'User not found.'
          });

          const passwordMatch = await bcrypt.compare(password, teacherExists.password);

          if (!passwordMatch) return reply.status(400).send({
               status: 'error',
               message: 'Passwords do not match.'
          });

          const token = fastify.jwt.sign({
               email: teacherExists.email,
               username: teacherExists.username
          }, {
               sub: teacherExists.id,
               expiresIn: '7 days'
          });

          return reply.status(200).send({
               token,
               message: 'Authenticated successfully.'
          });
     });
};