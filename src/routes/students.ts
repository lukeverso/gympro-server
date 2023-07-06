import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { authenticate } from '../plugins/authenticate';
import bcrypt from 'bcrypt';

const salt = 10;

export async function studentsRoutes(fastify: FastifyInstance) {
     // Verify if an email has been taken by a student
     fastify.get('/students/verify-email', async (request, reply) => {
          try {
               const querySchema = z.object({
                    email: z.string()
               });

               const { email } = querySchema.parse(request.query);

               const userExists = await prisma.students.findUnique({
                    where: {
                         email
                    }
               });

               console.log(userExists);

               if (userExists) {
                    return reply.status(400).send({
                         status: 'error',
                         message: 'Este e-mail está em uso.'
                    });
               };

               return reply.status(200).send({
                    status: 'success',
                    message: 'E-mail não utilizado.'
               });
          } catch (error) {
               console.error(error);
               return reply.status(500).send({
                    status: 'error',
                    message: 'Erro interno do servidor.'
               });
          }
     });

     // Get a list of the students
     fastify.get('/students', {
          preHandler: authenticate
     }, async (request, reply) => {
          const students = await prisma.students.findMany();

          return { students };
     });

     // Get a specific student
     fastify.get('/students/:id', {
          preHandler: authenticate
     }, async (request, reply) => {
          const params = z.object({
               id: z.string().uuid()
          });

          const { id } = params.parse(request.params);

          const student = await prisma.students.findUnique({
               where: {
                    id
               },
               select: {
                    name: true,
                    username: true,
                    email: true,
                    birthdate: true,
                    telephone: true
               }
          });

          return { student };
     });

     // Edit a student
     fastify.put('/students/:id', {
          preHandler: authenticate
     }, async (request, reply) => {
          try {
               const params = z.object({
                    id: z.string().uuid()
               });

               const { id } = params.parse(request.params);

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

               const body = z.object({
                    name: z.string(),
                    username: z.string(),
                    email: z.string().email(),
                    password: z.string(),
                    birthdate: z.string(),
                    telephone: z.string()
               });

               const student = body.parse(request.body);

               const hashedPassword = await bcrypt.hash(student.password, salt);

               await prisma.students.update({
                    where: {
                         id
                    },
                    data: {
                         name: student.name,
                         username: student.username,
                         email: student.email,
                         birthdate: student.birthdate,
                         telephone: student.telephone,
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
               const params = z.object({
                    id: z.string().uuid()
               });

               const { id } = params.parse(request.body);

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