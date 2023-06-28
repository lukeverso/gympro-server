import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';

import { authenticationRoutes } from './routes/authentication';

import { addressesRoutes } from './routes/addresses';
import { exercisesRoutes } from './routes/exercises';
import { measuresRoutes } from './routes/measures';
import { teachersRoutes } from './routes/teachers';
import { studentsRoutes } from './routes/students';

const fastify = Fastify();

fastify.register(cors, {
     origin: true
});

fastify.register(jwt, {
     secret: 'gymprosystem'
});

fastify.register(authenticationRoutes);

fastify.register(addressesRoutes);
fastify.register(exercisesRoutes);
fastify.register(measuresRoutes);
fastify.register(teachersRoutes);
fastify.register(studentsRoutes);

fastify
     .listen({
          port: 5000
     }).then(() => {
          console.log('Server running at http://localhost:5000');
     });