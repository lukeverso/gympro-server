import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { authenticate } from '../plugins/authenticate';
import bcrypt from 'bcrypt';

const salt = 10;

export async function studentsRoutes(fastify: FastifyInstance) {
     // Verify if an email has been taken by a student
     fastify.post('/students/verify-email', async (request, reply) => {
          try {
               const querySchema = z.object({
                    email: z.string().email()
               });

               const { email } = querySchema.parse(request.query);

               const user = await prisma.students.findUnique({
                    where: {
                         email
                    }
               });

               if (user?.email === email) {
                    return reply.status(200).send({
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
                    code: z.string(),
                    street: z.string(),
                    number: z.string(),
                    complement: z.string().nullable(),
                    district: z.string(),
                    city: z.string(),
                    state: z.string()
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
                         code: student.code,
                         street: student.street,
                         number: student.number,
                         complement: student.complement,
                         district: student.district,
                         city: student.city,
                         state: student.state
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

     // Get a list of the students
     fastify.get('/students', {
          preHandler: authenticate
     }, async (request, reply) => {
          const students = await prisma.students.findMany();

          return { students };
     });

     // Get a specific student's data
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
                    email: true,
                    telephone: true,
                    birthdate: true,

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
                    surname: z.string(),
                    email: z.string().email(),
                    password: z.string(),
                    birthdate: z.string(),
                    telephone: z.string(),
                    code: z.string(),
                    street: z.string(),
                    number: z.string(),
                    complement: z.string().nullable(),
                    district: z.string(),
                    city: z.string(),
                    state: z.string()
               });

               const student = body.parse(request.body);

               const fullname = student.name + ' ' + student.surname;

               const hashedPassword = await bcrypt.hash(student.password, salt);

               await prisma.students.update({
                    where: {
                         id
                    },
                    data: {
                         name: fullname,
                         email: student.email,
                         password: hashedPassword,
                         birthdate: student.birthdate,
                         telephone: student.telephone,
                         code: student.code,
                         street: student.street,
                         number: student.number,
                         complement: student.complement,
                         district: student.district,
                         city: student.city,
                         state: student.state
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

     // Get student's name
     fastify.get('/students/me/:id/name', {
          preHandler: authenticate
     }, async (request, reply) => {
          try {
               const params = z.object({
                    id: z.string().uuid()
               });

               const { id } = params.parse(request.params);

               const user = await prisma.students.findFirst({
                    where: {
                         id
                    },
                    select: {
                         name: true
                    }
               });

               if (!user) return reply.status(400).send({
                    status: 'error',
                    message: 'User not found.'
               });

               return reply.status(200).send({ user });
          } catch (error) {
               console.log(error);

               return reply.status(500).send({
                    status: 'error',
                    message: `Ocorreu um erro: ${error}`
               });
          };
     });

     // Update student's name
     fastify.patch('/students/me/:id/name', {
          preHandler: authenticate
     }, async (request, reply) => {
          try {
               const params = z.object({
                    id: z.string().uuid()
               });

               const { id } = params.parse(request.params);

               const body = z.object({
                    name: z.string(),
                    surname: z.string()
               });

               const { name, surname } = body.parse(request.body);

               const fullname = name + ' ' + surname;

               const user = await prisma.students.findFirst({
                    where: {
                         id
                    }
               });

               if (!user) return reply.status(400).send({
                    status: 'error',
                    message: 'User not found.'
               });

               await prisma.students.update({
                    where: {
                         id
                    },
                    data: {
                         name: fullname
                    }
               });

               return reply.status(200).send({
                    status: 'success',
                    message: 'Nome editado com sucesso.'
               });
          } catch (error) {
               console.log(error);

               return reply.status(500).send({
                    status: 'error',
                    message: `Ocorreu um erro: ${error}`
               });
          };
     });

     // Get student's e-mail
     fastify.get('/students/me/:id/email', {
          preHandler: authenticate
     }, async (request, reply) => {
          try {
               const params = z.object({
                    id: z.string().uuid()
               });

               const { id } = params.parse(request.params);

               const user = await prisma.students.findFirst({
                    where: {
                         id
                    },
                    select: {
                         email: true
                    }
               });

               if (!user) return reply.status(400).send({
                    status: 'error',
                    message: 'User not found.'
               });

               return reply.status(200).send({ user });
          } catch (error) {
               console.log(error);

               return reply.status(500).send({
                    status: 'error',
                    message: `Ocorreu um erro: ${error}`
               });
          };
     });

     // Update student's e-mail
     fastify.patch('/students/me/:id/email', {
          preHandler: authenticate
     }, async (request, reply) => {
          try {
               const params = z.object({
                    id: z.string().uuid()
               });

               const { id } = params.parse(request.params);

               const body = z.object({
                    email: z.string().email()
               });

               const { email } = body.parse(request.body);

               const user = await prisma.students.findFirst({
                    where: {
                         id
                    }
               });

               if (!user) return reply.status(400).send({
                    status: 'error',
                    message: 'User not found.'
               });

               await prisma.students.update({
                    where: {
                         id
                    },
                    data: {
                         email
                    }
               });

               return reply.status(200).send({
                    status: 'success',
                    message: 'E-mail editado com sucesso.'
               });
          } catch (error) {
               if (error instanceof z.ZodError) {
                    reply.status(400).send({
                         status: 'error',
                         message: error.errors[0].message
                    });
               };

               return reply.status(500).send({
                    status: 'error',
                    message: `Ocorreu um erro: ${error}`
               });
          };
     });

     // Get student's e-mail
     fastify.get('/students/me/:id/telephone', {
          preHandler: authenticate
     }, async (request, reply) => {
          try {
               const params = z.object({
                    id: z.string().uuid()
               });

               const { id } = params.parse(request.params);

               const user = await prisma.students.findFirst({
                    where: {
                         id
                    },
                    select: {
                         telephone: true
                    }
               });

               if (!user) return reply.status(400).send({
                    status: 'error',
                    message: 'User not found.'
               });

               return reply.status(200).send({ user });
          } catch (error) {
               console.log(error);

               return reply.status(500).send({
                    status: 'error',
                    message: `Ocorreu um erro: ${error}`
               });
          };
     });

     // Update student's e-mail
     fastify.patch('/students/me/:id/telephone', {
          preHandler: authenticate
     }, async (request, reply) => {
          try {
               const params = z.object({
                    id: z.string().uuid()
               });

               const { id } = params.parse(request.params);

               const body = z.object({
                    telephone: z.string()
               });

               const { telephone } = body.parse(request.body);

               const user = await prisma.students.findFirst({
                    where: {
                         id
                    }
               });

               if (!user) return reply.status(400).send({
                    status: 'error',
                    message: 'User not found.'
               });

               await prisma.students.update({
                    where: {
                         id
                    },
                    data: {
                         telephone
                    }
               });

               return reply.status(200).send({
                    status: 'success',
                    message: 'Telefone editado com sucesso.'
               });
          } catch (error) {
               if (error instanceof z.ZodError) {
                    reply.status(400).send({
                         status: 'error',
                         message: error.errors[0].message
                    });
               };

               return reply.status(500).send({
                    status: 'error',
                    message: `Ocorreu um erro: ${error}`
               });
          };
     });

     // Get student's e-mail
     fastify.get('/students/me/:id/address', {
          preHandler: authenticate
     }, async (request, reply) => {
          try {
               const params = z.object({
                    id: z.string().uuid()
               });

               const { id } = params.parse(request.params);

               const user = await prisma.students.findFirst({
                    where: {
                         id
                    },
                    select: {
                         code: true,
                         city: true,
                         complement: true,
                         district: true,
                         number: true,
                         state: true,
                         street: true
                    }
               });

               if (!user) return reply.status(400).send({
                    status: 'error',
                    message: 'User not found.'
               });

               return reply.status(200).send({ user });
          } catch (error) {
               console.log(error);

               return reply.status(500).send({
                    status: 'error',
                    message: `Ocorreu um erro: ${error}`
               });
          };
     });

     // Update student's e-mail
     fastify.patch('/students/me/:id/address', {
          preHandler: authenticate
     }, async (request, reply) => {
          try {
               const params = z.object({
                    id: z.string().uuid()
               });

               const { id } = params.parse(request.params);

               const body = z.object({
                    code: z.string(),
                    city: z.string(),
                    complement: z.string(),
                    district: z.string(),
                    number: z.string(),
                    state: z.string(),
                    street: z.string()
               });

               const {
                    code,
                    city,
                    complement,
                    district,
                    number,
                    state,
                    street
               } = body.parse(request.body);

               const user = await prisma.students.findFirst({
                    where: {
                         id
                    }
               });

               if (!user) return reply.status(400).send({
                    status: 'error',
                    message: 'User not found.'
               });

               await prisma.students.update({
                    where: {
                         id
                    },
                    data: {
                         code,
                         city,
                         complement,
                         district,
                         number,
                         state,
                         street
                    }
               });

               return reply.status(200).send({
                    status: 'success',
                    message: 'Telefone editado com sucesso.'
               });
          } catch (error) {
               if (error instanceof z.ZodError) {
                    reply.status(400).send({
                         status: 'error',
                         message: error.errors[0].message
                    });
               };

               return reply.status(500).send({
                    status: 'error',
                    message: `Ocorreu um erro: ${error}`
               });
          };
     });
};