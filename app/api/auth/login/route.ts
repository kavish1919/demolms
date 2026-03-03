import { handleLogin } from './shared';

export async function POST(request: Request) {
  return handleLogin(request);
}
