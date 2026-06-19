/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'admin' | 'staff' | 'read';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Product {
  id: string;
  code: string;
  nameEn: string;
  nameAr: string;
  category: string; // category document ID or string
  unit: string; // pcs, kg, tons, box, etc.
  quantity: number;
  minStock: number;
  notes: string;
  updatedAt: number; // millisecond timestamp
  updatedBy: string; // email of operator who adjusted
  className?: string;
}

export interface StockTransaction {
  id: string;
  productId: string;
  productCode: string;
  productNameEn: string;
  productNameAr: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  refNo?: string; // PO number or invoice ID
  supplierOrReceiver?: string; // Al-Noor Trading, Customer X
  notes?: string;
  timestamp: number;
  user: string;
  userRole: UserRole;
}

export interface Category {
  id: string;
  nameEn: string;
  nameAr: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  detailsEn: string;
  detailsAr: string;
  timestamp: number;
  user: string;
  userRole: UserRole;
}

export interface SystemSettings {
  lang: 'en' | 'ar';
  theme: 'light' | 'dark';
  companyNameEn: string;
  companyNameAr: string;
  lowStockAlertThreshold: number;
}
