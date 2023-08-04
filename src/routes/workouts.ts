import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { authenticate } from '../plugins/authenticate';

export async function workoutsRoutes(fastify: FastifyInstance) {
     fastify.get('/workouts/:id', {
          preHandler: authenticate
     }, async (request, reply) => {
          try {
               const paramsSchema = z.object({
                    id: z.string().uuid()
               });

               const { id } = paramsSchema.parse(request.params);

               const workouts = await prisma.workouts.findMany({
                    where: {
                         id
                    },
                    select: {
                         active: true,
                         exercises: {
                              select: {
                                   annotations: true,
                                   id: true,
                                   name: true,
                                   repetitions: true,
                                   restTime: true,
                                   series: true,
                                   weight: true
                              }
                         },
                         focus: true,
                         id: true,
                         type: true
                    }
               });

               return reply.status(200).send(workouts);
          } catch (error) {
               console.log(error);

               return reply.status(500).send({
                    status: 'error',
                    message: `An error occurred: ${error}`,
               });
          };
     });

     fastify.post('/workouts/:sheetsId', {
          preHandler: authenticate,
     }, async (request, reply) => {
          try {
               const bodySchema = z.object({
                    type: z.string(),
                    focus: z.string()
               });

               const paramsSchema = z.object({
                    sheetsId: z.string().uuid()
               });

               const { type, focus } = bodySchema.parse(request.body);

               const { sheetsId } = paramsSchema.parse(request.params);

               const existingSheet = await prisma.sheets.findUnique({
                    where: {
                         id: sheetsId,
                    },
               });

               if (!existingSheet) {
                    return reply.status(404).send({
                         status: 'error',
                         message: 'Sheet not found.',
                    });
               }

               const newWorkout = await prisma.workouts.create({
                    data: {
                         sheetsId,
                         type,
                         focus,
                         active: true,
                    },
               });

               return reply.status(201).send({
                    status: 'success',
                    message: 'Workout created successfully.',
                    workout: newWorkout,
               });
          } catch (error) {
               console.log(error);

               return reply.status(500).send({
                    status: 'error',
                    message: `An error occurred: ${error}`,
               });
          };
     });

     fastify.delete('/workouts/:id/delete', {
          preHandler: authenticate,
     }, async (request, reply) => {
          try {
               const paramsSchema = z.object({
                    id: z.string().uuid()
               });

               const { id } = paramsSchema.parse(request.params);

               await prisma.workouts.delete({
                    where: {
                         id
                    }
               });

               return reply.status(200).send({
                    status: 'success',
                    message: 'Exercise deleted successfully.'
               });
          } catch (error) {
               console.log(error);

               return reply.status(500).send({
                    status: 'error',
                    message: `An error occurred: ${error}`,
               });
          }
     });
};