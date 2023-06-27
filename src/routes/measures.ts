import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { authenticate } from '../plugins/authenticate';

export async function measuresRoutes(fastify: FastifyInstance) {
     fastify.get('/measures', async (request, reply) => {
          const measures = await prisma.measures.findMany({
               select: {
                    arm: true,
                    bmi: true,
                    bodyFat: true,
                    height: true,
                    hip: true,
                    thigh: true,
                    waist: true,
                    weight: true,
                    wingspan: true,
                    student: {
                         select: {
                              name: true,
                              username: true
                         }
                    }
               }
          });

          return { measures };
     });

     fastify.post('/measures', async (request, reply) => {
          try {
               const measureBody = z.object({
                    studentId: z.string().uuid(),
                    height: z.string(),
                    weight: z.string(),
                    bmi: z.string(),
                    wingspan: z.string(),
                    waist: z.string(),
                    hip: z.string(),
                    arm: z.string(),
                    thigh: z.string(),
                    bodyFat: z.string()
               });

               const measureData = measureBody.parse(request.body);

               await prisma.measures.create({
                    data: {
                         studentId: measureData.studentId,
                         height: measureData.height,
                         weight: measureData.weight,
                         bmi: measureData.bmi,
                         wingspan: measureData.wingspan,
                         waist: measureData.waist,
                         hip: measureData.hip,
                         arm: measureData.arm,
                         thigh: measureData.thigh,
                         bodyFat: measureData.bodyFat,
                    },
               });

               return reply.status(201).send({
                    status: 'success',
                    message: 'Medidas criadas com sucesso!'
               });
          } catch (error) {
               console.log(error);

               return reply.status(500).send({
                    status: 'error',
                    message: `Ocorreu um erro: ${error}`
               });
          };
     });

     fastify.put('/measures/:id', async (request, reply) => {
          try {
               const measureParams = z.object({
                    id: z.string().uuid()
               });

               const { id } = measureParams.parse(request.params);

               const measureBody = z.object({
                    height: z.string(),
                    weight: z.string(),
                    bmi: z.string(),
                    wingspan: z.string(),
                    waist: z.string(),
                    hip: z.string(),
                    arm: z.string(),
                    thigh: z.string(),
                    bodyFat: z.string()
               });

               const measureData = measureBody.parse(request.body);

               await prisma.measures.update({
                    where: {
                         id
                    },
                    data: {
                         height: measureData.height,
                         weight: measureData.weight,
                         bmi: measureData.bmi,
                         wingspan: measureData.wingspan,
                         waist: measureData.waist,
                         hip: measureData.hip,
                         arm: measureData.arm,
                         thigh: measureData.thigh,
                         bodyFat: measureData.bodyFat,
                    }
               });

               return reply.status(201).send({
                    status: 'success',
                    message: 'Medidas alteradas com sucesso!'
               });
          } catch (error) {
               console.log(error);

               return reply.status(500).send({
                    status: 'error',
                    message: `Ocorreu um erro: ${error}`
               });
          };
     });
};