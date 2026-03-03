import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

type RegisterPayload = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  role?: 'student' | 'trainer';
  password?: string;
};

export async function POST(request: NextRequest) {
  let body: RegisterPayload;

  try {
    body = (await request.json()) as RegisterPayload;
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  const firstName = body?.firstName?.trim();
  const lastName = body?.lastName?.trim();
  const email = body?.email?.trim()?.toLowerCase();
  const phone = body?.phone?.trim() || null;
  const role = body?.role === 'trainer' ? 'trainer' : 'student';
  const password = body?.password;

  // ---------- Validation ----------
  if (!firstName || !lastName) {
    return NextResponse.json({ success: false, error: 'First name and last name are required' }, { status: 400 });
  }

  if (!email) {
    return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
  }

  if (!password || password.length < 6) {
    return NextResponse.json({ success: false, error: 'Password must be at least 6 characters' }, { status: 400 });
  }

  try {
    // ---------- Check duplicate email ----------
    const existing = await query<any[]>('SELECT id FROM users WHERE email = ?', [email]);

    if (existing && existing.length > 0) {
      return NextResponse.json({ success: false, error: 'An account with this email already exists' }, { status: 409 });
    }

    // ---------- Plain text password ---------- (Direct DB management requirement)
    const storedPassword = password;

    // ---------- Insert user with selected role ----------
    // Trainers start as inactive (Pending) until approved by admin
    const isActive = role === 'trainer' ? 0 : 1;
    const fullName = `${firstName} ${lastName}`;

    const insertResult = await query<any>(
      `INSERT INTO users (email, password, role, full_name, first_name, last_name, phone, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [email, storedPassword, role, fullName, firstName, lastName, phone, isActive],
    );

    // ---------- Insert into login_details ----------
    const newUserId = insertResult.insertId;
    if (newUserId) {
      const crypto = await import('crypto');
      const mspassword = crypto.createHash('md5').update(password).digest('hex');

      await query(
        `INSERT INTO login_details (user_id, username, password, mspassword, status, created_at)
         VALUES (?, ?, ?, ?, ?, CONVERT_TZ(NOW(), '+00:00', '+05:30'))`,
        [newUserId, email, storedPassword, mspassword, isActive ? '1' : '0'],
      );
    }

    return NextResponse.json(
      { success: true, message: 'Account created successfully' },
      { status: 201 },
    );
  } catch (error: any) {
    console.error('Register error:', error);

    // MySQL duplicate-entry error code
    if (error?.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ success: false, error: 'An account with this email already exists' }, { status: 409 });
    }

    const isDev = process.env.NODE_ENV !== 'production';
    const detail = typeof error?.message === 'string' ? error.message : undefined;

    return NextResponse.json(
      {
        success: false,
        error: isDev && detail ? detail : 'Server error',
        ...(isDev && detail ? { detail } : {}),
      },
      { status: 500 },
    );
  }
}
