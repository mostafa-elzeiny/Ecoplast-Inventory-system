/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowUpRight,
  ArrowDownLeft,
  Sliders,
  Calendar,
  Layers,
  FileText,
  Truck,
  CheckCircle,
  AlertTriangle,
  Clock,
  ExternalLink,
  ChevronRight,
  User,
  Activity
} from 'lucide-react';
import { Product, StockTransaction, UserRole } from '../types';

interface StockMovementViewProps {
  products: Product[];
  transactions: StockTransaction[];
  userRole: UserRole;
  userEmail: string;
  onAddTransaction: (tx: Omit<StockTransaction, 'id' | 'timestamp'>) => void;
  lang: 'en' | 'ar';
  t: any;
  defaultType?: 'in' | 'out' | 'adjustment';
}

export default function StockMovementView({
  products,
  transactions,
  userRole,
  userEmail,
  onAddTransaction,
  lang,
  t,
  defaultType = 'in'
}: StockMovementViewProps) {
  
  const [txType, setTxType] = useState<'in' | 'out' | 'adjustment'>(defaultType);
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');

  // Form Fields
  const [quantity, setQuantity] = useState<string>('50');
  const [dateStr, setDateStr] = useState<string>(new Date().toISOString().split('T')[0]);
  const [supplierOrReceiver, setSupplierOrReceiver] = useState<string>('');
  const [refNo, setRefNo] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  
  // Feedback States
  const [successMsg, setSuccessMsg] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const canWrite = userRole === 'admin' || userRole === 'staff';
  const isRtl = lang === 'ar';

  // Toggle active Tx Type tab
  const handleTypeChange = (type: 'in' | 'out' | 'adjustment') => {
    setTxType(type);
    setErrorMsg(null);
    setSuccessMsg(false);
    // Reset specific fields
    setSupplierOrReceiver('');
    setRefNo('');
  };

  // Find currently selected product details
  const activeProduct = useMemo(() => {
    return products.find(p => p.id === selectedProductId) || null;
  }, [products, selectedProductId]);

  // Live Math Calculations for Impact Box
  const liveImpact = useMemo(() => {
    if (!activeProduct) return { current: 0, delta: 0, result: 0, unit: '', allowed: true };

    const current = Number(activeProduct.quantity) || 0;
    const deltaInput = Number(quantity) || 0;
    const unit = activeProduct.unit;

    let delta = 0;
    let result = current;
    let allowed = true;

    if (txType === 'in') {
      delta = deltaInput;
      result = current + deltaInput;
    } else if (txType === 'out') {
      delta = -deltaInput;
      result = current - deltaInput;
      if (result < 0) {
        allowed = false; // Out of stock logic block
      }
    } else if (txType === 'adjustment') {
      // Adjustment is absolute or relative? Let's make it a differential adjustment (e.g., +/- value). Let's treat quantity input as the target, or relative shift. Let's make it: change target quantity value.
      // But let's let the user type e.g., "50" or "-50" for direct adjustment, which is standard. If they type 50, let's make it the relative shift.
      delta = deltaInput;
      result = current + deltaInput;
      if (result < 0) {
        allowed = false;
      }
    }

    return { current, delta, result, unit, allowed };
  }, [activeProduct, quantity, txType]);

  // Submissions handler
  const handleCommitTx = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(false);

    if (!canWrite) {
      setErrorMsg(t.unauthorized);
      return;
    }

    if (!activeProduct) {
      setErrorMsg(lang === 'en' ? 'Please register a product first.' : 'يرجى تسجيل مادة خامة في الدليل أولاً.');
      return;
    }

    const qtyNumber = Number(quantity);
    if (!qtyNumber || qtyNumber <= 0) {
      setErrorMsg(lang === 'en' ? 'Quantity must be greater than 0.' : 'يجب أن تكون الكمية أكبر من الصفر.');
      return;
    }

    if (!liveImpact.allowed) {
      setErrorMsg(
        lang === 'en'
          ? 'Transaction Denied: Outgoing quantity exceeds current available stock!'
          : 'العملية مرفوضة: الكمية المنصرفة المطلوبة تتجاوز الرصيد المتوفر بالمستودع!'
      );
      return;
    }

    // Construct Stock Movement object
    const payload: Omit<StockTransaction, 'id' | 'timestamp'> = {
      productId: activeProduct.id,
      productCode: activeProduct.code,
      productNameEn: activeProduct.nameEn,
      productNameAr: activeProduct.nameAr,
      type: txType,
      quantity: txType === 'out' ? -qtyNumber : qtyNumber,
      previousQuantity: liveImpact.current,
      newQuantity: liveImpact.result,
      refNo: refNo || (txType === 'adjustment' ? 'ADJ-REG' : 'PO-REG'),
      supplierOrReceiver: supplierOrReceiver || (txType === 'in' ? 'SABIC' : 'Internal'),
      notes: notes || '',
      user: userEmail,
      userRole
    };

    onAddTransaction(payload);
    
    // Clear and success feedback
    setSuccessMsg(true);
    setQuantity('10');
    setNotes('');
    setRefNo('');
    setSupplierOrReceiver('');

    setTimeout(() => {
      setSuccessMsg(false);
    }, 5000);
  };

  // Recent transactions of current type (Max 5 results)
  const recentTxsFiltered = useMemo(() => {
    return transactions
      .filter(tx => tx.type === txType)
      .slice(0, 5)
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [transactions, txType]);

  return (
    <div className="space-y-6">
      {/* Dynamic top selection bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800/80 shadow-xs">
        <div className="flex bg-slate-100 dark:bg-slate-950/60 p-1 rounded-xl gap-1 max-w-md">
          <button
            onClick={() => handleTypeChange('in')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
              txType === 'in'
                ? 'bg-blue-600 text-white shadow-xs scale-100'
                : 'text-slate-550 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <ArrowDownLeft className="h-4 w-4" />
            {t.menuStockIn}
          </button>
          <button
            onClick={() => handleTypeChange('out')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
              txType === 'out'
                ? 'bg-emerald-600 text-white shadow-xs scale-100'
                : 'text-slate-550 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <ArrowUpRight className="h-4 w-4" />
            {t.menuStockOut}
          </button>
          <button
            onClick={() => handleTypeChange('adjustment')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
              txType === 'adjustment'
                ? 'bg-amber-500 text-white shadow-xs scale-100'
                : 'text-slate-550 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Sliders className="h-4 w-4" />
            {t.menuAdjustments}
          </button>
        </div>
      </div>

      {/* Main core transaction editor - Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: The entry form */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800/80 shadow-xs lg:col-span-2">
          {/* Header */}
          <div className="flex items-center gap-2 mb-6">
            {txType === 'in' && <ArrowDownLeft className="text-blue-500 h-6 w-6" />}
            {txType === 'out' && <ArrowUpRight className="text-emerald-500 h-6 w-6" />}
            {txType === 'adjustment' && <Sliders className="text-amber-500 h-6 w-6" />}
            <h2 className="text-base md:text-lg font-bold font-sans text-slate-800 dark:text-slate-100">
              {txType === 'in' && t.stockInHeader}
              {txType === 'out' && t.stockOutHeader}
              {txType === 'adjustment' && t.adjustmentHeader}
            </h2>
          </div>

          <form onSubmit={handleCommitTx} className="space-y-4 text-xs">
            {/* Product selection dropdown */}
            <div className="space-y-1.5">
              <label className="block text-slate-500 dark:text-slate-400 font-semibold font-sans">
                {t.selectProduct} *
              </label>
              <select
                value={selectedProductId}
                onChange={e => setSelectedProductId(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg border-slate-200 dark:border-slate-750 bg-slate-50/50 dark:bg-slate-950/30 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-sans"
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.code} — {lang === 'en' ? p.nameEn : p.nameAr}
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity and Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-slate-500 dark:text-slate-400 font-semibold font-sans">
                  {t.qtyToMove} ({activeProduct?.unit || 'Units'}) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={quantity}
                  onChange={e => setQuantity(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg border-slate-200 dark:border-slate-750 bg-slate-50/50 dark:bg-slate-950/30 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-slate-500 dark:text-slate-400 font-semibold font-sans flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-slate-450" />
                  {lang === 'en' ? 'Date' : 'تاريخ القيد'}
                </label>
                <input
                  type="date"
                  required
                  value={dateStr}
                  onChange={e => setDateStr(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg border-slate-200 dark:border-slate-750 bg-slate-50/50 dark:bg-slate-950/30 text-slate-800 dark:text-slate-100"
                />
              </div>
            </div>

            {/* Counter-party and Reference */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-slate-500 dark:text-slate-400 font-semibold font-sans">
                  {txType === 'in' && t.supplierLabel}
                  {txType === 'out' && t.receiverLabel}
                  {txType === 'adjustment' && t.adjustmentReason}
                </label>
                <input
                  type="text"
                  placeholder={
                    txType === 'in'
                      ? 'e.g., SABIC Petrochemicals'
                      : txType === 'out'
                      ? 'e.g., Delta Bags Corp.'
                      : 'e.g., Damage wastage correction'
                  }
                  value={supplierOrReceiver}
                  onChange={e => setSupplierOrReceiver(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg border-slate-200 dark:border-slate-750 bg-slate-50/50 dark:bg-slate-950/30 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-slate-500 dark:text-slate-400 font-semibold font-sans">
                  {t.refPO}
                </label>
                <input
                  type="text"
                  placeholder="e.g., PO-2026-0042 / INV-9902"
                  value={refNo}
                  onChange={e => setRefNo(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg border-slate-200 dark:border-slate-750 bg-slate-50/50 dark:bg-slate-950/30 text-slate-800 dark:text-slate-100"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <label className="block text-slate-500 dark:text-slate-400 font-semibold font-sans">
                {t.notes}
              </label>
              <textarea
                rows={3}
                placeholder="Operational audit notes regarding quality, transport, or shrinkage factor..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg border-slate-200 dark:border-slate-750 bg-slate-50/50 dark:bg-slate-950/30 text-slate-800 dark:text-slate-100"
              />
            </div>

            {/* Response Banner Feedback */}
            {successMsg && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-800/40 rounded-xl text-emerald-800 dark:text-emerald-450 font-semibold flex items-center gap-2">
                <CheckCircle className="h-4.5 w-4.5 text-emerald-500 animate-pulse" />
                {t.transactionRegistered}
              </div>
            )}

            {errorMsg && (
              <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-800/40 rounded-xl text-red-800 dark:text-red-450 font-semibold flex items-center gap-2">
                <AlertTriangle className="h-4.5 w-4.5 text-red-500" />
                {errorMsg}
              </div>
            )}

            {/* Form actions save */}
            <div className="flex gap-2.5 pt-4">
              <button
                type="submit"
                className={`py-2 px-5 text-white bg-blue-600 hover:bg-blue-750 dark:bg-emerald-600 dark:hover:bg-emerald-700 font-semibold rounded-xl cursor-pointer ${
                  txType === 'in' ? 'bg-blue-600 hover:bg-blue-750' : 'bg-emerald-600 hover:bg-emerald-750'
                }`}
              >
                {txType === 'in' && t.saveStockIn}
                {txType === 'out' && t.saveStockOut}
                {txType === 'adjustment' && t.saveAdjustment}
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT COLUMN: The Live Impact Preview Box */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800/80 shadow-xs flex flex-col justify-between h-full relative overflow-hidden">
            {/* Visual top bar of indicator card */}
            <div
              className={`absolute top-0 left-0 right-0 h-1.5 ${
                txType === 'in' ? 'bg-blue-500' : txType === 'out' ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />

            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-50 dark:border-slate-800/50">
                <h3 className="font-sans font-bold text-slate-850 dark:text-slate-100 text-sm">
                  {t.impactTitle}
                </h3>
                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 bg-slate-50 dark:bg-slate-950 px-2 py-0.5 rounded border border-slate-100 dark:border-slate-800">
                  {lang === 'en' ? 'Live preview' : 'معاينة فورية'}
                </span>
              </div>

              {activeProduct ? (
                <div className="text-xs space-y-4 font-sans leading-relaxed text-slate-650 dark:text-slate-350">
                  <p>
                    {t.impactDescription}{' '}
                    <strong className="text-slate-850 dark:text-slate-100">
                      {quantity} {liveImpact.unit}
                    </strong>{' '}
                    {t.of}{' '}
                    <strong className="text-slate-850 dark:text-slate-100">
                      {lang === 'en' ? activeProduct.nameEn : activeProduct.nameAr}
                    </strong>{' '}
                    {t.toInventory}
                  </p>

                  {/* Math Grid visual blocks */}
                  <div className="space-y-3 pt-3">
                    {/* Item 1: Current Stock */}
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-450">{t.currentStock}</span>
                      <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
                        {liveImpact.current.toLocaleString()} {liveImpact.unit}
                      </span>
                    </div>

                    {/* Item 2: Quantities changed */}
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-450">
                        {txType === 'in' && t.added}
                        {txType === 'out' && t.removed}
                        {txType === 'adjustment' && t.adjusted}
                      </span>
                      <span
                        className={`font-mono font-bold ${
                          txType === 'in'
                            ? 'text-blue-600'
                            : txType === 'out'
                            ? 'text-red-500'
                            : liveImpact.delta < 0
                            ? 'text-red-500'
                            : 'text-blue-500'
                        }`}
                      >
                        {liveImpact.delta > 0 ? '+' : ''}
                        {liveImpact.delta.toLocaleString()} {liveImpact.unit}
                      </span>
                    </div>

                    {/* Section Line divider */}
                    <div className="border-t border-dashed border-slate-200 dark:border-slate-750 my-2" />

                    {/* Item 3: Resulting state */}
                    <div className="flex justify-between items-center text-sm font-bold">
                      <span className="text-slate-800 dark:text-slate-200">{t.newStock}</span>
                      <span className="font-mono text-blue-600 dark:text-blue-400">
                        {liveImpact.result.toLocaleString()} {liveImpact.unit}
                      </span>
                    </div>
                  </div>

                  {/* Warning label if below 0 */}
                  {!liveImpact.allowed && (
                    <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/50 text-red-800 dark:text-red-400 flex items-start gap-2 max-w-full text-[11px] font-semibold">
                      <AlertTriangle className="h-4.5 w-4.5 shrink-0 text-red-500 mt-0.5" />
                      <span>
                        {lang === 'en'
                          ? 'Denied: Action depletes stock below absolute zero bounds!'
                          : 'مرفوض: حركة الصرف تجعل الرصيد بالسالب وهو غير مسموح به!'}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-xs text-slate-400 italic text-center py-10">
                  {lang === 'en' ? 'Select product to trace live.' : 'اختر مادة لمشاهدة التأثير المباشر.'}
                </div>
              )}
            </div>

            {/* Operator responsible signoff */}
            <div className="mt-8 pt-4 border-t border-slate-50 dark:border-slate-800/50 flex justify-between items-center text-[10px] text-slate-400 font-mono">
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {t.operator}:
              </span>
              <span>{userEmail}</span>
            </div>
          </div>
        </div>

      </div>

      {/* BOTTOM SECTION: Underling Transactions list of active type */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800/80 shadow-xs">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-sans font-bold text-slate-850 dark:text-slate-100 text-sm flex items-center gap-2">
            <Clock className="text-sky-500 h-5 w-5" />
            {t.recentTransactions}
          </h3>
        </div>

        <div className="overflow-x-auto max-w-full">
          <table className="w-full text-xs text-left text-slate-500 dark:text-slate-400 min-w-[700px] border-collapse">
            <thead className="text-[10px] text-slate-700 dark:text-slate-350 bg-slate-50 dark:bg-slate-950 uppercase font-mono border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3 font-semibold">{t.codeCol}</th>
                <th className="px-4 py-3 font-semibold">
                  {lang === 'en' ? t.nameEnCol : t.nameArCol}
                </th>
                <th className="px-4 py-3 font-semibold">{t.qtyCol}</th>
                <th className="px-4 py-3 font-semibold">
                  {txType === 'in' && (lang === 'en' ? 'Supplier' : 'المورد')}
                  {txType === 'out' && (lang === 'en' ? 'Destination' : 'العميل')}
                  {txType === 'adjustment' && (lang === 'en' ? 'Audit Code / Reason' : 'سبب التعديل')}
                </th>
                <th className="px-4 py-3 font-semibold">{t.refCol}</th>
                <th className="px-4 py-3 font-semibold">{t.timestamp}</th>
                <th className="px-4 py-3 font-semibold">{t.operator}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentTxsFiltered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-405 italic">
                    {lang === 'en' ? 'No recent operations registered.' : 'لا يوجد حركات مسجلة حالياً.'}
                  </td>
                </tr>
              ) : (
                recentTxsFiltered.map(tx => {
                  const dateLabel = new Date(tx.timestamp).toLocaleString(
                    lang === 'en' ? 'en-US' : 'ar-EG',
                    { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
                  );

                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-950/20">
                      <td className="px-4 py-2.5 font-mono font-bold text-slate-500">
                        {tx.productCode}
                      </td>
                      <td className="px-4 py-2.5 font-sans font-medium text-slate-800 dark:text-slate-200">
                        {lang === 'en' ? tx.productNameEn : tx.productNameAr}
                      </td>
                      <td
                        className={`px-4 py-2.5 font-mono font-bold ${
                          tx.type === 'in' ? 'text-blue-600' : 'text-red-500'
                        }`}
                      >
                        {tx.type === 'in' ? '+' : ''}
                        {tx.quantity.toLocaleString()}
                      </td>
                      <td className="px-4 py-2.5 text-slate-600 dark:text-slate-350 font-sans">
                        {tx.supplierOrReceiver || '-'}
                      </td>
                      <td className="px-4 py-2.5 font-mono text-slate-550 dark:text-slate-400">
                        {tx.refNo || '-'}
                      </td>
                      <td className="px-4 py-2.5 text-slate-400">{dateLabel}</td>
                      <td className="px-4 py-2.5 text-slate-400 truncate max-w-[120px]">
                        @{tx.user}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
