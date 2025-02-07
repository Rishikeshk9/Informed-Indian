'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';

const publicPaths = ['/privacy-policy', '/login'];

export default function AuthGuard({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated && !publicPaths.includes(pathname)) {
      router.push('/login');
    } else if (isAuthenticated && pathname === '/login') {
      router.push('/dashboard');
    }
  }, [isAuthenticated, pathname, router]);

  if (!isAuthenticated && !publicPaths.includes(pathname)) {
    return null;
  }

  return children;
}
