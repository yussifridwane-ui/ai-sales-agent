PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  passwordHash TEXT NOT NULL,
  name TEXT NOT NULL,
  emailVerified TEXT,
  image TEXT,
  platformRole TEXT NOT NULL DEFAULT 'user',
  locale TEXT NOT NULL DEFAULT 'fr',
  timezone TEXT NOT NULL DEFAULT 'UTC',
  status TEXT NOT NULL DEFAULT 'active',
  marketingConsent INTEGER NOT NULL DEFAULT 0,
  lastLoginAt TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expiresAt TEXT NOT NULL,
  ip TEXT,
  userAgent TEXT,
  createdAt TEXT NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS password_resets (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expiresAt TEXT NOT NULL,
  usedAt TEXT,
  createdAt TEXT NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS email_verifications (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expiresAt TEXT NOT NULL,
  usedAt TEXT,
  createdAt TEXT NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS organizations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  country TEXT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  industry TEXT NOT NULL,
  salesGoal TEXT NOT NULL,
  website TEXT,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  locale TEXT NOT NULL DEFAULT 'fr',
  status TEXT NOT NULL DEFAULT 'active',
  isDemo INTEGER NOT NULL DEFAULT 0,
  onboardingDone INTEGER NOT NULL DEFAULT 0,
  logoUrl TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  maxDiscountPct REAL NOT NULL DEFAULT 0,
  sellingZones TEXT NOT NULL DEFAULT '[]',
  businessHours TEXT NOT NULL DEFAULT '{}',
  refundPolicy TEXT,
  shippingPolicy TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS organization_members (
  id TEXT PRIMARY KEY,
  organizationId TEXT NOT NULL,
  userId TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'owner',
  createdAt TEXT NOT NULL,
  UNIQUE (organizationId, userId),
  FOREIGN KEY (organizationId) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS plans (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  priceMonthly INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  conversationLimit INTEGER NOT NULL,
  agentLimit INTEGER NOT NULL,
  productLimit INTEGER NOT NULL,
  teamLimit INTEGER NOT NULL,
  automationsEnabled INTEGER NOT NULL DEFAULT 0,
  analyticsEnabled INTEGER NOT NULL DEFAULT 1,
  advancedAnalytics INTEGER NOT NULL DEFAULT 0,
  apiAccess INTEGER NOT NULL DEFAULT 0,
  prioritySupport INTEGER NOT NULL DEFAULT 0,
  widgetEnabled INTEGER NOT NULL DEFAULT 1,
  features TEXT NOT NULL DEFAULT '[]',
  active INTEGER NOT NULL DEFAULT 1,
  sortOrder INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  organizationId TEXT NOT NULL UNIQUE,
  planId TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'trialing',
  billingCycle TEXT NOT NULL DEFAULT 'monthly',
  currentPeriodStart TEXT NOT NULL,
  currentPeriodEnd TEXT NOT NULL,
  cancelAtPeriodEnd INTEGER NOT NULL DEFAULT 0,
  trialEndsAt TEXT,
  externalId TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (organizationId) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY (planId) REFERENCES plans(id)
);

CREATE TABLE IF NOT EXISTS agents (
  id TEXT PRIMARY KEY,
  organizationId TEXT NOT NULL,
  name TEXT NOT NULL,
  avatar TEXT,
  description TEXT,
  language TEXT NOT NULL DEFAULT 'fr',
  languages TEXT NOT NULL DEFAULT '["fr"]',
  tone TEXT NOT NULL DEFAULT 'professional',
  role TEXT NOT NULL DEFAULT 'virtual_salesperson',
  objective TEXT,
  instructions TEXT,
  greeting TEXT,
  businessHours TEXT,
  allowedProductIds TEXT NOT NULL DEFAULT '[]',
  escalateToHuman INTEGER NOT NULL DEFAULT 1,
  isActive INTEGER NOT NULL DEFAULT 1,
  isDemo INTEGER NOT NULL DEFAULT 0,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (organizationId) REFERENCES organizations(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS agent_instructions (
  id TEXT PRIMARY KEY,
  organizationId TEXT NOT NULL,
  agentId TEXT NOT NULL UNIQUE,
  roleBlock TEXT,
  identityBlock TEXT,
  rulesBlock TEXT,
  restrictions TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (agentId) REFERENCES agents(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  organizationId TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  price REAL NOT NULL,
  compareAtPrice REAL,
  currency TEXT NOT NULL DEFAULT 'USD',
  stock INTEGER NOT NULL DEFAULT 0,
  sku TEXT,
  images TEXT NOT NULL DEFAULT '[]',
  sizes TEXT NOT NULL DEFAULT '[]',
  colors TEXT NOT NULL DEFAULT '[]',
  features TEXT NOT NULL DEFAULT '[]',
  shippingInfo TEXT,
  available INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'active',
  forbiddenForAi INTEGER NOT NULL DEFAULT 0,
  isDemo INTEGER NOT NULL DEFAULT 0,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (organizationId) REFERENCES organizations(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS product_variants (
  id TEXT PRIMARY KEY,
  organizationId TEXT NOT NULL,
  productId TEXT NOT NULL,
  name TEXT NOT NULL,
  sku TEXT,
  price REAL,
  stock INTEGER NOT NULL DEFAULT 0,
  options TEXT NOT NULL DEFAULT '{}',
  FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS knowledge_documents (
  id TEXT PRIMARY KEY,
  organizationId TEXT NOT NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  content TEXT NOT NULL,
  sourceUrl TEXT,
  isDemo INTEGER NOT NULL DEFAULT 0,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (organizationId) REFERENCES organizations(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS knowledge_sources (
  id TEXT PRIMARY KEY,
  organizationId TEXT NOT NULL,
  kind TEXT NOT NULL,
  value TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ready',
  createdAt TEXT NOT NULL,
  FOREIGN KEY (organizationId) REFERENCES organizations(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  organizationId TEXT NOT NULL,
  firstName TEXT,
  lastName TEXT,
  email TEXT,
  phone TEXT,
  country TEXT,
  company TEXT,
  source TEXT,
  channel TEXT NOT NULL DEFAULT 'website',
  productInterest TEXT,
  budget TEXT,
  score INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'new',
  notes TEXT,
  lastContactAt TEXT,
  nextAction TEXT,
  nextActionAt TEXT,
  optedOut INTEGER NOT NULL DEFAULT 0,
  isDemo INTEGER NOT NULL DEFAULT 0,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (organizationId) REFERENCES organizations(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS conversations (
  id TEXT PRIMARY KEY,
  organizationId TEXT NOT NULL,
  leadId TEXT,
  agentId TEXT,
  channel TEXT NOT NULL DEFAULT 'website',
  status TEXT NOT NULL DEFAULT 'new',
  intent TEXT,
  leadScore INTEGER NOT NULL DEFAULT 0,
  potentialValue REAL,
  humanTakeover INTEGER NOT NULL DEFAULT 0,
  assignedTo TEXT,
  lastMessageAt TEXT NOT NULL,
  optedOut INTEGER NOT NULL DEFAULT 0,
  isDemo INTEGER NOT NULL DEFAULT 0,
  metadata TEXT NOT NULL DEFAULT '{}',
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (organizationId) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY (leadId) REFERENCES leads(id),
  FOREIGN KEY (agentId) REFERENCES agents(id)
);

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  organizationId TEXT NOT NULL,
  conversationId TEXT NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  generatedByAi INTEGER NOT NULL DEFAULT 0,
  intent TEXT,
  metadata TEXT NOT NULL DEFAULT '{}',
  createdAt TEXT NOT NULL,
  FOREIGN KEY (conversationId) REFERENCES conversations(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS conversation_events (
  id TEXT PRIMARY KEY,
  organizationId TEXT NOT NULL,
  conversationId TEXT NOT NULL,
  type TEXT NOT NULL,
  payload TEXT NOT NULL DEFAULT '{}',
  createdAt TEXT NOT NULL,
  FOREIGN KEY (conversationId) REFERENCES conversations(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  organizationId TEXT NOT NULL,
  number TEXT NOT NULL,
  leadId TEXT,
  conversationId TEXT,
  agentId TEXT,
  channel TEXT NOT NULL DEFAULT 'website',
  source TEXT,
  campaign TEXT,
  subtotal REAL NOT NULL DEFAULT 0,
  discount REAL NOT NULL DEFAULT 0,
  shipping REAL NOT NULL DEFAULT 0,
  tax REAL NOT NULL DEFAULT 0,
  total REAL NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'pending',
  paymentStatus TEXT NOT NULL DEFAULT 'unpaid',
  notes TEXT,
  isDemo INTEGER NOT NULL DEFAULT 0,
  attributedToAi INTEGER NOT NULL DEFAULT 1,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  UNIQUE (organizationId, number),
  FOREIGN KEY (organizationId) REFERENCES organizations(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS order_items (
  id TEXT PRIMARY KEY,
  organizationId TEXT NOT NULL,
  orderId TEXT NOT NULL,
  productId TEXT,
  name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unitPrice REAL NOT NULL,
  total REAL NOT NULL,
  FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  organizationId TEXT NOT NULL,
  orderId TEXT,
  provider TEXT NOT NULL,
  amount REAL NOT NULL,
  currency TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  externalId TEXT,
  checkoutUrl TEXT,
  isDemo INTEGER NOT NULL DEFAULT 0,
  metadata TEXT NOT NULL DEFAULT '{}',
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (organizationId) REFERENCES organizations(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS automation_rules (
  id TEXT PRIMARY KEY,
  organizationId TEXT NOT NULL,
  name TEXT NOT NULL,
  trigger TEXT NOT NULL,
  conditions TEXT NOT NULL DEFAULT '{}',
  actions TEXT NOT NULL DEFAULT '[]',
  isActive INTEGER NOT NULL DEFAULT 1,
  isDemo INTEGER NOT NULL DEFAULT 0,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (organizationId) REFERENCES organizations(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS automation_runs (
  id TEXT PRIMARY KEY,
  organizationId TEXT NOT NULL,
  ruleId TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued',
  payload TEXT NOT NULL DEFAULT '{}',
  result TEXT,
  createdAt TEXT NOT NULL,
  completedAt TEXT,
  FOREIGN KEY (ruleId) REFERENCES automation_rules(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS integrations (
  id TEXT PRIMARY KEY,
  organizationId TEXT NOT NULL,
  provider TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'not_connected',
  config TEXT NOT NULL DEFAULT '{}',
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  UNIQUE (organizationId, provider),
  FOREIGN KEY (organizationId) REFERENCES organizations(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS integration_credentials (
  id TEXT PRIMARY KEY,
  organizationId TEXT NOT NULL,
  integrationId TEXT NOT NULL,
  keyName TEXT NOT NULL,
  encryptedValue TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  FOREIGN KEY (integrationId) REFERENCES integrations(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  organizationId TEXT,
  userId TEXT,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  readAt TEXT,
  href TEXT,
  createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS analytics_events (
  id TEXT PRIMARY KEY,
  organizationId TEXT NOT NULL,
  name TEXT NOT NULL,
  value REAL,
  meta TEXT NOT NULL DEFAULT '{}',
  createdAt TEXT NOT NULL,
  FOREIGN KEY (organizationId) REFERENCES organizations(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS usage_records (
  id TEXT PRIMARY KEY,
  organizationId TEXT NOT NULL,
  agentId TEXT,
  conversationId TEXT,
  model TEXT NOT NULL,
  tokensIn INTEGER NOT NULL DEFAULT 0,
  tokensOut INTEGER NOT NULL DEFAULT 0,
  estimatedCost REAL NOT NULL DEFAULT 0,
  kind TEXT NOT NULL DEFAULT 'conversation',
  createdAt TEXT NOT NULL,
  FOREIGN KEY (organizationId) REFERENCES organizations(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS invoices (
  id TEXT PRIMARY KEY,
  organizationId TEXT NOT NULL,
  number TEXT NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'paid',
  periodStart TEXT NOT NULL,
  periodEnd TEXT NOT NULL,
  pdfUrl TEXT,
  createdAt TEXT NOT NULL,
  FOREIGN KEY (organizationId) REFERENCES organizations(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS support_tickets (
  id TEXT PRIMARY KEY,
  organizationId TEXT,
  userId TEXT,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  priority TEXT NOT NULL DEFAULT 'normal',
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  organizationId TEXT,
  userId TEXT,
  action TEXT NOT NULL,
  entity TEXT,
  entityId TEXT,
  ip TEXT,
  meta TEXT NOT NULL DEFAULT '{}',
  createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS objections (
  id TEXT PRIMARY KEY,
  organizationId TEXT NOT NULL,
  phrase TEXT NOT NULL,
  response TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  FOREIGN KEY (organizationId) REFERENCES organizations(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS sales_scripts (
  id TEXT PRIMARY KEY,
  organizationId TEXT NOT NULL,
  agentId TEXT,
  greeting TEXT,
  qualificationQuestions TEXT NOT NULL DEFAULT '[]',
  arguments TEXT NOT NULL DEFAULT '[]',
  ctas TEXT NOT NULL DEFAULT '[]',
  followUpHours TEXT NOT NULL DEFAULT '[2,24,72]',
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (organizationId) REFERENCES organizations(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS commercial_rules (
  id TEXT PRIMARY KEY,
  organizationId TEXT NOT NULL,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  UNIQUE (organizationId, key),
  FOREIGN KEY (organizationId) REFERENCES organizations(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS widget_settings (
  id TEXT PRIMARY KEY,
  organizationId TEXT NOT NULL UNIQUE,
  allowedDomains TEXT NOT NULL DEFAULT '[]',
  primaryColor TEXT NOT NULL DEFAULT '#14B8A6',
  position TEXT NOT NULL DEFAULT 'right',
  greeting TEXT,
  agentId TEXT,
  enabled INTEGER NOT NULL DEFAULT 1,
  FOREIGN KEY (organizationId) REFERENCES organizations(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS webhook_events (
  id TEXT PRIMARY KEY,
  organizationId TEXT,
  provider TEXT NOT NULL,
  externalId TEXT NOT NULL,
  payload TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'processed',
  createdAt TEXT NOT NULL,
  UNIQUE (provider, externalId)
);

CREATE TABLE IF NOT EXISTS processed_jobs (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued',
  payload TEXT NOT NULL DEFAULT '{}',
  result TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(userId);
CREATE INDEX IF NOT EXISTS idx_members_user ON organization_members(userId);
CREATE INDEX IF NOT EXISTS idx_agents_org ON agents(organizationId);
CREATE INDEX IF NOT EXISTS idx_products_org ON products(organizationId);
CREATE INDEX IF NOT EXISTS idx_leads_org ON leads(organizationId);
CREATE INDEX IF NOT EXISTS idx_conv_org ON conversations(organizationId);
CREATE INDEX IF NOT EXISTS idx_conv_status ON conversations(organizationId, status);
CREATE INDEX IF NOT EXISTS idx_msg_conv ON messages(conversationId);
CREATE INDEX IF NOT EXISTS idx_orders_org ON orders(organizationId);
CREATE INDEX IF NOT EXISTS idx_pay_org ON payments(organizationId);
CREATE INDEX IF NOT EXISTS idx_analytics_org ON analytics_events(organizationId, createdAt);
CREATE INDEX IF NOT EXISTS idx_usage_org ON usage_records(organizationId, createdAt);
CREATE INDEX IF NOT EXISTS idx_audit_org ON audit_logs(organizationId, createdAt);
