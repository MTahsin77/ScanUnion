import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
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
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, email, pin, enabled, currentPassword, newPassword } = body;

    let updateData: any = {};

    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (pin) updateData.pin = pin;
    if (typeof enabled === 'boolean') updateData.enabled = enabled;

    // Handle password change
    if (currentPassword && newPassword) {
      const user = await prisma.user.findUnique({
        where: { id: params.id },
        select: { passwordHash: true, tempPassword: true, isFirstLogin: true }
      });

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      // Check if it's first login with temp password
      if (user.isFirstLogin && user.tempPassword === currentPassword) {
        const hashedPassword = await bcrypt.hash(newPassword, 12);
        updateData.passwordHash = hashedPassword;
        updateData.tempPassword = null;
        updateData.isFirstLogin = false;
      } else if (user.passwordHash) {
        // Verify current password
        const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!isValid) {
          return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
        }
        
        const hashedPassword = await bcrypt.hash(newPassword, 12);
        updateData.passwordHash = hashedPassword;
      } else {
        return NextResponse.json({ error: 'Invalid password change request' }, { status: 400 });
      }
    }

    const user = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
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
      }
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.user.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
