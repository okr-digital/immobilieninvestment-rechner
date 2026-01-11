import { Deal, YearlyResult, KPIResult } from '../types';

export const calculateDeal = (deal: Deal): { yearlyResults: YearlyResult[], kpis: KPIResult } => {
  const {
    purchasePrice, coldRentMonthly, parkingRentMonthly, rentIncreasePercent,
    taxPercent, registryPercent, notaryPercent, agentPercent, capex,
    equityAmount, interestRate, loanTermYears, financeCosts, financeCapex,
    adminCostMonthly, maintenanceCostMonthly: maintInput, reserveCostMonthly: reserveInput,
    vacancyPercent, costIncreasePercent,
    personalTaxRate, afaPercent, buildingSharePercent,
    holdingPeriodYears, appreciationPercent, sellingCostPercent, capitalGainsTax,
    etfReturnPercent, etfTaxPercent, sizeSqm
  } = deal;

  // 1. Initial Costs
  const ancillaryCosts = purchasePrice * ((taxPercent + registryPercent + notaryPercent + agentPercent) / 100);
  const totalCapex = capex;
  const totalInvestmentNeeded = purchasePrice + ancillaryCosts + totalCapex;
  
  // 2. Financing
  // Determine what is financed
  let loanAmount = purchasePrice - equityAmount;
  
  // If costs are not financed, they must be paid by equity (but we track "Cash to Close" separately)
  // If costs ARE financed, add to loan.
  if (financeCosts) loanAmount += ancillaryCosts;
  if (financeCapex) loanAmount += totalCapex;

  // Cash to close (Initial Cash Invested)
  // Logic: Cash Needed = Total Cost - Loan
  const cashToClose = totalInvestmentNeeded - loanAmount;

  // 3. Setup Loop Variables
  const results: YearlyResult[] = [];
  
  let currentLoan = loanAmount;
  let currentPropertyValue = purchasePrice; 
  let currentMonthlyRent = coldRentMonthly + parkingRentMonthly;
  
  // Parse inputs
  let currentMonthlyAdmin = adminCostMonthly;
  let currentMonthlyMaint = maintInput < 10 ? maintInput * sizeSqm : maintInput;
  let currentMonthlyReserve = reserveInput < 10 ? reserveInput * sizeSqm : reserveInput;

  // ETF Simulation Setup
  let etfValue = cashToClose; 
  let investedCapital = cashToClose;

  let cumulativeCashflowPostTax = 0;

  // Calculate Fixed Annuity (PMT)
  // Monthly Rate
  const r = interestRate / 100 / 12;
  const n = loanTermYears * 12;
  
  let monthlyPayment = 0;
  if (loanAmount > 0) {
    if (interestRate === 0) {
      monthlyPayment = loanAmount / n;
    } else {
      // PMT Formula: P * (r * (1+r)^n) / ((1+r)^n - 1)
      monthlyPayment = loanAmount * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    }
  }
  
  const annualFixedAnnuity = monthlyPayment * 12;

  for (let year = 1; year <= holdingPeriodYears; year++) {
    // A. Income
    const annualGrossRent = currentMonthlyRent * 12;
    const vacancyLoss = annualGrossRent * (vacancyPercent / 100);
    const effectiveRent = annualGrossRent - vacancyLoss;

    // B. Operating Costs (Non-recoverable)
    const annualAdmin = currentMonthlyAdmin * 12;
    const annualMaint = currentMonthlyMaint * 12;
    const annualReserve = currentMonthlyReserve * 12; 
    const annualOpCosts = annualAdmin + annualMaint + annualReserve; 
    
    // C. Finance
    // Interest is calculated on remaining debt at start of year (simplified vs monthly exact, but close enough for yearly model)
    // For more precision in a yearly loop with monthly annuity:
    // Interest part of the year approx: currentLoan * rate.
    // However, since loan decreases monthly, standard approximation:
    const annualInterest = currentLoan * (interestRate / 100);
    
    // Check if fully paid
    let annualAnnunityActual = annualFixedAnnuity;
    
    // If debt is low, we only pay what's left + interest
    if (currentLoan * (1 + interestRate/100) < annualFixedAnnuity) {
       // Last payment year logic simplified
       annualAnnunityActual = currentLoan + annualInterest;
    }
    
    // Avoid negative debt if term is shorter than view period
    if (currentLoan <= 0) {
      annualAnnunityActual = 0;
    }

    const annualPrincipal = Math.max(0, annualAnnunityActual - annualInterest);
    
    // D. Tax (Austria Simplified)
    // AfA
    const afaBase = (purchasePrice + ancillaryCosts) * (buildingSharePercent / 100); 
    const annualAfA = afaBase * (afaPercent / 100);

    // Tax Basis
    const taxBasis = effectiveRent - annualOpCosts - annualInterest - annualAfA;
    
    let taxAmount = 0;
    if (taxBasis > 0) {
      taxAmount = taxBasis * (personalTaxRate / 100);
    } else {
      // Negative Tax = Saving
      taxAmount = taxBasis * (personalTaxRate / 100);
    }

    // E. Cashflow
    const cfPreTax = effectiveRent - annualOpCosts - annualAnnunityActual; 
    const cfPostTax = cfPreTax - taxAmount; 
    
    cumulativeCashflowPostTax += cfPostTax;

    // F. ETF Benchmark Logic
    // 1. Grow existing ETF
    etfValue = etfValue * (1 + etfReturnPercent / 100);
    
    // 2. Reinvest or Inject
    if (cfPostTax > 0) {
      // Invest positive CF into ETF
      etfValue += cfPostTax;
    } else {
      // Negative CF means we need to add money to Real Estate.
      investedCapital += Math.abs(cfPostTax);
      etfValue += Math.abs(cfPostTax);
    }

    // G. Updates for next year
    currentLoan -= annualPrincipal;
    if (currentLoan < 0) currentLoan = 0;

    currentPropertyValue = currentPropertyValue * (1 + appreciationPercent / 100);
    
    // Inflation
    currentMonthlyRent = currentMonthlyRent * (1 + rentIncreasePercent / 100);
    currentMonthlyAdmin = currentMonthlyAdmin * (1 + costIncreasePercent / 100);
    currentMonthlyMaint = currentMonthlyMaint * (1 + costIncreasePercent / 100);
    currentMonthlyReserve = currentMonthlyReserve * (1 + costIncreasePercent / 100);

    results.push({
      year,
      propertyValue: currentPropertyValue,
      remainingDebt: currentLoan,
      equityInProperty: currentPropertyValue - currentLoan,
      grossRent: annualGrossRent,
      vacancyLoss,
      operatingCosts: annualOpCosts,
      interestPayment: annualInterest,
      principalPayment: annualPrincipal,
      annuity: annualAnnunityActual,
      taxBasis,
      taxAmount,
      cashflowPreTax: cfPreTax,
      cashflowPostTax: cfPostTax,
      accumulatedCashflow: cumulativeCashflowPostTax,
      etfValue,
      investedCapital
    });
  }

  // KPI Calculation
  const y1 = results[0];
  const end = results[results.length - 1];

  // Selling logic
  const grossSaleProceeds = end.propertyValue;
  const sellingCosts = grossSaleProceeds * (sellingCostPercent / 100);
  
  let exitTax = 0;
  if (capitalGainsTax > 0) {
     const gain = grossSaleProceeds - purchasePrice; 
     if (gain > 0) exitTax = gain * (capitalGainsTax / 100);
  }

  const netSaleProceeds = grossSaleProceeds - sellingCosts - exitTax - end.remainingDebt;
  const endWealthRealEstate = netSaleProceeds + end.accumulatedCashflow;

  // ETF Exit Tax
  const etfGain = end.etfValue - end.investedCapital;
  const etfTax = etfGain > 0 ? etfGain * (etfTaxPercent / 100) : 0;
  const endWealthETF = end.etfValue - etfTax;

  // CAGR
  const cagr = Math.pow((endWealthRealEstate / end.investedCapital), (1 / holdingPeriodYears)) - 1;

  // Yields (Year 1)
  const grossYield = (y1.grossRent / purchasePrice) * 100;
  const netYield = ((y1.grossRent - y1.vacancyLoss - y1.operatingCosts) / totalInvestmentNeeded) * 100;

  // DSCR (Year 1)
  // NOI = Gross Rent - Vacancy - Operating Costs
  const noi = y1.grossRent - y1.vacancyLoss - y1.operatingCosts;
  const debtService = y1.annuity;
  const dscr = debtService > 0 ? noi / debtService : 0;

  return {
    yearlyResults: results,
    kpis: {
      monthlyCashflowYear1PreTax: y1.cashflowPreTax / 12,
      monthlyCashflowYear1PostTax: y1.cashflowPostTax / 12,
      grossYield,
      netYield,
      totalInvestment: cashToClose,
      totalEquityReturnCAGR: cagr * 100,
      endWealthRealEstate,
      endWealthETF,
      breakEvenYear: 0,
      dscr
    }
  };
};