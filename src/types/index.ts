// ==========================================
// STORE & ONBOARDING TYPES
// ==========================================

export type StoreType = 'Kirana / General Store' | 'Supermarket' | 'Organic & Gourmet' | 'Fruits & Vegetables' | 'Specialty Foods';

export type ProductCategory = 
  | 'Dairy & Bread'
  | 'Fresh Fruits & Vegetables'
  | 'Snacks & Beverages'
  | 'Staples, Rice & Dals'
  | 'Personal Care'
  | 'Household Essentials'
  | 'Packaged Foods'
  | 'Instant Foods & Noodles'
  | 'Bakery & Sweets';

export interface TimeSlot {
  id: string;
  label: string;
  openTime: string;  // e.g. "08:00 AM"
  closeTime: string; // e.g. "02:00 PM"
  enabled: boolean;
}

export interface StoreDocument {
  id: string;
  type: 'FSSAI' | 'GST' | 'Shop License' | 'PAN' | 'Store Photos';
  title: string;
  docNumber?: string;
  expiryDate?: string;
  fileUri?: string;
  fileName?: string;
  status: 'Uploaded' | 'Missing' | 'Verified' | 'Needs Attention';
  uploadProgress?: number;
  uploadedAt?: string;
}

export type VerificationState = 'Under Review' | 'Needs Changes' | 'Approved' | 'Rejected';

export interface StoreDetails {
  storeId: string;
  storeName: string;
  ownerName: string;
  primaryPhone: string;
  alternatePhone?: string;
  email: string;
  storeType: StoreType;
  selectedCategories: ProductCategory[];
  timeSlots: TimeSlot[];
  avgPackingTimeMinutes: number;
  packingStaffCount: number;
  description: string;
  address: {
    addressLine1: string;
    addressLine2?: string;
    landmark?: string;
    city: string;
    pincode: string;
    latitude: number;
    longitude: number;
  };
  pickupInstructions?: string;
  deliveryRadiusKm: number;
  minOrderValue: number;
  expressDeliveryEnabled: boolean;
  scheduledDeliveryEnabled: boolean;
  slotDurationMinutes: number;
  maxOrdersPerSlot: number;
  commissionTier: 'Starter' | 'Growth' | 'Enterprise';
  bankDetails: {
    accountNumber: string;
    ifscCode: string;
    accountHolderName: string;
    upiId?: string;
    bankName: string;
  };
  verificationStatus: VerificationState;
  rejectionReason?: string;
  isOpen: boolean;
  closedReason?: string;
  reopenTime?: string;
}

// ==========================================
// CATALOG & PRODUCT TYPES
// ==========================================

export type CatalogFilterTab = 'All' | 'Available' | 'Unavailable' | 'Needs Attention' | 'Pending Review';

export interface ProductItem {
  id: string;
  sku: string;
  name: string;
  brand: string;
  category: ProductCategory;
  subcategory?: string;
  packSize: string; // e.g. "500 g", "1 L", "1 kg"
  unit: 'g' | 'kg' | 'ml' | 'L' | 'pc' | 'pack';
  mrp: number;
  sellingPrice: number; // Invariant: sellingPrice <= mrp
  isAvailable: boolean; // Binary availability (NO STOCK QUANTITY)
  soldByWeight: boolean;
  maxPerOrder: number;
  isVeg: boolean;
  isMasterCatalog: boolean;
  reviewStatus: 'Approved' | 'Pending Review' | 'Needs Changes';
  imageUrl: string;
  additionalImages?: string[];
  barcode?: string;
  description?: string;
  aisleLocation?: string; // e.g., "Aisle 2 - Shelf B"
}

// ==========================================
// ORDER TYPES (G11 - G16)
// ==========================================

export type OrderStatus = 
  | 'NEW'
  | 'PICKING'
  | 'READY_FOR_PICKUP'
  | 'COMPLETED'
  | 'CANCELLED';

export type DeliveryMode = 'Express' | 'Scheduled';

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  brand: string;
  packSize: string;
  category: ProductCategory;
  aisle: string;
  imageUrl: string;
  unitPrice: number;
  quantity: number;
  isSoldByWeight: boolean;
  targetWeight?: string;
  actualWeight?: number; // In grams or kg if weighed
  isPicked: boolean;
  isUnavailable: boolean;
  scannedBarcode?: string;
  substitution?: {
    status: 'None' | 'Pending' | 'Approved' | 'Rejected';
    action: 'replace' | 'refund';
    replacementProduct?: ProductItem;
    originalPrice: number;
    newPrice: number;
  };
}

