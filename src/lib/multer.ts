import multer from 'fastify-multer';

export const m = multer({
     storage: multer.diskStorage({}),
     limits: {
          fileSize: 10000000
     }
});