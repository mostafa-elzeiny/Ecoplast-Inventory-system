/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { AlertOctagon, AlertTriangle, Send, FileText, CheckCircle, ArrowDownLeft } from 'lucide-react';
import { Product, Category } from '../types';

interface ShortagesViewProps {
  products: Product[];
  categories: Category[];
  lang: 'en' | 'ar';
  t: any;
  onNavigate: (view: string) => void;
}

export default function ShortagesView({
  products,
  categories,
  lang,
  t,
  onNavigate
}: ShortagesViewProps) {
  
  const [draftedOrders, setDraftedOrders] = useState<Record<string, boolean>>({});

  const isRtl = lang === 'ar';

  const categoryLabels = useMemo(() => {
    const map: Record<string, { en: string; ar: string }> = {};
    categories.forEach(c => {
      map[c.id] = { en: c.nameEn, ar: c.nameAr };
    });
    return map;
  }, [categories]);

  // Find depleted (exactly 0) and low stock (<= minStock and > 0)
  const shortages = useMemo(() => {
    const depleted = products.filter(p => p.quantity === 0);
    const low = products.filter(p => p.quantity <= p.minStock && p.quantity > 0);
    return { depleted, low, total: depleted.length + low.length };
  }, [products]);

  const handleGenerateDraft = (code: string) => {
    setDraftedOrders(prev => ({
      ...prev,
      [code]: true
    }));
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="bg-gradient-to-r from-red-600 via-amber-600 to-amber-700 text-white rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <h1 className="text-xl md:text-2xl font-bold font-sans tracking-tight flex items-center gap-2">
              <AlertOctagon className="h-6 w-6 animate-bounce" />
              {t.shortageReportsTitle}
            </h1>
            <p className="text-red-100 text-xs font-light max-w-2xl">
              {t.shortageAlertDesc}
            </p>
          </div>

          <div className="bg-red-900/40 border border-red-500/30 rounded-xl px-4 py-2 text-center text-xs self-stretch md:self-auto uppercase font-mono tracking-wider">
            {lang === 'en' ? 'Critical Alerts: ' : 'إجمالي التنبيهات: '}
            <strong>{shortages.total}</strong>
          </div>
        </div>
      </div>

      {shortages.total === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-12 text-center rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-xs max-w-xl mx-auto space-y-3">
          <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto" />
          <h2 className="text-base font-bold text-slate-850 dark:text-slate-150">
            {lang === 'en' ? 'Excellent! Warehouse Stocks Are Safe' : 'مستودع إيكو بلاست أمن تماماً !'}
          </h2>
          <p className="text-xs text-slate-400">
            {lang === 'en'
              ? 'No shortage issues found. Every plastic material SKU is sitting comfortably above safety limits.'
              : 'جميع خامات المواد البلاستيكية المتوفرة حالياً كافية ولا تقع تحت مؤشر نقص الخامات.'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Section 1: Depleted / Out of Stock (0 Quantity) */}
          {shortages.depleted.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-semibold text-red-600 uppercase tracking-widest flex items-center gap-1.5 font-sans">
                <AlertOctagon className="h-4.5 w-4.5" />
                {t.stockOutOfStock} ({shortages.depleted.length})
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {shortages.depleted.map(p => (
                  <div
                    key={p.id}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-red-100 dark:border-red-950/40 p-5 shadow-2xs flex flex-col justify-between hover:shadow-xs transition-shadow relative overflow-hidden"
                  >
                    {/* Top warning line */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-red-500" />

                    <div className="space-y-3">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <span className="font-mono text-[10px] bg-red-50 dark:bg-red-970 text-red-650 px-1.5 py-0.5 rounded border border-red-100 dark:border-red-900 font-bold tracking-tight">
                            {p.code}
                          </span>
                          <span className="font-sans text-[10px] text-slate-450 block mt-1 uppercase font-semibold">
                            {categoryLabels[p.category]
                              ? lang === 'en'
                                ? categoryLabels[p.category].en
                                : categoryLabels[p.category].ar
                              : p.category}
                          </span>
                        </div>

                        <span className="px-2 py-0.5 rounded text-[8px] font-bold bg-red-150 text-red-800 dark:bg-red-950/40 dark:text-red-400 shrink-0 uppercase tracking-wider font-sans">
                          {t.outOfStockBadge}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <h3 className="font-sans font-semibold text-slate-800 dark:text-slate-100 text-sm">
                          {p.nameEn}
                        </h3>
                        <p className="font-sans font-medium text-right text-slate-600 dark:text-slate-250 text-xs">
                          {p.nameAr}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 pt-3.5 border-t border-slate-50 dark:border-slate-800/50 flex justify-between items-center text-xs">
                      <div className="font-mono font-medium">
                        <span className="text-red-600 font-bold">0</span> /{' '}
                        <span className="text-slate-400">{p.minStock} {p.unit}</span>
                      </div>

                      {draftedOrders[p.code] ? (
                        <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1">
                          <CheckCircle className="h-3.5 w-3.5" />
                          {lang === 'en' ? 'Draft Dispatched' : 'تم إرسال المسودة للمشتريات'}
                        </span>
                      ) : (
                        <button
                          onClick={() => handleGenerateDraft(p.code)}
                          className="px-3 py-1 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 text-red-750 dark:text-red-400 font-bold rounded-lg text-[10px] flex items-center gap-1.5 cursor-pointer select-none transition-colors"
                        >
                          <Send className="h-3 w-3" />
                          {t.generateRefNo}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 2: Low Stock (<= minStock and > 0) */}
          {shortages.low.length > 0 && (
            <div className="space-y-3 pt-4">
              <h2 className="text-xs font-semibold text-amber-650 uppercase tracking-widest flex items-center gap-1.5 font-sans">
                <AlertTriangle className="h-4.5 w-4.5" />
                {t.stockLowStock} ({shortages.low.length})
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {shortages.low.map(p => {
                  const percentage = Math.min((p.quantity / (p.minStock || 1)) * 100, 100);

                  return (
                    <div
                      key={p.id}
                      className="bg-white dark:bg-slate-900 rounded-2xl border border-amber-100 dark:border-amber-950/40 p-4 shadow-2xs flex flex-col justify-between hover:shadow-xs transition-shadow relative overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500" />

                      <div className="space-y-2">
                        <div className="flex justify-between items-start gap-1">
                          <div>
                            <span className="font-mono text-[9px] bg-amber-50 dark:bg-amber-970 text-amber-650 px-1.5 py-0.5 rounded border border-amber-100 dark:border-amber-900 font-bold tracking-tight">
                              {p.code}
                            </span>
                            <span className="font-sans text-[9px] text-slate-450 block mt-1 uppercase font-semibold">
                              {categoryLabels[p.category]
                                ? lang === 'en'
                                  ? categoryLabels[p.category].en
                                  : categoryLabels[p.category].ar
                                : p.category}
                            </span>
                          </div>

                          <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/45 shrink-0 uppercase tracking-wider font-sans">
                            {t.lowStockBadge}
                          </span>
                        </div>

                        <div className="space-y-0.5">
                          <h3 className="font-sans font-semibold text-slate-800 dark:text-slate-100 text-[13px] leading-snug">
                            {p.nameEn}
                          </h3>
                          <p className="font-sans font-medium text-right text-slate-600 dark:text-slate-300 text-[11px]">
                            {p.nameAr}
                          </p>
                        </div>
                      </div>

                      {/* Math and gauge */}
                      <div className="space-y-2 pt-3 mt-3 border-t border-slate-50 dark:border-slate-800/50 text-[11px]">
                        <div className="flex justify-between items-center text-slate-550 dark:text-slate-400 font-mono">
                          <span>
                            {lang === 'en' ? 'Available: ' : 'الموجود: '}
                            <strong className="text-amber-600 font-bold">{p.quantity}</strong>
                          </span>
                          <span>
                            {lang === 'en' ? 'Limit: ' : 'الحد: '}
                            <strong>{p.minStock} {p.unit}</strong>
                          </span>
                        </div>

                        <div className="h-1 w-full bg-slate-150 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>

                        {draftedOrders[p.code] ? (
                          <div className="text-[10px] font-semibold text-emerald-600 flex items-center justify-end gap-1 pt-1.5">
                            <CheckCircle className="h-3 w-3" />
                            {lang === 'en' ? 'Draft Dispatched' : 'تم إرسال المسودة للمشتريات'}
                          </div>
                        ) : (
                          <div className="flex justify-end pt-1.5">
                            <button
                              onClick={() => handleGenerateDraft(p.code)}
                              className="px-2.5 py-0.5 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 font-bold rounded-md text-[9px] flex items-center gap-1 cursor-pointer select-none"
                            >
                              <Send className="h-2.5 w-2.5" />
                              {t.generateRefNo}
                            </button>
                          </div>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
