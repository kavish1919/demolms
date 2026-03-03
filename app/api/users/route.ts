import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET /api/users  — list users with optional ?role=student|trainer|admin
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const search = searchParams.get('search');

    let sql = 'SELECT id, full_name, first_name, last_name, email, role, phone, avatar, is_active, last_login, created_at, updated_at FROM users';
    const conditions: string[] = [];
    const params: any[] = [];

    if (role) {
      conditions.push('role = ?');
      params.push(role);
    }

    if (search) {
      conditions.push('(first_name LIKE ? OR last_name LIKE ? OR full_name LIKE ? OR email LIKE ?)');
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY created_at DESC';

    const rows = await query<any[]>(sql, params);

    const users = rows.map((r: any) => ({
      id: String(r.id),
      email: r.email,
      role: r.role,
      firstName: r.first_name || '',
      lastName: r.last_name || '',
      fullName: r.full_name || '',
      phone: r.phone || '',
      avatarUrl: r.avatar || '',
      isActive: !!r.is_active,
      lastLogin: r.last_login ? new Date(r.last_login).toISOString() : null,
      createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
      updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString(),
    }));

    return NextResponse.json({ success: true, users }, { status: 200 });
  } catch (error: any) {
    console.error('GET /api/users error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}

// POST /api/users  — create a new user (admin action)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, phone, role, password } = body;

    if (!firstName || !lastName || !email) {
      return NextResponse.json({ success: false, error: 'firstName, lastName, and email are required' }, { status: 400 });
    }

    const validRole = role || 'student';
    const fullName = `${firstName} ${lastName}`;

    // If password provided hash it, else generate a random temp password
    let hashedPassword: string;
    if (password) {
      const bcrypt = await import('bcryptjs');
      hashedPassword = await bcrypt.hash(password, 10);
    } else {
      const bcrypt = await import('bcryptjs');
      const temp = Math.random().toString(36).slice(-8);
      hashedPassword = await bcrypt.hash(temp, 10);
    }

    const existing = await query<any[]>('SELECT id FROM users WHERE email = ?', [email.toLowerCase()]);
    if (existing && existing.length > 0) {
      return NextResponse.json({ success: false, error: 'Email already exists' }, { status: 409 });
    }

    await query(
      `INSERT INTO users (full_name, first_name, last_name, email, password, role, phone)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [fullName, firstName, lastName, email.toLowerCase(), hashedPassword, validRole, phone || null],
    );

    return NextResponse.json({ success: true, message: 'User created' }, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/users error:', error);
    if (error?.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ success: false, error: 'Email already exists' }, { status: 409 });
    }
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}
