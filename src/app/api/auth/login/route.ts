import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pin, email, password } = body;

    let user;

    if (pin) {
      // Scanner user login with PIN
      user = await prisma.user.findUnique({
        where: { pin },
        select: {
          id: true,
          name: true,
          pin: true,
          role: true,
          enabled: true,
          isFirstLogin: true,
          tempPassword: true,
          passwordHash: true,
        }
      });

      if (!user || !user.enabled) {
        return NextResponse.json({ error: 'Invalid PIN or user disabled' }, { status: 401 });
      }

      // For scanner users, PIN is sufficient
      if (user.role === 'USER') {
        return NextResponse.json({
          user: {
            id: user.id,
            name: user.name,
            role: user.role,
            isFirstLogin: user.isFirstLogin
          }
        });
      }
    }

    if (email && password) {
      // Admin login with email and password
      user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          enabled: true,
          isFirstLogin: true,
          tempPassword: true,
          passwordHash: true,
        }
      });

      if (!user || !user.enabled || user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }

      // Check password (temp password or hashed password)
      let passwordValid = false;
      
      if (user.isFirstLogin && user.tempPassword) {
        passwordValid = password === user.tempPassword;
      } else if (user.passwordHash) {
        passwordValid = await bcrypt.compare(password, user.passwordHash);
      }

      if (!passwordValid) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }

      return NextResponse.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          isFirstLogin: user.isFirstLogin
        }
      });
    }

    return NextResponse.json({ error: 'Invalid login request' }, { status: 400 });
  } catch (error) {
    console.error('Error during login:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
