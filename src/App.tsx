/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  addDoc,
  deleteDoc,
  writeBatch
} from 'firebase/firestore';
import { db, seedDatabaseIfEmpty } from './lib/firebase';
import { initialCategories, initialProducts, initialTransactions, initialLogs } from './lib/defaults';
import { translations } from './lib/translations';
import {
  User,
  Product,
  Category,
  StockTransaction,
  ActivityLog,
  SystemSettings,
  UserRole
} from './types';

// Importing all dynamic subcomponents
import Logo from './components/Logo';
import DashboardView from './components/DashboardView';
import CurrentInventoryView from './components/CurrentInventoryView';
import ProductsView from './components/ProductsView';
import CategoriesView from './components/CategoriesView';
import StockMovementView from './components/StockMovementView';
import ExcelIntegrationView from './components/ExcelIntegrationView';
import ShortagesView from './components/ShortagesView';
import ReportsView from './components/ReportsView';
import ActivityLogsView from './components/ActivityLogsView';
import UsersPermissionsView from './components/UsersPermissionsView';
import SettingsView from './components/SettingsView';

import {
  LayoutDashboard,
  Grid,
  Package,
  Layers,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingDown,
  FileSpreadsheet,
  Shield,
  History,
  Settings,
  AlertTriangle,
  Globe,
  Moon,
  Sun,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Lock,
  DoorOpen
} from 'lucide-react';

