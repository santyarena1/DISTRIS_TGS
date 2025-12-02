import prisma from './db';
import bcrypt from 'bcryptjs';

export async function createUser(username: string, password: string) {
  const hashed = await bcrypt.hash(password, 10);
  return prisma.user.create({ data: { username, password: hashed } });
}

export async function getUserByUsername(username: string) {
  return prisma.user.findUnique({ where: { username } });
}
