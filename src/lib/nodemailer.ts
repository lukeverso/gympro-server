import nodemailer from 'nodemailer';

export function nodemailerTransport() {
     return nodemailer.createTransport({
          host: process.env.SMTP_HOST as any,
          port: process.env.SMTP_PORT as any,
          auth: {
               user: process.env.SMTP_USERNAME as any,
               pass: process.env.SMTP_PASSWORD as any
          }
     });
};
