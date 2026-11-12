'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import {
  Ban,
  CheckCircle2,
  Gift,
  Loader2,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Send,
  Wallet,
  X,
} from 'lucide-react';
import { AdminDrawer } from '@/components/admin/admin-drawer';
import { AdminPagination } from '@/components/admin/admin-pagination';
import { useAdminSidebar } from '@/components/admin/admin-sidebar-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ApiClientError } from '@/lib/api/client';
import {
  GIFT_CARD_MAX_AMOUNT,
  GIFT_CARD_MIN_AMOUNT,
  GIFT_CARD_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  type GiftCardStatus,
  type PaymentMethodCode,
} from '@/lib/api/rewards';
import {
  activateGiftCard,
  disableGiftCard,
  enableGiftCard,
  getAdminGiftCard,
  issueGiftCard,
  listAdminGiftCards,
  resendGiftCard,
  type AdminGiftCard,
  type AdminGiftCardDetail,
  type AdminGiftCardPage,
} from '@/lib/api/admin/rewards';

const fcfa = (n: number) => `${n.toLocaleString('fr-FR')} FCFA`;
const date = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');
const errorMessage = (err: unknown, fallback: string) => {
  if (err instanceof ApiClientError) return err.details?.[0]?.message || err.message;
  return err instanceof Error ? err.message : fallback;
};

const STATUS_STYLE: Record<GiftCardStatus, string> = {
  PENDING_PAYMENT: 'bg-amber-50 text-amber-800 border-amber-200',
  ACTIVE: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  USED: 'bg-gray-100 text-gray-600 border-gray-200',
  DISABLED: 'bg-red-50 text-red-700 border-red-200',
  EXPIRED: 'bg-gray-100 text-gray-600 border-gray-200',
};

const TABS: { key: GiftCardStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'Toutes' },
  { key: 'PENDING_PAYMENT', label: 'À encaisser' },
  { key: 'ACTIVE', label: 'Actives' },
  { key: 'USED', label: 'Épuisées' },
  { key: 'DISABLED', label: 'Désactivées' },
  { key: 'EXPIRED', label: 'Expirées' },
];

const PAYMENT_OPTIONS: PaymentMethodCode[] = ['WAVE', 'ORANGE_MONEY', 'FREE_MONEY', 'CARD', 'CASH_ON_DELIVERY'];

