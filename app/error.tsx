'use client';

import Link from 'next/link';
import { CircleAlert } from 'lucide-react';

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="content-width page-main state-page"><span className="state-icon error"><CircleAlert size={28} /></span><h1>Un problème est survenu</h1><p>Cette page n’a pas pu se charger. Réessayez ou revenez à la boutique.</p><div className="state-actions"><button className="button button-primary" onClick={reset}>Réessayer</button><Link className="button button-outline" href="/boutique">Aller à la boutique</Link></div></main>;
}
