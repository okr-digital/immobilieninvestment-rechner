export enum ScenarioType {
  CONSERVATIVE = 'CONSERVATIVE',
  NEUTRAL = 'NEUTRAL',
  OPTIMISTIC = 'OPTIMISTIC'
}

export interface Deal {
  id: string;
  name: string;
  
  // 3.1 Objektdaten
  purchasePrice: number;
  sizeSqm: number;
  coldRentMonthly: number;
  parkingRentMonthly: number;
  rentIncreasePercent: number;

  // 3.2 Nebenkosten (AT)
  taxPercent: number; // Grunderwerb
  registryPercent: number; // Grundbuch
  notaryPercent: number; // Notar
  agentPercent: number; // Makler
  capex: number; // Sanierung

  // 3.3 Finanzierung
  equityAmount: number; // Eigenkapital
  interestRate: number;
  loanTermYears: number; // Laufzeit in Jahren statt Tilgung in %
  financeCosts: boolean; // Nebenkosten mitfinanzieren?
  financeCapex: boolean; // Sanierung mitfinanzieren?

  // 3.4 Laufende Kosten
  adminCostMonthly: number; // Verwaltung
  maintenanceCostMonthly: number; // Instandhaltung
  reserveCostMonthly: number; // Rücklage
  vacancyPercent: number; // Leerstand
  costIncreasePercent: number;

  // 3.5 Steuern (AT)
  personalTaxRate: number;
  afaPercent: number;
  buildingSharePercent: number;

  // 3.6 Exit
  holdingPeriodYears: number;
  appreciationPercent: number;
  sellingCostPercent: number;
  capitalGainsTax: number; // Spekulationssteuer (0 or 30 normally)

  // 6. Benchmark
  etfReturnPercent: number;
  etfTaxPercent: number; // KESt
}

export interface YearlyResult {
  year: number;
  propertyValue: number;
  remainingDebt: number;
  equityInProperty: number; // Value - Debt
  
  grossRent: number;
  vacancyLoss: number;
  operatingCosts: number;
  
  interestPayment: number;
  principalPayment: number; // Tilgung
  annuity: number;

  taxBasis: number;
  taxAmount: number; // Can be negative (saving)
  
  cashflowPreTax: number;
  cashflowPostTax: number;
  
  accumulatedCashflow: number;
  
  etfValue: number; // Comparative scenario
  investedCapital: number; // Total cash put in (Start + negative CFs)
}

export interface KPIResult {
  monthlyCashflowYear1PreTax: number;
  monthlyCashflowYear1PostTax: number;
  grossYield: number;
  netYield: number;
  totalInvestment: number; // Cash to close
  totalEquityReturnCAGR: number;
  totalEquityReturnIRR?: number; // Optional
  endWealthRealEstate: number;
  endWealthETF: number;
  breakEvenYear: number;
  dscr: number; // Debt Service Coverage Ratio
}