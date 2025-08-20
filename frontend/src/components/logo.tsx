'use client';

import { useRouter } from 'next/navigation';

interface LogoProps {
  clickable?: boolean;
  redirectTo?: string;
  className?: string;
}

export function Logo({ clickable = false, redirectTo = '/scan/events', className }: LogoProps) {
  const router = useRouter();

  const handleClick = () => {
    if (clickable) {
      router.push(redirectTo);
    }
  };

  return (
    <img 
      src="/logo.png" 
      alt="The Students' Union Logo" 
      className={`h-10 object-contain ${clickable ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''} ${className || ''}`}
      style={{ maxWidth: '150px' }}
      onClick={handleClick}
    />
  );
}
