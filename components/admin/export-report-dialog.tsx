'use client';

import { useState } from 'react';
import type { ReportDataset, FinancialTransaction } from '@/lib/admin/mock-data/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  FileSpreadsheet,
  FileText,
  Download,
  Layers,
  Sparkles,
  Printer,
} from 'lucide-react';
import { toast } from 'sonner';

type ReportType = 'sales' | 'financial' | 'products' | 'transactions';
type ExportFormat = 'csv' | 'pdf';

interface ExportReportDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  dataset: ReportDataset;
  periodLabel: string;
  transactions: FinancialTransaction[];
}

export function ExportReportDialog({
  isOpen,
  onOpenChange,
  dataset,
  periodLabel,
  transactions,
}: ExportReportDialogProps) {
  const [reportType, setReportType] = useState<ReportType>('sales');
  const [format, setFormat] = useState<ExportFormat>('csv');
  const [isExporting, setIsExporting] = useState(false);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(val);

  const handleExportCSV = () => {
    let csvContent = '\uFEFF'; // UTF-8 BOM for Excel
    const generatedDate = new Date().toLocaleDateString('fr-FR');

    if (reportType === 'sales') {
      csvContent += `DÉCOFLEUR PLUS - RAPPORT COMMERCIAL ET VENTES\n`;
      csvContent += `Période:;${periodLabel}\n`;
      csvContent += `Date d'export:;${generatedDate}\n\n`;

      csvContent += `MÉTRIQUES CLÉS\n`;
      csvContent += `Chiffre d'affaires brut (FCFA);Commandes;Panier moyen (FCFA);Nouveaux clients;Clients récurrents\n`;
      csvContent += `${dataset.current.grossRevenue};${dataset.current.ordersCount};${dataset.current.averageOrderValue};${dataset.current.newCustomersCount};${dataset.current.returningCustomersCount}\n\n`;

      csvContent += `TOP VENTES PRODUITS\n`;
      csvContent += `Produit;SKU;Catégorie;Quantité vendue;Revenu total (FCFA);Prix moyen (FCFA);Marge (%)\n`;
      dataset.topProducts.forEach((p) => {
        csvContent += `"${p.name}";${p.sku};"${p.category}";${p.quantitySold};${p.revenue};${p.averagePrice};${p.marginRate == null ? 'n.c.' : `${p.marginRate}%`}\n`;
      });
      csvContent += `\n`;

      csvContent += `RÉPARTITION PAR CATÉGORIE\n`;
      csvContent += `Catégorie;Volume ventes;Revenu (FCFA);Part (%)\n`;
      dataset.categoriesBreakdown.forEach((c) => {
        csvContent += `"${c.category}";${c.salesCount};${c.revenue};${c.percentage}%\n`;
      });
      csvContent += `\n`;

      csvContent += `RÉPARTITION PAR ZONE DE LIVRAISON\n`;
      csvContent += `Zone de livraison;Commandes;Revenu (FCFA);Part (%)\n`;
      dataset.zonesBreakdown.forEach((z) => {
        csvContent += `"${z.zone}";${z.ordersCount};${z.revenue};${z.percentage}%\n`;
      });
    } else if (reportType === 'financial') {
      csvContent += `DÉCOFLEUR PLUS - BILAN FINANCIER ET ENCAISSEMENTS\n`;
      csvContent += `Période:;${periodLabel}\n`;
      csvContent += `Date d'export:;${generatedDate}\n\n`;

      csvContent += `RÉCAPITULATIF DE TRÉSORERIE\n`;
      csvContent += `Total Encaissé (FCFA);En attente / Espèces (FCFA);Commissions passerelles (FCFA);Trésorerie nette (FCFA)\n`;
      csvContent += `${dataset.current.collectedAmount};${dataset.current.pendingAmount};${dataset.current.gatewayFees};${dataset.current.netRevenue}\n\n`;

      csvContent += `VENTILATION PAR MODE DE PAIEMENT\n`;
      csvContent += `Moyen de paiement;Transactions;Brut encaissé (FCFA);Frais passerelles (FCFA);Net perçu (FCFA);Part (%)\n`;
      dataset.paymentBreakdown.forEach((p) => {
        csvContent += `"${p.label}";${p.count};${p.grossRevenue};${p.fees};${p.netRevenue};${p.percentage}%\n`;
      });
    } else if (reportType === 'products') {
      csvContent += `DÉCOFLEUR PLUS - SYNTHÈSE DES PERFORMANCES PRODUITS\n`;
      csvContent += `Période:;${periodLabel}\n`;
      csvContent += `Date d'export:;${generatedDate}\n\n`;

      csvContent += `PRODUITS ET RENTABILITÉ\n`;
      csvContent += `Nom du produit;SKU;Catégorie;Quantité vendue;Revenu généré (FCFA);Prix unitaire moyen;Taux de marge estimé\n`;
      dataset.topProducts.forEach((p) => {
        csvContent += `"${p.name}";${p.sku};"${p.category}";${p.quantitySold};${p.revenue};${p.averagePrice};${p.marginRate == null ? 'n.c.' : `${p.marginRate}%`}\n`;
      });
    } else {
      // transactions
      csvContent += `DÉCOFLEUR PLUS - JOURNAL DES ENCAISSEMENTS ET TRANSACTIONS\n`;
      csvContent += `Période:;${periodLabel}\n`;
      csvContent += `Date d'export:;${generatedDate}\n\n`;

      csvContent += `Date;Réf Transaction;Commande;Client;Téléphone;Moyen;Montant brut (FCFA);Frais (FCFA);Net (FCFA);Statut;Réf Passerelle\n`;
      transactions.forEach((tx) => {
        const d = new Date(tx.date).toLocaleDateString('fr-FR');
        csvContent += `${d};${tx.ref};${tx.orderRef};"${tx.customerName}";${tx.customerPhone};${tx.paymentMethod};${tx.grossAmount};${tx.gatewayFee};${tx.netAmount};${tx.status};${tx.gatewayRef || 'N/A'}\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `decofleur_rapport_${reportType}_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    // Generate styled printable HTML view
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Veuillez autoriser les fenêtres pop-up pour imprimer ou exporter en PDF');
      return;
    }

    const generatedDate = new Date().toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    let bodyContent = '';

    if (reportType === 'sales') {
      bodyContent = `
        <div class="header">
          <div class="brand">
            <h1>Décofleur <span>Plus</span></h1>
            <p>Nature en Élégance • Saly & Petite Côte, Sénégal</p>
          </div>
          <div class="meta">
            <h2>Rapport Commercial & Ventes</h2>
            <p><strong>Période :</strong> ${periodLabel}</p>
            <p><strong>Édité le :</strong> ${generatedDate}</p>
          </div>
        </div>

        <div class="kpi-grid">
          <div class="kpi-card">
            <span class="kpi-label">Chiffre d'Affaires</span>
            <span class="kpi-value">${formatCurrency(dataset.current.grossRevenue)}</span>
          </div>
          <div class="kpi-card">
            <span class="kpi-label">Commandes</span>
            <span class="kpi-value">${dataset.current.ordersCount}</span>
          </div>
          <div class="kpi-card">
            <span class="kpi-label">Panier Moyen</span>
            <span class="kpi-value">${formatCurrency(dataset.current.averageOrderValue)}</span>
          </div>
          <div class="kpi-card">
            <span class="kpi-label">Nouveaux Clients</span>
            <span class="kpi-value">${dataset.current.newCustomersCount}</span>
          </div>
        </div>

        <h3>Top 5 Meilleures Ventes Florales</h3>
        <table>
          <thead>
            <tr>
              <th>Produit</th>
              <th>SKU</th>
              <th>Catégorie</th>
              <th style="text-align: right;">Qté</th>
              <th style="text-align: right;">CA Généré</th>
              <th style="text-align: right;">Marge</th>
            </tr>
          </thead>
          <tbody>
            ${dataset.topProducts
              .map(
                (p) => `
              <tr>
                <td><strong>${p.name}</strong></td>
                <td>${p.sku}</td>
                <td>${p.category}</td>
                <td style="text-align: right;">${p.quantitySold}</td>
                <td style="text-align: right;">${formatCurrency(p.revenue)}</td>
                <td style="text-align: right;">${p.marginRate == null ? 'n.c.' : `${p.marginRate}%`}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>

        <h3>Répartition Géographique des Ventes</h3>
        <table>
          <thead>
            <tr>
              <th>Zone de Livraison</th>
              <th style="text-align: right;">Commandes</th>
              <th style="text-align: right;">Revenu</th>
              <th style="text-align: right;">Part</th>
            </tr>
          </thead>
          <tbody>
            ${dataset.zonesBreakdown
              .map(
                (z) => `
              <tr>
                <td>${z.zone}</td>
                <td style="text-align: right;">${z.ordersCount}</td>
                <td style="text-align: right;">${formatCurrency(z.revenue)}</td>
                <td style="text-align: right;">${z.percentage}%</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      `;
    } else if (reportType === 'financial') {
      bodyContent = `
        <div class="header">
          <div class="brand">
            <h1>Décofleur <span>Plus</span></h1>
            <p>Nature en Élégance • Saly & Petite Côte, Sénégal</p>
          </div>
          <div class="meta">
            <h2>Bilan Financier & Trésorerie</h2>
            <p><strong>Période :</strong> ${periodLabel}</p>
            <p><strong>Édité le :</strong> ${generatedDate}</p>
          </div>
        </div>

        <div class="kpi-grid">
          <div class="kpi-card">
            <span class="kpi-label">Total Encaissé</span>
            <span class="kpi-value">${formatCurrency(dataset.current.collectedAmount)}</span>
          </div>
          <div class="kpi-card">
            <span class="kpi-label">En attente / Espèces</span>
            <span class="kpi-value">${formatCurrency(dataset.current.pendingAmount)}</span>
          </div>
          <div class="kpi-card">
            <span class="kpi-label">Frais & Commissions</span>
            <span class="kpi-value">${formatCurrency(dataset.current.gatewayFees)}</span>
          </div>
          <div class="kpi-card">
            <span class="kpi-label">Trésorerie Nette</span>
            <span class="kpi-value" style="color: #059669;">${formatCurrency(dataset.current.netRevenue)}</span>
          </div>
        </div>

        <h3>Ventilation par Passerelle et Mode de Paiement</h3>
        <table>
          <thead>
            <tr>
              <th>Mode de Paiement</th>
              <th style="text-align: right;">Transactions</th>
              <th style="text-align: right;">Montant Brut</th>
              <th style="text-align: right;">Frais Passerelle</th>
              <th style="text-align: right;">Net Reçu</th>
              <th style="text-align: right;">Part</th>
            </tr>
          </thead>
          <tbody>
            ${dataset.paymentBreakdown
              .map(
                (p) => `
              <tr>
                <td><strong>${p.label}</strong></td>
                <td style="text-align: right;">${p.count}</td>
                <td style="text-align: right;">${formatCurrency(p.grossRevenue)}</td>
                <td style="text-align: right;">${formatCurrency(p.fees)}</td>
                <td style="text-align: right; font-weight: 600;">${formatCurrency(p.netRevenue)}</td>
                <td style="text-align: right;">${p.percentage}%</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      `;
    } else {
      // transactions log
      bodyContent = `
        <div class="header">
          <div class="brand">
            <h1>Décofleur <span>Plus</span></h1>
            <p>Nature en Élégance • Saly & Petite Côte, Sénégal</p>
          </div>
          <div class="meta">
            <h2>Grand Livre des Encaissements</h2>
            <p><strong>Période :</strong> ${periodLabel}</p>
            <p><strong>Édité le :</strong> ${generatedDate}</p>
          </div>
        </div>

        <h3>Dernières Transactions Financières</h3>
        <table>
          <thead>
            <tr>
              <th>Réf</th>
              <th>Commande</th>
              <th>Client</th>
              <th>Moyen</th>
              <th style="text-align: right;">Brut</th>
              <th style="text-align: right;">Frais</th>
              <th style="text-align: right;">Net</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            ${transactions
              .map(
                (tx) => `
              <tr>
                <td><code>${tx.ref}</code></td>
                <td>${tx.orderRef}</td>
                <td>${tx.customerName}</td>
                <td style="text-transform: capitalize;">${tx.paymentMethod.replace('_', ' ')}</td>
                <td style="text-align: right;">${formatCurrency(tx.grossAmount)}</td>
                <td style="text-align: right;">${formatCurrency(tx.gatewayFee)}</td>
                <td style="text-align: right; font-weight: 600;">${formatCurrency(tx.netAmount)}</td>
                <td><span class="badge ${tx.status}">${tx.status}</span></td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      `;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Décofleur Plus - Rapport ${reportType} - ${periodLabel}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              color: #1e293b;
              padding: 40px;
              margin: 0;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              border-bottom: 2px solid #e2e8f0;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .brand h1 {
              margin: 0;
              color: #0f172a;
              font-size: 26px;
            }
            .brand h1 span {
              color: #c1647a;
            }
            .brand p {
              margin: 4px 0 0 0;
              color: #64748b;
              font-size: 13px;
            }
            .meta h2 {
              margin: 0 0 8px 0;
              color: #0f172a;
              font-size: 18px;
            }
            .meta p {
              margin: 3px 0;
              font-size: 12px;
              color: #475569;
            }
            .kpi-grid {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 16px;
              margin-bottom: 30px;
            }
            .kpi-card {
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              padding: 14px;
              background: #f8fafc;
            }
            .kpi-label {
              display: block;
              font-size: 11px;
              text-transform: uppercase;
              color: #64748b;
              font-weight: 600;
              margin-bottom: 6px;
            }
            .kpi-value {
              font-size: 20px;
              font-weight: 700;
              color: #0f172a;
            }
            h3 {
              font-size: 16px;
              color: #0f172a;
              margin: 24px 0 12px 0;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 24px;
              font-size: 13px;
            }
            th, td {
              border: 1px solid #e2e8f0;
              padding: 10px 12px;
              text-align: left;
            }
            th {
              background: #f1f5f9;
              font-weight: 600;
              color: #334155;
            }
            .badge {
              display: inline-block;
              padding: 2px 8px;
              border-radius: 4px;
              font-size: 11px;
              font-weight: 600;
              text-transform: uppercase;
            }
            .badge.encaisse { background: #dcfce7; color: #166534; }
            .badge.en_attente { background: #fef9c3; color: #854d0e; }
            .badge.rembourse { background: #fee2e2; color: #991b1b; }
            @media print {
              body { padding: 20px; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          ${bodyContent}
          <div style="text-align: center; margin-top: 40px; color: #94a3b8; font-size: 11px;">
            Document généré automatiquement depuis le système de gestion Décofleur Plus • Confidentiel
          </div>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      if (format === 'csv') {
        handleExportCSV();
        toast.success(`Rapport ${reportType} exporté avec succès en CSV`);
      } else {
        handleExportPDF();
        toast.success(`Aperçu d'impression PDF généré avec succès`);
      }
      setIsExporting(false);
      onOpenChange(false);
    }, 400);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[94vw] max-w-[560px] p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-pink-50 text-[#c1647a]">
              <Download className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg sm:text-xl font-bold">Exporter un rapport d’activité</DialogTitle>
              <DialogDescription className="text-xs sm:text-sm text-gray-500">
                Période : <span className="font-semibold text-gray-900">{periodLabel}</span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-5 py-2">
          {/* Sélection du Type de Rapport */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase text-gray-500">
              Type de rapport
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
              <button
                type="button"
                onClick={() => setReportType('sales')}
                className={`flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-all ${
                  reportType === 'sales'
                    ? 'border-[#c1647a] bg-pink-50/50 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2 font-medium text-gray-900">
                  <Layers className="h-4 w-4 text-[#c1647a]" />
                  <span>Ventes & Commercial</span>
                </div>
                <p className="text-xs text-gray-500">
                  CA, commandes, panier moyen, top fleurs et zones.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setReportType('financial')}
                className={`flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-all ${
                  reportType === 'financial'
                    ? 'border-[#c1647a] bg-pink-50/50 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2 font-medium text-gray-900">
                  <FileText className="h-4 w-4 text-emerald-600" />
                  <span>Bilan & Trésorerie</span>
                </div>
                <p className="text-xs text-gray-500">
                  Total encaissé, Wave, OM, CB, commissions et net.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setReportType('products')}
                className={`flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-all ${
                  reportType === 'products'
                    ? 'border-[#c1647a] bg-pink-50/50 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2 font-medium text-gray-900">
                  <Sparkles className="h-4 w-4 text-amber-600" />
                  <span>Performance Produits</span>
                </div>
                <p className="text-xs text-gray-500">
                  Volumes vendus par bouquet, chiffre d’affaires et marges.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setReportType('transactions')}
                className={`flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-all ${
                  reportType === 'transactions'
                    ? 'border-[#c1647a] bg-pink-50/50 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2 font-medium text-gray-900">
                  <FileSpreadsheet className="h-4 w-4 text-blue-600" />
                  <span>Grand Livre Encaissements</span>
                </div>
                <p className="text-xs text-gray-500">
                  Journal d’audit détaillé de chaque transaction et statut.
                </p>
              </button>
            </div>
          </div>

          {/* Sélection du Format */}
          <div className="space-y-2 sm:space-y-2.5">
            <Label className="text-xs font-semibold uppercase text-gray-500">
              Format d’exportation
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setFormat('csv')}
                className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                  format === 'csv'
                    ? 'border-[#c1647a] bg-pink-50/30 ring-1 ring-[#c1647a]'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                  <FileSpreadsheet className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">Format CSV (Excel)</div>
                  <div className="text-xs text-gray-500">Pour tableurs & comptabilité</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormat('pdf')}
                className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                  format === 'pdf'
                    ? 'border-[#c1647a] bg-pink-50/30 ring-1 ring-[#c1647a]'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-100 text-rose-700">
                  <Printer className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">Document Imprimable (PDF)</div>
                  <div className="text-xs text-gray-500">Mise en page officielle & branding</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isExporting}
          >
            Annuler
          </Button>
          <Button
            type="button"
            onClick={handleExport}
            disabled={isExporting}
            className="bg-[#c1647a] hover:bg-[#a84d63] text-white"
          >
            {isExporting ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Génération en cours...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Générer & Télécharger
              </span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
