'use client';

import { useEffect, useState } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  Eye,
  Globe,
  Info,
  Layers,
  Loader2,
  Monitor,
  RotateCw,
  Smartphone,
  Tablet,
  UserPlus,
  Users,
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ReportPeriodPreset } from '@/lib/admin/mock-data/types';
import { getAdminVisitorReport, type VisitorReport } from '@/lib/api/admin/reports';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler, Legend);

const ACCENT = '#c1647a';
const GREEN = '#193e23';

const nf = new Intl.NumberFormat('fr-FR');
const fmt = (n: number) => nf.format(n);

/** « 2026-11-21 » → « 21/11 » (ou « 21/11/2026 » avec l'année). */
function shortDate(day: string, withYear = false): string {
  const [y, m, d] = day.split('-');
  return withYear ? `${d}/${m}/${y}` : `${d}/${m}`;
}

function pageLabel(path: string): string {
  return path === '/' ? 'Accueil' : path;
}

const DEVICE_ICONS: Record<string, typeof Smartphone> = { mobile: Smartphone, tablette: Tablet, ordinateur: Monitor };

function Delta({ value, comparison }: { value: number | null; comparison: string }) {
  if (value === null) {
    return (
      <span className="text-[11px] text-gray-400" title="Aucune visite sur la période précédente">
        — {comparison}
      </span>
    );
  }
  const up = value >= 0;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span className={`inline-flex items-center gap-0.5 text-[11px] font-semibold ${up ? 'text-emerald-700' : 'text-red-600'}`}>
      <Icon className="h-3 w-3" />
      {up ? '+' : ''}
      {value.toLocaleString('fr-FR')}% <span className="font-normal text-gray-500 ml-1">{comparison}</span>
    </span>
  );
}

