import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import bcrypt from 'bcrypt';

const salt = 10;

export async function authenticationRoutes(fastify: FastifyInstance) {
     // Create a student
     fastify.post('/students', async (request, reply) => {
          try {
               const body = z.object({
                    name: z.string(),
                    surname: z.string(),
                    email: z.string().email(),
                    password: z.string(),
                    birthdate: z.string(),
                    telephone: z.string(),
                    street: z.string(),
                    number: z.string(),
                    complement: z.string().nullable(),
                    city: z.string(),
                    country: z.string(),
               });

               const student = body.parse(request.body);

               const fullname = student.name + ' ' + student.surname;

               const hashedPassword = await bcrypt.hash(student.password, salt);

               await prisma.students.create({
                    data: {
                         name: fullname,
                         email: student.email,
                         password: hashedPassword,
                         birthdate: student.birthdate,
                         telephone: student.telephone,
                         status: true,
                         street: student.street,
                         number: student.number,
                         complement: student.complement,
                         city: student.city,
                         country: student.country,
                    }
               });

               return reply.status(201).send({
                    status: 'success',
                    message: 'Aluno criado com sucesso'
               });
          } catch (error) {
               console.log(error);

               return reply.status(500).send({
                    status: 'error',
                    message: `Ocorreu um erro: ${error}`
               });
          };
     });

     // Create a teacher
     fastify.post('/teachers', async (request, reply) => {
          try {
               const body = z.object({
                    name: z.string(),
                    surname: z.string(),
                    email: z.string().email(),
                    password: z.string(),
                    birthdate: z.string(),
                    telephone: z.string(),
                    street: z.string(),
                    number: z.string(),
                    complement: z.string().nullable(),
                    city: z.string(),
                    country: z.string(),
               });

               const teacher = body.parse(request.body);

               const fullname = teacher.name + ' ' + teacher.surname;

               const hashedPassword = await bcrypt.hash(teacher.password, salt);

               const create = await prisma.teachers.create({
                    data: {
                         name: fullname,
                         email: teacher.email,
                         password: hashedPassword,
                         birthdate: teacher.birthdate,
                         telephone: teacher.telephone,
                         status: true,
                         street: teacher.street,
                         number: teacher.number,
                         complement: teacher.complement,
                         city: teacher.city,
                         country: teacher.country
                    }
               });

               const token = fastify.jwt.sign({
                    email: create.email,
               }, {
                    sub: create.id,
                    expiresIn: '7 days'
               });

               return reply.status(201).send({
                    status: 'success',
                    message: 'Personal criado com sucesso',
                    teacher: {
                         id: create.id,
                         name: create.name,
                         email: create.email
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
     fastify.post('/students/login', async (request, reply) => {
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
               id: studentExists.id,
               email: studentExists.email
          }, {
               sub: studentExists.id,
               expiresIn: '7 days'
          });

          const user = {
               id: studentExists.id,
               name: studentExists.name,
               email: studentExists.email
          };

          return reply.status(200).send({
               user,
               token,
               message: 'Authenticated successfully.'
          });
     });

     // Login teacher
     fastify.post('/teachers/login', async (request, reply) => {
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