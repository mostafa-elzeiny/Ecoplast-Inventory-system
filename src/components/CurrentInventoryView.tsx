/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Search,
  ArrowUpDown,
  Download,
  CheckCircle,
  AlertOctagon,
  Edit2,
  Trash2,
  Save,
  Grid,
  Lock,
  RotateCcw
} from 'lucide-react';
import { Product, Category, UserRole } from '../types';

interface CurrentInventoryViewProps {
  products: Product[];
  categories: Category[];
  userRole: UserRole;
  userEmail: string;
  onUpdateProducts: (updatedProduct: Product) => void;
  onBulkUpdate: (updatedProducts: Product[]) => void;
  lang: 'en' | 'ar';
  t: any;
}

type SortField = 'code' | 'nameEn' | 'nameAr' | 'category' | 'quantity' | 'minStock';
type SortOrder = 'asc' | 'desc';

export default function CurrentInventoryView({
  products,
  categories,
  userRole,
  userEmail,
  onUpdateProducts,
  onBulkUpdate,
  lang,
  t
}: CurrentInventoryViewProps) {
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStockLevel, setSelectedStockLevel] = useState('all');
  const [sortField, setSortField] = useState<SortField>('code');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Double Click Cell Editing States
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editQuantityValue, setEditQuantityValue] = useState<number>(0);
  const [editNotesValue, setEditNotesValue] = useState<string>('');
  
  // Track bulk unsaved changes
  const [changedProducts, setChangedProducts] = useState<Record<string, Product>>({});
  const [showSaveMessage, setShowSaveMessage] = useState(false);

  const isRtl = lang === 'ar';
  const canEdit = userRole === 'admin' || userRole === 'staff';

  // Toggle Sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Double click cell trigger
  const startEditingQuantity = (prod: Product) => {
    if (!canEdit) return;
    setEditingProductId(prod.id);
    setEditQuantityValue(prod.quantity);
    setEditNotesValue(prod.notes || '');
  };

  // Handle single rows changes
  const saveRowEdit = (prod: Product) => {
    const updated: Product = {
      ...prod,
      quantity: Number(editQuantityValue) || 0,
      notes: editNotesValue,
      updatedAt: Date.now(),
      updatedBy: userEmail
    };

    // Store in internal state
    setChangedProducts(prev => ({
      ...prev,
      [prod.id]: updated
    }));

    setEditingProductId(null);
  };

  const handleCellBlur = (prod: Product) => {
    saveRowEdit(prod);
  };

  const handleKeyPress = (e: React.KeyboardEvent, prod: Product) => {
    if (e.key === 'Enter') {
      saveRowEdit(prod);
    } else if (e.key === 'Escape') {
      setEditingProductId(null);
    }
  };

  // Quick reset manual changed table entries
  const handleResetDraft = () => {
    setChangedProducts({});
  };

  // Commit manual updates back to firestore
  const handleSaveChanges = async () => {
    const listToUpdate = Object.values(changedProducts) as Product[];
    if (listToUpdate.length === 0) return;

    onBulkUpdate(listToUpdate);
    setChangedProducts({});
    setShowSaveMessage(true);
    setTimeout(() => setShowSaveMessage(false), 3000);
  };

  // Map category IDs to labels
  const categoriesMap = useMemo(() => {
    const map: Record<string, { en: string; ar: string }> = {};
    categories.forEach(c => {
      map[c.id] = { en: c.nameEn, ar: c.nameAr };
    });
    return map;
  }, [categories]);

  // Filters + sorting pipeline
  const processedProducts = useMemo(() => {
    let result = [...products];

    // Apply quick changes locally for user responsiveness
    result = result.map(p => {
      if (changedProducts[p.id]) {
        return changedProducts[p.id];
      }
      return p;
    });

    // 1. Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        p =>
          p.code.toLowerCase().includes(term) ||
          p.nameEn.toLowerCase().includes(term) ||
          p.nameAr.toLowerCase().includes(term) ||
          (p.notes && p.notes.toLowerCase().includes(term))
      );
    }

    // 2. Filter by category
    if (selectedCategory !== 'all') {
      result = result.filter(p => p.category === selectedCategory);
    }

    // 3. Filter by stock level
    if (selectedStockLevel !== 'all') {
      if (selectedStockLevel === 'in_stock') {
        result = result.filter(p => p.quantity > p.minStock);
      } else if (selectedStockLevel === 'low_stock') {
        result = result.filter(p => p.quantity <= p.minStock && p.quantity > 0);
      } else if (selectedStockLevel === 'out_of_stock') {
        result = result.filter(p => p.quantity === 0);
      }
    }

    // 4. Sort
    result.sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      // Convert to string compare or numbers
      if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [products, changedProducts, searchTerm, selectedCategory, selectedStockLevel, sortField, sortOrder]);

  // Export to CSV spreadsheet
  const handleExportCSV = () => {
    // UTF-8 BOM characters so Excel understands Arabic characters flawlessly
    const BOM = '\uFEFF';
    
    // Header Row
    const headers = [
      t.codeCol,
      t.nameEnCol,
      t.nameArCol,
      t.catCol,
      t.unitCol,
      t.qtyCol,
      t.minStockCol,
      t.notesCol
    ];
    
    const csvRows = [headers.join(',')];

    processedProducts.forEach(p => {
      const catLabel = categoriesMap[p.category]
        ? lang === 'en'
          ? categoriesMap[p.category].en
          : categoriesMap[p.category].ar
        : p.category;

      const row = [
        `"${p.code.replace(/"/g, '""')}"`,
        `"${p.nameEn.replace(/"/g, '""')}"`,
        `"${p.nameAr.replace(/"/g, '""')}"`,
        `"${catLabel.replace(/"/g, '""')}"`,
        `"${p.unit.replace(/"/g, '""')}"`,
        p.quantity,
        p.minStock,
        `"${(p.notes || '').replace(/"/g, '""')}"`
      ];
      csvRows.push(row.join(','));
    });

    const csvContent = BOM + csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Eco-Plast_Inventory_Matrix_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const hasUnsavedChanges = Object.keys(changedProducts).length > 0;

  return (
    <div className="space-y-6">
      {/* Upper header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800/80 shadow-xs">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="space-y-1">
            <h1 className="text-xl md:text-2xl font-bold font-sans tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Grid className="text-emerald-500 h-6 w-6" />
              {t.excelTableTitle}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-light max-w-2xl">
              {t.excelTableSub}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-stretch lg:self-auto">
            {hasUnsavedChanges && (
              <>
                <button
                  onClick={handleResetDraft}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850 flex items-center gap-1.5 border border-slate-200 dark:border-slate-750 cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  {lang === 'en' ? 'Reset Draft' : 'تراجع عن السجلات'}
                </button>
                <button
                  onClick={handleSaveChanges}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 flex items-center gap-1.5 shadow-xs cursor-pointer animate-pulse"
                >
                  <Save className="h-3.5 w-3.5" />
                  {t.saveChanges} ({Object.keys(changedProducts).length})
                </button>
              </>
            )}

            <button
              onClick={handleExportCSV}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-slate-800 dark:bg-slate-700 hover:bg-slate-950 dark:hover:bg-slate-600 flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              {t.exportCsv}
            </button>
          </div>
        </div>
      </div>

      {/* Save indicator feedback banner */}
      {showSaveMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 text-xs text-emerald-800 dark:text-emerald-400 font-semibold flex items-center gap-2">
          <CheckCircle className="h-4.5 w-4.5" />
          {lang === 'en'
            ? 'Success! Spreadsheet changes saved permanently to Cloud databases.'
            : 'بشرى سارة! تم حفظ تعديلات خلايا المخزون والمصادقة عليها سحابياً بنجاح.'}
        </div>
      )}

      {/* Filter and search control board */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Main search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border rounded-lg text-xs border-slate-200 dark:border-slate-750 bg-slate-50/50 dark:bg-slate-950/30 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-sans"
            />
          </div>

          {/* Category Dropdown Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-xs border-slate-200 dark:border-slate-750 bg-slate-50/50 dark:bg-slate-950/30 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">{t.allCategories}</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>
                  {lang === 'en' ? c.nameEn : c.nameAr}
                </option>
              ))}
            </select>
          </div>

          {/* Stock Level Dropdown Filter */}
          <div>
            <select
              value={selectedStockLevel}
              onChange={e => setSelectedStockLevel(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-xs border-slate-200 dark:border-slate-750 bg-slate-50/50 dark:bg-slate-950/30 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">{t.allStockLevels}</option>
              <option value="in_stock">{t.stockInStock}</option>
              <option value="low_stock">{t.stockLowStock}</option>
              <option value="out_of_stock">{t.stockOutOfStock}</option>
            </select>
          </div>

          {/* User Permission display indicator */}
          <div className="border border-slate-150 dark:border-slate-850 rounded-lg p-2 flex items-center justify-between text-[11px] bg-slate-50/20 dark:bg-slate-950/10">
            <span className="text-slate-400 font-sans">{t.activeRole}:</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1 font-sans">
              {userRole === 'admin' && t.roleAdmin}
              {userRole === 'staff' && t.roleStaff}
              {userRole === 'read' && (
                <>
                  <Lock className="h-3 w-3 text-red-500" />
                  {t.roleRead}
                </>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Spreadsheet Grid layout */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto max-w-full">
          <table className="w-full text-xs text-left text-slate-500 dark:text-slate-400 min-w-[900px] border-collapse">
            <thead className="text-[11px] text-slate-700 dark:text-slate-350 bg-slate-50 dark:bg-slate-950/55 uppercase font-mono border-b border-slate-100 dark:border-slate-800/80">
              <tr>
                {/* Column Headers with click sorting */}
                <th
                  onClick={() => handleSort('code')}
                  className="px-4 py-3.5 font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none border-r border-slate-100 dark:border-slate-800/50"
                >
                  <div className="flex items-center gap-1">
                    {t.codeCol}
                    <ArrowUpDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('nameEn')}
                  className="px-4 py-3.5 font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none border-r border-slate-100 dark:border-slate-800/50"
                >
                  <div className="flex items-center gap-1">
                    {t.nameEnCol}
                    <ArrowUpDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('nameAr')}
                  className="px-4 py-3.5 font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none border-r border-slate-100 dark:border-slate-800/50"
                >
                  <div className="flex items-center gap-1">
                    {t.nameArCol}
                    <ArrowUpDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('category')}
                  className="px-4 py-3.5 font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none border-r border-slate-100 dark:border-slate-800/50"
                >
                  <div className="flex items-center gap-1">
                    {t.catCol}
                    <ArrowUpDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('quantity')}
                  className="px-4 py-3.5 font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none border-r border-slate-100 dark:border-slate-800/50 bg-emerald-50/10 dark:bg-emerald-950/5"
                >
                  <div className="flex items-center gap-1">
                    {t.qtyCol}
                    <ArrowUpDown className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  </div>
                </th>
                <th className="px-4 py-3.5 font-semibold text-slate-700 dark:text-slate-300 border-r border-slate-100 dark:border-slate-800/50">
                  {t.unitCol}
                </th>
                <th
                  onClick={() => handleSort('minStock')}
                  className="px-4 py-3.5 font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none border-r border-slate-100 dark:border-slate-800/50"
                >
                  <div className="flex items-center gap-1">
                    {t.minStockCol}
                    <ArrowUpDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  </div>
                </th>
                <th className="px-4 py-3.5 font-semibold text-slate-700 dark:text-slate-300">
                  {t.notesCol}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 font-sans">
              {processedProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400 italic font-sans">
                    {t.noProducts}
                  </td>
                </tr>
              ) : (
                processedProducts.map(p => {
                  const isEditing = editingProductId === p.id;
                  const hasDraft = changedProducts[p.id] !== undefined;
                  const isOut = p.quantity === 0;
                  const isLow = p.quantity <= p.minStock && p.quantity > 0;
                  
                  const isRtlAlign = lang === 'ar';

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-slate-50/50 dark:hover:bg-slate-950/20 group transition-colors duration-150 ${
                        hasDraft
                          ? 'bg-amber-50/15 dark:bg-amber-950/5 border-l-2 border-l-amber-500'
                          : ''
                      }`}
                    >
                      {/* Product SKU */}
                      <td className="px-4 py-3 font-mono font-bold text-[11px] text-slate-500 dark:text-slate-455 border-r border-slate-100 dark:border-slate-800/50">
                        {p.code}
                      </td>

                      {/* Product Name En */}
                      <td className="px-4 py-3 text-slate-800 dark:text-slate-205 border-r border-slate-100 dark:border-slate-800/50 truncate max-w-[180px]">
                        {p.nameEn}
                      </td>

                      {/* Product Name Ar */}
                      <td className="px-4 py-3 text-slate-800 dark:text-slate-205 border-r border-slate-100 dark:border-slate-800/50 text-right font-sans truncate max-w-[180px]">
                        {p.nameAr}
                      </td>

                      {/* Category Label */}
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-350 border-r border-slate-100 dark:border-slate-800/50 truncate max-w-[140px]">
                        {categoriesMap[p.category]
                          ? lang === 'en'
                            ? categoriesMap[p.category].en
                            : categoriesMap[p.category].ar
                          : p.category}
                      </td>

                      {/* SPREADSHEET Quantity (Double click cell edit) */}
                      <td
                        onDoubleClick={() => startEditingQuantity(p)}
                        className={`px-4 py-3 font-semibold border-r border-slate-100 dark:border-slate-800/50 cursor-pointer select-none hover:bg-slate-100/50 dark:hover:bg-slate-950/45 transition-colors relative ${
                          isOut
                            ? 'text-red-650 bg-red-50/10 dark:bg-red-950/5'
                            : isLow
                            ? 'text-amber-650 bg-amber-50/10 dark:bg-amber-100/5'
                            : 'text-slate-800 dark:text-slate-200'
                        }`}
                        title={canEdit ? (lang === 'en' ? "Double click to edit cell quantity directly" : "انقر نقرا مزدوجا لتعديل كمية الخلية مباشرة") : undefined}
                      >
                        {isEditing ? (
                          <div className="absolute inset-0 bg-white dark:bg-slate-800 flex items-center px-1">
                            <input
                              type="number"
                              value={editQuantityValue}
                              onChange={e => setEditQuantityValue(Math.max(0, Number(e.target.value)))}
                              onBlur={() => handleCellBlur(p)}
                              onKeyDown={e => handleKeyPress(e, p)}
                              className="w-full px-1.5 py-0.5 text-xs text-slate-900 bg-slate-50 rounded border border-emerald-500 font-mono text-center focus:outline-none"
                              autoFocus
                            />
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs">{p.quantity.toLocaleString()}</span>
                            {canEdit && (
                              <Edit2 className="h-3 w-3 text-slate-300 opacity-0 group-hover:opacity-100 hover:text-emerald-500 transition-opacity" />
                            )}
                          </div>
                        )}
                      </td>

                      {/* Stocking Unit */}
                      <td className="px-4 py-3 border-r border-slate-100 dark:border-slate-800/50 text-slate-500 uppercase tracking-wider font-mono text-[10px]">
                        {p.unit}
                      </td>

                      {/* Safety Limit Min Stock */}
                      <td className="px-4 py-3 border-r border-slate-100 dark:border-slate-800/50 text-slate-500 font-mono">
                        {p.minStock}
                      </td>

                      {/* Operational Notes */}
                      <td className={`px-4 py-3 truncate max-w-[200px] text-slate-400 italic`}>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editNotesValue}
                            onChange={e => setEditNotesValue(e.target.value)}
                            onBlur={() => handleCellBlur(p)}
                            onKeyDown={e => handleKeyPress(e, p)}
                            className="w-full py-0.5 px-1.5 border border-emerald-500 text-[11px] rounded bg-slate-50 dark:bg-slate-800 focus:outline-none text-slate-800 dark:text-slate-100"
                          />
                        ) : (
                          p.notes || '-'
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Help tooltip guidelines */}
      <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800/50 text-xs bg-slate-50/30 dark:bg-slate-950/5 text-slate-450 dark:text-slate-400 font-sans leading-relaxed space-y-1">
        <p className="font-semibold flex items-center gap-1 text-slate-700 dark:text-slate-350">
          <CheckCircle className="h-4 w-4 text-emerald-500" />
          {lang === 'en' ? 'Pro-Tip: Quick Online Reconciliation' : 'معلومة سرية: التسوية الفورية من داخل الخلية'}
        </p>
        <p>
          {lang === 'en'
            ? 'Warehouse managers can reconcile any material counts by double-clicking inside the quantity cell. Unsaved values glow in gold; click "Save Direct Changes" to commit all changes to Firebase.'
            : 'بإمكان رؤساء المستودع تغيير الكميات المتوفرة على الفور عن طريق النقر المزدوج فوق أي خلية بالجدول. التغييرات الجديدة تضيء باللون البرتقالي لتذكيرك بحفظها سحابياً.'}
        </p>
      </div>
    </div>
  );
}