function Kpi({
  label,
  value,
  icon: Icon,
  children,
}: {
  label: string;
  value: string;
  icon: typeof Users;
  children?: React.ReactNode;
}) {
  return (
    <Card className="border-gray-200 shadow-2xs">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 px-3 sm:px-4 pt-3 sm:pt-4">
        <CardTitle className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-gray-500 truncate">
          {label}
        </CardTitle>
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-pink-50 text-[#c1647a]">
          <Icon className="h-3.5 w-3.5" />
        </span>
      </CardHeader>
      <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
        <div className="text-xl sm:text-2xl font-bold text-gray-900 tabular-nums">{value}</div>
        <div className="mt-1 min-h-4">{children}</div>
      </CardContent>
    </Card>
  );
}

function BreakdownList({ items, total, iconFor, capitalize = false }: {
  items: { label: string; visits: number }[];
  total: number;
  iconFor?: (label: string) => typeof Users;
  /** Libellés en minuscules côté serveur (appareils) : première lettre en majuscule */
  capitalize?: boolean;
}) {
  if (items.length === 0) return <p className="text-xs text-gray-400 py-4 text-center">Aucune visite sur la période.</p>;
  return (
    <ul className="space-y-3">
      {items.map((item) => {
        const pct = total ? Math.round((item.visits / total) * 100) : 0;
        const Icon = iconFor?.(item.label);
        return (
          <li key={item.label}>
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className={`flex items-center gap-1.5 font-medium text-gray-800 truncate ${capitalize ? 'capitalize' : ''}`}>
                {Icon && <Icon className="h-3.5 w-3.5 text-gray-500 shrink-0" />}
                {item.label}
              </span>
              <span className="text-gray-500 tabular-nums shrink-0">
                {fmt(item.visits)} · {pct}%
              </span>
            </div>
            <div className="mt-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
              <div className="h-full rounded-full bg-[#c1647a]" style={{ width: `${pct}%` }} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

interface LoadResult {
  key: string;
  report?: VisitorReport;
  error?: string;
}

/** Onglet « Visiteurs & Audience » des rapports : fréquentation de la boutique sur la période choisie. */
export function VisitorsReport({
  preset,
  startDate,
  endDate,
}: {
  preset: ReportPeriodPreset;
  startDate?: string;
  endDate?: string;
}) {
  const [retry, setRetry] = useState(0);
  const [result, setResult] = useState<LoadResult | null>(null);
  const [lastReport, setLastReport] = useState<VisitorReport | null>(null);
  const key = JSON.stringify([preset, startDate, endDate, retry]);
  const loading = result?.key !== key;

  useEffect(() => {
    let active = true;
    getAdminVisitorReport({ preset, startDate, endDate })
      .then((report) => {
        if (!active) return;
        setResult({ key, report });
        setLastReport(report);
      })
      .catch((err: unknown) => {
        if (active) setResult({ key, error: err instanceof Error ? err.message : 'Rapport indisponible.' });
      });
    return () => {
      active = false;
    };
  }, [key, preset, startDate, endDate]);

  // Pendant un nouveau chargement, le rapport précédent reste affiché (atténué)
  const report = (!loading && result?.report) || lastReport;
  const error = !loading ? result?.error : undefined;

  if (error && !report) {
    return (
      <Card className="border-red-200 bg-red-50/60 shadow-2xs">
        <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm text-red-800">
          <span>Les visiteurs n&apos;ont pas pu être chargés : {error}</span>
          <Button size="sm" variant="outline" onClick={() => setRetry((n) => n + 1)} className="h-8 text-xs bg-white">
            <RotateCw className="h-3.5 w-3.5 mr-1.5" /> Réessayer
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!report) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-sm text-gray-500">
        <Loader2 className="h-4 w-4 animate-spin text-[#c1647a]" /> Chargement des visiteurs…
      </div>
    );
  }

  const { current, deltas, comparisonLabel } = report;
  const longRange = report.daily.length > 62;
  const chartData = {
    labels: report.daily.map((d) => shortDate(d.date, longRange)),
    datasets: [
      {
        label: 'Visiteurs',
        data: report.daily.map((d) => d.visitors),
        borderColor: ACCENT,
        backgroundColor: 'rgba(193, 100, 122, 0.12)',
        fill: true,
        tension: 0.3,
        pointRadius: report.daily.length > 45 ? 0 : 3,
        borderWidth: 2,
      },
      {
        label: 'Pages vues',
        data: report.daily.map((d) => d.pageViews),
        borderColor: GREEN,
        backgroundColor: 'rgba(25, 62, 35, 0.08)',
        fill: false,
        tension: 0.3,
        pointRadius: report.daily.length > 45 ? 0 : 3,
        borderWidth: 2,
        borderDash: [5, 4],
      },
    ],
  };
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index' as const, intersect: false },
    plugins: {
      legend: { position: 'bottom' as const, labels: { boxWidth: 12, font: { size: 11 } } },
    },
    scales: {
      y: { beginAtZero: true, ticks: { precision: 0, font: { size: 11 } }, grid: { color: '#f3f4f6' } },
      x: { ticks: { font: { size: 10 }, maxRotation: 0, autoSkip: true, maxTicksLimit: 12 }, grid: { display: false } },
    },
  };

  return (
    <div className={`space-y-6 transition-opacity ${loading ? 'opacity-60' : ''}`} aria-busy={loading}>
      <div className="flex items-start gap-2 rounded-xl border border-gray-200 bg-white p-3 text-[11px] sm:text-xs text-gray-600">
        <Info className="h-3.5 w-3.5 mt-0.5 shrink-0 text-gray-400" />
        <p>
          Mesure anonyme de la boutique : un identifiant tiré au hasard par navigateur, aucune donnée personnelle.
          Les robots, le back-office et les navigateurs où l&apos;équipe est connectée ne sont pas comptés.{' '}
          {report.trackingSince ? (
            <>Données disponibles depuis le <strong>{shortDate(report.trackingSince, true)}</strong>.</>
          ) : (
            <strong>Le compteur vient d&apos;être activé : les premières visites apparaîtront ici.</strong>
          )}
        </p>
      </div>

      <div className="grid gap-2.5 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <Kpi label="Visiteurs uniques" value={fmt(current.visitors)} icon={Users}>
          <Delta value={deltas.visitorsDelta} comparison={comparisonLabel} />
        </Kpi>
        <Kpi label="Pages vues" value={fmt(current.pageViews)} icon={Eye}>
          <Delta value={deltas.pageViewsDelta} comparison={comparisonLabel} />
        </Kpi>
        <Kpi label="Nouveaux visiteurs" value={fmt(current.newVisitors)} icon={UserPlus}>
          <span className="text-[11px] text-gray-500">
            {fmt(current.returningVisitors)} déjà venu{current.returningVisitors > 1 ? 's' : ''} avant
          </span>
        </Kpi>
        <Kpi label="Pages par visite" value={current.pagesPerVisit.toLocaleString('fr-FR')} icon={Layers}>
          <span className="text-[11px] text-gray-500">
            {fmt(current.visits)} visite{current.visits > 1 ? 's' : ''} (1 par visiteur et par jour)
          </span>
        </Kpi>
      </div>

      <Card className="border-gray-200 shadow-xs">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold text-gray-900">Fréquentation par jour</CardTitle>
          <p className="text-xs text-gray-500">
            {report.periodLabel} · du {shortDate(report.from, true)} au {shortDate(report.to, true)}
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-64 sm:h-72">
            <Line data={chartData} options={chartOptions} />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border-gray-200 shadow-xs lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-gray-900">Pages les plus vues</CardTitle>
          </CardHeader>
          <CardContent>
            {report.topPages.length === 0 ? (
              <p className="text-xs text-gray-400 py-4 text-center">Aucune page vue sur la période.</p>
            ) : (
              <ol className="space-y-2">
                {report.topPages.map((page, i) => (
                  <li key={page.path} className="flex items-center justify-between gap-2 text-xs">
                    <a
                      href={page.path}
                      target="_blank"
                      rel="noreferrer"
                      className="flex min-w-0 items-center gap-2 text-gray-800 hover:text-[#c1647a]"
                      title={page.path}
                    >
                      <span className="w-4 shrink-0 text-right text-gray-400 tabular-nums">{i + 1}</span>
                      <span className="truncate font-medium">{pageLabel(page.path)}</span>
                    </a>
                    <span className="shrink-0 text-gray-500 tabular-nums">{fmt(page.views)}</span>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-1.5">
              <Globe className="h-4 w-4 text-gray-500" /> Provenance des visites
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BreakdownList items={report.sources} total={current.visits} />
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-1.5">
              <Smartphone className="h-4 w-4 text-gray-500" /> Appareils
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BreakdownList
              items={report.devices}
              total={current.visits}
              iconFor={(label) => DEVICE_ICONS[label] ?? Monitor}
              capitalize
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
