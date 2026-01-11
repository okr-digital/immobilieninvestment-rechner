import React, { useState, useEffect, useMemo } from 'react';
import { Deal, ScenarioType } from './types';
import { DEFAULT_DEAL, PRESETS } from './constants';
import { calculateDeal } from './services/calculationEngine';
import { Accordion, InputField, Toggle } from './components/InputComponents';
import { Dashboard } from './components/Dashboard';
import { TrafficLight } from './components/TrafficLight';
import { Calculator, Save, RotateCcw, HelpCircle, BarChart3, Table as TableIcon, LayoutDashboard, Copy, Trash2 } from 'lucide-react';

const formatCurrency = (val: number) => new Intl.NumberFormat('de-AT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);
const formatCurrencyCompact = (val: number) => new Intl.NumberFormat('de-AT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0, notation: 'compact' }).format(val);

export default function App() {
  const [deal, setDeal] = useState<Deal>(() => {
    const saved = localStorage.getItem('immo-deal');
    // Migration: If saved deal doesn't have loanTermYears, set default
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Merge parsed data with DEFAULT_DEAL to ensure all fields exist
        return { ...DEFAULT_DEAL, ...parsed };
      } catch (e) {
        return DEFAULT_DEAL;
      }
    }
    return DEFAULT_DEAL;
  });

  const [comparisonDeal, setComparisonDeal] = useState<Deal | null>(null);
  const [proMode, setProMode] = useState(false);
  const [viewMode, setViewMode] = useState<'charts' | 'table'>('charts');
  
  // Calculate results on every deal change
  const results = useMemo(() => calculateDeal(deal), [deal]);
  
  // Calculate comparison results if comparison deal exists
  const comparisonResults = useMemo(() => comparisonDeal ? calculateDeal(comparisonDeal) : null, [comparisonDeal]);

  useEffect(() => {
    localStorage.setItem('immo-deal', JSON.stringify(deal));
  }, [deal]);

  const updateDeal = (field: keyof Deal, value: any) => {
    setDeal(prev => ({ ...prev, [field]: value }));
  };

  const applyPreset = (presetKey: string) => {
    setDeal(prev => ({ ...prev, ...PRESETS[presetKey] }));
  };

  const handleReset = () => {
    if (confirm('Möchtest du wirklich alle Eingaben zurücksetzen?')) {
      setDeal({ ...DEFAULT_DEAL });
    }
  };

  const toggleComparison = () => {
    if (comparisonDeal) {
      setComparisonDeal(null);
    } else {
      setComparisonDeal({ ...deal });
    }
  };

  return (
    <div className="min-h-screen lg:h-screen flex flex-col lg:flex-row font-sans text-slate-800 lg:overflow-hidden relative">
      
      {/* LEFT COLUMN: Inputs (50% on Large Screens, Stacked on Mobile) */}
      <aside className="w-full lg:w-1/2 bg-paper border-r border-slate-200 flex flex-col lg:h-full">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 bg-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <div className="bg-[#0052CC] text-white p-1 rounded">
               <Calculator size={20} />
            </div>
            <div className="font-bold text-xl tracking-tight leading-none">
              <span className="text-slate-900">OKR</span><span className="text-[#0052CC]">.digital</span>
            </div>
          </div>
          <div className="flex gap-2">
            
            {/* COMPARISON BUTTON */}
            <button 
              onClick={toggleComparison} 
              title={comparisonDeal ? "Vergleich löschen" : "Aktuellen Stand als Vergleich (A) setzen"} 
              className={`p-2 rounded transition-colors flex items-center gap-1 text-xs font-medium ${comparisonDeal ? 'bg-indigo-100 text-indigo-700 hover:bg-red-100 hover:text-red-600' : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-100'}`}
            >
              {comparisonDeal ? <Trash2 size={18} /> : <Copy size={18} />}
              <span className="hidden sm:inline">{comparisonDeal ? 'Vergleich lösen' : 'Vergleich (A)'}</span>
            </button>
            
            <div className="w-px h-6 bg-slate-200 mx-1"></div>

            <button onClick={handleReset} title="Reset" className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded transition-colors"><RotateCcw size={18} /></button>
            <button title="Save" className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded transition-colors"><Save size={18} /></button>
          </div>
        </div>

        {/* Scrollable Inputs */}
        <div className="flex-1 lg:overflow-y-auto p-4 space-y-2 pb-24">
          
          <div className="flex gap-2 mb-4">
             {Object.keys(PRESETS).map(key => (
               <button 
                key={key} 
                onClick={() => applyPreset(key)}
                className="flex-1 py-1 px-2 text-xs font-medium border border-slate-200 bg-white text-slate-600 rounded hover:border-indigo-300 hover:text-indigo-600 transition-colors shadow-sm"
               >
                 {key}
               </button>
             ))}
          </div>

          <Accordion title="1. Objektdaten" defaultOpen={true}>
            <InputField label="Kaufpreis" value={deal.purchasePrice} onChange={(v) => updateDeal('purchasePrice', v)} unit="€" step={1000} />
            <div className="flex gap-3">
              <InputField label="Wohnfläche" value={deal.sizeSqm} onChange={(v) => updateDeal('sizeSqm', v)} unit="m²" />
              <InputField label="Stellplatz Miete" value={deal.parkingRentMonthly} onChange={(v) => updateDeal('parkingRentMonthly', v)} unit="€" />
            </div>
            <InputField label="Kaltmiete (monatlich)" value={deal.coldRentMonthly} onChange={(v) => updateDeal('coldRentMonthly', v)} unit="€" />
            <InputField label="Mietsteigerung p.a." value={deal.rentIncreasePercent} onChange={(v) => updateDeal('rentIncreasePercent', v)} unit="%" step={0.1} />
          </Accordion>

          <Accordion title="2. Kaufnebenkosten & Sanierung">
             <div className="grid grid-cols-2 gap-3">
               <InputField label="Grunderwerbsteuer" value={deal.taxPercent} onChange={(v) => updateDeal('taxPercent', v)} unit="%" step={0.1} />
               <InputField label="Grundbuch" value={deal.registryPercent} onChange={(v) => updateDeal('registryPercent', v)} unit="%" step={0.1} />
               <InputField label="Notar" value={deal.notaryPercent} onChange={(v) => updateDeal('notaryPercent', v)} unit="%" step={0.1} />
               <InputField label="Makler" value={deal.agentPercent} onChange={(v) => updateDeal('agentPercent', v)} unit="%" step={0.1} />
             </div>
             <InputField label="Sanierung / Capex" value={deal.capex} onChange={(v) => updateDeal('capex', v)} unit="€" step={500} />
          </Accordion>

          <Accordion title="3. Finanzierung" defaultOpen={true}>
            <InputField label="Eigenkapital" value={deal.equityAmount} onChange={(v) => updateDeal('equityAmount', v)} unit="€" step={1000} />
            <div className="flex gap-3">
              <InputField label="Zinssatz (Nominal)" value={deal.interestRate} onChange={(v) => updateDeal('interestRate', v)} unit="%" step={0.1} />
              <InputField label="Kreditlaufzeit" value={deal.loanTermYears} onChange={(v) => updateDeal('loanTermYears', v)} unit="Jahre" step={1} min={1} max={40} />
            </div>
            <div className="mt-2 space-y-2">
               <Toggle label="Nebenkosten finanzieren?" checked={deal.financeCosts} onChange={(v) => updateDeal('financeCosts', v)} />
               <Toggle label="Sanierung finanzieren?" checked={deal.financeCapex} onChange={(v) => updateDeal('financeCapex', v)} />
            </div>
          </Accordion>

          <Accordion title="4. Laufende Kosten">
            <p className="text-xs text-slate-500 mb-2">Nur Kosten, die <strong>nicht</strong> auf den Mieter umlegbar sind.</p>
            <div className="flex gap-3">
               <InputField 
                 label="Verwaltung" 
                 value={deal.adminCostMonthly} 
                 onChange={(v) => updateDeal('adminCostMonthly', v)} 
                 unit="€/Mo" 
                 tooltip="Nur Sondereigentumsverwaltung (Mietverwaltung). Die Gebäudeverwaltung zahlt i.d.R. der Mieter."
               />
               <InputField 
                 label="Leerstand" 
                 value={deal.vacancyPercent} 
                 onChange={(v) => updateDeal('vacancyPercent', v)} 
                 unit="%" 
                 tooltip="Standardrisiko in AT ca. 2-4%. Entspricht ca. 2 Wochen pro Jahr."
               />
            </div>
            <div className="flex gap-3">
               <InputField 
                 label="Instandhaltung" 
                 value={deal.maintenanceCostMonthly} 
                 onChange={(v) => updateDeal('maintenanceCostMonthly', v)} 
                 unit="€/m²" 
                 tooltip="Reparaturen innerhalb der Wohnung (Therme, Böden, etc.), die der Eigentümer zahlt."
               />
               <InputField 
                 label="Rücklage" 
                 value={deal.reserveCostMonthly} 
                 onChange={(v) => updateDeal('reserveCostMonthly', v)} 
                 unit="€/m²" 
                 tooltip="Gesetzliche Mindestdotierung in AT seit 2022: 0,90 €/m². Bei Altbau oft höher."
               />
            </div>
            <InputField label="Kostensteigerung p.a." value={deal.costIncreasePercent} onChange={(v) => updateDeal('costIncreasePercent', v)} unit="%" step={0.1} />
          </Accordion>

          <Accordion title="5. Steuern & Exit">
            <InputField label="Grenzsteuersatz" value={deal.personalTaxRate} onChange={(v) => updateDeal('personalTaxRate', v)} unit="%" />
            <div className="flex gap-3">
              <InputField label="AfA Satz" value={deal.afaPercent} onChange={(v) => updateDeal('afaPercent', v)} unit="%" step={0.1} />
              <InputField label="Gebäudeanteil" value={deal.buildingSharePercent} onChange={(v) => updateDeal('buildingSharePercent', v)} unit="%" />
            </div>
            <div className="my-4 border-t border-slate-200 pt-4">
              <label className="text-sm font-semibold text-slate-700 mb-2 block">Exit Szenario</label>
              <InputField label="Haltedauer" value={deal.holdingPeriodYears} onChange={(v) => updateDeal('holdingPeriodYears', v)} unit="Jahre" max={40} min={5} />
              <InputField label="Wertsteigerung Immo p.a." value={deal.appreciationPercent} onChange={(v) => updateDeal('appreciationPercent', v)} unit="%" step={0.1} />
            </div>
          </Accordion>
          
          <Accordion title="6. Benchmark (ETF)">
             <InputField label="ETF Rendite p.a." value={deal.etfReturnPercent} onChange={(v) => updateDeal('etfReturnPercent', v)} unit="%" step={0.1} />
             <InputField label="KESt (Kapitalertragst.)" value={deal.etfTaxPercent} onChange={(v) => updateDeal('etfTaxPercent', v)} unit="%" step={0.1} />
          </Accordion>

          <div className="pt-8 text-xs text-slate-400 text-center pb-4">
             <p>Alle Angaben ohne Gewähr. Keine Anlageberatung.</p>
             <p>Modellierung für den österreichischen Markt.</p>
          </div>
        </div>
      </aside>

      {/* MOBILE STICKY FOOTER */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-dashboard border-t border-white/10 p-4 shadow-2xl z-50 flex justify-between items-center text-white safe-pb">
        <div>
          <div className="text-xs text-slate-400">Cashflow / Mo</div>
          <div className={`font-bold text-lg ${results.kpis.monthlyCashflowYear1PostTax > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {formatCurrency(results.kpis.monthlyCashflowYear1PostTax)}
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-400">Invest (EK)</div>
          <div className="font-bold text-lg text-white">
            {formatCurrencyCompact(results.kpis.totalInvestment)}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Dashboard (Remaining 50%) */}
      <main className="w-full lg:w-1/2 bg-dashboard flex flex-col lg:h-full">
        {/* Top Bar */}
        <header className="p-4 bg-dashboardLight border-b border-white/5 shrink-0 flex flex-col md:flex-row justify-between items-center text-white shadow-md gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto justify-between">
             <TrafficLight kpis={results.kpis} etfReturn={deal.etfReturnPercent} />
             {/* Mobile only toggle placement could go here, but stick to right side for now */}
          </div>
          
          <div className="flex items-center gap-4">
             {/* View Switcher */}
             <div className="flex bg-slate-700/50 p-1 rounded-lg">
                <button 
                  onClick={() => setViewMode('charts')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${viewMode === 'charts' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                >
                  <LayoutDashboard size={16} />
                  <span className="hidden sm:inline">Charts</span>
                </button>
                <button 
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${viewMode === 'table' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                >
                  <TableIcon size={16} />
                  <span className="hidden sm:inline">Tabelle</span>
                </button>
             </div>

             <div className="h-6 w-px bg-white/10 mx-2"></div>

             <div className="flex items-center gap-2">
               <span className="text-sm text-slate-300">Pro</span>
               <Toggle label="" checked={proMode} onChange={setProMode} />
             </div>
          </div>
        </header>
        
        {/* Dashboard Content */}
        <div className="flex-1 lg:overflow-y-auto p-4 md:p-8 dashboard-scroll">
           <Dashboard data={results} comparisonData={comparisonResults} proMode={proMode} viewMode={viewMode} deal={deal} />
        </div>
      </main>
    </div>
  );
}