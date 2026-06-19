/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  FileSpreadsheet,
  UploadCloud,
  CheckCircle,
  AlertTriangle,
  Play,
  Clipboard,
  Database,
  ArrowRight,
  Layers,
  Sparkles
} from 'lucide-react';
import { Product, Category, UserRole } from '../types';

interface ExcelIntegrationViewProps {
  categories: Category[];
  userRole: UserRole;
  userEmail: string;
  onBulkUpdate: (products: Product[]) => void;
  lang: 'en' | 'ar';
  t: any;
}

interface ParsedProduct {
  code: string;
  nameEn: string;
  nameAr: string;
  category: string;
  unit: string;
  quantity: number;
  minStock: number;
  status: 'valid' | 'invalid';
  issue?: string;
}

export default function ExcelIntegrationView({
  categories,
  userRole,
  userEmail,
  onBulkUpdate,
  lang,
  t
}: ExcelIntegrationViewProps) {
  
  const [inputText, setInputText] = useState('');
  const [parsedData, setParsedData] = useState<ParsedProduct[]>([]);
  const [alertSuccess, setAlertSuccess] = useState<string | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);
  
  const isRtl = lang === 'ar';
  const canWrite = userRole === 'admin' || userRole === 'staff';

  const categoryIds = categories.map(c => c.id);

  // Parse direct spreadsheet raw copy-paste rows
  const handleParseAndVerify = () => {
    setErrorText(null);
    setAlertSuccess(null);
    setParsedData([]);

    if (!inputText.trim()) {
      setErrorText(lang === 'en' ? 'Please paste CSV rows to parse.' : 'يرجى لصق جداول خامات بنظام CSV أولاً لفك الشفرة.');
      return;
    }

    try {
      const lines = inputText.split('\n');
      const tempParsed: ParsedProduct[] = [];

      lines.forEach((line, index) => {
        let cleanLine = line.trim();
        if (!cleanLine) return; // skip empty lines

        // Skip headers line if detected
        if (index === 0 && (cleanLine.toLowerCase().includes('code') || cleanLine.toLowerCase().includes('sku') || cleanLine.includes('رمز'))) {
          return;
        }

        // Split by commas, tabs or semicolons (Excel spreadsheet friendly)
        let parts = cleanLine.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/); // matches commas outside speech quotes
        if (parts.length < 2) {
          parts = cleanLine.split('\t'); // try tabs
        }

        if (parts.length < 5) {
          tempParsed.push({
            code: parts[0] || `LINE-${index}`,
            nameEn: 'Incomplete Row Data',
            nameAr: 'بيانات سطر غير مكتملة',
            category: 'hdpe',
            unit: 'tons',
            quantity: 0,
            minStock: 10,
            status: 'invalid',
            issue: lang === 'en' ? 'Deficient columns in CSV row.' : 'أعمدة السطر مفقودة في السطر المذكور.'
          });
          return;
        }

        // Map order: SKU, NameEn, NameAr, Category, Unit, Quantity, MinStock
        const code = (parts[0] || '').replace(/"/g, '').trim().toUpperCase();
        const nameEn = (parts[1] || '').replace(/"/g, '').trim();
        const nameAr = (parts[2] || '').replace(/"/g, '').trim();
        const category = (parts[3] || '').replace(/"/g, '').trim().toLowerCase();
        const unit = (parts[4] || 'tons').replace(/"/g, '').trim().toLowerCase();
        const quantity = Number(parts[5]) || 0;
        const minStock = Number(parts[6]) || 5;

        // Validations
        let status: 'valid' | 'invalid' = 'valid';
        let issue = '';

        if (!code) {
          status = 'invalid';
          issue = lang === 'en' ? 'SKU Code is required.' : 'كود رمز المادة مطلوب.';
        } else if (!nameEn || !nameAr) {
          status = 'invalid';
          issue = lang === 'en' ? 'Bilingual Names are required.' : 'البيانات الثنائية لاسم المادة مطلوبة.';
        } else if (!categoryIds.includes(category)) {
          // auto-fit category fallback to prevent crashes
          status = 'valid';
          issue = lang === 'en' ? `Category handle "${category}" not configured. Will default to "${categories[0]?.id || 'Raw'}"` : `الفئة "${category}" غير مسجلة. سيتم تعيين الفئة الافتراضية.`;
        }

        tempParsed.push({
          code,
          nameEn,
          nameAr,
          category: categoryIds.includes(category) ? category : (categories[0]?.id || 'hdpe'),
          unit,
          quantity,
          minStock,
          status,
          issue: issue || undefined
        });
      });

      setParsedData(tempParsed);
      if (tempParsed.length > 0) {
        setAlertSuccess(t.importVerifySuccess);
      }
    } catch (err: any) {
      setErrorText(lang === 'en' ? `Parsing error: ${err.message}` : `فشل في تفكيك الملف: ${err.message}`);
    }
  };

  // Perform Firestore Sync saving operations
  const handleBulkImportSave = () => {
    if (!canWrite) {
      setErrorText(t.unauthorized);
      return;
    }

    const validItems = parsedData.filter(x => x.status === 'valid');
    if (validItems.length === 0) {
      setErrorText(lang === 'en' ? 'No valid registers ready for import.' : 'لا يوجد قيود سليمة لمزامنتها مع الخادم.');
      return;
    }

    // Convert to standard Product parameters with random IDs
    const formattedProducts: Product[] = validItems.map(x => ({
      id: `prod-excel-${x.code}-${Math.random().toString(36).substr(2, 5)}`,
      code: x.code,
      nameEn: x.nameEn,
      nameAr: x.nameAr,
      category: x.category,
      unit: x.unit,
      quantity: x.quantity,
      minStock: x.minStock,
      notes: lang === 'en' ? `Bulk Excel Imported Registry - ${new Date().toLocaleDateString()}` : `مزامنة واستيراد ذو تدقيق جماعي - ${new Date().toLocaleDateString()}`,
      updatedAt: Date.now(),
      updatedBy: userEmail
    }));

    onBulkUpdate(formattedProducts);
    
    setAlertSuccess(`${t.importFinalCount} ${validItems.length}`);
    setParsedData([]);
    setInputText('');
  };

  return (
    <div className="space-y-6">
      {/* Top action header info */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800/80 shadow-xs">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="space-y-1">
            <h1 className="text-xl md:text-2xl font-bold font-sans tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <FileSpreadsheet className="text-emerald-500 h-6 w-6 animate-pulse" />
              {t.excelIntegrationName}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-light max-w-2xl">
              {t.excelHowToBody}
            </p>
          </div>
        </div>
      </div>

      {/* Main split grid editor */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Left Form pasting block (takes 2 cols) */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800/80 shadow-xs lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-50 dark:border-slate-800/50">
            <h3 className="font-sans font-bold text-slate-850 dark:text-slate-150 text-xs flex items-center gap-2">
              <Clipboard className="h-4 w-4 text-emerald-500" />
              {lang === 'en' ? 'Paster Box Parser' : 'صندوق لصق البيانات'}
            </h3>
          </div>

          <div className="text-[11px] text-slate-500 dark:text-slate-400 p-3 bg-slate-50 dark:bg-slate-950/20 rounded-xl leading-relaxed space-y-1 border border-slate-100/50 dark:border-slate-800/30">
            <p className="font-semibold text-slate-700 dark:text-orange-400">
              {t.excelHowToTitle}
            </p>
            <p>{t.excelColumnsRequired}</p>
          </div>

          <textarea
            rows={10}
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder={t.excelPlaceholder}
            className="w-full text-xs p-3.5 border rounded-2xl border-slate-200 dark:border-slate-750 bg-slate-50/50 dark:bg-slate-950/40 text-slate-800 dark:text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />

          {errorText && (
            <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-150 rounded-xl text-red-800 dark:text-red-400 font-semibold text-xs flex items-center gap-2">
              <AlertTriangle className="h-4.5 w-4.5 text-red-500" />
              {errorText}
            </div>
          )}

          {alertSuccess && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-150 rounded-xl text-emerald-900 dark:text-emerald-450 font-semibold text-xs flex items-center gap-2">
              <CheckCircle className="h-4.5 w-4.5 text-emerald-500" />
              {alertSuccess}
            </div>
          )}

          <button
            onClick={handleParseAndVerify}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-950 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
          >
            <Sparkles className="h-4 w-4 text-amber-400 animate-spin" />
            {t.parseAndVerify}
          </button>
        </div>

        {/* Right Preview and upload block (takes 3 cols) */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800/80 shadow-xs lg:col-span-3 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-50 dark:border-slate-800/50">
              <h3 className="font-sans font-bold text-slate-850 dark:text-slate-150 text-xs flex items-center gap-2">
                <Database className="h-4 w-4 text-blue-500 animate-pulse" />
                {t.parsedPreview}
              </h3>
              {parsedData.length > 0 && (
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full uppercase">
                  {parsedData.filter(x => x.status === 'valid').length} Valid Rows
                </span>
              )}
            </div>

            {parsedData.length === 0 ? (
              <div className="py-24 flex flex-col items-center justify-center text-center text-slate-400 gap-2 border-2 border-dashed border-slate-100 dark:border-slate-800/60 rounded-2xl">
                <UploadCloud className="h-10 w-10 text-slate-300 stroke-1" />
                <span className="text-xs">{lang === 'en' ? 'Pasted records preview shows here' : 'معاينة القيود والملفات المستخرجة تظهر هنا'}</span>
              </div>
            ) : (
              <div className="overflow-x-auto max-h-[350px] border rounded-xl border-slate-100 dark:border-slate-800">
                <table className="w-full text-left text-[11px] border-collapse">
                  <thead className="bg-slate-50 dark:bg-slate-950 uppercase text-slate-600 dark:text-slate-400 font-mono">
                    <tr>
                      <th className="px-3 py-2 border-r border-slate-100 dark:border-slate-800">SKU</th>
                      <th className="px-3 py-2 border-r border-slate-100 dark:border-slate-800">Description</th>
                      <th className="px-3 py-2 border-r border-slate-100 dark:border-slate-800">البيان بالعربية</th>
                      <th className="px-3 py-2 border-r border-slate-100 dark:border-slate-800">Category</th>
                      <th className="px-3 py-2 border-r border-slate-100 dark:border-slate-800">Qty</th>
                      <th className="px-3 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {parsedData.map((item, idx) => {
                      const isErr = item.status === 'invalid';
                      return (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="px-3 py-2 border-r border-slate-150 dark:border-slate-800 font-mono font-bold">{item.code}</td>
                          <td className="px-3 py-2 border-r border-slate-150 dark:border-slate-800 truncate max-w-[120px]">{item.nameEn}</td>
                          <td className="px-3 py-2 border-r border-slate-150 dark:border-slate-800 text-right truncate max-w-[120px] font-sans">{item.nameAr}</td>
                          <td className="px-3 py-2 border-r border-slate-150 dark:border-slate-800 font-mono">{item.category}</td>
                          <td className="px-3 py-2 border-r border-slate-150 dark:border-slate-800 font-mono">{item.quantity}</td>
                          <td className="px-3 py-2">
                            {isErr ? (
                              <span className="text-red-500 font-semibold" title={item.issue}>
                                Error ❌
                              </span>
                            ) : (
                              <span className="text-emerald-600 font-semibold">Valid ✓</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {parsedData.length > 0 && (
            <button
              onClick={handleBulkImportSave}
              className="mt-6 w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs select-none transition-colors"
            >
              <Database className="h-4 w-4 animate-bounce" />
              {t.importExecute}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
