import { ScannerClient } from '@/components/scan/scanner-client';
import { getMockEventById } from '@/lib/mock-data';
import type { Event } from '@/lib/types';
import { notFound } from 'next/navigation';

interface ScanEventPageProps {
  params: {
    id: string;
  };
}

export default function ScanEventPage({ params }: ScanEventPageProps) {
  const event = getMockEventById(params.id) as Event | undefined;

  if (!event) {
    notFound();
  }

  return <ScannerClient event={event} />;
}
