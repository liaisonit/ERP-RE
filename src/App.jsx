'use client';

import React, { useState } from 'react';
import {
  TrendingUp, Zap, RefreshCw, Briefcase, PieChart,
  Activity, ChevronsDown, Sparkles, ShieldCheck, Map, Target, Download
} from 'lucide-react';

// -------------------- UTILS --------------------
const formatCurrency = (val) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(val);

// -------------------- PDF --------------------
const generateReport = (title, value) => {
  const w = window.open('', '_blank');

  w.document.write(`
  <html>
  <head>
    <title>${title}</title>
    <style>
      body { font-family: Inter, sans-serif; margin:0; }
      .header { background:#065f46; color:white; padding:60px; }
      .logo { height:70px; margin-bottom:20px; }
      .content { padding:40px 60px; }
      .footer {
        padding:30px 60px;
        border-top:1px solid #eee;
        font-size:14px;
        color:#555;
      }
      .big { font-size:36px; margin-top:20px; }
    </style>
  </head>
  <body>
    <div class="header">
      <img class="logo" src="https://static.wixstatic.com/media/c12706_95ffde7d7fdf43fcb12e87a36b56eef6~mv2.png"/>
      <h4>WEALTH PROJECTION BLUEPRINT</h4>
      <h1>${title}</h1>
    </div>

    <div class="content">
      <p class="big">${value}</p>
    </div>

    <div class="footer">
      Ask Geo Financial Services<br/>
      www.askgeo.in | +91 99606 24271
    </div>
  </body>
  </html>
  `);

  w.document.close();
};

// -------------------- TABS --------------------
const BASIC = [
  { id: 'sip', name: 'SIP Pro', icon: TrendingUp },
  { id: 'stepup', name: 'Step-Up SIP', icon: Zap },
  { id: 'lumpsum', name: 'Lumpsum', icon: Briefcase },
  { id: 'goal', name: 'Goal Planner', icon: Target },
];

const ADVANCED = [
  { id: 'stp', name: 'STP to SIP', icon: RefreshCw },
  { id: 'emivssip', name: 'EMI vs SIP', icon: PieChart },
  { id: 'emimatch', name: 'EMI Match SIP', icon: Activity },
  { id: 'prepay', name: 'EMI Prepayment', icon: ChevronsDown },
  { id: 'smartemi', name: 'Zero-Cost EMI', icon: Sparkles },
  { id: 'closure', name: 'Early Debt Freedom', icon: ShieldCheck },
  { id: 'fire', name: 'FIRE Target', icon: Map },
];

// -------------------- MAIN --------------------
export default function Calculators() {
  const [mode, setMode] = useState('basic');
  const [active, setActive] = useState('sip');

  const tabs = mode === 'basic' ? BASIC : ADVANCED;

  return (
    <div className="p-10 bg-zinc-50">

      {/* MODE SWITCH */}
      <div className="flex gap-2 mb-6">
        {['basic','advanced'].map(m => (
          <button
            key={m}
            onClick={()=>setMode(m)}
            className={`px-4 py-2 rounded-xl text-sm ${
              mode===m ? 'bg-emerald-600 text-white' : 'bg-white border'
            }`}
          >
            {m.toUpperCase()}
          </button>
        ))}
      </div>

      {/* TOOL TABS */}
      <div className="flex flex-wrap gap-3 mb-10">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={()=>setActive(t.id)}
            className={`px-4 py-2 rounded-xl text-sm flex gap-2 items-center ${
              active===t.id ? 'bg-emerald-600 text-white' : 'bg-white border'
            }`}
          >
            <t.icon size={16}/>
            {t.name}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      {active === 'sip' && <Sip />}
      {active === 'emimatch' && <EmiMatch />}
      {active === 'smartemi' && <SmartEmi />}
      {active === 'closure' && <Closure />}
      {active === 'stp' && <STP />}
    </div>
  );
}

// -------------------- COMMON RIGHT CARD --------------------
const ResultCard = ({ title, value, reportTitle }) => (
  <div className="bg-emerald-950 p-8 rounded-3xl text-white">
    <p className="text-sm text-emerald-300">{title}</p>
    <h2 className="text-4xl mt-2">{formatCurrency(value)}</h2>

    <button
      onClick={()=>generateReport(reportTitle, formatCurrency(value))}
      className="mt-6 bg-emerald-500 px-4 py-3 rounded-xl flex gap-2"
    >
      <Download size={16}/> Download Report
    </button>
  </div>
);

// -------------------- SIP --------------------
const Sip = () => {
  const sip = 25000, years = 15, rate = 12;
  const r = rate/12/100, n = years*12;
  const fv = sip*((Math.pow(1+r,n)-1)/r)*(1+r);

  return (
    <div className="grid grid-cols-2 gap-10">
      <div>Inputs</div>
      <ResultCard title="Future Value" value={fv} reportTitle="SIP Report"/>
    </div>
  );
};

// -------------------- EMI MATCH --------------------
const EmiMatch = () => {
  const emi = 25000, months = 36, r = 12/12/100;
  const fv = emi*((Math.pow(1+r,months)-1)/r)*(1+r);

  return (
    <div className="grid grid-cols-2 gap-10">
      <div>Inputs</div>
      <ResultCard title="If invested instead" value={fv} reportTitle="EMI Match"/>
    </div>
  );
};

// -------------------- ZERO COST EMI --------------------
const SmartEmi = () => {
  const loan = 5000000;
  const interest = 2000000;
  const total = loan + interest;

  return (
    <div className="grid grid-cols-2 gap-10">
      <div>Inputs</div>
      <ResultCard title="Recover Full Loan Cost" value={total} reportTitle="Loan Recovery"/>
    </div>
  );
};

// -------------------- EARLY CLOSURE --------------------
const Closure = () => {
  const required = 3000000;

  return (
    <div className="grid grid-cols-2 gap-10">
      <div>Inputs</div>
      <ResultCard title="Closure Corpus Required" value={required} reportTitle="Closure"/>
    </div>
  );
};

// -------------------- STP --------------------
const STP = () => {
  const monthly = 20000;
  const months = 24;
  const r = 12/12/100;

  const fv = monthly*((Math.pow(1+r,months)-1)/r)*(1+r);

  return (
    <div className="grid grid-cols-2 gap-10">
      <div>Inputs</div>
      <ResultCard title="Projected SIP Value" value={fv} reportTitle="STP to SIP"/>
    </div>
  );
};