export default function App() {
  // Navigation active view state
  const [activeView, setActiveView] = useState<string>('dashboard');
  
  // Simulation Active Account details (Admin, Staff, or Read-only)
  const [activeRole, setActiveRole] = useState<UserRole>(() => {
    return (localStorage.getItem('eco_role') as UserRole) || 'admin';
  });
  const [activeEmail, setActiveEmail] = useState<string>(() => {
    return localStorage.getItem('eco_email') || 'mostafa.elzeiny11@gmail.com';
  });

  // Database Collections States - Initialized instantly from Cache or beautiful Defaults
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const cached = localStorage.getItem('eco_products');
      return cached ? JSON.parse(cached) : initialProducts;
    } catch {
      return initialProducts;
    }
  });
  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const cached = localStorage.getItem('eco_categories');
      return cached ? JSON.parse(cached) : initialCategories;
    } catch {
      return initialCategories;
    }
  });
  const [transactions, setTransactions] = useState<StockTransaction[]>(() => {
    try {
      const cached = localStorage.getItem('eco_transactions');
      return cached ? JSON.parse(cached) : initialTransactions;
    } catch {
      return initialTransactions;
    }
  });
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    try {
      const cached = localStorage.getItem('eco_activity_logs');
      return cached ? JSON.parse(cached) : initialLogs;
    } catch {
      return initialLogs;
    }
  });

  // System Core Settings (Bilingual preferences and light/dark theme)
  const [sysSettings, setSysSettings] = useState<SystemSettings>(() => {
    const savedLang = (localStorage.getItem('eco_lang') as 'en' | 'ar') || 'en';
    const savedTheme = (localStorage.getItem('eco_theme') as 'light' | 'dark') || 'light';
    return {
      lang: savedLang,
      theme: savedTheme,
      companyNameEn: 'Eco Plast',
      companyNameAr: 'إيكو بلاست',
      lowStockAlertThreshold: 10
    };
  });

  // DB initial loading splash screen state - initialized to false to eliminate all startup stalls
  const [loading, setLoading] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Shortage notification alert state
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);

  const lang = sysSettings.lang;
  const theme = sysSettings.theme;
  const t = translations[lang];
  const isRtl = lang === 'ar';

  // 1. Database Seeding & Asynchronous Sync Engine
  useEffect(() => {
    let unsubscribeProds: (() => void) | null = null;
    let unsubscribeCats: (() => void) | null = null;
    let unsubscribeTxs: (() => void) | null = null;
    let unsubscribeLogs: (() => void) | null = null;

    async function initDb() {
      try {
        // Seed first in the background if completely fresh database instance
        await seedDatabaseIfEmpty();
      } catch (err) {
        console.warn('Asynchronous database seeding suggestion (skipped or ready):', err);
      }

      // Background snapshot loaders that dynamically match data over time
      try {
        unsubscribeProds = onSnapshot(collection(db, 'products'), (snapshot) => {
          const prodList: Product[] = [];
          snapshot.forEach((doc) => {
            prodList.push({ id: doc.id, ...doc.data() } as Product);
          });
          if (prodList.length > 0) {
            setProducts(prodList);
            localStorage.setItem('eco_products', JSON.stringify(prodList));
          }
        }, (error) => {
          console.error('Firestore products background sync paused:', error);
        });
      } catch (e) {
        console.error('Products listener error:', e);
      }

      try {
        unsubscribeCats = onSnapshot(collection(db, 'categories'), (snapshot) => {
          const catList: Category[] = [];
          snapshot.forEach((doc) => {
            catList.push({ id: doc.id, ...doc.data() } as Category);
          });
          if (catList.length > 0) {
            setCategories(catList);
            localStorage.setItem('eco_categories', JSON.stringify(catList));
          }
        }, (error) => {
          console.error('Firestore categories background sync paused:', error);
        });
      } catch (e) {
        console.error('Categories listener error:', e);
      }

      try {
        unsubscribeTxs = onSnapshot(collection(db, 'transactions'), (snapshot) => {
          const txList: StockTransaction[] = [];
          snapshot.forEach((doc) => {
            txList.push({ id: doc.id, ...doc.data() } as StockTransaction);
          });
          if (txList.length > 0) {
            setTransactions(txList);
            localStorage.setItem('eco_transactions', JSON.stringify(txList));
          }
        }, (error) => {
          console.error('Firestore transactions background sync paused:', error);
        });
      } catch (e) {
        console.error('Transactions listener error:', e);
      }

      try {
        unsubscribeLogs = onSnapshot(collection(db, 'activity_logs'), (snapshot) => {
          const logList: ActivityLog[] = [];
          snapshot.forEach((doc) => {
            logList.push({ id: doc.id, ...doc.data() } as ActivityLog);
          });
          if (logList.length > 0) {
            setActivityLogs(logList);
            localStorage.setItem('eco_activity_logs', JSON.stringify(logList));
          }
        }, (error) => {
          console.error('Firestore activity_logs background sync paused:', error);
        });
      } catch (e) {
        console.error('Logs listener error:', e);
      }
    }

    initDb();

    return () => {
      if (unsubscribeProds) unsubscribeProds();
      if (unsubscribeCats) unsubscribeCats();
      if (unsubscribeTxs) unsubscribeTxs();
      if (unsubscribeLogs) unsubscribeLogs();
    };
  }, []);

  // 2. Persisting Local Variables Actions
  useEffect(() => {
    // Add light/dark body HTML adjustments wrapper
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('eco_theme', theme);
  }, [theme]);

  // 3. Callback actions writers
  const createSystemLog = async (action: string, en: string, ar: string) => {
    try {
      const logRef = doc(collection(db, 'activity_logs'));
      await setDoc(logRef, {
        action,
        detailsEn: en,
        detailsAr: ar,
        timestamp: Date.now(),
        user: activeEmail,
        userRole: activeRole
      });
    } catch (err) {
      console.error('Failed to log activity:', err);
    }
  };

  const handleUpdateProduct = async (prod: Product) => {
    if (activeRole === 'read') return;
    try {
      await setDoc(doc(db, 'products', prod.id), prod);
      await createSystemLog(
        'product_updated',
        `Product item @${prod.code} details modified.`,
        `تم تعديل تفاصيل ملف منتج كود @${prod.code}.`
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddProduct = async (newProd: Omit<Product, 'id'>) => {
    if (activeRole === 'read') return;
    try {
      const newRef = doc(collection(db, 'products'));
      const full: Product = { id: newRef.id, ...newProd };
      await setDoc(newRef, full);
      await createSystemLog(
        'product_created',
        `New polymer material ${full.nameEn} (@${full.code}) registered in database directory.`,
        `تم تسجيل وتكويد مادة خامة جديدة ${full.nameAr} (@${full.code}) بالدليل الموحد للمستودع.`
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (activeRole !== 'admin') return;
    const target = products.find(p => p.id === id);
    if (!target) return;
    try {
      await deleteDoc(doc(db, 'products', id));
      await createSystemLog(
        'product_deleted',
        `Product SKU @${target.code} deregistered completely from databases.`,
        `تم مسح وإلغاء تسجيل مادة الخامة كود @${target.code} بالكامل من قواعد البيانات.`
      );
    } catch (err) {
      console.error(err);
    }
  };

  // Excel bulk spreadsheet synchronized writes
  const handleBulkUpdate = async (updatedList: Product[]) => {
    if (activeRole === 'read') return;
    try {
      const batch = writeBatch(db);
      updatedList.forEach(p => {
        const ref = doc(db, 'products', p.id);
        batch.set(ref, p);
      });
      await batch.commit();
      await createSystemLog(
        'bulk_sheets_synced',
        `Performed spreadsheet bulk sync modifying/updating ${updatedList.length} row quantities.`,
        `تم جرد وتعديل تسويات جماعية لكميات لـ ${updatedList.length} صنف خام بلاستيك.`
      );
    } catch (err) {
      console.error(err);
    }
  };

  // CORE LEDGER TRANSACTION MUTATOR (Automatic Stock Adjustments)
  const handleAddTransaction = async (txData: Omit<StockTransaction, 'id' | 'timestamp'>) => {
    if (activeRole === 'read') return;
    try {
      const txRef = doc(collection(db, 'transactions'));
      const timestamp = Date.now();
      const fullTx: StockTransaction = { id: txRef.id, timestamp, ...txData };

      // Write Transaction record
      await setDoc(txRef, fullTx);

      // Now atomic update quantity on the actual product!
      const prodRef = doc(db, 'products', txData.productId);
      const targetProd = products.find(p => p.id === txData.productId);
      if (targetProd) {
        const nextQty = targetProd.quantity + txData.quantity; // txData.quantity is negative for Stock Out
        await setDoc(prodRef, {
          ...targetProd,
          quantity: Math.max(0, nextQty),
          updatedAt: timestamp,
          updatedBy: activeEmail
        });
      }

      await createSystemLog(
        `stock_${txData.type}`,
        `Committed stock movement type [${txData.type.toUpperCase()}] for SKU @${txData.productCode} of quantity ${Math.abs(txData.quantity)} units.`,
        `تم تسجيل وقيد حركة مستودع [${txData.type === 'in' ? 'وارد' : txData.type === 'out' ? 'صادر' : 'تسوية'}] بالمادة كود @${txData.productCode} بمقدار ${Math.abs(txData.quantity)} وحدة.`
      );
    } catch (err) {
      console.error(err);
    }
  };

  // Database snapshot download trigger
  const handleBackupDatabase = () => {
    const serialized = JSON.stringify({
      products,
      transactions,
      categories,
      activityLogs,
      backupTimestamp: Date.now(),
      backupUser: activeEmail
    }, null, 2);

    const blob = new Blob([serialized], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Eco-Plast_Database_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Database snapshot uploading restorations
  const handleRestoreDatabase = async (backupData: any): Promise<boolean> => {
    if (activeRole !== 'admin') return false;
    try {
      const batch = writeBatch(db);

      // 1. Restore Categories
      if (backupData.categories && Array.isArray(backupData.categories)) {
        backupData.categories.forEach((cat: any) => {
          const ref = doc(db, 'categories', cat.id);
          batch.set(ref, cat);
        });
      }

      // 2. Restore Products
      if (backupData.products && Array.isArray(backupData.products)) {
        backupData.products.forEach((p: any) => {
          const ref = doc(db, 'products', p.id);
          batch.set(ref, p);
        });
      }

      // 3. Restore Transactions
      if (backupData.transactions && Array.isArray(backupData.transactions)) {
        backupData.transactions.forEach((tx: any) => {
          const ref = doc(db, 'transactions', tx.id);
          batch.set(ref, tx);
        });
      }

      await batch.commit();

      await createSystemLog(
        'database_restored',
        `Complete system restoration triggered. Recovered all table listings fully.`,
        `تم تفعيل استعادة شاملة لقاعدة البيانات ومزامنتها بنسخة تاريخية سابقة.`
      );

      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  // Categories mutators
  const handleAddCategory = async (cat: Category) => {
    if (activeRole === 'read') return;
    try {
      await setDoc(doc(db, 'categories', cat.id), cat);
      await createSystemLog(
        'category_added',
        `New Material category handle listed: [${cat.nameEn}].`,
        `تم قيد وتسجيل فئة خام بلاستيكي جديدة: [${cat.nameAr}].`
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateCategory = async (cat: Category) => {
    if (activeRole === 'read') return;
    try {
      await setDoc(doc(db, 'categories', cat.id), cat);
      await createSystemLog(
        'category_updated',
        `Material category listing updated: [${cat.nameEn}].`,
        `تم تحديث مواصفات فئة الخام البلاستيكي: [${cat.nameAr}].`
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (activeRole !== 'admin') return;
    const target = categories.find(c => c.id === id);
    if (!target) return;
    try {
      await deleteDoc(doc(db, 'categories', id));
      await createSystemLog(
        'category_deleted',
        `Material category deleted: [${target.nameEn}].`,
        `تم شطب فئة تقسيم الخامات البلاستيكية نهائياً: [${target.nameAr}].`
      );
    } catch (err) {
      console.error(err);
    }
  };

  // Helper toggle language
  const handleToggleLanguage = () => {
    const nextLang = lang === 'en' ? 'ar' : 'en';
    setSysSettings(prev => {
      const updated = { ...prev, lang: nextLang };
      localStorage.setItem('eco_lang', nextLang);
      return updated;
    });
  };

  // Switch simulators role
  const handleSwitchSimulatorUser = (role: UserRole, email: string) => {
    setActiveRole(role);
    setActiveEmail(email);
    localStorage.setItem('eco_role', role);
    localStorage.setItem('eco_email', email);
  };

  // Low stock lists count calculations
  const alertShortagesList = React.useMemo(() => {
    return products.filter(p => p.quantity <= p.minStock);
  }, [products]);

  // If FireStore connection is loading, show corporate splash spinner!
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="space-y-4 text-center max-w-sm">
          <Logo className="h-16 justify-center" showText={false} />
          <h2 className="text-emerald-800 dark:text-emerald-400 font-bold font-sans text-lg tracking-tight">
            Eco Plast WarehouseOS
          </h2>
          <div className="flex items-center justify-center gap-2 font-mono text-slate-400 text-xs">
            <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
            <span>Meticulously preparing digital assets...</span>
          </div>
        </div>
      </div>
    );
  }

  // Sidebar Menu mapping elements
  const navigationItems = [
    { view: 'dashboard', label: t.menuDashboard, icon: LayoutDashboard },
    { view: 'current_inventory', label: t.menuCurrentInventory, icon: Grid },
    { view: 'products', label: t.menuProducts, icon: Package },
    { view: 'categories', label: t.menuCategories, icon: Layers },
    { view: 'stock_in', label: t.menuStockIn, icon: ArrowDownLeft, badge: 'blue' },
    { view: 'stock_out', label: t.menuStockOut, icon: ArrowUpRight, badge: 'emerald' },
    { view: 'shortages', label: t.menuLowStock, icon: TrendingDown, badgeCount: alertShortagesList.length },
    { view: 'reports', label: t.menuReports, icon: FileSpreadsheet },
    { view: 'excel_import', label: t.menuImportExcel, icon: FileSpreadsheet },
    { view: 'users_permissions', label: t.menuUsers, icon: Shield },
    { view: 'activity_logs', label: t.menuActivityLogs, icon: History },
    { view: 'settings', label: t.menuSettings, icon: Settings }
  ];

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="min-h-screen flex bg-[#F1F5F9] dark:bg-[#0F172A] text-slate-800 dark:text-slate-100 font-sans transition-colors duration-200"
    >
      {/* 1. LEFT SIDEBAR PANEL */}
      <aside
        className={`bg-white dark:bg-[#0F172A] border-r border-slate-200 dark:border-slate-850 hidden md:flex flex-col h-screen sticky top-0 transition-all duration-300 z-30 shrink-0 select-none ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Top brand header section */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
          {!sidebarCollapsed && <Logo showText={true} lang={lang} isDarkBg={theme === 'dark'} onClick={() => setActiveView('dashboard')} />}
          {sidebarCollapsed && <Logo showText={false} className="h-8 justify-center mx-auto" isDarkBg={theme === 'dark'} onClick={() => setActiveView('dashboard')} />}

          {/* Squeeze collapse button */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700/60"
          >
            {sidebarCollapsed ? (
              isRtl ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
            ) : (
              isRtl ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Dynamic menus grids */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navigationItems.map(item => {
            const IconComp = item.icon;
            const isSelected = activeView === item.view;

            return (
              <button
                key={item.view}
                onClick={() => setActiveView(item.view)}
                className={`w-full py-2.5 px-3 rounded-xl text-left flex items-center gap-3 transition-all relative select-none font-medium text-xs font-sans cursor-pointer ${
                  isRtl ? 'text-right' : ''
                } ${
                  isSelected
                    ? 'bg-[#10B981] text-white shadow-sm'
                    : 'text-slate-600 dark:text-[#94A3B8] hover:bg-slate-100 dark:hover:bg-[#334155]/40 hover:text-slate-900 dark:text-white'
                }`}
              >
                <IconComp className={`h-4.5 w-4.5 shrink-0 transition-transform ${
                  isSelected ? 'scale-110 text-white' : 'text-slate-400 dark:text-[#94A3B8]'
                }`} />
                
                {!sidebarCollapsed && (
                  <span className="truncate">{item.label}</span>
                )}

                {/* Optional side indicator badge dots */}
                {item.badge && isSelected && (
                  <span className="absolute right-3.5 h-1.5 w-1.5 rounded-full bg-white animate-ping" />
                )}

                {/* alert quantity counter badge bubble */}
                {!sidebarCollapsed && item.badgeCount !== undefined && item.badgeCount > 0 && (
                  <span className={`ml-auto font-bold font-mono text-[9px] px-1.5 py-0.5 rounded-full shrink-0 ${
                    isSelected ? 'bg-white text-emerald-600' : 'bg-amber-500 text-white'
                  }`}>
                    {item.badgeCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar bottom logged simulation indicator profile */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-950/20">
          <div
            onClick={() => setActiveView('users_permissions')}
            className={`flex items-center gap-3 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/40 transition-all cursor-pointer ${
              sidebarCollapsed ? 'justify-center' : ''
            }`}
          >
            <div className="h-9 w-9 rounded-full bg-emerald-500 text-white font-bold text-xs flex items-center justify-center font-sans tracking-widest flex-shrink-0">
              {activeEmail.substr(0, 2).toUpperCase()}
            </div>
            {!sidebarCollapsed && (
              <div className="text-xs min-w-0 flex-1">
                <span className="font-semibold block text-slate-700 dark:text-slate-200 truncate">
                  {activeRole === 'admin' ? t.roleAdmin : activeRole === 'staff' ? t.roleStaff : t.roleRead}
                </span>
                <span className="text-[10px] text-slate-400 font-mono truncate block">
                  {activeEmail}
                </span>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* 2. MAIN LAYOUT GRID SECTION CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 max-w-full">
        
        {/* TOP HEADER NAVIGATION AND TIGHT TOOLS */}
        <header className="sticky top-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md pt-4 pb-3 px-4 md:px-6 z-20 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center select-none">
          <div className="flex items-center gap-2">
            <div className="md:hidden">
              <Logo showText={false} className="h-7" onClick={() => setActiveView('dashboard')} />
            </div>
            {/* Context title path */}
            <div className="hidden md:flex items-center gap-1 text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">
              <span>{t.appName}</span>
              <ChevronRight className={`h-3 w-3 ${isRtl ? 'rotate-180' : ''}`} />
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                {navigationItems.find(x => x.view === activeView)?.label}
              </span>
            </div>
          </div>

          {/* Action Tools: Notification triggers, Lang switches, Simulators block */}
          <div className="flex items-center gap-2 pr-1">
            
            {/* ITEM 1: Language switcher */}
            <button
              onClick={handleToggleLanguage}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-650 dark:text-slate-400 font-mono text-[10px] font-bold flex items-center gap-1.5 cursor-pointer hover:bg-slate-50 transition-colors uppercase select-none"
            >
              <Globe className="h-3.5 w-3.5 text-emerald-500 animate-spin" />
              <span>{t.activeLanguage}</span>
            </button>

            {/* ITEM 2: Shortages Dropdown Trigger and bubble counter alerting */}
            <div className="relative">
              <button
                onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 cursor-pointer hover:bg-slate-50 relative"
              >
                <AlertTriangle className={`h-4.5 w-4.5 ${alertShortagesList.length > 0 ? 'text-amber-500 animate-pulse' : ''}`} />
                {alertShortagesList.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white font-mono text-[8px] rounded-full flex items-center justify-center font-bold">
                    {alertShortagesList.length}
                  </span>
                )}
              </button>

              {/* Dynamic list alert box dropdown */}
              <AnimatePresence>
                {showNotificationDropdown && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowNotificationDropdown(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className={`absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 shadow-xl z-50 text-xs ${
                        isRtl ? 'left-0 right-auto' : ''
                      }`}
                    >
                      <h4 className="font-bold border-b pb-2 mb-2 flex items-center gap-1.5 text-slate-800 dark:text-slate-100">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        {t.notifications}
                      </h4>

                      <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                        {alertShortagesList.length === 0 ? (
                          <p className="text-slate-400 italic py-4 text-center">
                            {t.noUnreadAlerts}
                          </p>
                        ) : (
                          alertShortagesList.slice(0, 5).map(p => (
                            <div
                              key={p.id}
                              onClick={() => {
                                setActiveView('shortages');
                                setShowNotificationDropdown(false);
                              }}
                              className="p-2 border border-slate-50 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-950 cursor-pointer flex justify-between items-start gap-1"
                            >
                              <div>
                                <span className="font-mono text-[8px] font-bold text-slate-400 block p-0">
                                  {p.code}
                                </span>
                                <span className="font-sans text-slate-705 dark:text-slate-205">
                                  {lang === 'en' ? p.nameEn : p.nameAr}
                                </span>
                              </div>
                              <span className="text-[9px] font-bold text-red-500 shrink-0 uppercase">
                                {p.quantity === 0 ? ' depleted' : ' low'}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* ITEM 3: Active Simulator Profile */}
            <button
              onClick={() => setActiveView('users_permissions')}
              className="px-3 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-50/10 hover:bg-emerald-50/20 text-emerald-800 dark:text-emerald-400 text-[10px] font-bold flex items-center gap-1 text-xs select-none cursor-pointer leading-tight uppercase font-sans shrink-0 border border-emerald-500"
            >
              <UserCheck className="h-3.5 w-3.5" />
              <span>{activeEmail.substr(0, 5)}</span>
            </button>
          </div>
        </header>

        {/* MOBILE BOTTOM NAVIGATION BAR */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 p-2.5 z-40 flex justify-around select-none">
          <button
            onClick={() => setActiveView('dashboard')}
            className={`flex flex-col items-center gap-1 text-[10px] ${
              activeView === 'dashboard' ? 'text-emerald-500' : 'text-slate-400'
            }`}
          >
            <LayoutDashboard className="h-5 w-5" />
            <span>Dash</span>
          </button>
          <button
            onClick={() => setActiveView('current_inventory')}
            className={`flex flex-col items-center gap-1 text-[10px] ${
              activeView === 'current_inventory' ? 'text-emerald-500' : 'text-slate-400'
            }`}
          >
            <Grid className="h-5 w-5" />
            <span>Matrix</span>
          </button>
          <button
            onClick={() => setActiveView('products')}
            className={`flex flex-col items-center gap-1 text-[10px] ${
              activeView === 'products' ? 'text-emerald-500' : 'text-slate-400'
            }`}
          >
            <Package className="h-5 w-5" />
            <span>SKUs</span>
          </button>
          <button
            onClick={() => setActiveView('stock_in')}
            className={`flex flex-col items-center gap-1 text-[10px] ${
              activeView === 'stock_in' ? 'text-emerald-500' : 'text-slate-400'
            }`}
          >
            <ArrowDownLeft className="h-5 w-5" />
            <span>In</span>
          </button>
          <button
            onClick={() => setActiveView('stock_out')}
            className={`flex flex-col items-center gap-1 text-[10px] ${
              activeView === 'stock_out' ? 'text-emerald-500' : 'text-slate-400'
            }`}
          >
            <ArrowUpRight className="h-5 w-5" />
            <span>Out</span>
          </button>
        </div>

        {/* 3. CORE ROUTE VIEWS DISPATCHER WALL */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto pb-20 md:pb-6">
          <div className="mx-auto max-w-7xl">
            {activeView === 'dashboard' && (
              <DashboardView
                products={products}
                transactions={transactions}
                categories={categories}
                activityLogs={activityLogs}
                lang={lang}
                t={t}
                onNavigate={setActiveView}
              />
            )}

            {activeView === 'current_inventory' && (
              <CurrentInventoryView
                products={products}
                categories={categories}
                userRole={activeRole}
                userEmail={activeEmail}
                onUpdateProducts={handleUpdateProduct}
                onBulkUpdate={handleBulkUpdate}
                lang={lang}
                t={t}
              />
            )}

            {activeView === 'products' && (
              <ProductsView
                products={products}
                categories={categories}
                userRole={activeRole}
                userEmail={activeEmail}
                onAddProduct={handleAddProduct}
                onUpdateProduct={handleUpdateProduct}
                onDeleteProduct={handleDeleteProduct}
                lang={lang}
                t={t}
              />
            )}

            {activeView === 'categories' && (
              <CategoriesView
                categories={categories}
                userRole={activeRole}
                onAddCategory={handleAddCategory}
                onUpdateCategory={handleUpdateCategory}
                onDeleteCategory={handleDeleteCategory}
                lang={lang}
                t={t}
              />
            )}

            {activeView === 'stock_in' && (
              <StockMovementView
                products={products}
                transactions={transactions}
                userRole={activeRole}
                userEmail={activeEmail}
                onAddTransaction={handleAddTransaction}
                lang={lang}
                t={t}
                defaultType="in"
              />
            )}

            {activeView === 'stock_out' && (
              <StockMovementView
                products={products}
                transactions={transactions}
                userRole={activeRole}
                userEmail={activeEmail}
                onAddTransaction={handleAddTransaction}
                lang={lang}
                t={t}
                defaultType="out"
              />
            )}

            {activeView === 'shortages' && (
              <ShortagesView
                products={products}
                categories={categories}
                lang={lang}
                t={t}
                onNavigate={setActiveView}
              />
            )}

            {activeView === 'reports' && (
              <ReportsView
                products={products}
                transactions={transactions}
                categories={categories}
                lang={lang}
                t={t}
              />
            )}

            {activeView === 'excel_import' && (
              <ExcelIntegrationView
                categories={categories}
                userRole={activeRole}
                userEmail={activeEmail}
                onBulkUpdate={handleBulkUpdate}
                lang={lang}
                t={t}
              />
            )}

            {activeView === 'users_permissions' && (
              <UsersPermissionsView
                userRole={activeRole}
                userEmail={activeEmail}
                onSwitchRole={handleSwitchSimulatorUser}
                lang={lang}
                t={t}
              />
            )}

            {activeView === 'activity_logs' && (
              <ActivityLogsView
                activityLogs={activityLogs}
                lang={lang}
                t={t}
              />
            )}

            {activeView === 'settings' && (
              <SettingsView
                settings={sysSettings}
                userRole={activeRole}
                onUpdateSettings={setSysSettings}
                onBackupDatabase={handleBackupDatabase}
                onRestoreDatabase={handleRestoreDatabase}
                lang={lang}
                t={t}
              />
            )}
          </div>
        </main>

      </div>
    </div>
  );
}
