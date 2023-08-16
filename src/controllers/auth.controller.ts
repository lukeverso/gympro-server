import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

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
               expiresIn: '7 days'
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
               expiresIn: '7 days'
          });

          const teacher = {
               id: teacherExists.id
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

          if (student?.email === email) {
               return response.status(200).send({
                    status: 'error',
                    message: 'Este e-mail está em uso.'
               });
          };

          const code = generateRandomString(6);

          await prisma.verificationCodes.create({
               data: {
                    code,
                    email
               }
          });

          const transport = nodemailer.createTransport({
               host: 'smtp-relay.brevo.com',
               port: 587,
               auth: {
                    user: 'cristhovamlucas@gmail.com',
                    pass: 'FcvrRdD28JPCbwLs'
               }
          });

          const html = ``;

          transport.sendMail({
               to: email,
               from: 'cristhovamlucas@gmail.com',
               subject: 'Código de autorização',
               text: `Seu código de autorização é o ${code}`
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

          if (teacher?.email === email) {
               return response.status(200).send({
                    status: 'error',
                    message: 'Este e-mail está em uso.'
               });
          };

          const code = generateRandomString(6);

          const emailExists = await prisma.verificationCodes.findUnique({
               where: {
                    email
               }
          });

          if (emailExists) {
               await prisma.verificationCodes.update({
                    where: {
                         email
                    },
                    data: {
                         code
                    }
               });
          } else {
               await prisma.verificationCodes.create({
                    data: {
                         code,
                         email
                    }
               });
          };

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
               }
          });

          if (emailExists) {
               const checkCode = await prisma.verificationCodes.findUnique({
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

          return response.status(500).send({
               status: 'error',
               message: `An error occurred: ${error}`,
          });
     };
};