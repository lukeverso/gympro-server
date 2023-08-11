import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import bcrypt from 'bcrypt';
import { z } from 'zod';

const salt = 10;

function calculateAge(birthdate: string) {
     const today = new Date();
     const birthDateParts = birthdate.split('/');
     const birthDate = new Date(
          parseInt(birthDateParts[2], 10),
          parseInt(birthDateParts[1], 10) - 1,
          parseInt(birthDateParts[0], 10)
     );

     let age = today.getFullYear() - birthDate.getFullYear();
     const monthToday = today.getMonth();
     const dayToday = today.getDate();
     const monthBirth = birthDate.getMonth();
     const dayBirth = birthDate.getDate();

     if (monthToday < monthBirth || (monthToday === monthBirth && dayToday < dayBirth)) {
          age--;
     };

     return age;
};

export async function createStudent(request: Request, response: Response) {
     const body = z.object({
          name: z.string(),
          surname: z.string(),
          email: z.string().email(),
          password: z.string(),
          birthdate: z.string(),
          telephone: z.string(),
          code: z.string(),
          street: z.string(),
          number: z.string(),
          complement: z.string().nullable(),
          district: z.string(),
          city: z.string(),
          state: z.string()
     });

     const student = body.parse(request.body);

     const fullname = student.name + ' ' + student.surname;

     const hashedPassword = await bcrypt.hash(student.password, salt);

     try {
          await prisma.students.create({
               data: {
                    name: fullname,
                    email: student.email,
                    password: hashedPassword,
                    birthdate: student.birthdate,
                    telephone: student.telephone,
                    status: true,
                    code: student.code,
                    street: student.street,
                    number: student.number,
                    complement: student.complement,
                    district: student.district,
                    city: student.city,
                    state: student.state
               }
          });

          return response.status(201).send({
               status: 'success',
               message: 'Aluno criado com sucesso'
          });
     } catch (error) {
          console.log(error);

          return response.status(500).send({
               status: 'error',
               message: `Ocorreu um erro: ${error}`
          });
     };
};

export async function getStudentData(request: Request, response: Response) {
     const requestParams = z.object({
          id: z.string().uuid()
     });

     const { id } = requestParams.parse(request.params);

     try {
          const student = await prisma.students.findUnique({
               where: {
                    id
               },
               select: {
                    name: true,
                    teacher: {
                         select: {
                              name: true,
                              birthdate: true,
                              email: true,
                              telephone: true
                         }
                    },
                    sheets: {
                         select: {
                              id: true,
                              active: true,
                              annotations: true,
                              objective: true,
                              startDate: true,
                              endDate: true,
                              workouts: {
                                   select: {
                                        id: true,
                                        focus: true,
                                        active: true,
                                        type: true
                                   }
                              }
                         }
                    }
               }
          });

          return response.status(200).send(student);
     } catch (error) {
          console.log(error);

          return response.status(500).send({
               status: 'error',
               message: `Ocorreu um erro: ${error}`
          });
     };
};

export async function findStudentByMail(request: Request, response: Response) {
     const requestParams = z.object({
          email: z.string()
     });

     const { email } = requestParams.parse(request.params);

     try {
          const student = await prisma.students.findUnique({
               where: {
                    email
               },
               select: {
                    id: true,
                    name: true
               }
          });

          return response.status(200).send(student);
     } catch (error) {
          console.log(error);

          return response.status(500).send({
               status: 'error',
               message: `Ocorreu um erro: ${error}`
          });
     };
};

export async function getStudentDetails(request: Request, response: Response) {
     const requestParams = z.object({
          id: z.string().uuid(),
     });

     const { id } = requestParams.parse(request.params);

     try {
          const details = await prisma.students.findUnique({
               where: {
                    id,
               },
               select: {
                    id: true,
                    name: true,
                    birthdate: true,
                    email: true,
                    telephone: true,
                    picture: true,
                    status: true,
                    sheets: {
                         select: {
                              id: true,
                              annotations: true,
                              active: true,
                              objective: true,
                              endDate: true,
                              startDate: true,
                              workouts: {
                                   select: {
                                        id: true,
                                        focus: true,
                                        type: true,
                                   },
                              },
                         },
                         orderBy: {
                              startDate: 'desc',
                         },
                         take: 1,
                         where: {
                              active: true,
                         },
                    },
               },
          });

          if (!details) {
               return response.status(404).send({
                    status: 'error',
                    message: 'Student not found.',
               });
          }

          const age = calculateAge(details.birthdate);

          const studentDetails = {
               ...details,
               age,
          };

          return response.status(200).send(studentDetails);
     } catch (error) {
          console.log(error);

          return response.status(500).send({
               status: 'error',
               message: `Ocorreu um erro: ${error}`,
          });
     };
};

