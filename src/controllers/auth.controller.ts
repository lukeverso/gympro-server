import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { nodemailerTransport } from '../lib/nodemailer';

function generateRandomCode(length: number) {
     let result = '';

     const characters = '0123456789';
     const charactersLength = characters.length;

     for (let i = 0; i < length; i++) {
          const randomIndex = Math.floor(Math.random() * charactersLength);
          result += characters.charAt(randomIndex);
     };

     return result;
};

export async function loginStudent(request: Request, response: Response) {
     const loginBody = z.object({
          email: z.string(),
          password: z.string()
     });

     const { email, password } = loginBody.parse(request.body);

     try {
          const studentExists = await prisma.students.findFirst({
               where: {
                    email
               },
          });

          if (!studentExists) return response.status(400).send({
               status: 'error',
               message: 'User not found.'
          });

          const passwordMatch = await bcrypt.compare(password, studentExists.password);

          if (!passwordMatch) return response.status(400).send({
               status: 'error',
               message: 'Passwords do not match.'
          });

          const token = jwt.sign({
               id: studentExists.id
          }, process.env.JWT_SECRET as string, {
               expiresIn: '24h'
          });

          const user = {
               id: studentExists.id
          };

          return response.status(200).send({
               user,
               token,
               message: 'Authenticated successfully.'
          });
     } catch (error) {
          console.log(error);

          return response.status(500).send({
               status: 'error',
               message: `An error occurred: ${error}`,
          });
     };
};

export async function loginTeacher(request: Request, response: Response) {
     const loginBody = z.object({
          email: z.string(),
          password: z.string()
     });

     const { email, password } = loginBody.parse(request.body);

     try {
          const teacherExists = await prisma.teachers.findFirst({
               where: {
                    email
               },
          });

          if (!teacherExists) return response.status(400).send({
               status: 'error',
               message: 'User not found.'
          });

          const passwordMatch = await bcrypt.compare(password, teacherExists.password);

          if (!passwordMatch) return response.status(400).send({
               status: 'error',
               message: 'Passwords do not match.'
          });

          const token = jwt.sign({
               id: teacherExists.id
          }, process.env.JWT_SECRET as string, {
               expiresIn: '24h'
          });

          const teacher = {
               id: teacherExists.id,
               name: teacherExists.name,
               email: teacherExists.email
          };

          return response.status(200).send({
               teacher,
               token,
               message: 'Authenticated successfully.'
          });
     } catch (error) {
          console.log(error);

          return response.status(500).send({
               status: 'error',
               message: `An error occurred: ${error}`,
          });
     };
};

export async function verifyMailForStudent(request: Request, response: Response) {
     const bodySchema = z.object({
          email: z.string()
     });

     const { email } = bodySchema.parse(request.body);

     try {
          const student = await prisma.students.findUnique({
               where: {
                    email
               }
          });

          const teacher = await prisma.teachers.findUnique({
               where: {
                    email
               }
          });

          if (student?.email === email || teacher?.email === email) {
               return response.status(200).send({
                    status: 'error',
                    message: 'Este e-mail está em uso.'
               });
          };

          const code = generateRandomCode(6);

          await prisma.verificationCodes.upsert({
               create: {
                    code,
                    email
               },
               update: {
                    code
               },
               where: {
                    email
               }
          });

          const transport = nodemailerTransport();

          const html = `<!DOCTYPE html>
          <html lang="pt-br">          
               <head>
                    <meta charset="utf-8">
                    <link rel="icon" href="/favicon.ico">
                    <link rel="preconnect" href="https://fonts.googleapis.com">
                    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet">
                    <style>
                         * {
                              font-family: 'Roboto', sans-serif;
                         }

                         body {
                              background: #EAEAEA;
                         }

                         .container {
                              width: 60%;
                              margin: 0 auto;
                              padding: 50px 70px;
                              background: #FFFFFF;
                              text-align: center;
                              display: block;
                         }
                         
                         .logo {
                              font-size: 32px;
                         }
                         
                         .text {
                              margin-bottom: 50px;
                              font-size: 20px;
                         }

                         .code {
                              font-size: 24px;
                              font-weight: 700;
                              padding: 10px 30px;
                              background: #EAEAEA;
                         }

                         .warning {
                              margin-top: 50px;
                              font-size: 12px;
                         }
                    </style>
               </head>
               <body>
                    <div class="container">
                         <p class="logo">Gym<strong>Pro</strong></p>
                         <h1 class="title">Olá!</h1>
                         <p class="text">
                              Use o código informado neste e-mail para autorizar o acesso à sua conta no app Gym<strong>Pro</strong>:
                         </p>
                         <span class="code">${code}</span>
                         <p class="warning">
                              Caso não esteja criando uma conta no <strong>GymPro</strong>, desconsidere este e-mail.<br/>
                         </p>
                    </div>
               </body>
          </html>`;

          transport.sendMail({
               to: email,
               from: 'contatogymproapp@gmail.com',
               subject: 'Código de autorização',
               html: html
          });

          return response.status(200).send({
               status: 'success',
               message: 'E-mail não utilizado.'
          });
     } catch (error) {
          console.log(error);

          return response.status(500).send({
               status: 'error',
               message: `An error occurred: ${error}`,
          });
     };
};

