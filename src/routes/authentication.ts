import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import bcrypt from 'bcrypt';
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
     host: process.env.SMTP_HOST,
     port: process.env.SMTP_PORT,
     secure: true,
     auth: {
          // TODO: replace `user` and `pass` values from <https://forwardemail.net>
          user: process.env.SMTP_USERNAME,
          pass: process.env.SMTP_PASSWORD
     }
});

function generateRandomString(length: number) {
     let result = '';

     const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
     const charactersLength = characters.length;

     for (let i = 0; i < length; i++) {
          const randomIndex = Math.floor(Math.random() * charactersLength);
          result += characters.charAt(randomIndex);
     };

     return result;
};

export async function authenticationRoutes(fastify: FastifyInstance) {
     // LOGIN PARA ALUNOS
     fastify.post('/students/login', async (request, reply) => {
          try {
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
          } catch (error) {
               console.log(error);

               return reply.status(500).send({
                    status: 'error',
                    message: `An error occurred: ${error}`,
               });
          };
     });

     // LOGIN PARA PROFESSORES
     fastify.post('/teachers/login', async (request, reply) => {
          try {
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
          } catch (error) {
               console.log(error);

               return reply.status(500).send({
                    status: 'error',
                    message: `An error occurred: ${error}`,
               });
          };
     });

     // VERIFICAR DISPONIBILIDADE DE E-MAIL PARA ALUNOS
     fastify.post('/students/verify-email', async (request, reply) => {
          try {
               const bodySchema = z.object({
                    email: z.string()
               });

               const { email } = bodySchema.parse(request.body);

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

               const code = generateRandomString(6);

               const emailExists = await prisma.verificationCode.findUnique({
                    where: {
                         email
                    }
               });

               if (emailExists) {
                    await prisma.verificationCode.update({
                         where: {
                              email
                         },
                         data: {
                              code
                         }
                    });
               } else {
                    await prisma.verificationCode.create({
                         data: {
                              code,
                              email
                         }
                    });
               };

               transporter.sendMail({
                    from: 'cristhovamlucas@gmail.com',
                    to: email,
                    subject: code + ' é o seu código de acesso',
                    html: `<div style="margin: 0 auto; padding: 50px; font-family: sans-serif; text-align: center;">
                         <h1>
                              Olá!
                         </h1>
                         <p style="">
                              Use o código informado neste email para autorizar o acesso à sua conta no GymPro.
                         </p>
                         <h1 style="font-size: 24px; letter-spacing: 10px;">
                              ${code}
                         </h1>
                    </div>`,
               });

               return reply.status(200).send({
                    status: 'success',
                    message: 'E-mail não utilizado.'
               });
          } catch (error) {
               console.log(error);

               return reply.status(500).send({
                    status: 'error',
                    message: `An error occurred: ${error}`,
               });
          };
     });

     // VERIFICAR DISPONIBILIDADE DE E-MAIL PARA PROFESSORES
     fastify.post('/teachers/verify-email', async (request, reply) => {
          try {
               const bodySchema = z.object({
                    email: z.string()
               });

               const { email } = bodySchema.parse(request.body);

               const teacher = await prisma.teachers.findUnique({
                    where: {
                         email
                    }
               });

               if (teacher?.email === email) {
                    return reply.status(200).send({
                         status: 'error',
                         message: 'Este e-mail está em uso.'
                    });
               };

               const code = generateRandomString(6);

               const emailExists = await prisma.verificationCode.findUnique({
                    where: {
                         email
                    }
               });

               if (emailExists) {
                    await prisma.verificationCode.update({
                         where: {
                              email
                         },
                         data: {
                              code
                         }
                    });
               } else {
                    await prisma.verificationCode.create({
                         data: {
                              code,
                              email
                         }
                    });
               };

               return reply.status(200).send({
                    status: 'success',
                    message: 'E-mail não utilizado.'
               });
          } catch (error) {
               console.log(error);

               return reply.status(500).send({
                    status: 'error',
                    message: `An error occurred: ${error}`,
               });
          };
     });

     fastify.get('/confirm-email', async (request, reply) => {
          try {
               const bodySchema = z.object({
                    email: z.string(),
                    code: z.string()
               });

               const { email, code } = bodySchema.parse(request.body);

               const emailExists = await prisma.verificationCode.findUnique({
                    where: {
                         email
                    }
               });

               if (emailExists) {
                    const checkCode = await prisma.verificationCode.findUnique({
                         where: {
                              email
                         },
                         select: {
                              code: true
                         }
                    });

                    // if (checkCode === code) {

                    // };
               };
          } catch (error) {
               console.log(error);

               return reply.status(500).send({
                    status: 'error',
                    message: `An error occurred: ${error}`,
               });
          };
     });
};