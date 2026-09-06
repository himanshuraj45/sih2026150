import type { Metadata } from 'next';
import ForensicCarvingLab from '@/components/ForensicCarvingLab';

export const metadata: Metadata = {
  title: 'Forensic Carving Lab',
  description: 'Read-only simulated forensic carving workflow for prepared sample evidence.',
};

export default function ForensicCarvingPage() {
  return <ForensicCarvingLab />;
}