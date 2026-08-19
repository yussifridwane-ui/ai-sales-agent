export type User = {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  emailVerified: string | null;
  image: string | null;
  platformRole: string;
  locale: string;
  timezone: string;
  status: string;
  marketingConsent: boolean;
  lastLoginAt: string | null;
  mfaEnabled: boolean;
  mfaSecret: string | null;
  failedLoginCount: number;
  lockedUntil: string | null;
  passwordChangedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Session = {
  id: string;
  userId: string;
  token: string;
  expiresAt: string;
  ip: string | null;
  userAgent: string | null;
  mfaVerifiedAt: string | null;
  createdAt: string;
};

export type Organization = {
  id: string;
  name: string;
  slug: string;
  country: string;
  currency: string;
  industry: string;
  salesGoal: string;
  website: string | null;
  timezone: string;
  locale: string;
  status: string;
  isDemo: boolean;
  onboardingDone: boolean;
  logoUrl: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  maxDiscountPct: number;
  sellingZones: string;
  businessHours: string;
  refundPolicy: string | null;
  shippingPolicy: string | null;
  createdAt: string;
  updatedAt: string;
};

export type OrganizationMember = {
  id: string;
  organizationId: string;
  userId: string;
  role: string;
  createdAt: string;
};

export type Plan = {
  id: string;
  slug: string;
  name: string;
  priceMonthly: number;
  currency: string;
  conversationLimit: number;
  agentLimit: number;
  productLimit: number;
  teamLimit: number;
  automationsEnabled: boolean;
  analyticsEnabled: boolean;
  advancedAnalytics: boolean;
  apiAccess: boolean;
  prioritySupport: boolean;
  widgetEnabled: boolean;
  features: string;
  active: boolean;
  sortOrder: number;
};

export type Subscription = {
  id: string;
  organizationId: string;
  planId: string;
  status: string;
  billingCycle: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  trialEndsAt: string | null;
  externalId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Agent = {
  id: string;
  organizationId: string;
  name: string;
  avatar: string | null;
  description: string | null;
  language: string;
  languages: string;
  tone: string;
  role: string;
  objective: string | null;
  instructions: string | null;
  greeting: string | null;
  businessHours: string | null;
  allowedProductIds: string;
  escalateToHuman: boolean;
  isActive: boolean;
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Product = {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  category: string | null;
  price: number;
  compareAtPrice: number | null;
  currency: string;
  stock: number;
  sku: string | null;
  images: string;
  sizes: string;
  colors: string;
  features: string;
  shippingInfo: string | null;
  available: boolean;
  status: string;
  forbiddenForAi: boolean;
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
};

export type KnowledgeDocument = {
  id: string;
  organizationId: string;
  title: string;
  type: string;
  content: string;
  sourceUrl: string | null;
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Lead = {
  id: string;
  organizationId: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  country: string | null;
  company: string | null;
  source: string | null;
  channel: string;
  productInterest: string | null;
  budget: string | null;
  score: number;
  status: string;
  notes: string | null;
  lastContactAt: string | null;
  nextAction: string | null;
  nextActionAt: string | null;
  optedOut: boolean;
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Conversation = {
  id: string;
  organizationId: string;
  leadId: string | null;
  agentId: string | null;
  channel: string;
  status: string;
  intent: string | null;
  leadScore: number;
  potentialValue: number | null;
  humanTakeover: boolean;
  assignedTo: string | null;
  lastMessageAt: string;
  optedOut: boolean;
  isDemo: boolean;
  metadata: string;
  createdAt: string;
  updatedAt: string;
};

export type Message = {
  id: string;
  organizationId: string;
  conversationId: string;
  role: string;
  content: string;
  generatedByAi: boolean;
  intent: string | null;
  metadata: string;
  createdAt: string;
};

export type Order = {
  id: string;
  organizationId: string;
  number: string;
  leadId: string | null;
  conversationId: string | null;
  agentId: string | null;
  channel: string;
  source: string | null;
  campaign: string | null;
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  currency: string;
  status: string;
  paymentStatus: string;
  notes: string | null;
  isDemo: boolean;
  attributedToAi: boolean;
  createdAt: string;
  updatedAt: string;
};

export type OrderItem = {
  id: string;
  organizationId: string;
  orderId: string;
  productId: string | null;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

export type Payment = {
  id: string;
  organizationId: string;
  orderId: string | null;
  provider: string;
  amount: number;
  currency: string;
  status: string;
  externalId: string | null;
  checkoutUrl: string | null;
  isDemo: boolean;
  metadata: string;
  createdAt: string;
  updatedAt: string;
};

export type AutomationRule = {
  id: string;
  organizationId: string;
  name: string;
  trigger: string;
  conditions: string;
  actions: string;
  isActive: boolean;
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Integration = {
  id: string;
  organizationId: string;
  provider: string;
  status: string;
  config: string;
  createdAt: string;
  updatedAt: string;
};

export type Notification = {
  id: string;
  organizationId: string | null;
  userId: string | null;
  type: string;
  title: string;
  body: string;
  readAt: string | null;
  href: string | null;
  createdAt: string;
};

export type AnalyticsEvent = {
  id: string;
  organizationId: string;
  name: string;
  value: number | null;
  meta: string;
  createdAt: string;
};

export type Invoice = {
  id: string;
  organizationId: string;
  number: string;
  amount: number;
  currency: string;
  status: string;
  periodStart: string;
  periodEnd: string;
  pdfUrl: string | null;
  createdAt: string;
};

export type Objection = {
  id: string;
  organizationId: string;
  phrase: string;
  response: string;
  createdAt: string;
};

export type WidgetSettings = {
  id: string;
  organizationId: string;
  allowedDomains: string;
  primaryColor: string;
  position: string;
  greeting: string | null;
  agentId: string | null;
  enabled: boolean;
};

export type MembershipWithOrg = OrganizationMember & {
  organization: Organization & { subscription: (Subscription & { plan: Plan }) | null };
};
