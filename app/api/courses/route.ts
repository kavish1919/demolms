import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET /api/courses
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const trainerId = searchParams.get('trainerId');

        let sql = `
      SELECT c.*, 
             u.id as trainer_id, u.first_name, u.last_name, u.email as trainer_email
      FROM courses c
      LEFT JOIN users u ON c.trainer_id = u.id
    `;
        const params: any[] = [];

        if (trainerId) {
            sql += ' WHERE c.trainer_id = ?';
            params.push(trainerId);
        }

        sql += ' ORDER BY c.created_at DESC';

        const rows = await query<any[]>(sql, params);

        const courses = rows.map((r) => ({
            id: r.id,
            title: r.title,
            slug: r.slug,
            description: r.description,
            shortDescription: r.short_description,
            thumbnailUrl: r.thumbnail_url,
            introVideoUrl: r.intro_video_url,
            durationHours: r.duration_hours,
            fee: Number(r.fee),
            discountFee: r.discount_fee ? Number(r.discount_fee) : null,
            trainerId: r.trainer_id,
            isActive: !!r.is_active,
            isFeatured: !!r.is_featured,
            maxStudents: r.max_students,
            enrollmentCount: r.enrollment_count,
            rating: Number(r.rating),
            category: r.category,
            level: r.level,
            createdAt: r.created_at,
            updatedAt: r.updated_at,
            trainer: r.trainer_id ? {
                id: r.trainer_id,
                firstName: r.first_name,
                lastName: r.last_name,
                email: r.trainer_email
            } : null
        }));

        return NextResponse.json({ success: true, courses }, { status: 200 });
    } catch (error: any) {
        console.error('GET /api/courses error:', error);
        return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
    }
}
