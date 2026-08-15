import { resolvePostLoginPath } from '../../lib/auth/redirects';
import { LoginScreen } from './LoginScreen';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return <LoginScreen next={resolvePostLoginPath(next ?? null)} />;
}
