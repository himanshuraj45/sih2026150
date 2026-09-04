import type { Metadata } from 'next';
import ForensicAnalysis from '@/components/ForensicAnalysis';

export const metadata: Metadata = {
  title: 'CCTV Forensic Analysis',
  description: 'Prepare CCTV evidence for AI-assisted forensic intelligence review in NEXORA.',
};

export default function ForensicsPage() {
  return <ForensicAnalysis />;
}
