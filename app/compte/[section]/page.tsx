import { notFound } from 'next/navigation';
import { AccountSection } from '@/components/account-section';

const validSections = ['adresses', 'informations', 'fidelite', 'avis', 'notifications', 'cartes-cadeaux', 'coupons', 'parrainage'];
export const dynamicParams = false;
export function generateStaticParams() { return validSections.map((section) => ({ section })); }

export default async function AccountSectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (!validSections.includes(section)) notFound();
  return <AccountSection section={section} />;
}
