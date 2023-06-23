import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { authenticate } from '../plugins/authenticate';

export async function usersRoutes(fastify: FastifyInstance) {
     // List all users
     fastify.get('/users', async (request, reply) => {
          const users = await prisma.user.findMany();

          return reply.status(200).send({
               status: 'success',
               data: users
          });
     });

     // Create new user
     fastify.post('/users', async (request, reply) => {
          const userSchema = z.object({
               name: z.string(),
               username: z.string(),
               email: z.string().email(),
               password: z.string(),
               birthdate: z.string(),
               telephone: z.string(),
               role: z.string(),
               measure: z.object({
                    height: z.string(),
                    weight: z.string(),
                    bmi: z.string(),
                    wingspan: z.string().nullable(),
                    waist: z.string().nullable(),
                    hip: z.string().nullable(),
                    arm: z.string().nullable(),
                    thigh: z.string().nullable(),
                    bodyFat: z.string().nullable()
               }),
               address: z.object({
                    street: z.string(),
                    number: z.string(),
                    complement: z.string().nullable(),
                    code: z.string(),
                    city: z.string(),
                    country: z.string()
               }),
          });

          const userInfo = userSchema.parse(request.body);

          const userExists = await prisma.user.findFirst({
               where: {
                    OR: [
                         {
                              username: userInfo.username
                         },
                         {
                              email: userInfo.email
                         }
                    ]
               }
          });

          if (userExists) return reply.status(400).send({
               status: 'error',
               message: 'Username or e-mail already in use'
          });

          const user = await prisma.user.create({
               data: {
                    name: userInfo.name,
                    username: userInfo.username,
                    email: userInfo.email,
                    password: userInfo.password,
                    birthdate: userInfo.birthdate,
                    telephone: userInfo.telephone,
                    role: userInfo.role,
                    measure: {
                         create: {
                              height: userInfo.measure?.height,
                              weight: userInfo.measure?.weight,
                              bmi: userInfo.measure?.bmi,
                              wingspan: userInfo.measure?.wingspan,
                              waist: userInfo.measure?.waist,
                              hip: userInfo.measure?.hip,
                              arm: userInfo.measure?.arm,
                              thigh: userInfo.measure?.thigh,
                              bodyFat: userInfo.measure?.bodyFat,
                         }
                    },
                    address: {
                         create: {
                              street: userInfo.address.street,
                              number: userInfo.address.number,
                              complement: userInfo.address?.complement,
                              code: userInfo.address.code,
                              city: userInfo.address.city,
                              country: userInfo.address.country,
                         }
                    }
               }
          });

          if (user) return reply.status(200).send({
               status: 'success',
               message: 'User was created successfully'
          });
     });
};