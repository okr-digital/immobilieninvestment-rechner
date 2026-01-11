import React from 'react';
import { KPIResult } from '../types';

export const TrafficLight: React.FC<{ kpis: KPIResult, etfReturn: number }> = ({ kpis, etfReturn }) => {
  const checks = [
    { label: 'Cashflow Positiv', pass: kpis.monthlyCashflowYear1PostTax > 0 },
    { label: 'Rendite > 3.5%', pass: kpis.netYield > 3.5 },
    { label: 'Schlägt ETF', pass: kpis.totalEquityReturnCAGR > etfReturn }
  ];

  const score = checks.filter(c => c.pass).length;
  
  let color = 'bg-red-500';
  let text = 'Risikoreich';
  if (score === 2) { color = 'bg-yellow-500'; text = 'Solide'; }
  if (score === 3) { color = 'bg-green-500'; text = 'Top Deal'; }

  return (
    <div className="flex items-center space-x-3 bg-white/10 p-2 rounded-lg">
      <div className={`h-3 w-3 rounded-full ${color} shadow-[0_0_8px_rgba(255,255,255,0.5)]`} />
      <span className="text-white font-medium text-sm">{text}</span>
      <div className="hidden md:flex space-x-1">
        {checks.map((c, i) => (
          <div key={i} className={`h-1.5 w-4 rounded-full ${c.pass ? 'bg-green-500' : 'bg-white/20'}`} title={c.label} />
        ))}
      </div>
    </div>
  );
};