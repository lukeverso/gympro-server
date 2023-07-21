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

export async function studentsRoutes(fastify: FastifyInstance) {
     // VERIFICAR DISPONIBILIDADE DE E-MAIL PARA ALUNOS
     fastify.post('/students/verify-email', async (request, reply) => {
          try {
               const querySchema = z.object({
                    email: z.string().email()
               });

               const { email } = querySchema.parse(request.query);

               const student = await prisma.students.findUnique({
                    where: {
                         email
                    }
               });

               if (student?.email === email) {
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

     // CRIAR UM ALUNO
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

     // RECEBE OS DADOS DO ALUNO LOGADO
     fastify.get('/students/:id', {
          preHandler: authenticate
     }, async (request, reply) => {
          try {
               const requestParams = z.object({
                    id: z.string()
               });

               const { id } = requestParams.parse(request.params);

               const response = await prisma.students.findUnique({
                    where: {
                         id
                    },
                    select: {
                         name: true,
                         teacher: {
                              select: {
                                   name: true,
                                   birthdate: true,
                                   email: true,
                                   telephone: true
                              }
                         },
                         sheets: {
                              select: {
                                   id: true,
                                   active: true,
                                   annotations: true,
                                   objective: true,
                                   startDate: true,
                                   endDate: true,
                                   workouts: {
                                        select: {
                                             id: true,
                                             focus: true,
                                             active: true,
                                             type: true
                                        }
                                   }
                              }
                         }
                    }
               });

               return reply.status(200).send({ response });
          } catch (error) {
               console.log(error);

               return reply.status(500).send({
                    status: 'error',
                    message: `Ocorreu um erro: ${error}`
               });
          };
     });

     fastify.get('/students/details/:id', {
          preHandler: authenticate
     }, async (request, reply) => {
          try {
               const requestParams = z.object({
                    id: z.string()
               });

               const { id } = requestParams.parse(request.params);

               const details = await prisma.students.findUnique({
                    where: {
                         id
                    },
                    select: {
                         name: true,
                         birthdate: true,
                         email: true,
                         telephone: true,
                         status: true,
                         sheets: {
                              select: {
                                   workouts: {
                                        select: {
                                             focus: true
                                        }
                                   }
                              }
                         }
                    }
               });

               if (!details) {
                    return reply.status(404).send({
                         status: 'error',
                         message: 'Student not found.'
                    });
               }

               const age = calculateAge(details.birthdate);

               const studentDetails = {
                    ...details,
                    age
               };

               return reply.status(200).send(studentDetails);
          } catch (error) {
               console.log(error);

               return reply.status(500).send({
                    status: 'error',
                    message: `Ocorreu um erro: ${error}`
               });
          }
     });

     // APAGAR UM ALUNO
     fastify.delete('/students/:id', {
          preHandler: authenticate
     }, async (request, reply) => {
          try {
               const params = z.object({
                    id: z.string().uuid()
               });

               const { id } = params.parse(request.body);

               const student = await prisma.students.findFirst({
                    where: {
                         id
                    },
               });

               if (!student) return reply.status(400).send({
                    status: 'error',
                    message: 'student not found.'
               });

               await prisma.students.delete({
                    where: {
                         id
                    },
               });

               return reply.status(200).send({
                    status: 'success',
                    message: 'student deleted with success.'
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
     fastify.get('/students/:id/name', {
          preHandler: authenticate
     }, async (request, reply) => {
          try {
               const params = z.object({
                    id: z.string().uuid()
               });

               const { id } = params.parse(request.params);

               const student = await prisma.students.findFirst({
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
     fastify.patch('/students/:id/name', {
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

               const student = await prisma.students.findFirst({
                    where: {
                         id
                    }
               });

               if (!student) return reply.status(400).send({
                    status: 'error',
                    message: 'student not found.'
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

     // BUSCA O E-MAIL DO ALUNO
     fastify.get('/students/:id/email', {
          preHandler: authenticate
     }, async (request, reply) => {
          try {
               const params = z.object({
                    id: z.string().uuid()
               });

               const { id } = params.parse(request.params);

               const student = await prisma.students.findFirst({
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
     fastify.patch('/students/:id/email', {
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

               const student = await prisma.students.findFirst({
                    where: {
                         id
                    }
               });

               if (!student) return reply.status(400).send({
                    status: 'error',
                    message: 'student not found.'
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

     // BUSCA O TELEFONE DO ALUNO
     fastify.get('/students/:id/telephone', {
          preHandler: authenticate
     }, async (request, reply) => {
          try {
               const params = z.object({
                    id: z.string().uuid()
               });

               const { id } = params.parse(request.params);

               const student = await prisma.students.findFirst({
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
     fastify.patch('/students/:id/telephone', {
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

               const student = await prisma.students.findFirst({
                    where: {
                         id
                    }
               });

               if (!student) return reply.status(400).send({
                    status: 'error',
                    message: 'student not found.'
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

     // BUSCA O ENDEREÇO DO ALUNO
     fastify.get('/students/:id/address', {
          preHandler: authenticate
     }, async (request, reply) => {
          try {
               const params = z.object({
                    id: z.string().uuid()
               });

               const { id } = params.parse(request.params);

               const student = await prisma.students.findFirst({
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
     fastify.patch('/students/:id/address', {
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

               const student = await prisma.students.findFirst({
                    where: {
                         id
                    }
               });

               if (!student) return reply.status(400).send({
                    status: 'error',
                    message: 'student not found.'
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

     // BUSCA AS MEDIDAS DO ALUNO
     fastify.get('/students/:id/measures', {
          preHandler: authenticate
     }, async (request, reply) => {
          try {
               const params = z.object({
                    id: z.string().uuid()
               });

               const { id } = params.parse(request.params);

               const measures = await prisma.students.findFirst({
                    where: {
                         id
                    },
                    select: {
                         measures: {
                              select: {
                                   arm: true,
                                   bmi: true,
                                   calf: true,
                                   chest: true,
                                   height: true,
                                   hip: true,
                                   shoulders: true,
                                   thigh: true,
                                   waist: true,
                                   weight: true,
                                   wingspan: true
                              },
                              orderBy: {
                                   createdAt: 'desc'
                              }
                         }
                    }
               });

               if (!measures) return reply.status(400).send({
                    status: 'error',
                    message: 'Measures not found.'
               });

               return reply.status(200).send({ measures: measures.measures[0] });
          } catch (error) {
               console.log(error);

               return reply.status(500).send({
                    status: 'error',
                    message: `Ocorreu um erro: ${error}`
               });
          };
     });

     // ATUALIZA AS MEDIDAS DO ALUNO
     fastify.post('/students/:id/measures', {
          preHandler: authenticate
     }, async (request, reply) => {
          try {
               const params = z.object({
                    id: z.string().uuid()
               });

               const { id } = params.parse(request.params);

               const body = z.object({
                    arm: z.string(),
                    bmi: z.string(),
                    calf: z.string(),
                    chest: z.string(),
                    height: z.string(),
                    hip: z.string(),
                    shoulders: z.string(),
                    thigh: z.string(),
                    waist: z.string(),
                    weight: z.string(),
                    wingspan: z.string()
               });

               const {
                    arm,
                    bmi,
                    calf,
                    chest,
                    height,
                    hip,
                    shoulders,
                    thigh,
                    waist,
                    weight,
                    wingspan
               } = body.parse(request.body);

               const student = await prisma.students.findFirst({
                    where: {
                         id
                    }
               });

               if (!student) return reply.status(400).send({
                    status: 'error',
                    message: 'student not found.'
               });

               await prisma.measures.create({
                    data: {
                         studentsId: id,
                         arm,
                         bmi,
                         calf,
                         chest,
                         height,
                         hip,
                         shoulders,
                         thigh,
                         waist,
                         weight,
                         wingspan
                    }
               });

               return reply.status(200).send({
                    status: 'success',
                    message: 'Medidas alteradas com sucesso.'
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