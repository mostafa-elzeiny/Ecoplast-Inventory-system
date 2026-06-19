import { Category, Product, StockTransaction, ActivityLog } from '../types';

export const initialCategories: Category[] = [
  { id: 'hdpe', nameEn: 'HDPE Raw Granules', nameAr: 'حبيبات البولي إيثيلين عالي الكثافة' },
  { id: 'ldpe', nameEn: 'LDPE Recycled material', nameAr: 'بولي إيثيلين منخفض الكثافة معاد تدويره' },
  { id: 'pp', nameEn: 'Polypropylene (PP)', nameAr: 'بولي بروبيلين' },
  { id: 'pet', nameEn: 'PET Plastic Flakes', nameAr: 'رقائق بلاستيك PET' },
  { id: 'masterbatch', nameEn: 'Color Masterbatches', nameAr: 'ماستر باتش الألوان' },
  { id: 'filler', nameEn: 'Chemical Fillers', nameAr: 'المواد المالئة الكيميائية' }
];

export const initialProducts: Product[] = [
  {
    id: 'prod-hdpe-blue',
    code: 'HDPE-BLU-01',
    nameEn: 'Elite High-Density Polyethylene - Premium Blue',
    nameAr: 'بولي إيثيلين عالي الكثافة - أزرق ممتاز',
    category: 'hdpe',
    unit: 'tons',
    quantity: 45,
    minStock: 10,
    notes: 'Imported high-purity granules optimized for blowing and molding.',
    updatedAt: Date.now() - 86400000 * 2,
    updatedBy: 'm.zeiny@ecoplast.com'
  },
  {
    id: 'prod-ldpe-rec',
    code: 'LDPE-REC-02',
    nameEn: 'Eco-Grade LDPE Transparent Reprocessed',
    nameAr: 'بولي إيثيلين منخفض الكثافة شفاف معاد تدويره',
    category: 'ldpe',
    unit: 'tons',
    quantity: 8,
    minStock: 15,
    notes: 'Sourced from agricultural film waste recycling. High clarity and flexibility.',
    updatedAt: Date.now() - 86400000,
    updatedBy: 'warehouse-staff@ecoplast.com'
  },
  {
    id: 'prod-pp-inj',
    code: 'PP-INJ-042',
    nameEn: 'Moplen Polypropylene Homopolymer (Injection Grade)',
    nameAr: 'بولي بروبيلين متجانس - درجة حقن مالبين',
    category: 'pp',
    unit: 'tons',
    quantity: 112,
    minStock: 25,
    notes: 'For industrial products and crates. Excelled impact resistance.',
    updatedAt: Date.now() - 3600000 * 4,
    updatedBy: 'admin@ecoplast.com'
  },
  {
    id: 'prod-pet-clear',
    code: 'PET-FLK-001',
    nameEn: 'Hot Washed Transparent PET Bottle Flakes',
    nameAr: 'رقائق زجاجات PET شفافة ومغسولة بالكهرباء الساخنة',
    category: 'pet',
    unit: 'kg',
    quantity: 15000,
    minStock: 5000,
    notes: 'Premium flakes with PVC impurity under 50ppm. Sourced locally.',
    updatedAt: Date.now() - 3600000 * 2,
    updatedBy: 'warehouse-staff@ecoplast.com'
  },
  {
    id: 'prod-mb-green',
    code: 'MB-GRN-120',
    nameEn: 'Biodegradable Green Masterbatch additive',
    nameAr: 'ماستر باتش مضاف أخضر قابل للتحلل',
    category: 'masterbatch',
    unit: 'kg',
    quantity: 0,
    minStock: 1000,
    notes: 'Highly demanded green colorant with UV stabilization agents.',
    updatedAt: Date.now() - 86400000 * 5,
    updatedBy: 'admin@ecoplast.com'
  },
  {
    id: 'prod-fill-ca',
    code: 'FILL-CA-200',
    nameEn: 'Ultra-Fine Calcium Carbonate CaCO3 Filler Powder',
    nameAr: 'مسحوق كربونات الكالسيوم فائق النعومة',
    category: 'filler',
    unit: 'tons',
    quantity: 75,
    minStock: 20,
    notes: 'Coated with stearic acid for polymers compound integration.',
    updatedAt: Date.now() - 86400000 * 3,
    updatedBy: 'm.zeiny@ecoplast.com'
  }
];

