import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { authenticate } from '../plugins/authenticate';

export async function measuresRoutes(fastify: FastifyInstance) {
     // Store a student's measures
     fastify.post('/measures/:id', async (request, reply) => {
          try {
               const measuresParams = z.object({
                    id: z.string().uuid()
               });

               const { id } = measuresParams.parse(request.params);

               const measureBody = z.object({
                    height: z.string(),
                    weight: z.string(),
                    bmi: z.string(),
                    wingspan: z.string(),
                    waist: z.string(),
                    hip: z.string(),
                    arm: z.string(),
                    thigh: z.string(),
                    calf: z.string(),
                    bodyFat: z.string()
               });

               const {
                    height,
                    weight,
                    bmi,
                    wingspan,
                    waist,
                    hip,
                    arm,
                    thigh,
                    calf,
                    bodyFat,
               } = measureBody.parse(request.body);

               await prisma.measures.create({
                    data: {
                         studentId: id,
                         height: height,
                         weight: weight,
                         bmi: bmi,
                         wingspan: wingspan,
                         waist: waist,
                         hip: hip,
                         arm: arm,
                         thigh: thigh,
                         calf: calf,
                         bodyFat: bodyFat,
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

     // Edit a student's measures
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
                    calf: z.string(),
                    bodyFat: z.string()
               });

               const {
                    height,
                    weight,
                    bmi,
                    wingspan,
                    waist,
                    hip,
                    arm,
                    thigh,
                    calf,
                    bodyFat,
               } = measureBody.parse(request.body);

               await prisma.measures.update({
                    where: {
                         id
                    },
                    data: {
                         height,
                         weight,
                         bmi,
                         wingspan,
                         waist,
                         hip,
                         arm,
                         thigh,
                         calf,
                         bodyFat,
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