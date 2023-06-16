import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';

import { addressesRoutes } from './routes/addresses';
import { exercisesRoutes } from './routes/exercises';
import { gymsRoutes } from './routes/gyms';
import { measuresRoutes } from './routes/measures';
import { teachersRoutes } from './routes/teachers';
import { usersRoutes } from './routes/users';

const fastify = Fastify({
     logger: true
});

fastify.register(cors, {
     origin: true
});

fastify.register(jwt, {
     secret: 'gymprosystem'
});

fastify.register(addressesRoutes);
fastify.register(exercisesRoutes);
fastify.register(gymsRoutes);
fastify.register(measuresRoutes);
fastify.register(teachersRoutes);
fastify.register(usersRoutes);

fastify
     .listen({
          port: 5000
     }).then(() => {
          console.log('Server running at http://localhost:5000');
     });