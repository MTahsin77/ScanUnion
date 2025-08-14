import Image from 'next/image';

export function Logo() {
  return <Image src="/logo.svg" alt="ScanUnion Logo" width={150} height={37.5} priority />;
}
