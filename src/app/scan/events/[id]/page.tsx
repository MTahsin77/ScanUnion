import { ScannerClient } from '@/components/scan/scanner-client';
import { prisma } from '@/lib/database';
import type { Event } from '@/lib/types';
import { notFound } from 'next/navigation';

interface ScanEventPageProps {
  params: {
    id: string;
  };
}

export default async function ScanEventPage({ params }: ScanEventPageProps) {
  const event = await prisma.event.findUnique({
    where: { id: params.id }
  });

  if (!event) {
    notFound();
  }

  return <ScannerClient event={event} />;
}
