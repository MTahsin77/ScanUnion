import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, currentPassword, newPassword } = body;

    if (!userId || !currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
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
      return NextResponse.json({ error: 'User not found or not authorized' }, { status: 404 });
    }

    // Verify current password
    let currentPasswordValid = false;
    
    if (user.isFirstLogin && user.tempPassword) {
      currentPasswordValid = currentPassword === user.tempPassword;
    } else if (user.passwordHash) {
      currentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    }

    if (!currentPasswordValid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update user with new password and clear first login flag
    await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: hashedPassword,
        tempPassword: null,
        isFirstLogin: false,
      }
    });

    return NextResponse.json({
      message: 'Password changed successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isFirstLogin: false
      }
    });
  } catch (error) {
    console.error('Error changing password:', error);
    return NextResponse.json({ error: 'Password change failed' }, { status: 500 });
  }
}
