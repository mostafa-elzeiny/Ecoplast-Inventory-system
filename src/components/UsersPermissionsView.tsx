/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Shield, ShieldAlert, ShieldCheck, Lock, User, Check, AlertOctagon } from 'lucide-react';
import { UserRole } from '../types';

interface UsersPermissionsViewProps {
  userRole: UserRole;
  userEmail: string;
  onSwitchRole: (role: UserRole, email: string) => void;
  lang: 'en' | 'ar';
  t: any;
}

export default function UsersPermissionsView({
  userRole,
  userEmail,
  onSwitchRole,
  lang,
  t
}: UsersPermissionsViewProps) {
  
  const isRtl = lang === 'ar';

  const accounts = [
    {
      name: lang === 'en' ? 'Mostafa Elzeiny' : 'مصطفى الزيني',
      email: 'mostafa.elzeiny11@gmail.com',
      role: 'admin' as UserRole,
      desc: t.allPrivileges
    },
    {
      name: lang === 'en' ? 'Warehouse Operator' : 'عامل المستودع الفني',
      email: 'warehouse-staff@ecoplast.com',
      role: 'staff' as UserRole,
      desc: t.staffPrivileges
    },
    {
      name: lang === 'en' ? 'Supply chain Evaluator' : 'مستعرض خارجي فني',
      email: 'read-only@ecoplast.com',
      role: 'read' as UserRole,
      desc: t.readPrivileges
    }
  ];

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800/80 shadow-xs">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <h1 className="text-xl md:text-2xl font-bold font-sans tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Shield className="text-emerald-500 h-6 w-6" />
              {t.menuUsers}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-light">
              {lang === 'en'
                ? 'Dynamic role simulator. Switch user identities to test permissions blocks and staff controls.'
                : 'محاكي تبديل الصلاحيات الفورية. تنقل بين الهويات الوظيفية لاختبار ضوابط حماية المخزن.'}
            </p>
          </div>
        </div>
      </div>

      {/* Simulator Switch Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {accounts.map(acc => {
          const isActive = userEmail === acc.email;

          return (
            <div
              key={acc.email}
              onClick={() => onSwitchRole(acc.role, acc.email)}
              className={`bg-white dark:bg-slate-900 rounded-3xl p-6 border transition-all duration-300 cursor-pointer flex flex-col justify-between relative overflow-hidden select-none ${
                isActive
                  ? 'border-emerald-600 dark:border-emerald-500 ring-1 ring-emerald-600 shadow-md scale-100'
                  : 'border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs'
              }`}
            >
              {isActive && (
                <div className="absolute top-0 right-0 left-0 h-1.5 bg-emerald-600 dark:bg-emerald-500" />
              )}

              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className={`p-2.5 rounded-xl ${
                    isActive ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600' : 'bg-slate-50 dark:bg-slate-950 text-slate-400'
                  }`}>
                    <User className="h-5 w-5" />
                  </div>

                  {isActive && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 uppercase tracking-wider font-mono gap-1">
                      <Check className="h-3 w-3" />
                      {lang === 'en' ? 'Active simulation' : 'النشط حالياً'}
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <h3 className="font-sans font-bold text-slate-800 dark:text-slate-100 text-sm">
                    {acc.name}
                  </h3>
                  <p className="font-mono text-[10px] text-slate-400 truncate">
                    {acc.email}
                  </p>
                </div>

                <p className="text-slate-400 dark:text-slate-400 text-xs leading-relaxed">
                  {acc.desc}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-50 dark:border-slate-800/50 flex justify-between items-center text-[11px] font-mono font-bold uppercase">
                <span className="text-slate-400">{t.activeRole}:</span>
                <span className={isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}>
                  {acc.role === 'admin' && t.roleAdmin}
                  {acc.role === 'staff' && t.roleStaff}
                  {acc.role === 'read' && t.roleRead}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Permissions Matrix displays */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800/80 shadow-xs space-y-4">
        <h3 className="font-sans font-bold text-slate-850 dark:text-slate-150 text-sm">
          {lang === 'en' ? 'Simulation Permissions Matrix Matrix' : 'جدول الصلاحيات الفعلي والتدقيق'}
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-500 min-w-[500px] border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-950 font-mono text-[10px] font-semibold text-slate-650 uppercase">
              <tr>
                <th className="px-4 py-2">WMS Privilege Action</th>
                <th className="px-4 py-2">Admin User</th>
                <th className="px-4 py-2">Warehouse Staff</th>
                <th className="px-4 py-2">Read-Only Viewer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 leading-relaxed">
              <tr>
                <td className="px-4 py-2 font-medium">Add/Edit Product profiles</td>
                <td className="px-4 py-2 text-emerald-600 font-bold">✓ Allowed</td>
                <td className="px-4 py-2 text-emerald-600 font-bold">✓ Allowed</td>
                <td className="px-4 py-2 text-red-500">❌ Denied</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">Delete Material profiles</td>
                <td className="px-4 py-2 text-emerald-600 font-bold">✓ Allowed</td>
                <td className="px-4 py-2 text-red-500 font-bold">❌ Denied</td>
                <td className="px-4 py-2 text-red-500">❌ Denied</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">Log Stock In and Stock Out ledger items</td>
                <td className="px-4 py-2 text-emerald-600 font-bold">✓ Allowed</td>
                <td className="px-4 py-2 text-emerald-600 font-bold">✓ Allowed</td>
                <td className="px-4 py-2 text-red-500">❌ Denied</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">Direct inline Excel quantity adjustments</td>
                <td className="px-4 py-2 text-emerald-600 font-bold">✓ Allowed</td>
                <td className="px-4 py-2 text-emerald-600 font-bold">✓ Allowed</td>
                <td className="px-4 py-2 text-red-500">❌ Denied</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">Export CSV databases and Excel outputs</td>
                <td className="px-4 py-2 text-emerald-600 font-bold">✓ Allowed</td>
                <td className="px-4 py-2 text-emerald-600 font-bold">✓ Allowed</td>
                <td className="px-4 py-2 text-emerald-600 font-bold">✓ Allowed</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
