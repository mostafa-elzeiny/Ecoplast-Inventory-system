/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { FileText, Download, Calendar, Filter, Sparkles, CheckCircle } from 'lucide-react';
import { Product, StockTransaction, Category } from '../types';

interface ReportsViewProps {
  products: Product[];
  transactions: StockTransaction[];
  categories: Category[];
  lang: 'en' | 'ar';
  t: any;
}

export default function ReportsView({
  products,
  transactions,
  categories,
  lang,
  t
}: ReportsViewProps) {
  
  const [reportType, setReportType] = useState<'inventory' | 'shortages' | 'movements'>('inventory');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0], // 30 days ago
    end: new Date().toISOString().split('T')[0]
  });

  const isRtl = lang === 'ar';

  const categoryMap = useMemo(() => {
    const map: Record<string, { en: string; ar: string }> = {};
    categories.forEach(c => {
      map[c.id] = { en: c.nameEn, ar: c.nameAr };
    });
    return map;
  }, [categories]);

  // Compute records
  const compiledData = useMemo(() => {
    if (reportType === 'inventory') {
      return products.filter(
        p => selectedCategory === 'all' || p.category === selectedCategory
      );
    } else if (reportType === 'shortages') {
      return products.filter(p => p.quantity <= p.minStock);
    } else if (reportType === 'movements') {
      const startMs = new Date(dateRange.start).getTime();
      const endMs = new Date(dateRange.end).getTime() + 86400000; // end of tomorrow
      return transactions.filter(
        tx => tx.timestamp >= startMs && tx.timestamp <= endMs
      );
    }
    return [];
  }, [products, transactions, reportType, selectedCategory, dateRange]);

  // Handle Download CSV
  const handleDownload = () => {
    const BOM = '\uFEFF';
    let headers: string[] = [];
    let rows: string[][] = [];

    if (reportType === 'inventory' || reportType === 'shortages') {
      headers = [
        t.codeCol,
        t.nameEnCol,
        t.nameArCol,
        t.catCol,
        t.unitCol,
        t.qtyCol,
        t.minStockCol,
        t.notesCol
      ];

      rows = (compiledData as Product[]).map(p => [
        `"${p.code}"`,
        `"${p.nameEn}"`,
        `"${p.nameAr}"`,
        `"${categoryMap[p.category] ? (lang === 'en' ? categoryMap[p.category].en : categoryMap[p.category].ar) : p.category}"`,
        `"${p.unit}"`,
        String(p.quantity),
        String(p.minStock),
        `"${(p.notes || '').replace(/"/g, '""')}"`
      ]);
    } else {
      // movements
      headers = [
        t.codeCol,
        lang === 'en' ? 'Product Name En' : 'اسم المنتج بالإنجليزية',
        lang === 'en' ? 'Product Name Ar' : 'اسم المنتج بالعربية',
        t.qtyCol,
        t.typeCol,
        lang === 'en' ? 'Counter-Party' : 'المورد / المستلم',
        t.refCol,
        t.timestamp,
        t.operator
      ];

      rows = (compiledData as StockTransaction[]).map(tx => [
        `"${tx.productCode}"`,
        `"${tx.productNameEn}"`,
        `"${tx.productNameAr}"`,
        String(tx.quantity),
        `"${tx.type.toUpperCase()}"`,
        `"${tx.supplierOrReceiver || ''}"`,
        `"${tx.refNo || ''}"`,
        `"${new Date(tx.timestamp).toLocaleString()}"`,
        `"${tx.user}"`
      ]);
    }

    const csvContent = BOM + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Eco-Plast_${reportType}_Report_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800/80 shadow-xs">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <h1 className="text-xl md:text-2xl font-bold font-sans tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <FileText className="text-emerald-500 h-6 w-6" />
              {t.menuReports}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-light">
              {lang === 'en'
                ? 'Generate comprehensive, Excel-aligned raw material movement reports and ledger outputs.'
                : 'توليد وطباعة تقارير المخازن والجرد الكاملة المتوافقة جغرافياً وتصنيراً مع إكسل مكملاً.'}
            </p>
          </div>
        </div>
      </div>

      {/* Configuration Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800/80 p-6 shadow-xs space-y-6">
        {/* Toggle report types tabs */}
        <div className="flex flex-wrap p-1 bg-slate-100 dark:bg-slate-950/60 rounded-xl gap-1 max-w-lg">
          <button
            onClick={() => setReportType('inventory')}
            className={`flex-1 min-w-[120px] py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              reportType === 'inventory'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {lang === 'en' ? 'Current Inventory' : 'الجرد الحالي للمواد'}
          </button>
          <button
            onClick={() => setReportType('shortages')}
            className={`flex-1 min-w-[120px] py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              reportType === 'shortages'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {lang === 'en' ? 'Shortage / Low Stocks' : 'تقارير النقص والأمان'}
          </button>
          <button
            onClick={() => setReportType('movements')}
            className={`flex-1 min-w-[120px] py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              reportType === 'movements'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {lang === 'en' ? 'Stock Movements Log' : 'حركات الصرف والوارد'}
          </button>
        </div>

        {/* Filters according to active report selected */}
        <div className="p-4 bg-slate-50/50 dark:bg-slate-950/20 rounded-2xl border border-slate-100/50 dark:border-slate-800/40 text-xs">
          <div className="flex flex-wrap gap-4 items-end">
            
            {reportType === 'inventory' && (
              <div className="space-y-1.5 md:w-64">
                <label className="font-semibold text-slate-550 flex items-center gap-1">
                  <Filter className="h-3 w-3" />
                  {t.productCategory}
                </label>
                <select
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-900 focus:outline-none"
                >
                  <option value="all">{t.allCategories}</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>
                      {lang === 'en' ? c.nameEn : c.nameAr}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {reportType === 'movements' && (
              <div className="flex flex-wrap gap-4 items-end w-full md:w-auto">
                <div className="space-y-1.5 md:w-44">
                  <label className="font-semibold text-slate-500 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {lang === 'en' ? 'Start Date' : 'تاريخ البداية'}
                  </label>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={e => setDateRange(p => ({ ...p, start: e.target.value }))}
                    className="w-full px-3 py-1.5 border rounded-lg border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-900 focus:outline-none focus:ring-1"
                  />
                </div>

                <div className="space-y-1.5 md:w-44">
                  <label className="font-semibold text-slate-500 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {lang === 'en' ? 'End Date' : 'تاريخ النهاية'}
                  </label>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={e => setDateRange(p => ({ ...p, end: e.target.value }))}
                    className="w-full px-3 py-1.5 border rounded-lg border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-900 focus:outline-none focus:ring-1"
                  />
                </div>
              </div>
            )}

            {/* Download Execution Button */}
            <div className={`ml-auto self-stretch md:self-auto flex items-end ${isRtl ? 'md:mr-auto md:ml-0' : ''}`}>
              <button
                onClick={handleDownload}
                className="w-full md:w-auto px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
                title={t.exportCsv}
              >
                <Download className="h-4 w-4 text-emerald-400" />
                {t.exportCsv} (Compiled {compiledData.length} rows)
              </button>
            </div>

          </div>
        </div>

        {/* Compiled data preview list */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold font-sans text-slate-500 uppercase tracking-widest pl-1">
            {lang === 'en' ? 'Compiled Report Grid Preview' : 'معاينة القيود المدمجة بالمسودة'}
          </h3>

          <div className="border border-slate-100 dark:border-slate-800/80 rounded-2xl overflow-hidden max-h-96 overflow-y-auto">
            <table className="w-full text-left text-[11px] text-slate-500 dark:text-slate-400 border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-950 font-mono text-slate-600 dark:text-slate-400 uppercase">
                {reportType === 'inventory' || reportType === 'shortages' ? (
                  <tr>
                    <th className="px-4 py-3 border-r border-slate-100 dark:border-slate-800">SKU</th>
                    <th className="px-4 py-3 border-r border-slate-100 dark:border-slate-800">Description (En)</th>
                    <th className="px-4 py-3 border-r border-slate-100 dark:border-slate-800 font-sans text-right">المادة بالعربية</th>
                    <th className="px-4 py-3 border-r border-slate-100 dark:border-slate-800">Category</th>
                    <th className="px-4 py-3">In Stock</th>
                  </tr>
                ) : (
                  <tr>
                    <th className="px-3 py-2.5 border-r border-slate-100 dark:border-slate-800">SKU</th>
                    <th className="px-3 py-2.5 border-r border-slate-100 dark:border-slate-800">Description</th>
                    <th className="px-3 py-2.5 border-r border-slate-100 dark:border-slate-800">Change</th>
                    <th className="px-3 py-2.5 border-r border-slate-100 dark:border-slate-800">Type</th>
                    <th className="px-3 py-2.5 border-r border-slate-100 dark:border-slate-800">Operator</th>
                    <th className="px-3 py-2.5">Date</th>
                  </tr>
                )}
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {compiledData.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-12 text-center text-slate-400 italic">
                      {lang === 'en' ? 'No registers matching current parameters.' : 'لا يوجد قيود متطابقة مع هذا البحث.'}
                    </td>
                  </tr>
                ) : reportType === 'inventory' || reportType === 'shortages' ? (
                  (compiledData as Product[]).map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-2 border-r border-slate-150 dark:border-slate-800 font-mono font-bold text-slate-650">{p.code}</td>
                      <td className="px-4 py-2 border-r border-slate-150 dark:border-slate-800 shrink-0 truncate max-w-[150px]">{p.nameEn}</td>
                      <td className="px-4 py-2 border-r border-slate-150 dark:border-slate-800 font-sans text-right truncate max-w-[150px]">{p.nameAr}</td>
                      <td className="px-4 py-2 border-r border-slate-150 dark:border-slate-800 font-mono uppercase text-slate-400">{p.category}</td>
                      <td className="px-4 py-2 font-mono font-bold text-emerald-600">{p.quantity.toLocaleString()} <span className="text-[10px] uppercase font-normal text-slate-400">{p.unit}</span></td>
                    </tr>
                  ))
                ) : (
                  (compiledData as StockTransaction[]).map(tx => (
                    <tr key={tx.id} className="hover:bg-slate-50/50">
                      <td className="px-3 py-2 border-r border-slate-150 dark:border-slate-800 font-mono font-bold text-slate-650">{tx.productCode}</td>
                      <td className="px-3 py-2 border-r border-slate-150 dark:border-slate-800 truncate max-w-[150px]">{lang === 'en' ? tx.productNameEn : tx.productNameAr}</td>
                      <td className={`px-3 py-2 border-r border-slate-150 dark:border-slate-800 font-mono font-bold ${tx.type === 'in' ? 'text-blue-600' : 'text-red-500'}`}>{tx.type === 'in' ? '+' : ''}{tx.quantity}</td>
                      <td className="px-3 py-2 border-r border-slate-150 dark:border-slate-800 font-mono uppercase font-bold text-[10px]">{tx.type}</td>
                      <td className="px-3 py-2 border-r border-slate-150 dark:border-slate-800 truncate max-w-[100px] font-mono">@{tx.user}</td>
                      <td className="px-3 py-2">{new Date(tx.timestamp).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
