import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

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

export async function createTeacher(request: Request, response: Response) {
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

     const teacher = body.parse(request.body);

     const fullname = teacher.name + ' ' + teacher.surname;

     const hashedPassword = await bcrypt.hash(teacher.password, salt);

     try {
          const create = await prisma.teachers.create({
               data: {
                    name: fullname,
                    email: teacher.email,
                    password: hashedPassword,
                    birthdate: teacher.birthdate,
                    telephone: teacher.telephone,
                    status: true,
                    code: teacher.code,
                    street: teacher.street,
                    number: teacher.number,
                    complement: teacher.complement,
                    district: teacher.district,
                    city: teacher.city,
                    state: teacher.state
               }
          });

          const token = jwt.sign({
               id: create.id
          }, process.env.JWT_SECRET as string, {
               expiresIn: '7 days'
          });

          return response.status(201).send({
               status: 'success',
               message: 'Personal criado com sucesso',
               teacher: {
                    id: create.id,
                    name: create.name,
                    email: create.email
               },
               token
          });
     } catch (error) {
          console.log(error);

          return response.status(500).send({
               status: 'error',
               message: `Ocorreu um erro: ${error}`
          });
     };
};

export async function getTeacherDetails(request: Request, response: Response) {
     const requestParams = z.object({
          id: z.string().uuid()
     });

     const { id } = requestParams.parse(request.params);

     try {
          const teacher = await prisma.teachers.findUnique({
               where: {
                    id
               },
               select: {
                    name: true,
                    email: true,
                    telephone: true,
                    picture: true,
                    students: {
                         select: {
                              id: true,
                              name: true,
                              birthdate: true,
                         },
                         orderBy: {
                              createdAt: 'desc'
                         },
                         take: 5
                    }
               }
          });

          const studentsWithAge = teacher?.students.map(student => ({
               ...student,
               age: calculateAge(student.birthdate),
          }));

          const formattedResponse = {
               name: teacher?.name,
               email: teacher?.email,
               telephone: teacher?.telephone,
               picture: teacher?.picture,
               students: studentsWithAge,
          };

          return response.status(200).send(formattedResponse);
     } catch (error) {
          console.log(error);

          return response.status(500).send({
               status: 'error',
               message: `Ocorreu um erro: ${error}`
          });
     };
};

export async function getTeacherStudents(request: Request, response: Response) {
     const requestParams = z.object({
          id: z.string().uuid()
     });

     const { id } = requestParams.parse(request.params);

     try {
          const teacher = await prisma.teachers.findUnique({
               where: {
                    id
               },
               select: {
                    students: {
                         select: {
                              id: true,
                              name: true,
                              birthdate: true,
                         },
                         orderBy: {
                              name: 'asc'
                         },
                    }
               }
          });

          const students = teacher?.students.map(student => ({
               ...student,
               age: calculateAge(student.birthdate),
          }));

          return response.status(200).send(students);
     } catch (error) {
          console.log(error);

          return response.status(500).send({
               status: 'error',
               message: `Ocorreu um erro: ${error}`
          });
     };
};

export async function deleteTeacher(request: Request, response: Response) {
     const params = z.object({
          id: z.string().uuid()
     });

     const { id } = params.parse(request.body);

     try {
          const teacherExists = await prisma.teachers.findFirst({
               where: {
                    id
               },
          });

          if (!teacherExists) return response.status(400).send({
               status: 'error',
               message: 'Teacher not found.'
          });

          await prisma.teachers.delete({
               where: {
                    id
               },
          });

          return response.status(200).send({
               status: 'success',
               message: 'Teacher deleted with success.'
          });
     } catch (error) {
          console.log(error);

          return response.status(500).send({
               status: 'error',
               message: `Ocorreu um erro: ${error}`
          });
     };
};

export async function addStudentToTeacher(request: Request, response: Response) {
     const params = z.object({
          teacher: z.string().uuid(),
          student: z.string().uuid()
     });

     const { teacher, student } = params.parse(request.params);

     try {
          const existingStudent = await prisma.students.findUnique({
               where: {
                    id: student
               },
               select: {
                    teacherId: true,
                    id: true
               }
          });

          if (existingStudent) {
               if (existingStudent.teacherId === teacher) {
                    return response.status(400).send({
                         status: 'error',
                         message: 'This student is already assigned to this teacher.',
                         code: 'sameTeacher',
                         student: existingStudent.id
                    });
               } else if (existingStudent.teacherId !== null) {
                    return response.status(400).send({
                         status: 'error',
                         message: 'This student is already assigned to a different teacher.',
                         code: 'differentTeacher'
                    });
               }
          }

          await prisma.teachers.update({
               where: {
                    id: teacher
               },
               data: {
                    students: {
                         connect: {
                              id: student
                         }
                    }
               }
          });

          return response.status(200).send({
               status: 'success',
               message: 'Student added successfully.'
          });
     } catch (error) {
          console.log(error);

          return response.status(500).send({
               status: 'error',
               message: `Ocorreu um erro: ${error}`
          });
     };
};


