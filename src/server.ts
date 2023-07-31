import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import multer from 'fastify-multer';

import { authenticationRoutes } from './routes/authentication';
import { exercisesRoutes } from './routes/exercises';
import { measuresRoutes } from './routes/measures';
import { teachersRoutes } from './routes/teachers';
import { studentsRoutes } from './routes/students';
import { workoutsRoutes } from './routes/workouts';
import { notificationsRoutes } from './routes/notifications';
import { uploadRoutes } from './routes/upload';
import { sheetsRoutes } from './routes/sheets';

const fastify = Fastify();

fastify.register(multer.contentParser);

fastify.register(cors, {
     origin: true
});

fastify.register(jwt, {
     secret: 'gymprosystem'
});

fastify.register(authenticationRoutes);
fastify.register(exercisesRoutes);
fastify.register(measuresRoutes);
fastify.register(teachersRoutes);
fastify.register(studentsRoutes);
fastify.register(workoutsRoutes);
fastify.register(notificationsRoutes);
fastify.register(uploadRoutes);
fastify.register(sheetsRoutes);

fastify
     .listen({
          port: 3333,
          host: '0.0.0.0',
     }).then(() => {
          console.log('Server running at http://localhost:3333');
     });