export async function verifyMailForTeacher(request: Request, response: Response) {
     const bodySchema = z.object({
          email: z.string()
     });

     const { email } = bodySchema.parse(request.body);

     try {
          const teacher = await prisma.teachers.findUnique({
               where: {
                    email
               }
          });

          const student = await prisma.students.findUnique({
               where: {
                    email
               }
          });

          if (teacher?.email === email || student?.email === email) {
               return response.status(400).send({
                    status: 'error',
                    message: 'Este e-mail está em uso.'
               });
          };

          const code = generateRandomCode(6);

          await prisma.verificationCodes.upsert({
               create: {
                    code,
                    email
               },
               update: {
                    code
               },
               where: {
                    email
               }
          });

          const transport = nodemailerTransport();

          const html = `<!DOCTYPE html>
          <html lang="pt-br">          
               <head>
                    <meta charset="utf-8">
                    <link rel="icon" href="/favicon.ico">
                    <link rel="preconnect" href="https://fonts.googleapis.com">
                    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet">
                    <style>
                         * {
                              font-family: 'Roboto', sans-serif;
                         }

                         body {
                              background: #EAEAEA;
                         }
                         
                         .logo {
                              width: 25%;
                              margin: 0 auto;
                         }
                         
                         .text {
                              margin-bottom: 50px;
                              font-size: 20px;
                         }

                         .code {
                              font-size: 24px;
                              font-weight: 700;
                              padding: 10px 30px;
                              background: #EAEAEA;
                         }

                         .warning {
                              margin-top: 50px;
                              font-size: 12px;
                         }
                    </style>
               </head>
               <body>
                    <div class="container">
                         <p class="logo">Gym<strong>Pro</strong></p>
                         <h1 class="title">Olá!</h1>
                         <p class="text">
                              Use o código informado neste e-mail para autorizar o acesso à sua conta no app Gym<strong>Pro</strong>:
                         </p>
                         <span class="code">${code}</span>
                         <p class="warning">
                              Caso não esteja criando uma conta no <strong>GymPro</strong>, desconsidere este e-mail.<br/>
                         </p>
                    </div>
               </body>
          </html>`;

          transport.sendMail({
               to: email,
               from: 'contatogymproapp@gmail.com',
               subject: 'Código de autorização',
               html: html
          });

          return response.status(200).send({
               status: 'success',
               message: 'E-mail não utilizado.'
          });
     } catch (error) {
          console.log(error);

          return response.status(500).send({
               status: 'error',
               message: `An error occurred: ${error}`,
          });
     };
};

export async function confirmVerificationCode(request: Request, response: Response) {
     try {
          const bodySchema = z.object({
               email: z.string(),
               code: z.string()
          });

          const { email, code } = bodySchema.parse(request.body);

          const emailExists = await prisma.verificationCodes.findUnique({
               where: {
                    email
               },
               select: {
                    email: true,
                    code: true
               }
          });

          if (emailExists) {
               if (code === emailExists.code) {
                    await prisma.verificationCodes.delete({
                         where: {
                              email
                         }
                    });

                    return response.status(200).send({
                         status: 'success',
                         message: 'Código verificado com sucesso.'
                    });
               } else {
                    return response.status(400).send({
                         status: 'error',
                         message: 'Código incorreto...'
                    });
               };
          };
     } catch (error) {
          console.log(error);

          return response.status(500).send({
               status: 'error',
               message: `An error occurred: ${error}`,
          });
     };
};