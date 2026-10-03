import { AccountSidebar } from '@/components/account-sidebar';
import { SiteFooter } from '@/components/site-footer';

export default function AccountLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <><main className="content-width page-main account-layout"><AccountSidebar /><div className="account-content">{children}</div></main><SiteFooter /></>;
}
