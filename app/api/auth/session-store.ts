import crypto from 'crypto';
import type { AuthUser } from './login/shared';

const sessions = new Map<string, AuthUser>();

export function createSession(user: AuthUser): string {
  const token = crypto.randomUUID();
  sessions.set(token, user);
  return token;
}

export function getUserFromToken(token: string) {
  return sessions.get(token);
}

export function revokeSession(token: string) {
  sessions.delete(token);
}