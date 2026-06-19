/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { History, Search, Activity, ShieldCheck, User } from 'lucide-react';
import { ActivityLog } from '../types';

interface ActivityLogsViewProps {
  activityLogs: ActivityLog[];
  lang: 'en' | 'ar';
  t: any;
}

export default function ActivityLogsView({ activityLogs, lang, t }: ActivityLogsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const isRtl = lang === 'ar';

  const filteredLogs = useMemo(() => {
    return activityLogs
      .filter(
        log =>
          searchTerm === '' ||
          log.detailsEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.detailsAr.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.action.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [activityLogs, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800/80 shadow-xs">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <h1 className="text-xl md:text-2xl font-bold font-sans tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <History className="text-emerald-500 h-6 w-6 animate-pulse" />
              {t.menuActivityLogs}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-light">
              {lang === 'en'
                ? 'Chronological system audit logs detailing product registrations, manual bulk updates, database backups and warehouse actions.'
                : 'السجل الزمني لمراقبة عمليات مستودع إيكو بلاست بما فيها عمليات الشطب، النقل المخزني والنسخ الاحتياطي.'}
            </p>
          </div>
        </div>
      </div>

      {/* Filter and listings */}
      <div className="space-y-4">
        {/* Filter bar */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 shadow-2xs">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder={lang === 'en' ? 'Search logs by email, detail descriptions...' : 'ابحث بالسجلات برمز العملية، عنوان البريد الفني...'}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border rounded-lg text-xs border-slate-200 dark:border-slate-750 bg-slate-50/50 dark:bg-slate-950/30 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-sans"
            />
          </div>
        </div>

        {/* Unified lists */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-xs overflow-hidden">
          <div className="divide-y divide-slate-105 dark:divide-slate-800 max-h-[500px] overflow-y-auto">
            {filteredLogs.length === 0 ? (
              <div className="py-16 text-center text-slate-400 italic">
                {lang === 'en' ? 'No audit records discovered.' : 'لا يوجد سجلات تدقيق متناسقة مع الكلمات المدخلة.'}
              </div>
            ) : (
              filteredLogs.map(log => {
                const dateLabel = new Date(log.timestamp).toLocaleDateString(
                  lang === 'en' ? 'en-US' : 'ar-EG',
                  {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    second: '2-digit'
                  }
                );

                return (
                  <div key={log.id} className="p-4 flex gap-3 hover:bg-slate-50/30 transition-colors">
                    <div className="pt-0.5">
                      <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950/40 text-slate-500">
                        <Activity className="h-4 w-4" />
                      </div>
                    </div>

                    <div className="flex-1 space-y-1 text-xs">
                      <div className="flex flex-wrap justify-between items-center gap-2">
                        <span className="font-mono text-[10px] uppercase tracking-wider font-bold text-slate-400 bg-slate-50 dark:bg-slate-950/50 px-2 py-0.5 rounded border border-slate-100 dark:border-slate-800">
                          {log.action}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400">
                          {dateLabel}
                        </span>
                      </div>

                      <p className="text-slate-750 dark:text-slate-200 mt-1 leading-relaxed">
                        {lang === 'en' ? log.detailsEn : log.detailsAr}
                      </p>

                      <div className="flex items-center gap-4 text-[10px] text-slate-400 font-mono mt-2 pt-1">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          @{log.user}
                        </span>
                        <span className="flex items-center gap-1.5 leading-none">
                          <ShieldCheck className="h-3 w-3 text-emerald-500" />
                          {log.userRole.toUpperCase()} privilege
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
