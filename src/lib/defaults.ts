import { Category, Product, StockTransaction, ActivityLog } from '../types';

export const initialCategories: Category[] = [
  { id: 'hdpe', nameEn: 'Heavy Plastic (Hard)', nameAr: 'بلاستيك ناشف (قاسي / عالي الكثافة)' },
  { id: 'ldpe', nameEn: 'Light Plastic (Flexible)', nameAr: 'بلاستيك خفيف (مرن / منخفض الكثافة)' },
  { id: 'pp', nameEn: 'Medium Plastic (PP)', nameAr: 'بلاستيك وسط (بروبيلين)' },
  { id: 'pet', nameEn: 'Crushed Bottle Flakes', nameAr: 'كسر زجاجات بلاستيك (مخرز)' },
  { id: 'masterbatch', nameEn: 'Colors (Masterbatch)', nameAr: 'ألوان وبودرة خلط (ماستر باتش)' },
  { id: 'filler', nameEn: 'White Powder Additives', nameAr: 'بودرة بيضاء مالئة (شيكارة كربونات)' }
];

export const initialProducts: Product[] = [
  {
    id: 'prod-hdpe-blue',
    code: 'HDPE-BLU-01',
    nameEn: 'Hard Plastic - Blue Color',
    nameAr: 'بلاستيك ناشف - لون أزرق فرز أول',
    category: 'hdpe',
    unit: 'tons',
    quantity: 45,
    minStock: 10,
    notes: 'خامات زرقاء مخصصة لإنتاج الجرادل والخزانات والعبوات الثقيلة.',
    updatedAt: Date.now() - 86400000 * 2,
    updatedBy: 'm.zeiny@ecoplast.com'
  },
  {
    id: 'prod-ldpe-rec',
    code: 'LDPE-REC-02',
    nameEn: 'Flexible Plastic - Clear Transparent',
    nameAr: 'بلاستيك خفيف مرن - شفاف نظيف معاد تدويره',
    category: 'ldpe',
    unit: 'tons',
    quantity: 8,
    minStock: 15,
    notes: 'بلاستيك ناعم من بواقي الشاش والخرطوم ومناسب لإنتاج الشنط وأكياس اللف.',
    updatedAt: Date.now() - 86400000,
    updatedBy: 'warehouse-staff@ecoplast.com'
  },
  {
    id: 'prod-pp-inj',
    code: 'PP-INJ-042',
    nameEn: 'Medium Material - Injection Grade',
    nameAr: 'بلاستيك وسط - خامة حقن ماكينات (مالبين)',
    category: 'pp',
    unit: 'tons',
    quantity: 112,
    minStock: 25,
    notes: 'بولي بروبيلين وسط مخصص لإنتاج الكراسي البلاستيك والأطباق والأقفاص.',
    updatedAt: Date.now() - 3600000 * 4,
    updatedBy: 'admin@ecoplast.com'
  },
  {
    id: 'prod-pet-clear',
    code: 'PET-FLK-001',
    nameEn: 'Clean Crushed Bottle Flakes (Water Bottles)',
    nameAr: 'كسر زجاجات مياه معدنية - شفاف مغسول ونظيف',
    category: 'pet',
    unit: 'kg',
    quantity: 15050,
    minStock: 5000,
    notes: 'رقائق زجاجات مياه معدنية مغسولة ومجهزة بدون شوائب.',
    updatedAt: Date.now() - 3600000 * 2,
    updatedBy: 'warehouse-staff@ecoplast.com'
  },
  {
    id: 'prod-mb-green',
    code: 'MB-GRN-120',
    nameEn: 'Concentrated Color - Green Powder',
    nameAr: 'ألوان مركزة - أكياس بودرة خضراء دبل',
    category: 'masterbatch',
    unit: 'kg',
    quantity: 0,
    minStock: 1000,
    notes: 'صبغة تلوين خضراء مركزة لخلطها مع بواتق البلاستيك قبل الإنتاج.',
    updatedAt: Date.now() - 86400000 * 5,
    updatedBy: 'admin@ecoplast.com'
  },
  {
    id: 'prod-fill-ca',
    code: 'FILL-CA-200',
    nameEn: 'White Powder Sub-Bag (Calcium Carbonate)',
    nameAr: 'شيكارة بودرة بيضاء ناعمة (كربونات كالسيوم)',
    category: 'filler',
    unit: 'tons',
    quantity: 75,
    minStock: 20,
    notes: 'بودرة بيضاء مالئة تستخدم لخلط الزيادة وتوفير خامات البلاستيك في المسبك.',
    updatedAt: Date.now() - 86400000 * 3,
    updatedBy: 'm.zeiny@ecoplast.com'
  }
];

