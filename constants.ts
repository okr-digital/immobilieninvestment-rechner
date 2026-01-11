import { Deal } from './types';

export const DEFAULT_DEAL: Deal = {
  id: 'default',
  name: 'Mein Erstes Investment',
  
  // Object
  purchasePrice: 250000,
  sizeSqm: 65,
  coldRentMonthly: 900,
  parkingRentMonthly: 0,
  rentIncreasePercent: 2.0,

  // Costs (AT)
  taxPercent: 3.5,
  registryPercent: 1.1,
  notaryPercent: 1.5,
  agentPercent: 3.0,
  capex: 5000,

  // Finance
  equityAmount: 50000,
  interestRate: 3.5,
  loanTermYears: 30, // Standard term
  financeCosts: false,
  financeCapex: false,

  // Running Costs (Non-recoverable / Nicht umlagefähig)
  adminCostMonthly: 30, // Sondereigentumsverwaltung
  maintenanceCostMonthly: 1.00, // Innerhalb der Wohnung
  reserveCostMonthly: 1.00, // Reparaturrücklage (Legal min in AT is 0.90 since 2022)
  vacancyPercent: 3.0, // More conservative (approx 2 weeks/year)
  costIncreasePercent: 2.0,

  // Tax
  personalTaxRate: 42,
  afaPercent: 1.5,
  buildingSharePercent: 80,

  // Exit
  holdingPeriodYears: 20,
  appreciationPercent: 2.0,
  sellingCostPercent: 0,
  capitalGainsTax: 0, 

  // Benchmark
  etfReturnPercent: 7.0,
  etfTaxPercent: 27.5
};

export const PRESETS: Record<string, Partial<Deal>> = {
  STARTER: {
    // Typische Einsteigerwohnung (z.B. Graz/Linz, 70er Jahre Bau)
    purchasePrice: 165000,
    sizeSqm: 48,
    parkingRentMonthly: 0,
    equityAmount: 45000, // Etwas mehr EK für Sicherheit
    coldRentMonthly: 620, // ca. 12,90€/m²
    capex: 3000, // Kleinigkeiten
    interestRate: 3.5,
    loanTermYears: 30,
    reserveCostMonthly: 1.40, // Ältere Gebäude haben oft höhere Rücklagen!
    maintenanceCostMonthly: 1.00,
    vacancyPercent: 3.0,
    rentIncreasePercent: 2.0,
    appreciationPercent: 2.0,
  },
  CASHFLOW: {
    // Optimiert auf positiven CF (benötigt viel EK aktuell!)
    purchasePrice: 290000,
    sizeSqm: 75,
    parkingRentMonthly: 0,
    equityAmount: 110000, // Fast 40% EK nötig für guten Cashflow bei 3.5% Zins
    coldRentMonthly: 1350, // Gute Vermietung (z.B. WG-geeignet), ca 18€/m²
    interestRate: 3.4, // Guter Bonitäts-Zins
    loanTermYears: 35, // Langstreckenfinanzierung drückt die Rate
    vacancyPercent: 2.0, // Gute Lage, wenig Leerstand
    reserveCostMonthly: 1.00,
    // Explicit resets to prevent leaking values from other presets
    capex: 5000, 
    maintenanceCostMonthly: 1.00,
    rentIncreasePercent: 2.0,
    appreciationPercent: 2.0,
  },
  VALUE: {
    // Wertsteigerungs-Fokus (z.B. Wien Altbau, sanierungsbedürftig)
    purchasePrice: 420000,
    sizeSqm: 85,
    parkingRentMonthly: 0,
    equityAmount: 90000,
    coldRentMonthly: 1100, // Geringere Rendite (oft Richtwert-gedeckelt im Altbau)
    capex: 45000, // Größere Sanierung notwendig
    appreciationPercent: 3.5, // Wette auf den Markt / Lage
    rentIncreasePercent: 2.5,
    loanTermYears: 30,
    maintenanceCostMonthly: 1.50, // Höheres Risiko bei Altbau
    reserveCostMonthly: 1.20,
    vacancyPercent: 4.0, // Höheres Leerstandsrisiko (Sanierung/Mieterwechsel)
    interestRate: 3.5,
  }
};