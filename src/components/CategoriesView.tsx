/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Layers, Plus, Edit2, Trash2, X, Tag } from 'lucide-react';
import { Category, UserRole } from '../types';

interface CategoriesViewProps {
  categories: Category[];
  userRole: UserRole;
  onAddCategory: (cat: Category) => void;
  onUpdateCategory: (cat: Category) => void;
  onDeleteCategory: (id: string) => void;
  lang: 'en' | 'ar';
  t: any;
}

export default function CategoriesView({
  categories,
  userRole,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  lang,
  t
}: CategoriesViewProps) {
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
  const [formData, setFormData] = useState({
    id: '',
    nameEn: '',
    nameAr: ''
  });

  const canEdit = userRole === 'admin' || userRole === 'staff';

  const handleOpenAddModal = () => {
    if (!canEdit) return;
    setFormData({
      id: `cat-${String(categories.length + 1)}`,
      nameEn: '',
      nameAr: ''
    });
    setShowAddModal(true);
  };

  const handleOpenEditModal = (c: Category) => {
    if (!canEdit) return;
    setEditingCategory(c);
    setFormData({
      id: c.id,
      nameEn: c.nameEn,
      nameAr: c.nameAr
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;

    const constructed: Category = {
      id: formData.id.toLowerCase().trim().replace(/\s+/g, '-'),
      nameEn: formData.nameEn,
      nameAr: formData.nameAr
    };

    if (editingCategory) {
      onUpdateCategory(constructed);
      setEditingCategory(null);
    } else {
      onAddCategory(constructed);
      setShowAddModal(false);
    }
  };

  const handleDelete = (id: string) => {
    if (userRole !== 'admin') {
      alert(t.unauthorized);
      return;
    }
    if (confirm(t.deleteConfirmTitle)) {
      onDeleteCategory(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800/80 shadow-xs">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <h1 className="text-xl md:text-2xl font-bold font-sans tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Layers className="text-emerald-500 h-6 w-6" />
              {t.categoryTitle}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-light">
              {lang === 'en'
                ? 'Organize plastic components, polymers grade classifications and compounds.'
                : 'فرز وتشكيل أقسام الخامات وسلاسل الإمداد لتسهيل جرد المستودع.'}
            </p>
          </div>

          {canEdit && (
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs cursor-pointer select-none transition-colors"
            >
              <Plus className="h-4 w-4" />
              {t.addCategory}
            </button>
          )}
        </div>
      </div>

      {/* Grid listing */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map(cat => (
          <div
            key={cat.id}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/80 p-5 shadow-2xs hover:shadow-sm transition-all duration-300 flex flex-col justify-between group"
          >
            <div className="flex justify-between items-start">
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                <Tag className="h-5 w-5" />
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {canEdit && (
                  <button
                    onClick={() => handleOpenEditModal(cat)}
                    className="p-1 text-slate-400 hover:text-emerald-600 hover:bg-slate-50 dark:hover:bg-slate-800 rounded transition-colors"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                )}
                {userRole === 'admin' && (
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="p-1 text-slate-400 hover:text-red-650 hover:bg-slate-50 dark:hover:bg-slate-800 rounded transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="mt-4 space-y-1">
              <h3 className="font-sans font-semibold text-slate-800 dark:text-slate-150 text-sm">
                {cat.nameEn}
              </h3>
              <p className="font-sans font-medium text-right text-slate-600 dark:text-slate-350 text-xs">
                {cat.nameAr}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-50 dark:border-slate-800/50 flex justify-between items-center text-[10px] text-slate-400 font-mono uppercase tracking-wider">
              <span>{lang === 'en' ? 'ID Slug' : 'رمز المعرف'}</span>
              <span>{cat.id}</span>
            </div>
          </div>
        ))}
      </div>

      {/* DIALOG: CATEGORY FORM MODAL */}
      <AnimatePresence>
        {(showAddModal || editingCategory !== null) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowAddModal(false);
                setEditingCategory(null);
              }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl relative z-10 border border-slate-150 dark:border-slate-800"
            >
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingCategory(null);
                }}
                className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-650 rounded-full"
              >
                <X className="h-5 w-5" />
              </button>

              <h2 className="text-base md:text-lg font-bold font-sans tracking-tight text-slate-800 dark:text-slate-100 mb-6">
                {editingCategory ? t.editCategory : t.addCategory}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                {/* ID slug code - locked in edit */}
                <div className="space-y-1">
                  <label className="block text-slate-500 dark:text-slate-400 font-semibold font-sans">
                    Category Handle Identifier (a-z, no spaces)
                  </label>
                  <input
                    type="text"
                    required
                    disabled={editingCategory !== null}
                    value={formData.id}
                    onChange={e => setFormData(p => ({ ...p, id: e.target.value }))}
                    placeholder="e.g., hdpe-recycled"
                    className="w-full px-3 py-2 border rounded-lg border-slate-200 dark:border-slate-750 bg-slate-50/50 dark:bg-slate-950/30 text-slate-800 dark:text-slate-100 disabled:opacity-60"
                  />
                </div>

                {/* English Name */}
                <div className="space-y-1">
                  <label className="block text-slate-500 dark:text-slate-400 font-semibold font-sans">
                    {t.categoryNameEn} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nameEn}
                    onChange={e => setFormData(p => ({ ...p, nameEn: e.target.value }))}
                    placeholder="e.g., HDPE Raw Granules"
                    className="w-full px-3 py-2 border rounded-lg border-slate-200 dark:border-slate-750 bg-slate-50/50 dark:bg-slate-950/30 text-slate-800 dark:text-slate-100"
                  />
                </div>

                {/* Arabic Name */}
                <div className="space-y-1">
                  <label className="block text-slate-500 dark:text-slate-400 font-semibold font-sans">
                    {t.categoryNameAr} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nameAr}
                    onChange={e => setFormData(p => ({ ...p, nameAr: e.target.value }))}
                    placeholder="مثال: حبيبات بولي إيثيلين خام"
                    className="w-full px-3 py-2 border rounded-lg border-slate-200 dark:border-slate-750 bg-slate-50/50 dark:bg-slate-950/30 text-slate-850 dark:text-slate-100 text-right"
                  />
                </div>

                {/* Buttons controls */}
                <div className="flex justify-end gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingCategory(null);
                    }}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-semibold cursor-pointer"
                  >
                    {t.cancel}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold cursor-pointer"
                  >
                    {t.save}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