export const initialTransactions: StockTransaction[] = [
  {
    id: 'tx-1',
    productId: 'prod-pp-inj',
    productCode: 'PP-INJ-042',
    productNameEn: 'Medium Material - Injection Grade',
    productNameAr: 'بلاستيك وسط - خامة حقن ماكينات (مالبين)',
    type: 'in',
    quantity: 50,
    previousQuantity: 62,
    newQuantity: 112,
    refNo: 'PO-2026-0810',
    supplierOrReceiver: 'شركة سابك للبتروكيماويات',
    notes: 'دخل المستودع شحنة بضاعة كبيرة لإعادة ملء مخزون إيكو بلاست الرئيسي.',
    timestamp: Date.now() - 86400000 * 2,
    user: 'mostafa.elzeiny11@gmail.com',
    userRole: 'admin'
  },
  {
    id: 'tx-2',
    productId: 'prod-ldpe-rec',
    productCode: 'LDPE-REC-02',
    productNameEn: 'Flexible Plastic - Clear Transparent',
    productNameAr: 'بلاستيك خفيف مرن - شفاف نظيف معاد تدويره',
    type: 'out',
    quantity: 12,
    previousQuantity: 20,
    newQuantity: 8,
    refNo: 'SO-2026-1049',
    supplierOrReceiver: 'مصنع الهدى للبلاستيك',
    notes: 'صرفت شحنة بلاستيك ناعم لتصنيع رول بلاستيك للمزارع.',
    timestamp: Date.now() - 86400000,
    user: 'warehouse-staff@ecoplast.com',
    userRole: 'staff'
  },
  {
    id: 'tx-3',
    productId: 'prod-mb-green',
    productCode: 'MB-GRN-120',
    productNameEn: 'Concentrated Color - Green Powder',
    productNameAr: 'ألوان مركزة - أكياس بودرة خضراء دبل',
    type: 'out',
    quantity: 1500,
    previousQuantity: 1500,
    newQuantity: 0,
    refNo: 'SO-2026-1052',
    supplierOrReceiver: 'دلتا لتصنيع الشنط والأكياس',
    notes: 'اتصرف بالكامل للعميل. الكمية صفر حالياً للمادة دي ومحتاجين نطلب بسرعة.',
    timestamp: Date.now() - 3600000 * 12,
    user: 'admin@ecoplast.com',
    userRole: 'admin'
  },
  {
    id: 'tx-4',
    productId: 'prod-pet-clear',
    productCode: 'PET-FLK-001',
    productNameEn: 'Clean Crushed Bottle Flakes (Water Bottles)',
    productNameAr: 'كسر زجاجات مياه معدنية - شفاف مغسول ونظيف',
    type: 'adjustment',
    quantity: -200,
    previousQuantity: 15250,
    newQuantity: 15050,
    refNo: 'ADJ-2026-003',
    supplierOrReceiver: 'جرد وتصفية داخلية',
    notes: 'تعديل كمية النقص بسبب تبخر الرطوبة من البلاستيك أثناء تهوية الشكاير.',
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
    detailsAr: 'تم تجهيز وتعبئة بيانات مخزن إيكو بلاست بنجاح لبدء العمل المباشر.',
    timestamp: Date.now(),
    user: 'system',
    userRole: 'admin'
  },
  {
    id: 'log-2',
    action: 'import_setup',
    detailsEn: 'Excel-compatible templates verified and structures configured.',
    detailsAr: 'تم تأكيد قوالب جداول الإكسل لتشتغل بسهولة بالمستودع.',
    timestamp: Date.now() - 100000,
    user: 'admin@ecoplast.com',
    userRole: 'admin'
  }
];