export const initialTransactions: StockTransaction[] = [
  {
    id: 'tx-1',
    productId: 'prod-pp-inj',
    productCode: 'PP-INJ-042',
    productNameEn: 'Moplen Polypropylene Homopolymer (Injection Grade)',
    productNameAr: 'بولي بروبيلين متجانس - درجة حقن مالبين',
    type: 'in',
    quantity: 50,
    previousQuantity: 62,
    newQuantity: 112,
    refNo: 'PO-2026-0810',
    supplierOrReceiver: 'SABIC Petrochemicals Co.',
    notes: 'Eco Plast major restock. Certificate of analysis attached.',
    timestamp: Date.now() - 86400000 * 2,
    user: 'mostafa.elzeiny11@gmail.com',
    userRole: 'admin'
  },
  {
    id: 'tx-2',
    productId: 'prod-ldpe-rec',
    productCode: 'LDPE-REC-02',
    productNameEn: 'Eco-Grade LDPE Transparent Reprocessed',
    productNameAr: 'بولي إيثيلين منخفض الكثافة شفاف معاد تدويره',
    type: 'out',
    quantity: 12,
    previousQuantity: 20,
    newQuantity: 8,
    refNo: 'SO-2026-1049',
    supplierOrReceiver: 'El-Hoda Plastic Factory',
    notes: 'Dispatched for agricultural film manufacturing run.',
    timestamp: Date.now() - 86400000,
    user: 'warehouse-staff@ecoplast.com',
    userRole: 'staff'
  },
  {
    id: 'tx-3',
    productId: 'prod-mb-green',
    productCode: 'MB-GRN-120',
    productNameEn: 'Biodegradable Green Masterbatch additive',
    productNameAr: 'ماستر باتش مضاف أخضر قابل للتحلل',
    type: 'out',
    quantity: 1500,
    previousQuantity: 1500,
    newQuantity: 0,
    refNo: 'SO-2026-1052',
    supplierOrReceiver: 'Delta Bags Manufacturing',
    notes: 'Fully shipped. Stocks need critical attention.',
    timestamp: Date.now() - 3600000 * 12,
    user: 'admin@ecoplast.com',
    userRole: 'admin'
  },
  {
    id: 'tx-4',
    productId: 'prod-pet-clear',
    productCode: 'PET-FLK-001',
    productNameEn: 'Hot Washed Transparent PET Bottle Flakes',
    productNameAr: 'رقائق زجاجات PET شفافة ومغسولة بالكهرباء الساخنة',
    type: 'adjustment',
    quantity: -200,
    previousQuantity: 15200,
    newQuantity: 15000,
    refNo: 'ADJ-2026-003',
    supplierOrReceiver: 'Internal Audit',
    notes: 'Audit adjustment due to humidity shrinkage factor.',
    timestamp: Date.now() - 3600000 * 2,
    user: 'warehouse-staff@ecoplast.com',
    userRole: 'staff'
  }
];

export const initialLogs: ActivityLog[] = [
  {
    id: 'log-1',
    action: 'database_initiated',
    detailsEn: 'Eco Plast Inventory Management default database seeded successfully.',
    detailsAr: 'تم تعبئة قاعدة بيانات إدارة مخزون إيكو بلاست بنجاح.',
    timestamp: Date.now(),
    user: 'system',
    userRole: 'admin'
  },
  {
    id: 'log-2',
    action: 'import_setup',
    detailsEn: 'Excel-compatible templates verified and structures configured.',
    detailsAr: 'تأكيد قوالب إكسل المتوافقة وتكوين البنية.',
    timestamp: Date.now() - 100000,
    user: 'admin@ecoplast.com',
    userRole: 'admin'
  }
];
