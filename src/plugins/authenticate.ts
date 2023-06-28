import { FastifyRequest } from 'fastify';

export async function authenticate(request: FastifyRequest) {
     const response = await request.jwtVerify();

     console.log(response);
};