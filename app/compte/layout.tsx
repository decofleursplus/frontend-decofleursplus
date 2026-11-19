import { AccountSidebar } from '@/components/account-sidebar';
import { SiteFooter } from '@/components/site-footer';
import { TemporaryPasswordBanner } from '@/components/account/temporary-password-banner';

export default function AccountLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <><main className="content-width page-main account-layout"><AccountSidebar /><div className="account-content"><TemporaryPasswordBanner />{children}</div></main><SiteFooter /></>;
}
