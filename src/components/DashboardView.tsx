/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import {
  Package,
  TrendingDown,
  AlertTriangle,
  FileSpreadsheet,
  ArrowUpRight,
  ArrowDownLeft,
  Settings,
  CircleDot,
  Activity,
  History
} from 'lucide-react';
import { Product, StockTransaction, Category, ActivityLog } from '../types';

interface DashboardViewProps {
  products: Product[];
  transactions: StockTransaction[];
  categories: Category[];
  activityLogs: ActivityLog[];
  lang: 'en' | 'ar';
  t: any;
  onNavigate: (view: string) => void;
}

export default function DashboardView({
  products,
  transactions,
  categories,
  activityLogs,
  lang,
  t,
  onNavigate
}: DashboardViewProps) {
  
  // Calculate Key Stats
  const stats = useMemo(() => {
    const totalProducts = products.length;
    let totalQty = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    products.forEach(p => {
      totalQty += Number(p.quantity) || 0;
      if (p.quantity === 0) {
        outOfStockCount++;
      } else if (p.quantity <= p.minStock) {
        lowStockCount++;
      }
    });

    return { totalProducts, totalQty, lowStockCount, outOfStockCount };
  }, [products]);

  // Categories distribution pie chart data
  const categoryChartData = useMemo(() => {
    const categoryTotals: Record<string, { nameEn: string; nameAr: string; value: number }> = {};
    
    // Seed existing categories
    categories.forEach(cat => {
      categoryTotals[cat.id] = {
        nameEn: cat.nameEn,
        nameAr: cat.nameAr,
        value: 0
      };
    });

    products.forEach(p => {
      const catId = p.category;
      if (!categoryTotals[catId]) {
        categoryTotals[catId] = {
          nameEn: catId,
          nameAr: catId,
          value: 0
        };
      }
      
      // Calculate in Tons (divide kg by 1000 for balanced visualization)
      const qtyInTons = p.unit === 'kg' ? p.quantity / 1000 : p.quantity;
      categoryTotals[catId].value += Number(qtyInTons) || 0;
    });

    return Object.values(categoryTotals)
      .map(item => ({
        name: lang === 'en' ? item.nameEn : item.nameAr,
        value: Number(item.value.toFixed(1))
      }))
      .filter(item => item.value > 0);
  }, [products, categories, lang]);

  // Daily transaction trends for Bar/Area charts
  const trendChartData = useMemo(() => {
    const dailyData: Record<string, { date: string; incoming: number; outgoing: number }> = {};
    
    // Populate past 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString(lang === 'en' ? 'en-US' : 'en-EG', {
        month: 'short',
        day: 'numeric'
      });
      const key = d.toDateString();
      dailyData[key] = { date: label, incoming: 0, outgoing: 0 };
    }

    transactions.forEach(tx => {
      const dateKey = new Date(tx.timestamp).toDateString();
      if (dailyData[dateKey]) {
        const qty = Number(tx.quantity) || 0;
        if (tx.type === 'in') {
          dailyData[dateKey].incoming += qty;
        } else if (tx.type === 'out') {
          dailyData[dateKey].outgoing += Math.abs(qty);
        }
      }
    });

    return Object.values(dailyData);
  }, [transactions, lang]);

  // Low stock item highlights
  const lowStockList = useMemo(() => {
    return products
      .filter(p => p.quantity <= p.minStock)
      .slice(0, 5)
      .sort((a, b) => {
        const percentA = a.quantity / (a.minStock || 1);
        const percentB = b.quantity / (b.minStock || 1);
        return percentA - percentB; // most critical first
      });
  }, [products]);

  const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];

  const isRtl = lang === 'ar';

  return (
    <div className="space-y-6">
      {/* Upper Greeting and summary */}
      <div className="bg-gradient-to-r from-emerald-850 to-teal-900 text-white rounded-2xl p-6 shadow-sm border border-emerald-800/10 dark:border-emerald-800/40">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-sans font-bold tracking-tight">
              {t.dashTitle}
            </h1>
            <p className="text-emerald-100/80 text-xs md:text-sm mt-1 max-w-2xl font-light">
              {t.dashSub}
            </p>
          </div>
          <div className="flex items-center gap-2 bg-emerald-800/40 border border-emerald-700/50 rounded-xl py-2 px-3 self-stretch md:self-auto justify-center">
            <Activity className="h-5 w-5 text-emerald-400 animate-spin" />
            <span className="text-xs uppercase font-mono tracking-widest text-emerald-200">
              {lang === 'en' ? 'REAL-TIME ACTIVE' : 'قيد المراقبة اللحظية'}
            </span>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: Total Products */}
        <motion.div
          whileHover={{ y: -3 }}
          onClick={() => onNavigate('products')}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-xs flex items-center justify-between cursor-pointer group"
        >
          <div className="space-y-1">
            <span className="text-slate-500 dark:text-slate-400 text-xs font-medium font-sans">
              {t.statTotalProducts}
            </span>
            <div className="text-2xl font-bold font-sans tracking-tight text-slate-800 dark:text-slate-100">
              {stats.totalProducts} <span className="text-xs font-light text-slate-400">items</span>
            </div>
          </div>
          <div className="h-12 w-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform duration-250">
            <Package className="h-6 w-6" />
          </div>
        </motion.div>

        {/* Stat 2: Total Quantity on Stock */}
        <motion.div
          whileHover={{ y: -3 }}
          onClick={() => onNavigate('current_inventory')}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-xs flex items-center justify-between cursor-pointer group"
        >
          <div className="space-y-1">
            <span className="text-slate-500 dark:text-slate-400 text-xs font-medium font-sans">
              {t.statTotalQuantity}
            </span>
            <div className="text-2xl font-bold font-sans tracking-tight text-emerald-600 dark:text-emerald-400">
              {stats.totalQty.toLocaleString()}{' '}
              <span className="text-xs font-mono font-normal uppercase text-slate-400">
                Units
              </span>
            </div>
          </div>
          <div className="h-12 w-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform duration-250">
            <FileSpreadsheet className="h-6 w-6" />
          </div>
        </motion.div>

        {/* Stat 3: Low stock alerts */}
        <motion.div
          whileHover={{ y: -3 }}
          onClick={() => onNavigate('low_stock')}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/80 border-l-4 border-l-amber-500 shadow-xs flex items-center justify-between cursor-pointer group"
        >
          <div className="space-y-1">
            <span className="text-slate-500 dark:text-slate-400 text-xs font-medium font-sans">
              {t.statLowStockItems}
            </span>
            <div className="text-2xl font-bold font-sans tracking-tight text-amber-600 dark:text-amber-400">
              {stats.lowStockCount}{' '}
              {stats.lowStockCount > 0 && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-amber-100 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 align-middle ml-1">
                  Reorder
                </span>
              )}
            </div>
          </div>
          <div className="h-12 w-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform duration-250">
            <AlertTriangle className="h-6 w-6" />
          </div>
        </motion.div>

        {/* Stat 4: Out of stock - fully depleted */}
        <motion.div
          whileHover={{ y: -3 }}
          onClick={() => onNavigate('low_stock')}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/80 border-l-4 border-l-red-500 shadow-xs flex items-center justify-between cursor-pointer group"
        >
          <div className="space-y-1">
            <span className="text-slate-500 dark:text-slate-400 text-xs font-medium font-sans">
              {t.statOutOfStockItems}
            </span>
            <div className="text-2xl font-bold font-sans tracking-tight text-red-600 dark:text-red-400">
              {stats.outOfStockCount}{' '}
              {stats.outOfStockCount > 0 && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-red-100 dark:bg-red-950/30 text-red-800 dark:text-red-300 align-middle ml-1">
                  Urgent
                </span>
              )}
            </div>
          </div>
          <div className="h-12 w-12 rounded-xl bg-red-50 dark:bg-red-950/40 flex items-center justify-center text-red-600 dark:text-red-400 group-hover:scale-110 transition-transform duration-250">
            <TrendingDown className="h-6 w-6" />
          </div>
        </motion.div>
      </div>

      {/* Charting Section: Two Column Responsive Flex */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Dynamic Activity trends - Bar chart (takes 3 cols) */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/85 shadow-2xs lg:col-span-3 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-sans font-semibold text-slate-800 dark:text-slate-100 text-sm md:text-base flex items-center gap-1.5">
              <Activity className="h-5 w-5 text-emerald-500" />
              {t.chartTitleRecentTxs}
            </h3>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendChartData}>
                <defs>
                  <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
                <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    color: '#F8FAFC',
                    borderRadius: '8px',
                    borderColor: '#334155'
                  }}
                  itemStyle={{ color: '#F8FAFC' }}
                  labelStyle={{ color: '#94A3B8', fontWeight: 'bold' }}
                />
                <Legend iconType="circle" />
                <Area type="monotone" name={lang === 'en' ? 'Stock Receive (In)' : 'الوارد (مدخلات)'} dataKey="incoming" stroke="#10B981" fillOpacity={1} fill="url(#colorIn)" strokeWidth={2} />
                <Area type="monotone" name={lang === 'en' ? 'Stock Dispatch (Out)' : 'المنصرف (مخرجات)'} dataKey="outgoing" stroke="#EF4444" fillOpacity={1} fill="url(#colorOut)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories Distribution - Pie Chart (takes 2 cols) */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/85 shadow-2xs lg:col-span-2 flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="font-sans font-semibold text-slate-800 dark:text-slate-100 text-sm md:text-base">
              {t.chartTitleCategories}
            </h3>
          </div>
          {categoryChartData.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs italic gap-2">
              <Package className="h-8 w-8 stroke-1 text-slate-300" />
              <span>{lang === 'en' ? 'No stock values allocated' : 'لا يوجد مرجع كمي'}</span>
            </div>
          ) : (
            <div className="h-72 w-full flex flex-col justify-center">
              <div className="h-56 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {categoryChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val) => [`${val} ${lang === 'en' ? 'Tons' : 'طن'}`, t.categoryDistribution]}
                      contentStyle={{
                        backgroundColor: '#1E293B',
                        color: '#F8FAFC',
                        borderRadius: '6px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center text of doughnut */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-slate-400 text-[10px] uppercase tracking-wider">{t.categoryDistribution}</span>
                  <span className="text-base font-bold text-slate-700 dark:text-slate-200">
                    {categoryChartData.length} {lang === 'en' ? 'Classes' : 'تصنيف'}
                  </span>
                </div>
              </div>

              {/* Custom Legend for Categories */}
              <div className="grid grid-cols-2 gap-2 mt-4 text-[11px] overflow-y-auto max-h-16 px-1">
                {categoryChartData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-1.5 truncate">
                    <span
                      className="inline-block h-2 w-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-slate-600 dark:text-slate-300 truncate">{entry.name}</span>
                    <span className="text-slate-400 ml-auto font-mono">({entry.value})</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Low Stock Alerts Highlight & Audit trail */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
        {/* Low Stock & Shortages */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/85 shadow-2xs flex flex-col transition-all duration-300">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-sans font-semibold text-slate-800 dark:text-slate-100 text-sm md:text-base flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500 animate-bounce" />
              {t.statusSummary}
            </h3>
            {lowStockList.length > 0 && (
              <button
                onClick={() => onNavigate('low_stock')}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
              >
                {t.viewAll}
              </button>
            )}
          </div>

          {lowStockList.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-2">
              <CircleDot className="h-10 w-10 text-emerald-500 stroke-1" />
              <div className="font-medium text-slate-700 dark:text-slate-300">
                {lang === 'en' ? 'Inventory Health is Optimal' : 'حالة المخزون ممتازة ومثالية'}
              </div>
              <p className="text-xs text-slate-400">
                {lang === 'en'
                  ? 'All raw materials are currently safely above their warehouse reorder limits.'
                  : 'جميع خامات ومواد إيكو بلاست حالياً مسجلة بمستوى أمان أعلى من حافة الخطر.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3 flex-1 overflow-y-auto max-h-72 pr-1">
              {lowStockList.map(p => {
                const percentage = Math.min((p.quantity / (p.minStock || 1)) * 100, 100);
                const isOut = p.quantity === 0;

                return (
                  <div
                    key={p.id}
                    className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-950/30 text-xs flex flex-col gap-2 hover:bg-slate-50 dark:hover:bg-slate-950/55 transition-colors duration-250 cursor-pointer"
                    onClick={() => onNavigate('current_inventory')}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <span className="font-mono text-[10px] font-semibold text-slate-400 block tracking-tight">
                          {p.code}
                        </span>
                        <span className="font-sans font-medium text-slate-800 dark:text-slate-200 block">
                          {lang === 'en' ? p.nameEn : p.nameAr}
                        </span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase shrink-0 ${
                          isOut
                            ? 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400'
                        }`}
                      >
                        {isOut ? t.outOfStockBadge : t.lowStockBadge}
                      </span>
                    </div>

                    {/* Progress tracking indicator */}
                    <div className="space-y-1">
                      <div className="flex justify-between font-mono text-[10px] text-slate-400">
                        <span>
                          {lang === 'en' ? 'Current: ' : 'الحالي: '}
                          <strong className="text-slate-700 dark:text-slate-350">{p.quantity} {p.unit}</strong>
                        </span>
                        <span>
                          {lang === 'en' ? 'Safety Target: ' : 'الهدف بالأمان: '}
                          <strong>{p.minStock} {p.unit}</strong>
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            isOut ? 'bg-red-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Audit Log Stream */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/85 shadow-2xs flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-sans font-semibold text-slate-800 dark:text-slate-100 text-sm md:text-base flex items-center gap-2">
              <History className="h-5 w-5 text-sky-500" />
              {t.recentActivity}
            </h3>
            <button
              onClick={() => onNavigate('activity_logs')}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
            >
              {t.viewAll}
            </button>
          </div>

          {activityLogs.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-2">
              <Activity className="h-10 w-10 text-slate-300 stroke-1" />
              <div className="font-medium text-slate-600">
                {lang === 'en' ? 'No recent activities logged' : 'لا يوجد عمليات مسجلة حالياً'}
              </div>
            </div>
          ) : (
            <div className="space-y-3.5 flex-1 overflow-y-auto max-h-72 pr-1">
              {activityLogs.slice(0, 5).map(log => {
                const dateLabel = new Date(log.timestamp).toLocaleTimeString(
                  lang === 'en' ? 'en-US' : 'ar-EG',
                  { hour: '2-digit', minute: '2-digit', second: '2-digit' }
                );

                return (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl border border-slate-50 dark:border-slate-800/40 bg-slate-50/20 dark:bg-slate-950/10 text-xs flex gap-3 items-start"
                  >
                    <div className="h-2 w-2 rounded-full bg-emerald-500 self-start mt-1.5 flex-shrink-0 animate-ping" />
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-700 dark:text-slate-350 leading-relaxed">
                        {lang === 'en' ? log.detailsEn : log.detailsAr}
                      </p>
                      <div className="flex justify-between items-center mt-2 text-[10px] text-slate-400 font-mono">
                        <span className="truncate max-w-[150px]">@{log.user}</span>
                        <span>{dateLabel}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
