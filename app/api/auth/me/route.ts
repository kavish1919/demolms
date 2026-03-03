import { NextResponse } from 'next/server';
import { getUserFromToken } from '../session-store';

export async function GET(request: Request) {
  const authorization = request.headers.get('authorization');

  if (!authorization?.startsWith('Bearer ')) {
    return NextResponse.json({ success: false, error: 'Missing token' }, { status: 401 });
  }

  const token = authorization.split(' ')[1];
  const user = getUserFromToken(token);

  if (!user) {
    return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
  }

  return NextResponse.json({ success: true, user }, { status: 200 });
}