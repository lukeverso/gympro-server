import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import bcrypt from 'bcrypt';

const salt = 10;

export async function authenticationRoutes(fastify: FastifyInstance) {
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