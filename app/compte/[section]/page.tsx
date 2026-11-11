import { notFound } from 'next/navigation';
import { AccountSection } from '@/components/account-section';
import { isAccountSection } from '@/lib/account-sections';

export default async function AccountSectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (!isAccountSection(section)) notFound();
  return <AccountSection section={section} />;
}