export async function removeStudentFromTeacher(request: Request, response: Response) {
     const params = z.object({
          teacher: z.string().uuid(),
          student: z.string().uuid()
     });

     const { teacher, student } = params.parse(request.params);

     try {
          await prisma.teachers.update({
               where: {
                    id: teacher
               },
               data: {
                    students: {
                         disconnect: {
                              id: student
                         }
                    }
               }
          });

          return response.status(200).send({
               status: 'success',
               message: 'Student removed successfully.'
          });
     } catch (error) {
          console.log(error);

          return response.status(500).send({
               status: 'error',
               message: `Ocorreu um erro: ${error}`
          });
     };
};

export async function getTeacherName(request: Request, response: Response) {
     const params = z.object({
          id: z.string().uuid()
     });

     const { id } = params.parse(request.params);

     try {
          const student = await prisma.teachers.findFirst({
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

          return response.status(200).send({ student });
     } catch (error) {
          console.log(error);

          return response.status(500).send({
               status: 'error',
               message: `Ocorreu um erro: ${error}`
          });
     };
};

export async function updateTeacherName(request: Request, response: Response) {
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
          const student = await prisma.teachers.findFirst({
               where: {
                    id
               }
          });

          if (!student) return response.status(400).send({
               status: 'error',
               message: 'student not found.'
          });

          await prisma.teachers.update({
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

export async function getTeacherEmail(request: Request, response: Response) {
     const params = z.object({
          id: z.string().uuid()
     });

     const { id } = params.parse(request.params);

     try {
          const student = await prisma.teachers.findFirst({
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

          return response.status(200).send({ student });
     } catch (error) {
          console.log(error);

          return response.status(500).send({
               status: 'error',
               message: `Ocorreu um erro: ${error}`
          });
     };
};

export async function updateTeacherEmail(request: Request, response: Response) {
     const params = z.object({
          id: z.string().uuid()
     });

     const { id } = params.parse(request.params);

     const body = z.object({
          email: z.string().email()
     });

     const { email } = body.parse(request.body);

     try {
          const student = await prisma.teachers.findFirst({
               where: {
                    id
               }
          });

          if (!student) return response.status(400).send({
               status: 'error',
               message: 'student not found.'
          });

          await prisma.teachers.update({
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

export async function getTeacherTelephone(request: Request, response: Response) {
     const params = z.object({
          id: z.string().uuid()
     });

     const { id } = params.parse(request.params);

     try {
          const student = await prisma.teachers.findFirst({
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

          return response.status(200).send({ student });
     } catch (error) {
          console.log(error);

          return response.status(500).send({
               status: 'error',
               message: `Ocorreu um erro: ${error}`
          });
     };
};

export async function updateTeacherTelephone(request: Request, response: Response) {
     const params = z.object({
          id: z.string().uuid()
     });

     const { id } = params.parse(request.params);

     const body = z.object({
          telephone: z.string()
     });

     const { telephone } = body.parse(request.body);

     try {
          const student = await prisma.teachers.findFirst({
               where: {
                    id
               }
          });

          if (!student) return response.status(400).send({
               status: 'error',
               message: 'student not found.'
          });

          await prisma.teachers.update({
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

export async function getTeacherAddress(request: Request, response: Response) {
     const params = z.object({
          id: z.string().uuid()
     });

     const { id } = params.parse(request.params);

     try {
          const student = await prisma.teachers.findFirst({
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

export async function updateTeacherAddress(request: Request, response: Response) {
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
          const student = await prisma.teachers.findFirst({
               where: {
                    id
               }
          });

          if (!student) return response.status(400).send({
               status: 'error',
               message: 'student not found.'
          });

          await prisma.teachers.update({
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
          console.log(error);

          return response.status(500).send({
               status: 'error',
               message: `Ocorreu um erro: ${error}`
          });
     };
};