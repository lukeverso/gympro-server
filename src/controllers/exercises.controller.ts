import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';

export async function getStudentExercises(request: Request, response: Response) {
     const params = z.object({
          id: z.string().uuid()
     });

     const { id } = params.parse(request.params);

     try {
          const exercises = await prisma.workouts.findUnique({
               where: {
                    id
               },
               select: {
                    focus: true,
                    type: true,
                    exercises: {
                         select: {
                              id: true,
                              annotations: true,
                              name: true,
                              repetitions: true,
                              restTime: true,
                              series: true,
                              weight: true
                         }
                    }
               }
          });

          return response.status(200).send(exercises);
     } catch (error) {
          console.log(error);

          return response.status(500).send({
               status: 'error',
               message: `An error occurred: ${error}`,
          });
     };
};

export async function createExercise(request: Request, response: Response) {
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

     try {
          const existingWorkout = await prisma.workouts.findUnique({
               where: {
                    id: workoutsId,
               },
          });

          if (!existingWorkout) {
               return response.status(404).send({
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

          return response.status(201).send({
               status: 'success',
               message: 'Exercise created successfully.'
          });
     } catch (error) {
          console.log(error);

          return response.status(500).send({
               status: 'error',
               message: `An error occurred: ${error}`,
          });
     };
};

export async function getExercise(request: Request, response: Response) {
     const paramsSchema = z.object({
          id: z.string().uuid()
     });

     const { id } = paramsSchema.parse(request.params);

     try {
          const exercise = await prisma.exercises.findUnique({
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
     } catch (error) {
          console.log(error);

          return response.status(500).send({
               status: 'error',
               message: `An error occurred: ${error}`,
          });
     };
};

export async function updateExercise(request: Request, response: Response) {
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

     try {
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

          return response.status(200).send({
               status: 'success',
               message: 'Exercise created successfully.'
          });
     } catch (error) {
          console.log(error);

          return response.status(500).send({
               status: 'error',
               message: `An error occurred: ${error}`,
          });
     };
};

export async function deleteExercise(request: Request, response: Response) {
     const paramsSchema = z.object({
          id: z.string().uuid()
     });

     const { id } = paramsSchema.parse(request.params);

     try {
          await prisma.exercises.delete({
               where: {
                    id
               }
          });

          return response.status(200).send({
               status: 'success',
               message: 'Exercise deleted successfully.'
          });
     } catch (error) {
          console.log(error);

          return response.status(500).send({
               status: 'error',
               message: `An error occurred: ${error}`,
          });
     };
};