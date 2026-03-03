import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { mockUsers, mockUserPasswords } from '@/lib/mock-data';
import { query } from '@/lib/db';
import type { User } from '@/lib/types';
import { createSession } from '../session-store';

type LoginPayload = {
  email?: string;
  password?: string;
};

type HandleLoginOptions = {
  allowedRoles?: User['role'][];
};

const normalizeEmail = (value: string) => value.trim().toLowerCase();

export type AuthUser = {
  id: string;
  email: string;
  role: User['role'];
  firstName: string;
  lastName: string;
  phone: string;
  avatarUrl: string;
  createdAt: string;
};

function sanitizeUser(user: User): AuthUser {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone || '',
    avatarUrl: user.avatarUrl || '',
    createdAt: user.createdAt,
  };
}

export async function handleLogin(request: Request, options: HandleLoginOptions = {}) {
  let body: LoginPayload;

  try {
    body = (await request.json()) as LoginPayload;
  } catch (parseError) {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  const email = body?.email?.trim().toLowerCase();
  const password = body?.password?.trim();

  if (!email || !password) {
    return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 });
  }

  try {
    const normalizedEmail = normalizeEmail(email);

    // --- 1. Try database first ---
    const dbRows = await query<any[]>('SELECT * FROM users WHERE email = ? LIMIT 1', [normalizedEmail]);

    if (dbRows && dbRows.length > 0) {
      const dbUser = dbRows[0];
      let passwordMatch = await bcrypt.compare(password, dbUser.password);

      // Fallback for plain text passwords (direct DB entry)
      if (!passwordMatch && password === dbUser.password) {
        passwordMatch = true;
      }

      if (!passwordMatch) {
        return NextResponse.json({ success: false, error: 'Invalid email or password' }, { status: 401 });
      }

      // Check login_details.status for students/trainers
      if (dbUser.role === 'student' || dbUser.role === 'trainer') {
        const loginDetailsRows = await query<any[]>(
          'SELECT status FROM login_details WHERE user_id = ? LIMIT 1',
          [dbUser.id],
        );
        const loginStatus = loginDetailsRows[0]?.status;
        if (loginStatus !== '1') {
          return NextResponse.json({ success: false, error: 'not_permitted', message: 'Your account is not yet permitted by admin.' }, { status: 403 });
        }
      }

      if (options.allowedRoles && !options.allowedRoles.includes(dbUser.role)) {
        return NextResponse.json({ success: false, error: 'Invalid role for this endpoint' }, { status: 403 });
      }

      const safeUser: AuthUser = {
        id: String(dbUser.id),
        email: dbUser.email,
        role: dbUser.role,
        firstName: dbUser.first_name || '',
        lastName: dbUser.last_name || '',
        phone: dbUser.phone || '',
        avatarUrl: dbUser.avatar || '',
        createdAt: dbUser.created_at ? new Date(dbUser.created_at).toISOString() : new Date().toISOString(),
      };

      const token = createSession(safeUser);

      // --- Update login_details with accessToken ---
      try {
        const existingLogin = await query<any[]>(
          'SELECT id FROM login_details WHERE user_id = ? LIMIT 1',
          [dbUser.id],
        );

        if (existingLogin && existingLogin.length > 0) {
          await query(
            `UPDATE login_details SET accessToken = ?, modified_at = CONVERT_TZ(NOW(), '+00:00', '+05:30') WHERE user_id = ?`,
            [token, dbUser.id],
          );
        } else {
          await query(
            `INSERT INTO login_details (user_id, username, password, accessToken, status, created_at)
             VALUES (?, ?, ?, ?, '1', CONVERT_TZ(NOW(), '+00:00', '+05:30'))`,
            [dbUser.id, dbUser.email, dbUser.password, token],
          );
        }

        // Update last_login in users table
        await query('UPDATE users SET last_login = CONVERT_TZ(NOW(), \' +00:00\', \' +05:30\') WHERE id = ?', [dbUser.id]);
      } catch (loginDetailErr) {
        console.error('login_details update failed (non-blocking):', loginDetailErr);
      }

      return NextResponse.json({ success: true, user: safeUser, token }, { status: 200 });
    }

    // --- 2. Fallback to mock data ---
    const user = mockUsers.find((item) => normalizeEmail(item.email) === normalizedEmail);
    const storedPassword = mockUserPasswords[normalizedEmail];

    if (!user || !storedPassword || storedPassword !== password) {
      return NextResponse.json({ success: false, error: 'Invalid email or password' }, { status: 401 });
    }

    if (options.allowedRoles && !options.allowedRoles.includes(user.role)) {
      return NextResponse.json({ success: false, error: 'Invalid role for this endpoint' }, { status: 403 });
    }

    const safeUser = sanitizeUser(user);
    const token = createSession(safeUser);

    return NextResponse.json({ success: true, user: safeUser, token }, { status: 200 });
  } catch (error: any) {
    console.error('Login error', error);

    const isDev = process.env.NODE_ENV !== 'production';
    const detail = typeof error?.message === 'string' ? error.message : undefined;

    return NextResponse.json(
      {
        success: false,
        error: isDev && detail ? detail : 'Server error',
        ...(isDev && detail ? { detail } : {}),
      },
      { status: 500 }
    );
  }
}
