export type AiToolSource = 'toolify' | 'manual' | 'other';
export type PricingModel = 'free' | 'freemium' | 'paid' | 'unknown';
export type ToolActionType = 'link' | 'prompt' | 'api';

export type AiTool = {
  id: string;
  slug: string;
  name: string;
  source: AiToolSource;
  sourceUrl?: string;
  websiteUrl?: string;
  shortDescription: string;
  primaryCategory: string;
  categories: string[];
  tags: string[];
  taskIntents: string[];
  inputTypes: string[];
  outputTypes: string[];
  bestFor: string[];
  notBestFor: string[];
  useWhen: string[];
  skipWhen: string[];
  pricingModel: PricingModel;
  action: {
    type: ToolActionType;
    openUrl?: string;
    apiAdapterKey?: string;
    promptTemplateIds?: string[];
  };
  safety: {
    allowed: boolean;
    blockedReason?: string;
    riskTags: string[];
  };
  metrics?: {
    monthlyVisitors?: number;
    rating?: number;
    reviewsCount?: number;
    savedCount?: number;
  };
};

export type AiToolDetail = {
  slug: string;
  toolSlug: string;
  name: string;
  source: AiToolSource;
  sourceUrl?: string;
  websiteUrl?: string;
  hero: {
    tagline: string;
    category: string;
    pricingModel: PricingModel;
    level: string;
    rating?: number;
    reviewsCount?: number;
    savedCount?: number;
    monthlyVisitors?: number;
  };
  overview: {
    whatIs: string;
    whyItMatters: string;
    whoItsFor: string;
    whereItWorks: string;
    whatYouGet: string;
  };
  howToUse: string;
  features: {
    core: string[];
    cards: { title: string; description: string }[];
  };
  pricing: {
    model: PricingModel;
    freePlan: string;
    paidPlan: string;
    billing: string;
    note: string;
  };
  alternatives: { slug: string; name: string; description: string }[];
  relatedTopics: string[];
  sourceMeta: {
    crawledAt?: string;
    sourceUrl?: string;
    dataCompleteness: 'full' | 'partial' | 'basic';
  };
};

export type TaskIntent = {
  taskType: string;
  deliverable: string;
  requiredCapabilities: string[];
  constraints: {
    budget?: string;
    skillLevel?: string;
    speed?: string;
  };
  language: 'zh' | 'en' | 'mixed';
  keywords: string[];
};

export type ToolScoreEvidence = {
  toolSlug: string;
  score: number;
  reasons: string[];
  matchedFields: string[];
};

export type ToolSlot = {
  id: string;
  role: string;
  primaryTools: AiTool[];
  alternatives: AiTool[];
  note: string;
};

export type UpgradeRecommendation = {
  key: 'professional' | 'budget' | 'automated' | 'advanced_visual';
  label: string;
  description: string;
  tools: AiTool[];
};

export type SkippedRecommendation = {
  tool: AiTool;
  reason: string;
};

export type ToolRecommendationResult = {
  taskIntent: TaskIntent;
  selectedTools: AiTool[];
  toolSlots: ToolSlot[];
  upgradeOptions: UpgradeRecommendation[];
  skippedTools: SkippedRecommendation[];
  scoringEvidence: ToolScoreEvidence[];
  catalogStats: {
    source: 'local' | 'fallback' | 'mixed';
    totalTools: number;
    safetyFilteredCount: number;
  };
};

export type ToolifyRawTool = {
  id?: number;
  source?: string;
  toolify_url?: string;
  slug?: string;
  name?: string;
  external_url?: string;
  introduction?: string;
  product_info?: string;
  how_to_use?: string;
  pricing_text?: string;
  rating?: number | null;
  reviews_count?: number | null;
  saved_count?: number | null;
  monthly_visitors_num?: number | null;
  monthly_visitors_raw?: string;
  added_on?: string;
  tool_type?: string;
  pricing_model?: string;
  categories_json?: string;
  tags_json?: string;
  features_json?: string;
  use_cases_json?: string;
  traffic_json?: string;
  crawled_at?: string;
  updated_at?: string;
};
