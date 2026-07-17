export type CommercialOfferInput = {
  companyName: string;
  sector?: string | null;
  idealClient?: string | null;
  goals?: string | null;
  services?: string[] | null;
  advantages?: string | null;
};

export type CommercialOfferResult = {
  proposal: string;
  arguments: string[];
  structure: string[];
};

export type ProspectAnalysisInput = {
  name: string;
  company?: string | null;
  need?: string | null;
  currentWebsite?: string | null;
  notes?: string | null;
};

export type ProspectAnalysisResult = {
  summary: string;
  opportunities: string[];
  recommendations: string[];
};

export type WebStrategyInput = {
  companyName: string;
  sector?: string | null;
  goals?: string | null;
  services?: string[] | null;
};

export type WebStrategyResult = {
  architecture: string[];
  recommendedPages: string[];
  uxRecommendations: string[];
};

export interface AIProvider {
  generateCommercialOffer(input: CommercialOfferInput): Promise<CommercialOfferResult>;
  analyzeProspect(input: ProspectAnalysisInput): Promise<ProspectAnalysisResult>;
  generateWebStrategy(input: WebStrategyInput): Promise<WebStrategyResult>;
}
