import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import bcrypt from 'bcrypt';

export async function authenticationRoutes(fastify: FastifyInstance) {
     // LOGIN PARA ALUNOS
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
               id: studentExists.id
          }, {
               sub: studentExists.id,
               expiresIn: '7 days'
          });

          const user = {
               id: studentExists.id
          };

          return reply.status(200).send({
               user,
               token,
               message: 'Authenticated successfully.'
          });
     });

     // LOGIN PARA PROFESSORES
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
               id: teacherExists.id,
          }, {
               sub: teacherExists.id,
               expiresIn: '7 days'
          });

          const teacher = {
               id: teacherExists.id
          };

          return reply.status(200).send({
               teacher,
               token,
               message: 'Authenticated successfully.'
          });
     });
};