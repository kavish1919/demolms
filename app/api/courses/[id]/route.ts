import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// PATCH /api/courses/[id]
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;
        const body = await request.json();
        const { trainerId } = body;

        // Check if course exists
        const existing = await query<any[]>('SELECT id FROM courses WHERE id = ?', [id]);
        if (!existing || existing.length === 0) {
            return NextResponse.json({ success: false, error: 'Course not found' }, { status: 404 });
        }

        // Update trainer_id
        // If trainerId is null or empty string, we unassign the trainer (set to NULL)
        const newTrainerId = trainerId || null;

        await query(
            'UPDATE courses SET trainer_id = ?, updated_at = NOW() WHERE id = ?',
            [newTrainerId, id]
        );

        return NextResponse.json({
            success: true,
            message: newTrainerId ? 'Trainer assigned successfully' : 'Trainer unassigned successfully'
        }, { status: 200 });
    } catch (error: any) {
        console.error('PATCH /api/courses/[id] error:', error);
        return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
    }
}
