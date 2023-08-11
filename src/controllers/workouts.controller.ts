import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';

export async function getWorkoutDetails(request: Request, response: Response) {
     const paramsSchema = z.object({
          id: z.string().uuid()
     });

     const { id } = paramsSchema.parse(request.params);

     try {
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

          return response.status(200).send(workouts);
     } catch (error) {
          console.log(error);

          return response.status(500).send({
               status: 'error',
               message: `An error occurred: ${error}`,
          });
     };
};

export async function createWorkout(request: Request, response: Response) {
     const bodySchema = z.object({
          type: z.string(),
          focus: z.string()
     });

     const paramsSchema = z.object({
          id: z.string().uuid()
     });

     const { type, focus } = bodySchema.parse(request.body);

     const { id } = paramsSchema.parse(request.params);

     try {
          const existingSheet = await prisma.sheets.findUnique({
               where: {
                    id: id,
               },
          });

          if (!existingSheet) {
               return response.status(404).send({
                    status: 'error',
                    message: 'Sheet not found.',
               });
          }

          const newWorkout = await prisma.workouts.create({
               data: {
                    sheetsId: id,
                    type,
                    focus,
                    active: true,
               },
          });

          return response.status(201).send({
               status: 'success',
               message: 'Workout created successfully.',
               workout: newWorkout,
          });
     } catch (error) {
          console.log(error);

          return response.status(500).send({
               status: 'error',
               message: `An error occurred: ${error}`,
          });
     };
};

export async function deleteWorkout(request: Request, response: Response) {
     const paramsSchema = z.object({
          id: z.string().uuid()
     });

     const { id } = paramsSchema.parse(request.params);

     try {
          await prisma.workouts.delete({
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