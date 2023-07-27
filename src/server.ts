import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
<<<<<<< HEAD
import multipart from '@fastify/multipart';
=======
>>>>>>> 9a5dbee8869f8e6e66708a9673d856b8c78f72d1

import { authenticationRoutes } from './routes/authentication';
import { exercisesRoutes } from './routes/exercises';
import { measuresRoutes } from './routes/measures';
import { teachersRoutes } from './routes/teachers';
import { studentsRoutes } from './routes/students';
import { workoutsRoutes } from './routes/workouts';
import { notificationsRoutes } from './routes/notifications';
import { uploadRoutes } from './routes/upload';

const fastify = Fastify();

fastify.register(cors, {
     origin: true
});

fastify.register(jwt, {
     secret: 'gymprosystem'
});

fastify.register(multipart);

fastify.register(authenticationRoutes);
fastify.register(exercisesRoutes);
fastify.register(measuresRoutes);
fastify.register(teachersRoutes);
fastify.register(studentsRoutes);
fastify.register(workoutsRoutes);
fastify.register(notificationsRoutes);
fastify.register(uploadRoutes);

fastify
     .listen({
          port: 3333,
          host: '0.0.0.0',
     }).then(() => {
          console.log('Server running at http://localhost:3333');
     });