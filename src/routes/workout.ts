import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma';

export async function workoutRoutes(fastify: FastifyInstance) {
     fastify.get('/workouts', async (request, reply) => {
          
     });
};