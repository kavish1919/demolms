import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // Count students
    const studentRows = await query<any[]>("SELECT COUNT(*) as count FROM users WHERE role = 'student'");
    const totalStudents = studentRows[0]?.count || 0;

    // Count trainers
    const trainerRows = await query<any[]>("SELECT COUNT(*) as count FROM users WHERE role = 'trainer'");
    const totalTrainers = trainerRows[0]?.count || 0;

    // Count all users
    const allRows = await query<any[]>('SELECT COUNT(*) as count FROM users');
    const totalUsers = allRows[0]?.count || 0;

    // Active users
    const activeRows = await query<any[]>('SELECT COUNT(*) as count FROM users WHERE is_active = 1');
    const activeUsers = activeRows[0]?.count || 0;

    // Recent signups (last 7 days)
    const recentRows = await query<any[]>(
      'SELECT COUNT(*) as count FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)'
    );
    const recentSignups = recentRows[0]?.count || 0;

    return NextResponse.json({
      success: true,
      stats: {
        totalStudents,
        totalTrainers,
        totalUsers,
        activeUsers,
        recentSignups,
      },
    });
  } catch (error: any) {
    console.error('GET /api/stats error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}