function StatusBadge({ status }: { status: GiftCardStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${STATUS_STYLE[status]}`}>
      {GIFT_CARD_STATUS_LABELS[status]}
    </span>
  );
}

export default function AdminGiftCardsPage() {
  return (
    <Suspense fallback={null}>
      <GiftCardsView />
    </Suspense>
  );
}

function GiftCardsView() {
  const searchParams = useSearchParams();
  const [status, setStatusState] = useState<GiftCardStatus | 'all'>('all');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [retry, setRetry] = useState(0);
  const [data, setData] = useState<AdminGiftCardPage | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  // Lien « Ouvrir dans le back-office » des emails : ?carte=ID
  const [selectedId, setSelectedId] = useState<string | null>(() => searchParams.get('carte'));
  const [issuing, setIssuing] = useState(false);

  const setStatus = (s: GiftCardStatus | 'all') => {
    setStatusState(s);
    setPage(1);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const query = useMemo(
    () => ({ status: status === 'all' ? undefined : status, search: search || undefined, page, limit: pageSize }),
    [status, search, page, pageSize],
  );
  const requestKey = JSON.stringify([query, retry]);
  const loading = loadedKey !== requestKey;

  useEffect(() => {
    let cancelled = false;
    listAdminGiftCards(query)
      .then((res) => {
        if (cancelled) return;
        setData(res);
        setLoadError(null);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(errorMessage(err, 'Chargement des cartes cadeaux impossible.'));
      })
      .finally(() => {
        if (!cancelled) setLoadedKey(requestKey);
      });
    return () => {
      cancelled = true;
    };
  }, [query, requestKey]);

  const refresh = () => setRetry((r) => r + 1);
  const counts = data?.counts;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="admin-page-title text-2xl font-bold text-[#1e2a1f]">Cartes cadeaux</h1>
          <p className="admin-page-subtitle text-sm text-gray-500">
            Encaissez les cartes commandées sur le site, émettez des cartes vendues en boutique et suivez leur utilisation.
          </p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={refresh} className="h-10 border-[#e7e4dd] bg-white text-xs text-gray-700">
            <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${loading ? 'animate-spin text-[#c1647a]' : ''}`} /> Actualiser
          </Button>
          <Button type="button" onClick={() => setIssuing(true)} className="h-10 bg-[#c1647a] text-xs font-semibold text-white hover:bg-[#a85266]">
            <Plus className="mr-1.5 h-3.5 w-3.5" /> Émettre une carte
          </Button>
        </div>
      </div>

      {counts && counts.PENDING_PAYMENT > 0 && status !== 'PENDING_PAYMENT' && (
        <button
          type="button"
          onClick={() => setStatus('PENDING_PAYMENT')}
          className="flex w-full items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-left text-xs text-amber-900"
        >
          <Wallet className="h-4 w-4 shrink-0" />
          <span>
            <strong>{counts.PENDING_PAYMENT} carte{counts.PENDING_PAYMENT > 1 ? 's' : ''} à encaisser</strong> : contactez l’acheteur puis cliquez
            sur « Paiement reçu » pour l’envoyer au destinataire.
          </span>
        </button>
      )}

      <div className="no-scrollbar flex flex-nowrap items-center gap-2 overflow-x-auto pb-1 sm:flex-wrap">
        {TABS.map((tab) => {
          const active = status === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setStatus(tab.key)}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition-all sm:px-4 ${
                active ? 'bg-[#c1647a] text-white shadow-xs' : 'border border-[#e7e4dd] bg-white text-gray-700 hover:bg-[#faf8f4]'
              }`}
              style={active ? { backgroundColor: '#c1647a', color: '#ffffff' } : undefined}
            >
              <span style={active ? { color: '#ffffff' } : undefined}>{tab.label}</span>
              <span
                className={`rounded-md px-1.5 py-0.5 text-[11px] font-bold ${active ? '' : 'bg-gray-100 text-gray-600'}`}
                style={active ? { backgroundColor: 'rgba(255,255,255,0.25)', color: '#ffffff' } : undefined}
              >
                {counts ? counts[tab.key] : '…'}
              </span>
            </button>
          );
        })}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Rechercher un code, un destinataire, un acheteur…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="h-10 border-[#e7e4dd] bg-white pl-9 pr-8 text-xs sm:text-sm"
        />
        {searchInput && (
          <button
            type="button"
            aria-label="Effacer la recherche"
            onClick={() => setSearchInput('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {loadError && (
        <div role="alert" className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-800">
          {loadError}
          <button type="button" onClick={refresh} className="font-semibold underline">
            Réessayer
          </button>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-[#e7e4dd] bg-white">
        {loading && !data ? (
          <div className="flex items-center justify-center gap-2 py-16 text-xs text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" /> Chargement des cartes…
          </div>
        ) : data && data.items.length === 0 ? (
          <div className="py-16 text-center text-xs text-gray-500">
            <Gift className="mx-auto mb-2 h-8 w-8 text-gray-300" />
            Aucune carte cadeau {status !== 'all' ? 'dans cet onglet' : 'pour le moment'}.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-xs">
              <thead className="bg-[#faf8f4] text-left text-[11px] uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Carte</th>
                  <th className="px-4 py-3 font-semibold">Montant / solde</th>
                  <th className="px-4 py-3 font-semibold">Destinataire</th>
                  <th className="px-4 py-3 font-semibold">Acheteur</th>
                  <th className="px-4 py-3 font-semibold">Statut</th>
                  <th className="px-4 py-3 font-semibold">Validité</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className={loading ? 'opacity-60' : ''}>
                {data?.items.map((card) => (
                  <tr key={card.id} className="border-t border-[#f0ede6] hover:bg-[#fcfaf7]">
                    <td className="px-4 py-3">
                      <span className="font-mono font-bold tracking-wider text-[#173f22]">{card.code}</span>
                      <span className="block text-[11px] text-gray-400">
                        {card.issuedInStore ? 'Émise en boutique' : 'Commandée en ligne'} · {date(card.createdAt)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <strong className="text-gray-900">{fcfa(card.initialAmount)}</strong>
                      <span className="block text-[11px] text-gray-500">Solde : {fcfa(card.status === 'PENDING_PAYMENT' ? 0 : card.balance)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-gray-800">{card.recipientName}</span>
                      <span className="block text-[11px] text-gray-500">{card.recipientEmail}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-gray-800">{card.purchaserName}</span>
                      <span className="block text-[11px] text-gray-500">{card.purchaserPhone || card.purchaserEmail}</span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={card.status} />
                    </td>
                    <td className="px-4 py-3 text-gray-600">{card.expiresAt ? `jusqu’au ${date(card.expiresAt)}` : '—'}</td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setSelectedId(card.id)}
                        className="h-8 border-[#e7e4dd] text-[11px]"
                      >
                        {card.status === 'PENDING_PAYMENT' ? 'Encaisser' : 'Détails'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {data && data.total > 0 && (
          <AdminPagination
            page={page}
            totalPages={data.totalPages}
            total={data.total}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
            itemLabel="cartes"
            disabled={loading}
            className="border-t border-[#f0ede6] px-4 py-3"
          />
        )}
      </div>

      <GiftCardDrawer key={selectedId ?? 'aucune'} cardId={selectedId} onClose={() => setSelectedId(null)} onChanged={refresh} />
      <IssueGiftCardDrawer
        key={issuing ? 'ouvert' : 'ferme'}
        isOpen={issuing}
        onClose={() => setIssuing(false)}
        onIssued={(card) => {
          setIssuing(false);
          refresh();
          setSelectedId(card.id);
        }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Détail d'une carte
// ---------------------------------------------------------------------------

function GiftCardDrawer({ cardId, onClose, onChanged }: { cardId: string | null; onClose: () => void; onChanged: () => void }) {
  const { currentUser } = useAdminSidebar();
  const canManage = currentUser?.role === 'ADMIN' || currentUser?.role === 'MANAGER';
  const [card, setCard] = useState<AdminGiftCardDetail | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodCode>('WAVE');
  const [notes, setNotes] = useState('');
  const [disableReason, setDisableReason] = useState('');
  const [confirmDisable, setConfirmDisable] = useState(false);
  const loading = Boolean(cardId) && !card && !loadError;

  useEffect(() => {
    if (!cardId) return;
    let cancelled = false;
    getAdminGiftCard(cardId)
      .then((res) => {
        if (!cancelled) setCard(res);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(errorMessage(err, 'Carte introuvable.'));
      });
    return () => {
      cancelled = true;
    };
  }, [cardId]);

  const run = (label: string, action: () => Promise<AdminGiftCardDetail | { sent: boolean; to: string }>, success: string) => {
    setBusy(label);
    action()
      .then((res) => {
        if ('transactions' in res) setCard(res);
        toast.success(success);
        onChanged();
        setConfirmDisable(false);
      })
      .catch((err) => toast.error(errorMessage(err, 'Action impossible.')))
      .finally(() => setBusy(null));
  };

  const footer = card ? (
    <div className="flex flex-wrap justify-end gap-2">
      {card.status === 'ACTIVE' && (
        <Button
          type="button"
          variant="outline"
          disabled={Boolean(busy)}
          onClick={() => run('resend', () => resendGiftCard(card.id), `Carte renvoyée à ${card.recipientEmail}`)}
          className="h-9 border-[#e7e4dd] text-xs"
        >
          {busy === 'resend' ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Send className="mr-1.5 h-3.5 w-3.5" />}
          Renvoyer au destinataire
        </Button>
      )}
      {canManage && card.status !== 'DISABLED' && card.status !== 'USED' && (
        <Button
          type="button"
          variant="outline"
          disabled={Boolean(busy)}
          onClick={() => setConfirmDisable(true)}
          className="h-9 border-red-200 text-xs text-red-700 hover:bg-red-50"
        >
          <Ban className="mr-1.5 h-3.5 w-3.5" /> Désactiver
        </Button>
      )}
      {canManage && card.status === 'DISABLED' && (
        <Button
          type="button"
          variant="outline"
          disabled={Boolean(busy)}
          onClick={() => run('enable', () => enableGiftCard(card.id), 'Carte réactivée')}
          className="h-9 border-[#e7e4dd] text-xs"
        >
          {busy === 'enable' ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="mr-1.5 h-3.5 w-3.5" />}
          Réactiver
        </Button>
      )}
    </div>
  ) : undefined;

  return (
    <AdminDrawer
      isOpen={Boolean(cardId)}
      onClose={onClose}
      title={card ? <span className="font-mono tracking-wider">{card.code}</span> : 'Carte cadeau'}
      subtitle={card ? `${fcfa(card.initialAmount)} pour ${card.recipientName}` : undefined}
      icon={<Gift className="h-5 w-5 text-[#c1647a]" />}
      headerExtra={card ? <StatusBadge status={card.status} /> : undefined}
      footer={footer}
      size="lg"
    >
      {loading ? (
        <div className="flex items-center gap-2 py-10 text-xs text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Chargement…
        </div>
      ) : loadError ? (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
          {loadError}
        </p>
      ) : card ? (
        <div className="space-y-5 text-xs">
          {card.status === 'PENDING_PAYMENT' && (
            <section className="space-y-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="flex items-center gap-1.5 text-sm font-bold text-amber-900">
                <Wallet className="h-4 w-4" /> Encaisser cette carte
              </h3>
              <p className="text-amber-900">
                Contactez {card.purchaserName} ({card.purchaserPhone || card.purchaserEmail}) pour le règlement de {fcfa(card.initialAmount)}.
                Une fois le paiement reçu, la carte est activée pour 12 mois et envoyée à {card.recipientEmail}.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-1">
                  <span className="font-semibold text-gray-700">Moyen de paiement</span>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethodCode)}
                    className="h-9 w-full rounded-md border border-[#e7e4dd] bg-white px-2"
                  >
                    {PAYMENT_OPTIONS.map((m) => (
                      <option key={m} value={m}>
                        {PAYMENT_METHOD_LABELS[m]}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-1">
                  <span className="font-semibold text-gray-700">Note interne (facultatif)</span>
                  <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Réf. Wave, reçu n°…" className="h-9 bg-white text-xs" />
                </label>
              </div>
              <Button
                type="button"
                disabled={Boolean(busy)}
                onClick={() =>
                  run(
                    'activate',
                    () => activateGiftCard(card.id, { paymentMethod, notes: notes.trim() || undefined }),
                    `Carte activée et envoyée à ${card.recipientEmail}`,
                  )
                }
                className="h-9 bg-[#24582d] text-xs font-semibold text-white hover:bg-[#1c4423]"
              >
                {busy === 'activate' ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />}
                Paiement reçu : activer et envoyer
              </Button>
            </section>
          )}

          {confirmDisable && (
            <section className="space-y-2 rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="font-semibold text-red-800">Désactiver la carte ? Elle ne pourra plus être utilisée jusqu’à sa réactivation.</p>
              <Input value={disableReason} onChange={(e) => setDisableReason(e.target.value)} placeholder="Motif (facultatif)" className="h-9 bg-white text-xs" />
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setConfirmDisable(false)} className="h-8 text-xs">
                  Annuler
                </Button>
                <Button
                  type="button"
                  disabled={Boolean(busy)}
                  onClick={() => run('disable', () => disableGiftCard(card.id, disableReason.trim() || undefined), 'Carte désactivée')}
                  className="h-8 bg-red-600 text-xs text-white hover:bg-red-700"
                >
                  {busy === 'disable' && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                  Confirmer
                </Button>
              </div>
            </section>
          )}

          <section className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-[#e7e4dd] p-3">
              <span className="text-gray-500">Montant</span>
              <strong className="block text-lg text-gray-900">{fcfa(card.initialAmount)}</strong>
            </div>
            <div className="rounded-xl border border-[#e7e4dd] p-3">
              <span className="text-gray-500">Solde disponible</span>
              <strong className="block text-lg text-[#24582d]">{fcfa(card.status === 'PENDING_PAYMENT' ? 0 : card.balance)}</strong>
            </div>
          </section>

          <section className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1 rounded-xl bg-[#faf8f4] p-3">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Destinataire</h3>
              <p className="font-semibold text-gray-900">{card.recipientName}</p>
              <p className="text-gray-600">{card.recipientEmail}</p>
              {card.message && <p className="pt-1 italic text-gray-600">« {card.message} »</p>}
            </div>
            <div className="space-y-1 rounded-xl bg-[#faf8f4] p-3">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Acheteur</h3>
              <p className="font-semibold text-gray-900">{card.purchaserName}</p>
              <p className="text-gray-600">{card.purchaserEmail}</p>
              {card.purchaserPhone && <p className="text-gray-600">{card.purchaserPhone}</p>}
            </div>
          </section>

          <section className="space-y-1.5 rounded-xl border border-[#e7e4dd] p-3">
            <p>
              <span className="text-gray-500">Origine :</span> {card.issuedInStore ? 'émise par l’équipe' : 'commandée sur le site'} le {date(card.createdAt)}
            </p>
            <p>
              <span className="text-gray-500">Paiement :</span>{' '}
              {card.paymentMethod ? `${PAYMENT_METHOD_LABELS[card.paymentMethod]} · ${date(card.paidAt)}` : card.activatedAt ? 'Carte offerte' : 'En attente'}
            </p>
            <p>
              <span className="text-gray-500">Validité :</span> {card.expiresAt ? `jusqu’au ${date(card.expiresAt)}` : 'démarre au paiement'}
            </p>
            {card.notes && <p className="whitespace-pre-line text-gray-700">{card.notes}</p>}
          </section>

          <section>
            <h3 className="mb-2 text-sm font-bold text-[#1e2a1f]">Historique</h3>
            {card.transactions.length === 0 ? (
              <p className="text-gray-500">Aucune opération pour l’instant.</p>
            ) : (
              <ul className="divide-y divide-[#f0ede6] rounded-xl border border-[#e7e4dd]">
                {card.transactions.map((t) => (
                  <li key={t.id} className="flex items-center justify-between gap-3 px-3 py-2.5">
                    <span>
                      <span className="block text-gray-800">
                        {t.note}
                        {t.orderId && t.orderNumber && (
                          <>
                            {' '}
                            <Link href={`/admin/commandes/${t.orderId}`} className="font-semibold text-[#c1647a] underline">
                              voir
                            </Link>
                          </>
                        )}
                      </span>
                      <span className="text-[11px] text-gray-400">{new Date(t.createdAt).toLocaleString('fr-FR')}</span>
                    </span>
                    <span className="text-right">
                      <strong className={t.amount >= 0 ? 'text-emerald-700' : 'text-red-600'}>
                        {t.amount >= 0 ? '+' : '−'}
                        {fcfa(Math.abs(t.amount))}
                      </strong>
                      <span className="block text-[11px] text-gray-400">Solde : {fcfa(t.balanceAfter)}</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      ) : null}
    </AdminDrawer>
  );
}

// ---------------------------------------------------------------------------
// Émission d'une carte par l'équipe
// ---------------------------------------------------------------------------

function IssueGiftCardDrawer({
  isOpen,
  onClose,
  onIssued,
}: {
  isOpen: boolean;
  onClose: () => void;
  onIssued: (card: AdminGiftCard) => void;
}) {
  const [amount, setAmount] = useState('25000');
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [message, setMessage] = useState('');
  const [purchaserName, setPurchaserName] = useState('');
  const [purchaserEmail, setPurchaserEmail] = useState('');
  const [purchaserPhone, setPurchaserPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodCode | ''>('CASH_ON_DELIVERY');
  const [notes, setNotes] = useState('');
  const [sendEmail, setSendEmail] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = Number(amount.replace(/\s/g, ''));
    if (!Number.isInteger(value) || value < GIFT_CARD_MIN_AMOUNT || value > GIFT_CARD_MAX_AMOUNT) {
      return setError(`Montant entre ${fcfa(GIFT_CARD_MIN_AMOUNT)} et ${fcfa(GIFT_CARD_MAX_AMOUNT)}.`);
    }
    setError(null);
    setSaving(true);
    issueGiftCard({
      amount: value,
      recipientName: recipientName.trim(),
      recipientEmail: recipientEmail.trim(),
      message: message.trim() || undefined,
      purchaserName: purchaserName.trim() || undefined,
      purchaserEmail: purchaserEmail.trim() || undefined,
      purchaserPhone: purchaserPhone.trim() || undefined,
      paymentMethod: paymentMethod || undefined,
      notes: notes.trim() || undefined,
      sendEmail,
    })
      .then((card) => {
        toast.success(`Carte ${card.code} émise`, {
          description: sendEmail ? `Envoyée à ${card.recipientEmail}` : 'À remettre au client',
        });
        onIssued(card);
      })
      .catch((err) => setError(errorMessage(err, 'La carte n’a pas pu être émise.')))
      .finally(() => setSaving(false));
  };

  const field = 'h-9 bg-white text-xs';

  return (
    <AdminDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Émettre une carte cadeau"
      subtitle="Vente en boutique ou geste commercial : la carte est active immédiatement (12 mois)."
      icon={<Gift className="h-5 w-5 text-[#c1647a]" />}
      size="md"
      footer={
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose} className="h-9 text-xs">
            Annuler
          </Button>
          <Button type="submit" form="issue-gift-card" disabled={saving} className="h-9 bg-[#c1647a] text-xs font-semibold text-white hover:bg-[#a85266]">
            {saving && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
            Émettre la carte
          </Button>
        </div>
      }
    >
      <form id="issue-gift-card" onSubmit={submit} className="space-y-4 text-xs">
        {error && (
          <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-red-700">
            {error}
          </p>
        )}
        <label className="block space-y-1">
          <span className="font-semibold text-gray-700">Montant (FCFA) *</span>
          <Input inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d\s]/g, ''))} className={field} required />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block space-y-1">
            <span className="font-semibold text-gray-700">Nom du destinataire *</span>
            <Input value={recipientName} onChange={(e) => setRecipientName(e.target.value)} className={field} required />
          </label>
          <label className="block space-y-1">
            <span className="font-semibold text-gray-700">Email du destinataire *</span>
            <Input type="email" value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} className={field} required />
          </label>
        </div>
        <label className="block space-y-1">
          <span className="font-semibold text-gray-700">Message (facultatif)</span>
          <textarea
            rows={3}
            maxLength={500}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full rounded-md border border-[#e7e4dd] bg-white px-3 py-2"
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="block space-y-1">
            <span className="font-semibold text-gray-700">Offert par</span>
            <Input value={purchaserName} onChange={(e) => setPurchaserName(e.target.value)} placeholder="DécoFleur Plus" className={field} />
          </label>
          <label className="block space-y-1">
            <span className="font-semibold text-gray-700">Email acheteur</span>
            <Input type="email" value={purchaserEmail} onChange={(e) => setPurchaserEmail(e.target.value)} className={field} />
          </label>
          <label className="block space-y-1">
            <span className="font-semibold text-gray-700">Téléphone</span>
            <Input value={purchaserPhone} onChange={(e) => setPurchaserPhone(e.target.value)} className={field} />
          </label>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block space-y-1">
            <span className="font-semibold text-gray-700">Règlement</span>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethodCode | '')}
              className="h-9 w-full rounded-md border border-[#e7e4dd] bg-white px-2"
            >
              <option value="">Carte offerte (geste commercial)</option>
              {PAYMENT_OPTIONS.map((m) => (
                <option key={m} value={m}>
                  {PAYMENT_METHOD_LABELS[m]}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1">
            <span className="font-semibold text-gray-700">Note interne</span>
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} className={field} />
          </label>
        </div>
        <label className="flex items-center gap-2 rounded-lg border border-[#e7e4dd] bg-[#fcfaf7] p-3">
          <input type="checkbox" checked={sendEmail} onChange={(e) => setSendEmail(e.target.checked)} className="h-4 w-4 accent-[#c1647a]" />
          Envoyer la carte par email au destinataire
        </label>
      </form>
    </AdminDrawer>
  );
}
