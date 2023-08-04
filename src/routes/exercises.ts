import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { authenticate } from '../plugins/authenticate';

export async function exercisesRoutes(fastify: FastifyInstance) {
     // BUSCA A LISTA DE EXERCÍCIOS DE UM ALUNO
     fastify.get('/exercises/:id', {
          preHandler: authenticate
     }, async (request, reply) => {
          try {
               const params = z.object({
                    id: z.string().uuid()
               });

               const { id } = params.parse(request.params);

               const exercises = await prisma.exercises.findUnique({
                    where: {
                         id
                    },
                    select: {
                         id: true,
                         annotations: true,
                         name: true,
                         repetitions: true,
                         restTime: true,
                         series: true,
                         weight: true
                    }
               });

               return reply.status(200).send(exercises);
          } catch (error) {
               console.log(error);

               return reply.status(500).send({
                    status: 'error',
                    message: `An error occurred: ${error}`,
               });
          }
     });

     // CRIA UM EXERCÍCIO EM UM TREINO
     fastify.post('/exercises/:workoutsId', {
          preHandler: authenticate,
     }, async (request, reply) => {
          try {
               const bodySchema = z.object({
                    name: z.string(),
                    series: z.string(),
                    repetitions: z.string(),
                    restTime: z.string(),
                    weight: z.string().nullable(),
                    annotations: z.string().nullable(),
               });

               const paramsSchema = z.object({
                    workoutsId: z.string().uuid()
               });

               const {
                    name,
                    series,
                    repetitions,
                    restTime,
                    weight,
                    annotations
               } = bodySchema.parse(request.body);

               const { workoutsId } = paramsSchema.parse(request.params);

               // Verificar se o workout associado (exerciseId) existe
               const existingWorkout = await prisma.workouts.findUnique({
                    where: {
                         id: workoutsId,
                    },
               });

               if (!existingWorkout) {
                    return reply.status(404).send({
                         status: 'error',
                         message: 'Workout not found.',
                    });
               };

               await prisma.exercises.create({
                    data: {
                         name,
                         repetitions,
                         restTime,
                         series,
                         annotations,
                         weight,
                         workoutsId
                    }
               });

               return reply.status(201).send({
                    status: 'success',
                    message: 'Exercise created successfully.'
               });
          } catch (error) {
               console.log(error);

               return reply.status(500).send({
                    status: 'error',
                    message: `An error occurred: ${error}`,
               });
          };
     });

     fastify.post('/exercises/:id/edit', {
          preHandler: authenticate,
     }, async (request, reply) => {
          try {
               const bodySchema = z.object({
                    name: z.string(),
                    series: z.string(),
                    repetitions: z.string(),
                    restTime: z.string(),
                    weight: z.string().nullable(),
                    annotations: z.string().nullable(),
               });

               const paramsSchema = z.object({
                    id: z.string().uuid()
               });

               const {
                    name,
                    series,
                    repetitions,
                    restTime,
                    weight,
                    annotations
               } = bodySchema.parse(request.body);

               const { id } = paramsSchema.parse(request.params);

               await prisma.exercises.update({
                    where: {
                         id
                    },
                    data: {
                         name,
                         repetitions,
                         restTime,
                         series,
                         annotations,
                         weight
                    }
               });

               return reply.status(200).send({
                    status: 'success',
                    message: 'Exercise created successfully.'
               });
          } catch (error) {
               console.log(error);

               return reply.status(500).send({
                    status: 'error',
                    message: `An error occurred: ${error}`,
               });
          };
     });

     fastify.delete('/exercises/:id/delete', {
          preHandler: authenticate,
     }, async (request, reply) => {
          try {
               const paramsSchema = z.object({
                    id: z.string().uuid()
               });

               const { id } = paramsSchema.parse(request.params);

               await prisma.exercises.delete({
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