export async function updateStudentStatus(request: Request, response: Response) {
     const params = z.object({
          id: z.string().uuid()
     });

     const { id } = params.parse(request.params);

     try {
          const student = await prisma.students.findFirst({
               where: {
                    id
               },
          });

          if (!student) return response.status(400).send({
               status: 'error',
               message: 'student not found.'
          });

          const status = !student.status;

          await prisma.students.update({
               where: {
                    id
               },
               data: {
                    status
               }
          });

          return response.status(200).send({
               status: 'success',
               message: 'Status do aluno alterado com sucesso.'
          });
     } catch (error) {
          console.log(error);

          return response.status(500).send({
               status: 'error',
               message: `Ocorreu um erro: ${error}`
          });
     };
};

export async function deleteStudent(request: Request, response: Response) {
     const params = z.object({
          id: z.string().uuid()
     });

     const { id } = params.parse(request.body);

     try {
          const student = await prisma.students.findFirst({
               where: {
                    id
               },
          });

          if (!student) return response.status(400).send({
               status: 'error',
               message: 'student not found.'
          });

          await prisma.students.delete({
               where: {
                    id
               },
          });

          return response.status(200).send({
               status: 'success',
               message: 'student deleted with success.'
          });
     } catch (error) {
          console.log(error);

          return response.status(500).send({
               status: 'error',
               message: `Ocorreu um erro: ${error}`
          });
     };
};

export async function getStudentName(request: Request, response: Response) {
     const params = z.object({
          id: z.string().uuid()
     });

     const { id } = params.parse(request.params);

     try {
          const student = await prisma.students.findFirst({
               where: {
                    id
               },
               select: {
                    name: true
               }
          });

          if (!student) return response.status(400).send({
               status: 'error',
               message: 'student not found.'
          });

          return response.status(200).send(student);
     } catch (error) {
          console.log(error);

          return response.status(500).send({
               status: 'error',
               message: `Ocorreu um erro: ${error}`
          });
     };
};

export async function updateStudentName(request: Request, response: Response) {
     const params = z.object({
          id: z.string().uuid()
     });

     const { id } = params.parse(request.params);

     const body = z.object({
          name: z.string(),
          surname: z.string()
     });

     const { name, surname } = body.parse(request.body);

     const fullname = name + ' ' + surname;

     try {
          const student = await prisma.students.findFirst({
               where: {
                    id
               }
          });

          if (!student) return response.status(400).send({
               status: 'error',
               message: 'student not found.'
          });

          await prisma.students.update({
               where: {
                    id
               },
               data: {
                    name: fullname
               }
          });

          return response.status(200).send({
               status: 'success',
               message: 'Nome editado com sucesso.'
          });
     } catch (error) {
          console.log(error);

          return response.status(500).send({
               status: 'error',
               message: `Ocorreu um erro: ${error}`
          });
     };
};

export async function getStudentEmail(request: Request, response: Response) {
     try {
          const params = z.object({
               id: z.string().uuid()
          });

          const { id } = params.parse(request.params);

          const student = await prisma.students.findFirst({
               where: {
                    id
               },
               select: {
                    email: true
               }
          });

          if (!student) return response.status(400).send({
               status: 'error',
               message: 'student not found.'
          });

          return response.status(200).send(student);
     } catch (error) {
          console.log(error);

          return response.status(500).send({
               status: 'error',
               message: `Ocorreu um erro: ${error}`
          });
     };
};

export async function updateStudentEmail(request: Request, response: Response) {
     const params = z.object({
          id: z.string().uuid()
     });

     const { id } = params.parse(request.params);

     const body = z.object({
          email: z.string().email()
     });

     const { email } = body.parse(request.body);

     try {
          const student = await prisma.students.findFirst({
               where: {
                    id
               }
          });

          if (!student) return response.status(400).send({
               status: 'error',
               message: 'student not found.'
          });

          await prisma.students.update({
               where: {
                    id
               },
               data: {
                    email
               }
          });

          return response.status(200).send({
               status: 'success',
               message: 'E-mail editado com sucesso.'
          });
     } catch (error) {
          if (error instanceof z.ZodError) {
               response.status(400).send({
                    status: 'error',
                    message: error.errors[0].message
               });
          };

          return response.status(500).send({
               status: 'error',
               message: `Ocorreu um erro: ${error}`
          });
     };
};

export async function getStudentTelephone(request: Request, response: Response) {
     const params = z.object({
          id: z.string().uuid()
     });

     const { id } = params.parse(request.params);

     try {
          const student = await prisma.students.findFirst({
               where: {
                    id
               },
               select: {
                    telephone: true
               }
          });

          if (!student) return response.status(400).send({
               status: 'error',
               message: 'student not found.'
          });

          return response.status(200).send(student);
     } catch (error) {
          console.log(error);

          return response.status(500).send({
               status: 'error',
               message: `Ocorreu um erro: ${error}`
          });
     };
};

