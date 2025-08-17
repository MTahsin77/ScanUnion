import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role') as Role | null;

    const users = await prisma.user.findMany({
      where: role ? { role } : undefined,
      select: {
        id: true,
        name: true,
        email: true,
        pin: true,
        enabled: true,
        role: true,
        isFirstLogin: true,
        createdAt: true,
        updatedAt: true,
        // Don't return password hash or temp password
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, pin, role, tempPassword } = body;

    // Check if user with PIN already exists
    const existingUser = await prisma.user.findUnique({
      where: { pin }
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User with this PIN already exists' }, { status: 400 });
    }

    // Check if admin with email already exists
    if (email) {
      const existingAdmin = await prisma.user.findUnique({
        where: { email }
      });

      if (existingAdmin) {
        return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
      }
    }

    let userData: any = {
      name,
      pin,
      role: role as Role,
      enabled: true,
    };

    if (role === 'ADMIN') {
      userData.email = email;
      userData.tempPassword = tempPassword;
      userData.isFirstLogin = true;
    }

    const user = await prisma.user.create({
      data: userData,
      select: {
        id: true,
        name: true,
        email: true,
        pin: true,
        enabled: true,
        role: true,
        isFirstLogin: true,
        tempPassword: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
