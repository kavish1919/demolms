import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

type Params = { params: Promise<{ id: string }> };

// GET /api/users/[id]
export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const rows = await query<any[]>(
      'SELECT id, full_name, first_name, last_name, email, role, phone, avatar, is_active, last_login, created_at, updated_at FROM users WHERE id = ?',
      [id],
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const r = rows[0];
    const user = {
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
    };

    return NextResponse.json({ success: true, user }, { status: 200 });
  } catch (error: any) {
    console.error('GET /api/users/[id] error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}

// PUT /api/users/[id] — update user
export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { firstName, lastName, phone, role, isActive } = body;

    const fields: string[] = [];
    const values: any[] = [];

    if (firstName !== undefined) {
      fields.push('first_name = ?');
      values.push(firstName);
    }
    if (lastName !== undefined) {
      fields.push('last_name = ?');
      values.push(lastName);
    }
    if (firstName !== undefined || lastName !== undefined) {
      const fn = firstName ?? '';
      const ln = lastName ?? '';
      fields.push('full_name = ?');
      values.push(`${fn} ${ln}`.trim());
    }
    if (phone !== undefined) {
      fields.push('phone = ?');
      values.push(phone || null);
    }
    if (role !== undefined) {
      fields.push('role = ?');
      values.push(role);
    }
    if (isActive !== undefined) {
      fields.push('is_active = ?');
      values.push(isActive ? 1 : 0);
    }

    if (fields.length === 0) {
      return NextResponse.json({ success: false, error: 'Nothing to update' }, { status: 400 });
    }

    values.push(id);
    await query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);

    // If isActive was updated, sync with login_details.status
    if (isActive !== undefined) {
      await query(
        'UPDATE login_details SET status = ? WHERE user_id = ?',
        [isActive ? '1' : '0', id]
      );
    }

    return NextResponse.json({ success: true, message: 'User updated' }, { status: 200 });
  } catch (error: any) {
    console.error('PUT /api/users/[id] error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}

// DELETE /api/users/[id]
export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    await query('DELETE FROM users WHERE id = ?', [id]);
    return NextResponse.json({ success: true, message: 'User deleted' }, { status: 200 });
  } catch (error: any) {
    console.error('DELETE /api/users/[id] error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}