export async function updateStudentTelephone(request: Request, response: Response) {
     const params = z.object({
          id: z.string().uuid()
     });

     const { id } = params.parse(request.params);

     const body = z.object({
          telephone: z.string()
     });

     const { telephone } = body.parse(request.body);
     
     try {
          const student = await prisma.students.findFirst({
               where: {
                    id
               }
          });

          if (!student) return response.status(400).send({
               status: 'error',
               message: 'student not found.'
          });

          await prisma.students.update({
               where: {
                    id
               },
               data: {
                    telephone
               }
          });

          return response.status(200).send({
               status: 'success',
               message: 'Telefone editado com sucesso.'
          });
     } catch (error) {
          if (error instanceof z.ZodError) {
               response.status(400).send({
                    status: 'error',
                    message: error.errors[0].message
               });
          };

          return response.status(500).send({
               status: 'error',
               message: `Ocorreu um erro: ${error}`
          });
     };
};

export async function getStudentAddress(request: Request, response: Response) {
     const params = z.object({
          id: z.string().uuid()
     });

     const { id } = params.parse(request.params);
     
     try {
          const student = await prisma.students.findFirst({
               where: {
                    id
               },
               select: {
                    code: true,
                    city: true,
                    complement: true,
                    district: true,
                    number: true,
                    state: true,
                    street: true
               }
          });

          if (!student) return response.status(400).send({
               status: 'error',
               message: 'student not found.'
          });

          return response.status(200).send({ student });
     } catch (error) {
          console.log(error);

          return response.status(500).send({
               status: 'error',
               message: `Ocorreu um erro: ${error}`
          });
     };
};

export async function updateStudentAddress(request: Request, response: Response) {
     const params = z.object({
          id: z.string().uuid()
     });

     const { id } = params.parse(request.params);

     const body = z.object({
          code: z.string(),
          city: z.string(),
          complement: z.string(),
          district: z.string(),
          number: z.string(),
          state: z.string(),
          street: z.string()
     });

     const {
          code,
          city,
          complement,
          district,
          number,
          state,
          street
     } = body.parse(request.body);
     
     try {
          const student = await prisma.students.findFirst({
               where: {
                    id
               }
          });

          if (!student) return response.status(400).send({
               status: 'error',
               message: 'student not found.'
          });

          await prisma.students.update({
               where: {
                    id
               },
               data: {
                    code,
                    city,
                    complement,
                    district,
                    number,
                    state,
                    street
               }
          });

          return response.status(200).send({
               status: 'success',
               message: 'Endereço editado com sucesso.'
          });
     } catch (error) {
          if (error instanceof z.ZodError) {
               response.status(400).send({
                    status: 'error',
                    message: error.errors[0].message
               });
          };

          return response.status(500).send({
               status: 'error',
               message: `Ocorreu um erro: ${error}`
          });
     };
};

export async function getStudentMeasures(request: Request, response: Response) {
     const params = z.object({
          id: z.string().uuid()
     });

     const { id } = params.parse(request.params);
     
     try {
          const measures = await prisma.students.findFirst({
               where: {
                    id
               },
               select: {
                    measures: {
                         select: {
                              arm: true,
                              bmi: true,
                              calf: true,
                              chest: true,
                              height: true,
                              hip: true,
                              shoulders: true,
                              thigh: true,
                              waist: true,
                              weight: true,
                              wingspan: true
                         },
                         orderBy: {
                              createdAt: 'desc'
                         }
                    }
               }
          });

          if (!measures) return response.status(400).send({
               status: 'error',
               message: 'Measures not found.'
          });

          return response.status(200).send({ measures: measures.measures[0] });
     } catch (error) {
          console.log(error);

          return response.status(500).send({
               status: 'error',
               message: `Ocorreu um erro: ${error}`
          });
     };
};

export async function updateStudentMeasures(request: Request, response: Response) {
     const params = z.object({
          id: z.string().uuid()
     });

     const { id } = params.parse(request.params);
     
     try {
          const body = z.object({
               arm: z.string(),
               bmi: z.string(),
               calf: z.string(),
               chest: z.string(),
               height: z.string(),
               hip: z.string(),
               shoulders: z.string(),
               thigh: z.string(),
               waist: z.string(),
               weight: z.string(),
               wingspan: z.string()
          });

          const {
               arm,
               bmi,
               calf,
               chest,
               height,
               hip,
               shoulders,
               thigh,
               waist,
               weight,
               wingspan
          } = body.parse(request.body);

          const student = await prisma.students.findFirst({
               where: {
                    id
               }
          });

          if (!student) return response.status(400).send({
               status: 'error',
               message: 'student not found.'
          });

          await prisma.measures.create({
               data: {
                    studentsId: id,
                    arm,
                    bmi,
                    calf,
                    chest,
                    height,
                    hip,
                    shoulders,
                    thigh,
                    waist,
                    weight,
                    wingspan
               }
          });

          return response.status(200).send({
               status: 'success',
               message: 'Medidas alteradas com sucesso.'
          });
     } catch (error) {
          if (error instanceof z.ZodError) {
               response.status(400).send({
                    status: 'error',
                    message: error.errors[0].message
               });
          };

          return response.status(500).send({
               status: 'error',
               message: `Ocorreu um erro: ${error}`
          });
     };
};