export interface RiderInfo {
  id: string;
  name: string;
  photoUrl: string;
  phone: string;
  vehicleNumber: string;
  etaMinutes: number;
  isArrived: boolean;
  pickupCode: string; // 4-digit code e.g., "4821"
}

export interface Order {
  id: string;        // Full format: "OB-GR-YYMMDD-NNNN" e.g., "OB-GR-260929-0087"
  shortId: string;   // Short format: "#0087"
  status: OrderStatus;
  deliveryMode: DeliveryMode;
  createdAt: string;
  scheduledSlot?: string;
  customerName: string;
  customerPhone: string;
  customerSpecialNotes?: string;
  substitutionPreference: 'Call to confirm' | 'Auto-replace with best match' | 'Do not replace, refund';
  items: OrderItem[];
  subtotal: number;
  taxes: number;
  packingFee: number;
  discount: number;
  totalAmount: number;
  paymentMode: 'Online Paid (UPI/Card)' | 'Pay on Delivery';
  estimatedPackingSeconds: number; // e.g., 600s (10 mins)
  packingTimeRemainingSeconds: number;
  bagCount: number;
  bagQualityChecks: {
    coldItemsSeparated: boolean;
    liquidsSealed: boolean;
    fragileOnTop: boolean;
  };
  rider?: RiderInfo;
  timeline: {
    title: string;
    time: string;
    completed: boolean;
  }[];
  cancelReason?: string;
}

// ==========================================
// EARNINGS & PAYOUT TYPES (G20 - G21)
// ==========================================

export type EarningsPeriod = 'Today' | 'This Week' | 'This Month' | 'Custom Date';

export interface EarningsSummary {
  period: EarningsPeriod;
  grossSales: number;
  totalRefunds: number;
  platformCommission: number;
  commissionPercentage: number;
  netEarnings: number;
  orderCount: number;
  nextPayoutDate: string;
  nextPayoutAmount: number;
}

export interface PayoutTransaction {
  id: string;
  date: string;
  amount: number;
  status: 'Paid' | 'Processing' | 'Failed';
  utrNumber: string;
  bankAccountMasked: string;
  periodDescription: string;
  deductions: number;
  downloadUrl?: string;
}

// ==========================================
// INSIGHTS & REVIEWS (G22 - G24)
// ==========================================

export interface StoreInsightsData {
  acceptanceRate: number; // percentage
  avgPackingTimeMinutes: number;
  fillRatePercentage: number;
  totalOrdersCompleted: number;
  topSellingProducts: {
    productName: string;
    category: string;
    unitsSold: number;
    revenue: number;
  }[];
  categoryDistribution: {
    category: string;
    percentage: number;
    revenue: number;
  }[];
  topUnavailableItems: {
    productName: string;
    requestedCount: number;
  }[];
  peakHours: {
    hour: string;
    orderCount: number;
  }[];
}

export interface CustomerReview {
  id: string;
  orderId: string;
  shortId: string;
  customerName: string;
  rating: number; // 1 to 5
  date: string;
  tags: string[];
  comment: string;
  isReported: boolean;
}

// ==========================================
// NAVIGATION TYPES
// ==========================================

export type RootStackParamList = {
  AuthStack: undefined;
  MainApp: undefined;
  // Deep linkable screens / Modals
  OrderDetail: { orderId: string };
  PickPackExecution: { orderId: string };
  ReadyHandover: { orderId: string };
  AddEditProduct: { productId?: string; isMaster?: boolean };
  BulkUpdate: undefined;
  StoreInsights: undefined;
  CustomerReviews: undefined;
  StoreSettings: undefined;
  PayoutHistory: undefined;
  VerificationStatusModal: undefined;
};

export type AuthStackParamList = {
  G1RegistrationIntro: undefined;
  G2StoreDetails: undefined;
  G3DocumentsUpload: undefined;
  G4DocumentReview: undefined;
  G5LocationDelivery: undefined;
  G6CatalogSetup: undefined;
  G7CatalogReview: undefined;
  G8PricingPlanBank: undefined;
  G8Payment: undefined;
  G9VerificationStatus: undefined;
};

export type MainTabParamList = {
  HomeTab: undefined;
  OrdersTab: undefined;
  CatalogTab: undefined;
  EarningsTab: undefined;
  AccountTab: undefined;
};
