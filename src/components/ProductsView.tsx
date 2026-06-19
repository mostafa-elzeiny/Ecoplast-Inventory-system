/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  Package,
  AlertCircle,
  FileText,
  X,
  FileSpreadsheet,
  Layers
} from 'lucide-react';
import { Product, Category, UserRole } from '../types';

interface ProductsViewProps {
  products: Product[];
  categories: Category[];
  userRole: UserRole;
  userEmail: string;
  onAddProduct: (prod: Omit<Product, 'id'>) => void;
  onUpdateProduct: (prod: Product) => void;
  onDeleteProduct: (id: string) => void;
  lang: 'en' | 'ar';
  t: any;
}

export default function ProductsView({
  products,
  categories,
  userRole,
  userEmail,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  lang,
  t
}: ProductsViewProps) {
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Modals management
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);

  // Form Fields
  const [formData, setFormData] = useState({
    code: '',
    nameEn: '',
    nameAr: '',
    category: '',
    unit: 'tons',
    quantity: 0,
    minStock: 10,
    notes: ''
  });

  const isRtl = lang === 'ar';
  const canEdit = userRole === 'admin' || userRole === 'staff';
  const isReadOnly = userRole === 'read';

  // Categories Lookup Map
  const categoriesMap = useMemo(() => {
    const map: Record<string, { en: string; ar: string }> = {};
    categories.forEach(c => {
      map[c.id] = { en: c.nameEn, ar: c.nameAr };
    });
    return map;
  }, [categories]);

  // Handle open add modal
  const handleOpenAddModal = () => {
    if (!canEdit) return;
    setFormData({
      code: `PRD-${String(products.length + 1).padStart(3, '0')}`,
      nameEn: '',
      nameAr: '',
      category: categories[0]?.id || '',
      unit: 'tons',
      quantity: 0,
      minStock: 10,
      notes: ''
    });
    setShowAddModal(true);
  };

  // Handle open edit modal
  const handleOpenEditModal = (p: Product) => {
    if (!canEdit) return;
    setEditingProduct(p);
    setFormData({
      code: p.code,
      nameEn: p.nameEn,
      nameAr: p.nameAr,
      category: p.category,
      unit: p.unit,
      quantity: p.quantity,
      minStock: p.minStock,
      notes: p.notes || ''
    });
  };

  // Submit operations
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;

    if (editingProduct) {
      // Edit mode
      const updated: Product = {
        ...editingProduct,
        code: formData.code,
        nameEn: formData.nameEn,
        nameAr: formData.nameAr,
        category: formData.category,
        unit: formData.unit,
        quantity: Number(formData.quantity) || 0,
        minStock: Number(formData.minStock) || 0,
        notes: formData.notes,
        updatedAt: Date.now(),
        updatedBy: userEmail
      };
      onUpdateProduct(updated);
      setEditingProduct(null);
    } else {
      // Add mode
      const created: Omit<Product, 'id'> = {
        code: formData.code,
        nameEn: formData.nameEn,
        nameAr: formData.nameAr,
        category: formData.category,
        unit: formData.unit,
        quantity: Number(formData.quantity) || 0,
        minStock: Number(formData.minStock) || 0,
        notes: formData.notes,
        updatedAt: Date.now(),
        updatedBy: userEmail
      };
      onAddProduct(created);
      setShowAddModal(false);
    }
  };

  const handleConfirmDelete = () => {
    if (userRole !== 'admin') {
      alert(t.unauthorized);
      return;
    }
    if (deletingProductId) {
      onDeleteProduct(deletingProductId);
      setDeletingProductId(null);
    }
  };

  // Filter pipeline
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchSearch =
        searchTerm === '' ||
        p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.nameAr.toLowerCase().includes(searchTerm.toLowerCase());

      const matchCategory =
        selectedCategory === 'all' || p.category === selectedCategory;

      return matchSearch && matchCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  return (
    <div className="space-y-6">
      {/* Top action header panel */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800/80 shadow-xs">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <h1 className="text-xl md:text-2xl font-bold font-sans tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Package className="text-emerald-500 h-6 w-6 animate-pulse" />
              {t.menuProducts}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-light">
              {lang === 'en'
                ? 'Register material SKUs, define physical stocking units and critical safety barriers.'
                : 'برمجة دلالات ومواصفات خامات البلاستيك والبوليمر، تحديد حد احتياجات الأمان المخزنية.'}
            </p>
          </div>

          {canEdit && (
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs cursor-pointer select-none transition-colors"
            >
              <Plus className="h-4 w-4" />
              {t.addProduct}
            </button>
          )}
        </div>
      </div>

      {/* Instant Filters */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 shadow-2xs">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border rounded-lg text-xs border-slate-200 dark:border-slate-750 bg-slate-50/50 dark:bg-slate-950/30 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-sans"
            />
          </div>

          <div className="md:w-64">
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
        </div>
      </div>

      {/* Products list grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.length === 0 ? (
          <div className="col-span-full bg-white dark:bg-slate-900 rounded-2xl py-16 px-4 text-center text-slate-400 italic font-sans border border-slate-100 dark:border-slate-800/80">
            <Package className="h-12 w-12 text-slate-350 mx-auto mb-2 stroke-1" />
            {t.noProducts}
          </div>
        ) : (
          filteredProducts.map(p => {
            const isLow = p.quantity <= p.minStock && p.quantity > 0;
            const isOut = p.quantity === 0;

            return (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden relative group"
              >
                {/* Visual side accent */}
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                    isOut ? 'bg-red-500' : isLow ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                />

                <div className="p-5 space-y-4">
                  {/* Top line with SKU and categories */}
                  <div className="flex justify-between items-start gap-2">
                    <div className="space-y-1">
                      <span className="font-mono text-[10px] font-bold text-slate-400 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 rounded px-1.5 py-0.5 tracking-tight">
                        {p.code}
                      </span>
                      <span className="font-sans font-medium text-[10px] text-emerald-600 dark:text-emerald-400 block mt-1 uppercase tracking-wider">
                        {categoriesMap[p.category]
                          ? lang === 'en'
                            ? categoriesMap[p.category].en
                            : categoriesMap[p.category].ar
                          : p.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {canEdit && (
                        <button
                          onClick={() => handleOpenEditModal(p)}
                          className="p-1 text-slate-400 hover:text-emerald-600 hover:bg-slate-50 dark:hover:bg-slate-800 rounded transition-colors"
                          title={t.editProduct}
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                      {userRole === 'admin' && (
                        <button
                          onClick={() => setDeletingProductId(p.id)}
                          className="p-1 text-slate-400 hover:text-red-650 hover:bg-slate-50 dark:hover:bg-slate-800 rounded transition-colors"
                          title={t.deleteProduct}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Descriptions block */}
                  <div className="space-y-1">
                    <h3 className="font-sans font-semibold text-slate-850 dark:text-slate-100 text-sm leading-relaxed">
                      {p.nameEn}
                    </h3>
                    <h4 className="font-sans font-medium text-right text-slate-700 dark:text-slate-250 text-xs text-right mt-1 font-sans">
                      {p.nameAr}
                    </h4>
                  </div>

                  {/* Quantity Indicator box */}
                  <div className="bg-slate-50/60 dark:bg-slate-950/20 rounded-xl p-3 flex justify-between items-center border border-slate-100/50 dark:border-slate-800/40">
                    <span className="text-slate-500 dark:text-slate-400 text-[11px] font-sans">
                      {t.productQuantity}
                    </span>
                    <div className="font-mono text-center">
                      <span className={`text-base font-bold ${
                        isOut ? 'text-red-600' : isLow ? 'text-amber-500' : 'text-emerald-600 dark:text-emerald-400'
                      }`}>
                        {p.quantity.toLocaleString()}
                      </span>{' '}
                      <span className="text-[10px] text-slate-400 font-bold uppercase">{p.unit}</span>
                    </div>
                  </div>

                  {/* Safety min stock factor */}
                  <div className="flex justify-between items-center text-[11px] text-slate-400">
                    <span className="font-sans">{t.productMinStock}</span>
                    <span className="font-mono font-medium text-slate-700 dark:text-slate-350">
                      {p.minStock} {p.unit}
                    </span>
                  </div>

                  {p.notes && (
                    <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800/50 text-[11px] text-slate-450 dark:text-slate-400 italic leading-relaxed truncate group-hover:whitespace-normal group-hover:overflow-visible flex items-start gap-1">
                      <FileText className="h-3 w-3 shrink-0 text-slate-350 mt-0.5" />
                      <span className="truncate group-hover:whitespace-normal">{p.notes}</span>
                    </div>
                  )}
                </div>

                {/* Footer status line */}
                <div className="bg-slate-50/50 dark:bg-slate-950/40 px-5 py-2 flex justify-between items-center text-[10px] text-slate-400 font-mono border-t border-slate-100/50 dark:border-slate-800/50">
                  <span className="truncate max-w-[150px]">@{p.updatedBy || 'admin'}</span>
                  <span>{new Date(p.updatedAt).toLocaleDateString()}</span>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* DIALOG 1: ADD & EDIT PRODUCT FORM MODAL */}
      <AnimatePresence>
        {(showAddModal || editingProduct !== null) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowAddModal(false);
                setEditingProduct(null);
              }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 w-full max-w-lg shadow-2xl relative z-10 border border-slate-150 dark:border-slate-800"
            >
              {/* Close button */}
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingProduct(null);
                }}
                className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-650 hover:bg-slate-100 dark:hover:bg-slate-105 rounded-full"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-2.5 mb-6">
                <Package className="h-6 w-6 text-emerald-500 animate-pulse" />
                <h2 className="text-lg md:text-xl font-bold font-sans tracking-tight text-slate-800 dark:text-slate-100">
                  {editingProduct ? t.editProduct : t.addProduct}
                </h2>
              </div>

              {/* FORM */}
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                {/* Code SKU */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-slate-500 dark:text-slate-400 font-semibold font-sans">
                      {t.productCode} *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.code}
                      onChange={e => setFormData(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                      placeholder="e.g., HDPE-BLU-01"
                      className="w-full px-3 py-2 border rounded-lg border-slate-200 dark:border-slate-750 bg-slate-50/50 dark:bg-slate-950/30 text-slate-800 dark:text-slate-100"
                    />
                  </div>

                  {/* Category dropdown */}
                  <div className="space-y-1.5">
                    <label className="block text-slate-500 dark:text-slate-400 font-semibold font-sans">
                      {t.productCategory} *
                    </label>
                    <select
                      value={formData.category}
                      onChange={e => setFormData(p => ({ ...p, category: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-lg border-slate-200 dark:border-slate-750 bg-slate-50/50 dark:bg-slate-950/30 text-slate-800 dark:text-slate-100"
                    >
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>
                          {lang === 'en' ? c.nameEn : c.nameAr}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Names EN & AR */}
                <div className="space-y-1.5">
                  <label className="block text-slate-500 dark:text-slate-400 font-semibold font-sans">
                    {t.productNameEn} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nameEn}
                    onChange={e => setFormData(p => ({ ...p, nameEn: e.target.value }))}
                    placeholder="Premium High-Density Polyethylene - Blue"
                    className="w-full px-3 py-2 border rounded-lg border-slate-200 dark:border-slate-750 bg-slate-50/50 dark:bg-slate-950/30 text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-slate-500 dark:text-slate-400 font-semibold font-sans">
                    {t.productNameAr} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nameAr}
                    onChange={e => setFormData(p => ({ ...p, nameAr: e.target.value }))}
                    placeholder="بولي إيثيلين ممتاز عالي الكثافة - أزرق"
                    className="w-full px-3 py-2 border rounded-lg border-slate-200 dark:border-slate-750 bg-slate-50/50 dark:bg-slate-950/30 text-slate-850 dark:text-slate-100 text-right"
                  />
                </div>

                {/* Quantities, Unit, and Min Stock */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-slate-500 dark:text-slate-400 font-semibold font-sans">
                      {t.productUnit}
                    </label>
                    <select
                      value={formData.unit}
                      onChange={e => setFormData(p => ({ ...p, unit: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-lg border-slate-200 dark:border-slate-750 bg-slate-50/50 dark:bg-slate-950/30 text-slate-800 dark:text-slate-100"
                    >
                      <option value="tons">{lang === 'en' ? 'Tons' : 'طن'}</option>
                      <option value="kg">{lang === 'en' ? 'Kg' : 'كيلو كجم'}</option>
                      <option value="pcs">{lang === 'en' ? 'Pcs' : 'قطعة'}</option>
                      <option value="bags">{lang === 'en' ? 'Bags' : 'أكياس خيش'}</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-slate-500 dark:text-slate-400 font-semibold font-sans">
                      {t.productQuantity} *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      disabled={editingProduct !== null} // edits should flow strictly via Stock In/Out or adjustments sheets to maintain history audit
                      value={formData.quantity}
                      onChange={e => setFormData(p => ({ ...p, quantity: Math.max(0, Number(e.target.value)) }))}
                      className="w-full px-3 py-2 border rounded-lg border-slate-200 dark:border-slate-750 bg-slate-50/55 dark:bg-slate-950/30 text-slate-800 dark:text-slate-100 disabled:opacity-50"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-slate-500 dark:text-slate-400 font-semibold font-sans">
                      {t.productMinStock} *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.minStock}
                      onChange={e => setFormData(p => ({ ...p, minStock: Math.max(1, Number(e.target.value)) }))}
                      className="w-full px-3 py-2 border rounded-lg border-slate-200 dark:border-slate-750 bg-slate-50/50 dark:bg-slate-950/30 text-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-1.5">
                  <label className="block text-slate-500 dark:text-slate-400 font-semibold font-sans">
                    {t.productNotes}
                  </label>
                  <textarea
                    rows={3}
                    value={formData.notes}
                    onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg border-slate-200 dark:border-slate-750 bg-slate-50/50 dark:bg-slate-950/30 text-slate-800 dark:text-slate-100"
                  />
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingProduct(null);
                    }}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-semibold hover:bg-slate-200 dark:hover:bg-slate-750 cursor-pointer"
                  >
                    {t.cancel}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-xs cursor-pointer"
                  >
                    {t.save}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DIALOG 2: DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {deletingProductId !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeletingProductId(null)}
              className="absolute inset-0 bg-slate-900/60 fallback-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-md shadow-2xl relative z-10 border border-slate-150 dark:border-slate-800"
            >
              <div className="flex items-center gap-3 mb-4 text-red-650">
                <AlertCircle className="h-6 w-6 animate-bounce" />
                <h3 className="text-base md:text-lg font-bold font-sans">
                  {t.deleteConfirmTitle}
                </h3>
              </div>

              <p className="text-slate-550 dark:text-slate-400 text-xs leading-relaxed mb-6">
                {t.deleteConfirmBody}
              </p>

              <div className="flex justify-end gap-2 text-xs">
                <button
                  onClick={() => setDeletingProductId(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-semibold cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold cursor-pointer"
                >
                  {t.confirm}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
