import React, { useState, useMemo } from 'react';
import { KPIResult, YearlyResult, Deal } from '../types';
import { calculateDeal } from '../services/calculationEngine';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend, BarChart, Bar, ReferenceLine, Cell } from 'recharts';
import { ChevronDown, ChevronUp, HelpCircle, TrendingUp, TrendingDown, RefreshCcw, Calculator, Split } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string;
  subValue?: string;
  isPositive?: boolean;
  tooltip?: string;
  children?: React.ReactNode;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, subValue, isPositive, tooltip, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  // Neutral text for label, Red/Green for numbers only
  const valColorClass = isPositive === undefined ? 'text-white' : isPositive ? 'text-emerald-400' : 'text-red-400';

  return (
    <div className="bg-dashboardLight rounded-xl p-4 shadow-lg border border-white/5 hover:border-white/10 transition-colors flex flex-col relative group/card">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2 w-full">
            <h3 className="text-slate-300 text-sm font-medium leading-tight">{title}</h3>
            {tooltip && (
              <div className="group relative z-[100]">
                <HelpCircle size={14} className="text-slate-500 hover:text-slate-200 cursor-help transition-colors shrink-0" />
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 p-2 bg-slate-900 text-slate-200 text-xs rounded border border-white/10 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-[100]">
                  {tooltip}
                  {/* Arrow pointing up */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-slate-900"></div>
                </div>
              </div>
            )}
        </div>
      </div>
      <div className="flex justify-between items-end mt-auto">
        <div>
          <div className={`text-2xl font-bold ${valColorClass}`}>{value}</div>
          {subValue && <div className="text-xs text-slate-400 mt-1">{subValue}</div>}
        </div>
        {children && (
          <button onClick={() => setIsOpen(!isOpen)} className="text-slate-500 hover:text-white transition-colors p-1">
            {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        )}
      </div>
      {isOpen && children && (
        <div className="mt-4 pt-4 border-t border-white/5 text-sm text-slate-300 animate-in fade-in slide-in-from-top-2 duration-200">
          {children}
        </div>
      )}
    </div>
  );
};

// --- SENSITIVITY HEATMAP COMPONENT ---
const SensitivityHeatmap: React.FC<{ deal: Deal }> = ({ deal }) => {
  const [metric, setMetric] = useState<'cashflow' | 'yield'>('cashflow');

  // Axis Steps
  const priceVariations = [-10, -5, 0, 5, 10]; // Percentage change
  const rateVariations = [-1.0, -0.5, 0, 0.5, 1.0]; // Absolute percentage point change

  const matrix = useMemo(() => {
    return rateVariations.map(rateDelta => {
      return priceVariations.map(priceDelta => {
        // Create scenario deal
        const newPrice = deal.purchasePrice * (1 + priceDelta / 100);
        const newRate = Math.max(0, deal.interestRate + rateDelta);

        const scenarioDeal = {
          ...deal,
          purchasePrice: newPrice,
          interestRate: newRate
        };

        const result = calculateDeal(scenarioDeal);
        return {
          priceDelta,
          rateDelta,
          cashflow: result.kpis.monthlyCashflowYear1PostTax,
          yield: result.kpis.netYield
        };
      });
    });
  }, [deal]);

  // Color Scale Helper
  const getColor = (val: number, type: 'cashflow' | 'yield') => {
    let intensity = 0;
    if (type === 'cashflow') {
       // Scale: -500 (red) to +500 (green)
       const normalized = Math.max(-500, Math.min(500, val));
       intensity = (normalized + 500) / 1000; // 0 to 1
    } else {
       // Scale: 1% (red) to 6% (green)
       const normalized = Math.max(1, Math.min(6, val));
       intensity = (normalized - 1) / 5;
    }
    
    // Mix Red (0, 100%, 50%) and Emerald (120, 100%, 50%)
    // Simplified RGB interpolation
    const r = Math.round(239 * (1 - intensity) + 16 * intensity);
    const g = Math.round(68 * (1 - intensity) + 185 * intensity);
    const b = Math.round(68 * (1 - intensity) + 129 * intensity);
    
    return `rgba(${r}, ${g}, ${b}, 0.2)`;
  };
  
  const getTextColor = (val: number, type: 'cashflow' | 'yield') => {
    if (type === 'cashflow') return val >= 0 ? 'text-emerald-400' : 'text-red-400';
    return val >= 3.5 ? 'text-emerald-400' : val >= 2.0 ? 'text-yellow-400' : 'text-red-400';
  };

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-slate-300 font-semibold flex items-center gap-2">
           Sensitivitäts-Analyse (Matrix)
           <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">Neu</span>
        </h3>
        <div className="flex bg-slate-800 rounded p-1">
           <button 
             onClick={() => setMetric('cashflow')}
             className={`px-2 py-1 text-xs rounded transition-colors ${metric === 'cashflow' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
           >
             Cashflow
           </button>
           <button 
             onClick={() => setMetric('yield')}
             className={`px-2 py-1 text-xs rounded transition-colors ${metric === 'yield' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
           >
             Rendite
           </button>
        </div>
      </div>
      
      <div className="min-w-[500px]">
        {/* X-Axis Label */}
        <div className="text-center text-xs text-slate-400 mb-1">Kaufpreis Veränderung</div>
        
        <div className="flex">
           {/* Y-Axis Label */}
           <div className="flex items-center justify-center w-8 -rotate-90 text-xs text-slate-400 shrink-0 whitespace-nowrap">
              Zins Veränderung
           </div>
           
           <table className="w-full border-collapse">
             <thead>
               <tr>
                 <th className="w-12"></th>
                 {priceVariations.map(p => (
                   <th key={p} className="p-2 text-xs text-slate-400 font-medium border-b border-white/5">
                     {p > 0 ? '+' : ''}{p}%
                   </th>
                 ))}
               </tr>
             </thead>
             <tbody>
               {matrix.map((row, rIdx) => (
                 <tr key={rIdx}>
                   <td className="p-2 text-xs text-slate-400 font-medium text-right pr-4 border-r border-white/5">
                     {rateVariations[rIdx] > 0 ? '+' : ''}{rateVariations[rIdx]}%
                   </td>
                   {row.map((cell, cIdx) => {
                     const isCenter = cell.priceDelta === 0 && cell.rateDelta === 0;
                     const val = metric === 'cashflow' ? cell.cashflow : cell.yield;
                     
                     return (
                       <td 
                         key={cIdx} 
                         className={`p-3 text-center border border-white/5 relative transition-all hover:scale-105 hover:z-10 hover:shadow-lg cursor-default ${isCenter ? 'ring-2 ring-indigo-500 z-10' : ''}`}
                         style={{ backgroundColor: getColor(val, metric) }}
                       >
                         {isCenter && <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-indigo-500 rounded-bl shadow"></div>}
                         <div className={`text-sm font-bold ${getTextColor(val, metric)}`}>
                           {metric === 'cashflow' ? formatCurrencyCompact(val) : formatPercent(val)}
                         </div>
                       </td>
                     );
                   })}
                 </tr>
               ))}
             </tbody>
           </table>
        </div>
      </div>
      <div className="mt-2 text-xs text-slate-500 text-center">
        Zeigt {metric === 'cashflow' ? 'monatlichen Netto-Cashflow (Jahr 1)' : 'Nettomietrendite'} bei abweichenden Marktbedingungen.
      </div>
    </div>
  );
};


interface DashboardProps {
  data: { yearlyResults: YearlyResult[], kpis: KPIResult };
  comparisonData: { yearlyResults: YearlyResult[], kpis: KPIResult } | null;
  proMode: boolean;
  viewMode: 'charts' | 'table';
  deal: Deal;
}

const formatCurrency = (val: number) => new Intl.NumberFormat('de-AT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);
const formatCurrencyCompact = (val: number) => new Intl.NumberFormat('de-AT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0, notation: 'compact' }).format(val);
const formatPercent = (val: number) => new Intl.NumberFormat('de-AT', { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 2 }).format(val / 100);
const formatNumber = (val: number) => new Intl.NumberFormat('de-AT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);

export const Dashboard: React.FC<DashboardProps> = ({ data, comparisonData, proMode, viewMode, deal }) => {
  const { kpis, yearlyResults } = data;
  const year1 = yearlyResults[0];

  // Calculate Average Cashflow Logic
  const totalMonths = yearlyResults.length * 12;
  const totalAccumulatedCashflow = yearlyResults[yearlyResults.length - 1].accumulatedCashflow;
  const avgMonthlyCashflow = totalAccumulatedCashflow / totalMonths;

  // Snapshot logic for the mini-table
  const snapshots = yearlyResults.filter(y => 
    y.year === 1 || 
    y.year === 2 ||
    y.year % 5 === 0 || 
    y.year === yearlyResults.length
  );
  // Deduplicate
  const uniqueSnapshots: YearlyResult[] = Array.from(new Set(snapshots));

  // Merge Data for Charts (A/B Test)
  const chartData = useMemo(() => {
    return yearlyResults.map((item, index) => {
      const compItem = comparisonData?.yearlyResults[index];
      return {
        ...item,
        // Comparison Data (Shadow)
        comp_propertyValue: compItem?.propertyValue,
        comp_remainingDebt: compItem?.remainingDebt,
        comp_equityInProperty: compItem?.equityInProperty,
        comp_cashflow: compItem?.cashflowPostTax
      };
    });
  }, [yearlyResults, comparisonData]);

  return (
    <div className="space-y-6">
      
      {/* KPI Grid - Always Visible */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* Cashflow Year 1 */}
        <KPICard 
          title="Monatlicher Cashflow (Jahr 1)" 
          value={formatCurrency(kpis.monthlyCashflowYear1PostTax)}
          subValue={`Vor Steuer: ${formatCurrency(kpis.monthlyCashflowYear1PreTax)}`}
          isPositive={kpis.monthlyCashflowYear1PostTax > 0}
          tooltip="Was jeden Monat im ersten Jahr nach allen Kosten und Steuern auf deinem Konto übrig bleibt."
        >
          <div className="space-y-1">
            <Row label="Kaltmiete + Stellplatz" val={year1.grossRent / 12} />
            <Row label="Leerstand" val={-year1.vacancyLoss / 12} />
            <Row label="Bewirtschaftung" val={-year1.operatingCosts / 12} />
            
            {proMode ? (
               <>
                 <div className="pl-2 border-l-2 border-slate-700 my-1 py-1 bg-slate-800/50 rounded-r">
                   <Row label="davon Zins" val={-year1.interestPayment / 12} highlight />
                   <Row label="davon Tilgung" val={-year1.principalPayment / 12} highlight />
                 </div>
                 <div className="flex justify-between text-slate-500 text-xs px-2 mb-1">
                    <span>= Annuität:</span>
                    <span>{formatCurrency(-year1.annuity/12)}</span>
                 </div>
               </>
            ) : (
               <Row label="Annuität (Bank)" val={-year1.annuity / 12} />
            )}
            
            <div className="border-t border-white/10 my-1 pt-1 font-bold flex justify-between">
              <span>Vor Steuer</span>
              <span>{formatCurrency(kpis.monthlyCashflowYear1PreTax)}</span>
            </div>
            <Row label="Steuer" val={-year1.taxAmount / 12} />
            <div className="border-t border-white/10 my-1 pt-1 font-bold flex justify-between text-emerald-400">
              <span>Nach Steuer</span>
              <span>{formatCurrency(kpis.monthlyCashflowYear1PostTax)}</span>
            </div>
          </div>
        </KPICard>

        {/* NEW: Average Cashflow Card */}
        <KPICard 
          title="Ø Cashflow (Laufzeit)" 
          value={formatCurrency(avgMonthlyCashflow)}
          subValue={`Gesamt: ${formatCurrencyCompact(totalAccumulatedCashflow)}`}
          isPositive={avgMonthlyCashflow > 0}
          tooltip="Der durchschnittliche monatliche Netto-Cashflow über die gesamte Haltedauer. Berücksichtigt Mietsteigerungen, sinkende Zinsen und Steuereffekte."
        >
          <div className="space-y-2">
            <p className="text-xs text-slate-400 mb-2">Entwicklung monatlich (Netto):</p>
            <table className="w-full text-xs text-right text-slate-300">
              <thead>
                  <tr className="text-slate-500 border-b border-white/10">
                    <th className="text-left py-1">Jahr</th>
                    <th className="py-1">Vor Steuer</th>
                    <th className="py-1">Nach Steuer</th>
                  </tr>
              </thead>
              <tbody>
                  {uniqueSnapshots.map(s => (
                    <tr key={s.year} className="border-b border-white/5 last:border-0 hover:bg-white/5">
                        <td className="text-left py-1 text-white font-medium">J{s.year}</td>
                        <td className="py-1 text-slate-400">{formatCurrency(s.cashflowPreTax/12)}</td>
                        <td className={`py-1 font-medium ${s.cashflowPostTax > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {formatCurrency(s.cashflowPostTax/12)}
                        </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </KPICard>

        {/* Yield Card */}
        <KPICard 
          title="Nettomietrendite" 
          value={formatPercent(kpis.netYield)}
          subValue={`Brutto: ${formatPercent(kpis.grossYield)}`}
          isPositive={kpis.netYield > 3.0}
          tooltip="Verhältnis Reinertrag zu Gesamtinvestitionskosten."
        >
           <div className="space-y-2 text-xs text-slate-400">
             <div className="flex justify-between border-t border-white/5 pt-1 mt-1">
               <span>Gesamtinvestition:</span>
               <span>{formatCurrency(kpis.totalInvestment / (1 - (data.yearlyResults[0].equityInProperty / data.yearlyResults[0].propertyValue)))} (ca.)</span>
             </div>
           </div>
        </KPICard>

        {/* Wealth Accumulation */}
        <KPICard 
          title="Vermögenszuwachs" 
          value={formatCurrency(kpis.endWealthRealEstate - kpis.totalInvestment)}
          subValue={`Endvermögen: ${formatCurrencyCompact(kpis.endWealthRealEstate)}`}
          isPositive={true}
          tooltip="Gewinn nach Verkauf (Immobilienwert - Restschuld + Cashflows - Investition)."
        />

        {/* ROI / CAGR */}
        <KPICard 
          title="EK-Rendite (CAGR)" 
          value={formatPercent(kpis.totalEquityReturnCAGR)}
          subValue={`Einsatz: ${formatCurrencyCompact(year1.investedCapital)}`} // Start cap
          isPositive={kpis.totalEquityReturnCAGR > 6}
          tooltip="Jährliche Durchschnittsrendite auf das eingesetzte Eigenkapital."
        />
        
        {/* Invest Requirement */}
        <KPICard 
          title="Cash-to-Close" 
          value={formatCurrency(kpis.totalInvestment)}
          isPositive={undefined}
          tooltip="Sofort benötigtes Eigenkapital (inkl. Kaufnebenkosten)."
        />

        {proMode && (
           <>
            <KPICard 
               title="Interner Zinsfuß (IRR)" 
               value={kpis.totalEquityReturnIRR ? formatPercent(kpis.totalEquityReturnIRR) : "N/A"}
               tooltip="Zeitgewichtete Rendite."
            />
            <KPICard 
               title="DSCR (Jahr 1)" 
               value={formatNumber(kpis.dscr)}
               subValue={kpis.dscr > 1.2 ? "OK" : "Kritisch"}
               isPositive={kpis.dscr > 1.2}
               tooltip="Deckungsgrad: Kann die Miete die Bankrate bezahlen? > 1.2 ist gut."
            />
           </>
        )}
      </div>

      {viewMode === 'charts' ? (
        /* Charts View */
        <div className="grid grid-cols-1 gap-6 mt-8 animate-in fade-in duration-300">
          
          {comparisonData && (
             <div className="bg-slate-800/50 border border-white/10 rounded-lg p-3 flex items-center gap-3">
                <Split size={20} className="text-slate-400" />
                <div className="text-sm">
                   <span className="text-slate-300 font-medium">Vergleichs-Modus Aktiv:</span>
                   <span className="text-slate-500 ml-1">Farbige Flächen = Aktuell (B), Graue Linien = Gespeichert (A).</span>
                </div>
             </div>
          )}

          {/* Sensitivity Matrix */}
          <div className="bg-dashboardLight rounded-xl p-4 shadow-lg border border-white/5">
             <SensitivityHeatmap deal={deal} />
          </div>

          {/* Chart 1: Asset vs Debt */}
          <div className="bg-dashboardLight rounded-xl p-4 shadow-lg border border-white/5">
            <h3 className="text-slate-300 font-semibold mb-4">Vermögensstruktur</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorDebt" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="year" stroke="#94a3b8" />
                  <YAxis hide stroke="#94a3b8" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9' }}
                    formatter={(val: number, name: string) => {
                       if (name.includes("comp_")) return [formatCurrency(val), "Vergleich (A)"];
                       return [formatCurrency(val), name];
                    }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="propertyValue" name="Immobilienwert" stroke="#10b981" fillOpacity={1} fill="url(#colorValue)" />
                  <Area type="monotone" dataKey="remainingDebt" name="Restschuld" stroke="#ef4444" fillOpacity={1} fill="url(#colorDebt)" />
                  
                  {/* COMPARISON SHADOW LINES */}
                  {comparisonData && (
                    <>
                      <Line type="monotone" dataKey="comp_propertyValue" name="Wert (A)" stroke="#94a3b8" strokeDasharray="5 5" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="comp_remainingDebt" name="Schuld (A)" stroke="#64748b" strokeDasharray="5 5" strokeWidth={2} dot={false} />
                    </>
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Net Wealth vs ETF */}
          <div className="bg-dashboardLight rounded-xl p-4 shadow-lg border border-white/5">
            <h3 className="text-slate-300 font-semibold mb-4">Nettovermögen vs ETF</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="year" stroke="#94a3b8" />
                  <YAxis hide stroke="#94a3b8" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9' }} 
                    formatter={(val: number, name: string) => {
                       if (name === "comp_equityInProperty") return [formatCurrency(val), "Immo (A)"];
                       return [formatCurrency(val), name];
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="equityInProperty" name="Immo Nettovermögen" stroke="#10b981" strokeWidth={3} dot={false} />
                  <Line type="monotone" dataKey="etfValue" name="ETF Alternative" stroke="#3b82f6" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                  
                  {/* COMPARISON SHADOW LINE */}
                  {comparisonData && (
                    <Line type="monotone" dataKey="comp_equityInProperty" name="Immo (A)" stroke="#94a3b8" strokeDasharray="5 5" strokeWidth={2} dot={false} />
                  )}
                  
                  <Line type="monotone" dataKey="investedCapital" name="Investiertes Kapital" stroke="#64748b" strokeWidth={1} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pro Chart: Cashflow Trend */}
          {proMode && (
            <div className="bg-dashboardLight rounded-xl p-4 shadow-lg border border-white/5">
              <h3 className="text-slate-300 font-semibold mb-4">Cashflow Entwicklung (Pro)</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="year" stroke="#94a3b8" />
                    <YAxis hide stroke="#94a3b8" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9' }} 
                      formatter={(val: number) => formatCurrency(val)}
                    />
                    <ReferenceLine y={0} stroke="#64748b" />
                    <Legend />
                    <Bar dataKey="cashflowPostTax" name="Cashflow (nach Steuer)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Table View */
        <div className="mt-8 bg-dashboardLight rounded-xl border border-white/5 overflow-hidden shadow-lg animate-in fade-in duration-300">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-400 uppercase bg-slate-900 border-b border-white/10">
                <tr>
                  <th className="px-4 py-3 sticky left-0 bg-slate-900 z-10">Jahr</th>
                  <th className="px-4 py-3 text-right">Miete (eff.)</th>
                  <th className="px-4 py-3 text-right">Kosten</th>
                  <th className="px-4 py-3 text-right text-red-300">Zins</th>
                  <th className="px-4 py-3 text-right text-emerald-300">Tilgung</th>
                  <th className="px-4 py-3 text-right font-bold text-slate-300">CF Brutto</th>
                  <th className="px-4 py-3 text-right">Steuer</th>
                  <th className="px-4 py-3 text-right font-bold">CF Netto</th>
                  <th className="px-4 py-3 text-right text-slate-500">Restschuld</th>
                  <th className="px-4 py-3 text-right text-slate-500">Immo-Wert</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {yearlyResults.map((row) => (
                  <tr key={row.year} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 font-medium text-white sticky left-0 bg-dashboardLight group-hover:bg-slate-800">{row.year}</td>
                    <td className="px-4 py-3 text-right font-mono">{formatCurrencyCompact(row.grossRent - row.vacancyLoss)}</td>
                    <td className="px-4 py-3 text-right font-mono text-slate-500">-{formatCurrencyCompact(row.operatingCosts)}</td>
                    <td className="px-4 py-3 text-right font-mono text-red-400">-{formatCurrencyCompact(row.interestPayment)}</td>
                    <td className="px-4 py-3 text-right font-mono text-emerald-400">-{formatCurrencyCompact(row.principalPayment)}</td>
                    <td className={`px-4 py-3 text-right font-bold font-mono ${row.cashflowPreTax > 0 ? 'text-slate-300' : 'text-red-300'}`}>
                      {formatCurrencyCompact(row.cashflowPreTax)}
                    </td>
                    <td className={`px-4 py-3 text-right font-mono ${row.taxAmount > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                      {row.taxAmount > 0 ? '-' : '+'}{formatCurrencyCompact(Math.abs(row.taxAmount))}
                    </td>
                    <td className={`px-4 py-3 text-right font-bold font-mono ${row.cashflowPostTax > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {formatCurrency(row.cashflowPostTax)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-500">{formatCurrencyCompact(row.remainingDebt)}</td>
                    <td className="px-4 py-3 text-right font-mono text-slate-500">{formatCurrencyCompact(row.propertyValue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-2 text-xs text-center text-slate-500 bg-slate-900/50">
             Scrollen für mehr Details
          </div>
        </div>
      )}

    </div>
  );
};

const Row: React.FC<{ label: string; val: number; highlight?: boolean }> = ({ label, val, highlight }) => (
  <div className={`flex justify-between ${highlight ? 'text-slate-200' : 'text-slate-300'}`}>
    <span>{label}</span>
    <span>{formatCurrency(val)}</span>
  </div>
);