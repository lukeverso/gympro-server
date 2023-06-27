import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import fastifyJwt from '@fastify/jwt';

export async function authenticationRoutes(fastify: FastifyInstance) {
     fastify.post('/login', async (request, reply) => {
          const loginBody = z.object({
               email: z.string(),
               password: z.string()
          });

          const { email, password } = loginBody.parse(request.body);

          const userExists = await prisma.student.findFirst({
               where: {
                    email
               },
          });

          if (!userExists) return reply.status(400).send({
               status: 'error',
               message: 'User not found.'
          });

          const passwordMatch = await bcrypt.compare(password, userExists.password);

          if (!passwordMatch) return reply.status(400).send({
               status: 'error',
               message: 'Passwords do not match.'
          });

          const token = fastify.jwt.sign({
               email: userExists.email,
               username: userExists.username
          }, {
               sub: userExists.id,
               expiresIn: ''
          });
     });
};