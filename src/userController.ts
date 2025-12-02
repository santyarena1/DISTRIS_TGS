// src/userController.ts
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from './db';

const DEFAULT_SALT_ROUNDS = 10;

// GET /users
export async function listUsersHandler(_req: Request, res: Response) {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
    orderBy: { id: 'asc' },
  });
  return res.json(users);
}

// POST /users
export async function createUserHandler(req: Request, res: Response) {
  const { email, password, name, role } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ error: 'Email y contraseña son obligatorios' });
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'Ya existe un usuario con ese email' });
    }

    const passwordHash = await bcrypt.hash(password, DEFAULT_SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        email,
        password: passwordHash,
        name: name ?? null,
        role: role ?? 'admin',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    return res.status(201).json(user);
  } catch (err: any) {
    console.error('Error creando usuario:', err);
    return res.status(500).json({ error: 'Error interno creando usuario' });
  }
}

// PATCH /users/:id
export async function updateUserHandler(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'ID inválido' });
  }

  const { email, password, name, role } = req.body;

  const data: any = {};
  if (email) data.email = email;
  if (name !== undefined) data.name = name;
  if (role) data.role = role;
  if (password) {
    data.password = await bcrypt.hash(password, DEFAULT_SALT_ROUNDS);
  }

  try {
    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    return res.json(user);
  } catch (err: any) {
    console.error('Error actualizando usuario:', err);
    return res.status(500).json({ error: 'Error interno actualizando usuario' });
  }
}

// DELETE /users/:id
export async function deleteUserHandler(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'ID inválido' });
  }

  try {
    await prisma.user.delete({ where: { id } });
    return res.status(204).send();
  } catch (err: any) {
    console.error('Error eliminando usuario:', err);
    return res.status(500).json({ error: 'Error interno eliminando usuario' });
  }
}
