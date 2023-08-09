import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { authenticate } from '../plugins/authenticate';
import bcrypt from 'bcrypt';

const salt = 10;

function calculateAge(birthdate: string) {
     const today = new Date();
     const birthDateParts = birthdate.split('/');
     const birthDate = new Date(
          parseInt(birthDateParts[2], 10),
          parseInt(birthDateParts[1], 10) - 1,
          parseInt(birthDateParts[0], 10)
     );

     let age = today.getFullYear() - birthDate.getFullYear();
     const monthToday = today.getMonth();
     const dayToday = today.getDate();
     const monthBirth = birthDate.getMonth();
     const dayBirth = birthDate.getDate();

     if (monthToday < monthBirth || (monthToday === monthBirth && dayToday < dayBirth)) {
          age--;
     };

     return age;
};

export async function teachersRoutes(fastify: FastifyInstance) {
     // CRIAR UM PROFESSOR
     fastify.post('/teachers', async (request, reply) => {
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
                         code: teacher.code,
                         street: teacher.street,
                         number: teacher.number,
                         complement: teacher.complement,
                         district: teacher.district,
                         city: teacher.city,
                         state: teacher.state
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

     // RECEBE OS DADOS DO PROFESSOR LOGADO
     fastify.get('/teachers/:id', {
          preHandler: authenticate,
     }, async (request, reply) => {
          try {
               const requestParams = z.object({
                    id: z.string().uuid()
               });

               const { id } = requestParams.parse(request.params);

               const response = await prisma.teachers.findUnique({
                    where: {
                         id
                    },
                    select: {
                         name: true,
                         email: true,
                         telephone: true,
                         picture: true,
                         students: {
                              select: {
                                   id: true,
                                   name: true,
                                   birthdate: true,
                              },
                              orderBy: {
                                   createdAt: 'desc'
                              },
                              take: 5
                         }
                    }
               });

               const studentsWithAge = response?.students.map(student => ({
                    ...student,
                    age: calculateAge(student.birthdate),
               }));

               const formattedResponse = {
                    name: response?.name,
                    email: response?.email,
                    telephone: response?.telephone,
                    picture: response?.picture,
                    students: studentsWithAge,
               };

               return reply.status(200).send(formattedResponse);
          } catch (error) {
               console.log(error);

               return reply.status(500).send({
                    status: 'error',
                    message: `Ocorreu um erro: ${error}`
               });
          }
     });

     // RECEBE OS ALUNOS DO PROFESSOR LOGADO
     fastify.get('/teachers/:id/students', {
          preHandler: authenticate,
     }, async (request, reply) => {
          try {
               const requestParams = z.object({
                    id: z.string().uuid()
               });

               const { id } = requestParams.parse(request.params);

               const response = await prisma.teachers.findUnique({
                    where: {
                         id
                    },
                    select: {
                         students: {
                              select: {
                                   id: true,
                                   name: true,
                                   birthdate: true,
                              },
                              orderBy: {
                                   name: 'asc'
                              },
                         }
                    }
               });

               const students = response?.students.map(student => ({
                    ...student,
                    age: calculateAge(student.birthdate),
               }));

               return reply.status(200).send(students);
          } catch (error) {
               console.log(error);

               return reply.status(500).send({
                    status: 'error',
                    message: `Ocorreu um erro: ${error}`
               });
          }
     });

     // APAGAR UM PROFESSOR
     fastify.delete('/teachers/:id', {
          preHandler: authenticate
     }, async (request, reply) => {
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

     // ADICIONAR UM ALUNO A UM PROFESSOR
     fastify.post('/teachers/:teacher/add/:student', {
          preHandler: authenticate
     }, async (request, reply) => {
          try {
               const params = z.object({
                    teacher: z.string().uuid(),
                    student: z.string().uuid()
               });

               const { teacher, student } = params.parse(request.params);

               await prisma.teachers.update({
                    where: {
                         id: teacher
                    },
                    data: {
                         students: {
                              connect: {
                                   id: student
                              }
                         }
                    }
               });

               return reply.status(200).send({
                    status: 'success',
                    message: 'Student added successfully.'
               });
          } catch (error) {
               console.log(error);

               return reply.status(500).send({
                    status: 'error',
                    message: `Ocorreu um erro: ${error}`
               });
          };
     });

     // REMOVER UM ALUNO DE UM PROFESSOR
     fastify.post('/teachers/:teacher/delete/:student', {
          preHandler: authenticate
     }, async (request, reply) => {
          try {
               const params = z.object({
                    teacher: z.string().uuid(),
                    student: z.string().uuid()
               });

               const { teacher, student } = params.parse(request.params);

               await prisma.teachers.update({
                    where: {
                         id: teacher
                    },
                    data: {
                         students: {
                              disconnect: {
                                   id: student
                              }
                         }
                    }
               });

               return reply.status(200).send({
                    status: 'success',
                    message: 'Student removed successfully.'
               });
          } catch (error) {
               console.log(error);

               return reply.status(500).send({
                    status: 'error',
                    message: `Ocorreu um erro: ${error}`
               });
          };
     });

     // BUSCA O NOME DO ALUNO
     fastify.get('/teachers/:id/name', {
          preHandler: authenticate
     }, async (request, reply) => {
          try {
               const params = z.object({
                    id: z.string().uuid()
               });

               const { id } = params.parse(request.params);

               const student = await prisma.teachers.findFirst({
                    where: {
                         id
                    },
                    select: {
                         name: true
                    }
               });

               if (!student) return reply.status(400).send({
                    status: 'error',
                    message: 'student not found.'
               });

               return reply.status(200).send({ student });
          } catch (error) {
               console.log(error);

               return reply.status(500).send({
                    status: 'error',
                    message: `Ocorreu um erro: ${error}`
               });
          };
     });

     // ATUALIZA O NOME DO ALUNO
     fastify.patch('/teachers/:id/name', {
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

               const student = await prisma.teachers.findFirst({
                    where: {
                         id
                    }
               });

               if (!student) return reply.status(400).send({
                    status: 'error',
                    message: 'student not found.'
               });

               await prisma.teachers.update({
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

     // BUSCA O E-MAIL DO ALUNO
     fastify.get('/teachers/:id/email', {
          preHandler: authenticate
     }, async (request, reply) => {
          try {
               const params = z.object({
                    id: z.string().uuid()
               });

               const { id } = params.parse(request.params);

               const student = await prisma.teachers.findFirst({
                    where: {
                         id
                    },
                    select: {
                         email: true
                    }
               });

               if (!student) return reply.status(400).send({
                    status: 'error',
                    message: 'student not found.'
               });

               return reply.status(200).send({ student });
          } catch (error) {
               console.log(error);

               return reply.status(500).send({
                    status: 'error',
                    message: `Ocorreu um erro: ${error}`
               });
          };
     });

     // ATUALIZA O E-MAIL DO ALUNO
     fastify.patch('/teachers/:id/email', {
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

               const student = await prisma.teachers.findFirst({
                    where: {
                         id
                    }
               });

               if (!student) return reply.status(400).send({
                    status: 'error',
                    message: 'student not found.'
               });

               await prisma.teachers.update({
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

     // BUSCA O TELEFONE DO ALUNO
     fastify.get('/teachers/:id/telephone', {
          preHandler: authenticate
     }, async (request, reply) => {
          try {
               const params = z.object({
                    id: z.string().uuid()
               });

               const { id } = params.parse(request.params);

               const student = await prisma.teachers.findFirst({
                    where: {
                         id
                    },
                    select: {
                         telephone: true
                    }
               });

               if (!student) return reply.status(400).send({
                    status: 'error',
                    message: 'student not found.'
               });

               return reply.status(200).send({ student });
          } catch (error) {
               console.log(error);

               return reply.status(500).send({
                    status: 'error',
                    message: `Ocorreu um erro: ${error}`
               });
          };
     });

     // ATUALIZA O TELEFONE DO ALUNO
     fastify.patch('/teachers/:id/telephone', {
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

               const student = await prisma.teachers.findFirst({
                    where: {
                         id
                    }
               });

               if (!student) return reply.status(400).send({
                    status: 'error',
                    message: 'student not found.'
               });

               await prisma.teachers.update({
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

     // BUSCA O ENDEREÇO DO ALUNO
     fastify.get('/teachers/:id/address', {
          preHandler: authenticate
     }, async (request, reply) => {
          try {
               const params = z.object({
                    id: z.string().uuid()
               });

               const { id } = params.parse(request.params);

               const student = await prisma.teachers.findFirst({
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

               if (!student) return reply.status(400).send({
                    status: 'error',
                    message: 'student not found.'
               });

               return reply.status(200).send({ student });
          } catch (error) {
               console.log(error);

               return reply.status(500).send({
                    status: 'error',
                    message: `Ocorreu um erro: ${error}`
               });
          };
     });

     // ATUALIZA O ENDEREÇO DO ALUNO
     fastify.patch('/teachers/:id/address', {
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

               const student = await prisma.teachers.findFirst({
                    where: {
                         id
                    }
               });

               if (!student) return reply.status(400).send({
                    status: 'error',
                    message: 'student not found.'
               });

               await prisma.teachers.update({
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
                    message: 'Endereço editado com sucesso.'
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