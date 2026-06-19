/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Settings,
  Moon,
  Sun,
  Database,
  Download,
  Upload,
  Webhook,
  Server,
  Code,
  ShieldCheck,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { SystemSettings, UserRole } from '../types';

interface SettingsViewProps {
  settings: SystemSettings;
  userRole: UserRole;
  onUpdateSettings: (newSettings: SystemSettings) => void;
  onBackupDatabase: () => void;
  onRestoreDatabase: (backupData: any) => Promise<boolean>;
  lang: 'en' | 'ar';
  t: any;
}

export default function SettingsView({
  settings,
  userRole,
  onUpdateSettings,
  onBackupDatabase,
  onRestoreDatabase,
  lang,
  t
}: SettingsViewProps) {
  
  const [theme, setTheme] = useState<'light' | 'dark'>(settings.theme || 'light');
  
  // Simulated API setup for ERP integration
  const [webhookUrl, setWebhookUrl] = useState('https://erp.ecoplasgy.com/v1/webhook');
  const [apiKeyGenerated, setApiKeyGenerated] = useState('');
  const [showIntegrationSuccess, setShowIntegrationSuccess] = useState(false);
  
  // Restore file picker states
  const [restoreFeedback, setRestoreFeedback] = useState<{ status: 'success' | 'error' | null; msg: string }>({ status: null, msg: '' });

  const isRtl = lang === 'ar';
  const isAdmin = userRole === 'admin';

  // Toggle Theme
  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    onUpdateSettings({
      ...settings,
      theme: newTheme
    });
  };

  // Generate Simulation API credentials for integrations
  const handleGenerateApiKey = () => {
    const key = `eco_live_tok_${Math.random().toString(36).substr(2, 16)}`;
    setApiKeyGenerated(key);
    setShowIntegrationSuccess(true);
    setTimeout(() => setShowIntegrationSuccess(false), 5000);
  };

  // Handle local restoration file picker on load
  const handleRestoreFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRestoreFeedback({ status: null, msg: '' });
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isAdmin) {
      setRestoreFeedback({
        status: 'error',
        msg: t.unauthorized
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (!json.products || !json.transactions || !json.categories) {
          throw new Error('Incompatible snapshot: missing core collections.');
        }

        const ok = await onRestoreDatabase(json);
        if (ok) {
          setRestoreFeedback({
            status: 'success',
            msg: lang === 'en'
              ? 'Database Snapshot restored successfully! All tables updated.'
              : 'تم استرجاع النسخة الاحتياطية بنجاح! تم تحديث جميع جداول المستودع.'
          });
        } else {
          throw new Error('Database transaction aborted.');
        }
      } catch (err: any) {
        setRestoreFeedback({
          status: 'error',
          msg: lang === 'en'
            ? `Restoration failed: ${err.message}`
            : `فشل استرجاع النسخة: ${err.message}`
        });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800/80 shadow-xs">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <h1 className="text-xl md:text-2xl font-bold font-sans tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Settings className="text-emerald-500 h-6 w-6" />
              {t.menuSettings}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-light">
              {lang === 'en'
                ? 'Manage active system modules, layout themes, database recovery snapshots and external API connections.'
                : 'برمجة إعدادات الأمان والمظهر، أخذ لقطات نسخ قواعد البيانات ومزامنة حزم إكسل.'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* PANEL 1: Theme and Backup management */}
        <div className="space-y-6">
          {/* Theme Setup */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800/80 shadow shadow-xs space-y-4">
            <h3 className="font-sans font-bold text-slate-850 dark:text-slate-150 text-sm flex items-center gap-2">
              <Sun className="h-4 w-4 text-amber-500" />
              {t.themeToggle}
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleThemeChange('light')}
                className={`py-3 px-4 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  theme === 'light'
                    ? 'border-emerald-600 dark:border-emerald-500 bg-emerald-50/20 text-emerald-800 dark:text-emerald-400 font-bold'
                    : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50 text-slate-500'
                }`}
              >
                <Sun className="h-4 w-4" />
                {t.lightMode}
              </button>
              <button
                onClick={() => handleThemeChange('dark')}
                className={`py-3 px-4 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  theme === 'dark'
                    ? 'border-emerald-600 dark:border-emerald-500 bg-emerald-50/20 text-emerald-800 dark:text-emerald-400 font-bold'
                    : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50 text-slate-500'
                }`}
              >
                <Moon className="h-4 w-4 text-emerald-505" />
                {t.darkMode}
              </button>
            </div>
          </div>

          {/* Backup Restre Suite (Fully Functional!) */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800/80 shadow shadow-xs space-y-4">
            <h3 className="font-sans font-bold text-slate-850 dark:text-slate-150 text-sm flex items-center gap-2">
              <Database className="h-4 w-4 text-blue-500" />
              {t.backupName}
            </h3>

            <p className="text-[11px] text-slate-450 dark:text-slate-400 leading-relaxed">
              {t.backupDesc}
            </p>

            <div className="space-y-3 Pt-2">
              {/* Backup triggers */}
              <button
                onClick={onBackupDatabase}
                className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer select-none transition-colors"
              >
                <Download className="h-4 w-4 text-emerald-400" />
                {t.downloadBackup}
              </button>

              {/* Restore trigger block */}
              <div className="relative">
                <input
                  type="file"
                  id="restore-file"
                  accept=".json"
                  onChange={handleRestoreFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="restore-file"
                  className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-850 dark:bg-rose-950/20 dark:text-rose-400 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer select-none border border-rose-100 dark:border-rose-900/50 transition-colors"
                >
                  <Upload className="h-4 w-4" />
                  {t.restoreBackup}
                </label>
              </div>

              {/* Restore Alerts notification */}
              {restoreFeedback.status === 'success' && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/35 border border-emerald-150 text-emerald-800 dark:text-emerald-400 font-semibold rounded-xl text-[11px] flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500 animate-pulse" />
                  {restoreFeedback.msg}
                </div>
              )}

              {restoreFeedback.status === 'error' && (
                <div className="p-3 bg-red-50 dark:bg-red-950/35 border border-red-150 text-red-800 dark:text-red-400 font-semibold rounded-xl text-[11px] flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  {restoreFeedback.msg}
                </div>
              )}

              <p className="text-[10px] text-slate-400 italic leading-relaxed text-center">
                {t.restoreDisclaimer}
              </p>
            </div>
          </div>
        </div>

        {/* PANEL 2: ERP Integration & System Expansion */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800/80 shadow shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-sans font-bold text-slate-850 dark:text-slate-150 text-sm flex items-center gap-2">
              <Webhook className="h-4 w-4 text-sky-500 animate-spin" />
              {lang === 'en' ? 'ERP System & Hook Integrations' : 'الربط البرمجي مع أنظمة تخطيط الموارد ERP'}
            </h3>

            <p className="text-xs text-slate-450 dark:text-slate-400 leading-relaxed">
              {lang === 'en'
                ? 'Configure live automated webhooks to relay every Stock In, Stock Out, or shortage alert directly to your external enterprise ERP systems (Odoo, SAP, Microsoft Dynamics 365).'
                : 'قم بإعداد روابط تلقائية فورية لإرسال إيرادات وصادرات المستودع ومستويات النقص الحرجة لربطها فورياً مع نظام الإنتاج والتشغيل في إيكو بلاست.'}
            </p>

            <div className="space-y-3.5 pt-3">
              {/* Webhook setup */}
              <div className="space-y-1 text-xs">
                <label className="font-semibold text-slate-500">Live Endpoint URL</label>
                <input
                  type="text"
                  value={webhookUrl}
                  onChange={e => setWebhookUrl(e.target.value)}
                  className="w-full px-3 py-1.5 border rounded-lg border-slate-200 dark:border-slate-755 bg-slate-50/50 dark:bg-slate-950/20 text-slate-700 dark:text-slate-350 font-mono"
                />
              </div>

              {/* Developer credentials */}
              {apiKeyGenerated && (
                <div className="space-y-1.5 pt-1 text-xs">
                  <label className="font-semibold text-slate-500 flex items-center gap-1">
                    <Code className="h-3.5 w-3.5 text-slate-400" />
                    WMS Access Token (OAuth proxy equivalent)
                  </label>
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-950/60 rounded-xl font-mono text-[10px] text-amber-650 tracking-tight select-all border border-slate-100 dark:border-slate-800 break-all">
                    {apiKeyGenerated}
                  </div>
                </div>
              )}

              {showIntegrationSuccess && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-150 text-emerald-800 dark:text-emerald-450 font-semibold text-[11px] rounded-xl flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  {lang === 'en' ? 'Hook synced successfully!' : 'تم تأكيد مفاتيح الربط البرمجي!'}
                </div>
              )}
            </div>
          </div>

          <div className="pt-6">
            <button
              onClick={handleGenerateApiKey}
              className="w-full py-2 bg-slate-800 hover:bg-slate-950 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
            >
              <Server className="h-4 w-4" />
              {lang === 'en' ? 'Authorize external Webhook sync' : 'إنشاء وتفعيل مزامنة مفاتيح الويب'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
