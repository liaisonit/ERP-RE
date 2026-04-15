import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Building, LayoutDashboard, IndianRupee, Users, 
  FileText, CheckCircle, Clock, ShieldCheck,
  Download, CreditCard, Lock, Phone, Filter, 
  Bell, Search, FileSpreadsheet, AlertTriangle, 
  Sparkles, BrainCircuit, ChevronRight, Bot, 
  Wand2, TrendingUp, X, HardHat, ClipboardList, 
  Truck, Hammer, Box, Send, Plus, Mail, ArrowRight, 
  Image as ImageIcon, HelpCircle
} from 'lucide-react';

// --- CUSTOM ANIMATION STYLES ---
const customStyles = `
  @keyframes slideUpFade {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes slideRightFade {
    from { opacity: 0; transform: translateX(20px); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes scalePop {
    0% { opacity: 0; transform: scale(0.92); }
    60% { transform: scale(1.02); }
    100% { opacity: 1; transform: scale(1); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  .anim-slide-up { animation: slideUpFade 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
  .anim-slide-right { animation: slideRightFade 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
  .anim-scale-pop { animation: scalePop 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
  .anim-fade-in { animation: fadeIn 0.3s ease-out forwards; opacity: 0; }
  
  .stagger-1 { animation-delay: 40ms; }
  .stagger-2 { animation-delay: 80ms; }
  .stagger-3 { animation-delay: 120ms; }
  .stagger-4 { animation-delay: 160ms; }
  .stagger-5 { animation-delay: 200ms; }
`;

// --- INITIAL STATE DATA ---
const generateInitialUnits = () => {
  const units = [];
  for (let floor = 1; floor <= 6; floor++) {
    for (let unitNum = 1; unitNum <= 4; unitNum++) {
      const is3BHK = unitNum === 1 || unitNum === 4;
      units.push({
        id: `A-${floor}0${unitNum}`,
        unit_number: `${floor}0${unitNum}`,
        floor: floor,
        type: is3BHK ? '3BHK' : '2BHK',
        carpet_area: is3BHK ? 1150 : 850,
        base_rate: 9500,
        status: floor === 1 ? (unitNum === 1 ? 'Booked' : 'Blocked') : 'Available',
        customer: floor === 1 && unitNum === 1 ? 'Rahul Sharma' : (floor === 1 && unitNum === 2 ? 'Sneha Patil' : null),
        token_amount: floor === 1 && unitNum === 1 ? 500000 : (floor === 1 && unitNum === 2 ? 100000 : 0),
        ai_insight: floor > 4 ? "High demand floor. 2% premium recommended." : "Standard pricing optimized."
      });
    }
  }
  return units;
};

const initialLeads = [
  { id: 'L-1001', name: 'Vikram Desai', phone: '+91 9876543210', source: 'Meta Ads', budget: '1.2 Cr', status: 'New', ai_score: 92, ai_action: "High intent. Call immediately." },
  { id: 'L-1002', name: 'Priya Rajan', phone: '+91 9876543211', source: 'Website', budget: '1.5 Cr', status: 'Contacted', ai_score: 65, ai_action: "Send virtual tour link." },
  { id: 'L-1003', name: 'Amit Singh', phone: '+91 9876543212', source: '99acres', budget: '90 L', status: 'Site Visit', ai_score: 88, ai_action: "Follow up on cost sheet." },
  { id: 'L-1004', name: 'Neha Gupta', phone: '+91 9876543213', source: 'Referral', budget: '2 Cr', status: 'Negotiation', ai_score: 95, ai_action: "Ready to close. Approve 1% discount." },
];

const initialDemands = [
  { id: 'D-501', unitId: 'A-101', customer: 'Rahul Sharma', amount: 1500000, milestone: 'Plinth Completion', dueDate: '2026-04-10', status: 'Overdue', ai_risk: 'High (85%)' },
  { id: 'D-502', unitId: 'A-101', customer: 'Rahul Sharma', amount: 200000, milestone: 'GST (Plinth)', dueDate: '2026-04-10', status: 'Overdue', ai_risk: 'High (85%)' },
  { id: 'D-503', unitId: 'A-201', customer: 'Anjali Verma', amount: 1500000, milestone: 'Plinth Completion', dueDate: '2026-04-20', status: 'Pending', ai_risk: 'Low (12%)' },
];

const initialBoqState = [
  { id: 'BQ-001', category: 'Steel', item: 'TMT 500D FE', uom: 'MT', est_qty: 1500, act_qty: 620, est_rate: 65000, act_rate: 64200, status: 'On Track', ai_pred: "Stock sufficient for next 45 days." },
  { id: 'BQ-002', category: 'Cement', item: 'OPC 53 Grade', uom: 'Bags', est_qty: 50000, act_qty: 12500, est_rate: 380, act_rate: 395, status: 'Over Budget', ai_pred: "Price rally detected. Lock vendor rates." },
  { id: 'BQ-003', category: 'Masonry', item: 'AAC Blocks', uom: 'CUM', est_qty: 8000, act_qty: 1200, est_rate: 3200, act_rate: 3200, status: 'On Track', ai_pred: "Optimal consumption matching timeline." },
];

const ROLES = {
  PRE_SALES: 'Pre-Sales (SDR)',
  SALES: 'Sales Executive',
  CRM: 'Post-Sales / CRM',
  FINANCE: 'Finance & Legal',
  OPS: 'Project Operations',
  MANAGEMENT: 'CXO / Management',
  CUSTOMER: 'Customer (External)'
};

export default function OPERP() {
  const [role, setRole] = useState(ROLES.MANAGEMENT);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [aiEnabled, setAiEnabled] = useState(true);
  
  // App State
  const [units, setUnits] = useState(generateInitialUnits());
  const [leads, setLeads] = useState(initialLeads);
  const [demands, setDemands] = useState(initialDemands);
  const [boq, setBoq] = useState(initialBoqState);
  const [selectedUnit, setSelectedUnit] = useState(null);
  
  // Form States
  const [customerName, setCustomerName] = useState('');
  const [tokenAmount, setTokenAmount] = useState('');
  
  // Modals & Chat States
  const [showCopilot, setShowCopilot] = useState(false);
  const [copilotInput, setCopilotInput] = useState('');
  const [copilotMsgs, setCopilotMsgs] = useState([
    { role: 'ai', text: "Hello! I'm your ERP Copilot. I have deep context into the inventory matrix, finance queue, and Ops BOQ. How can I assist?" }
  ]);
  const chatEndRef = useRef(null);

  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [newLeadData, setNewLeadData] = useState({ name: '', phone: '', budget: '', source: 'Walk-in' });

  const [selectedEmailLead, setSelectedEmailLead] = useState(null);
  
  // Transfer Material State
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferData, setTransferData] = useState({ boqId: 'BQ-002', qty: '', site: 'OP Tech-Park (Kharadi)' });

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [copilotMsgs]);

  // --- ACTIONS ---
  const handleSelectUnit = (unit) => {
    setSelectedUnit(unit);
    setCustomerName('');
    setTokenAmount('');
  };

  const handleBlockUnit = () => {
    if (!customerName || !tokenAmount) return alert("Please enter customer details.");
    setUnits(units.map(u => u.id === selectedUnit.id ? { ...u, status: 'Blocked', customer: customerName, token_amount: parseInt(tokenAmount) } : u));
    setSelectedUnit({...selectedUnit, status: 'Blocked', customer: customerName, token_amount: parseInt(tokenAmount)});
    setCustomerName(''); setTokenAmount('');
  };

  const handleApproveToken = (unitId) => {
    setUnits(units.map(u => u.id === unitId ? { ...u, status: 'Booked' } : u));
    if (selectedUnit?.id === unitId) setSelectedUnit({...selectedUnit, status: 'Booked'});
  };

  const handleCancelBlock = (unitId) => {
    setUnits(units.map(u => u.id === unitId ? { ...u, status: 'Available', customer: null, token_amount: 0 } : u));
    if (selectedUnit?.id === unitId) setSelectedUnit({...selectedUnit, status: 'Available', customer: null, token_amount: 0});
  };

  const updateLeadStatus = (leadId, newStatus) => {
    setLeads(leads.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
  };

  const handleRecordPayment = (demandId) => {
    setDemands(demands.map(d => d.id === demandId ? { ...d, status: 'Paid' } : d));
  };

  const handleAddLead = (e) => {
    e.preventDefault();
    if(!newLeadData.name) return;
    const newLead = {
      id: `L-${1000 + leads.length + 1}`,
      ...newLeadData,
      status: 'New',
      ai_score: Math.floor(Math.random() * 40) + 50,
      ai_action: "New organic lead. Qualify requirements."
    };
    setLeads([...leads, newLead]);
    setIsLeadModalOpen(false);
    setNewLeadData({ name: '', phone: '', budget: '', source: 'Walk-in' });
  };

  const handleAutoGenerateDemands = () => {
    const bookedUnits = units.filter(u => u.status === 'Booked');
    const newDemands = bookedUnits.map((u, i) => ({
      id: `D-${600 + demands.length + i}`,
      unitId: u.id,
      customer: u.customer || 'Customer',
      amount: Math.floor(u.base_rate * u.carpet_area * 0.10), 
      milestone: 'Slab 1 Casting',
      dueDate: '2026-05-15',
      status: 'Pending',
      ai_risk: 'Low (5%)'
    }));
    setDemands([...demands, ...newDemands]);
    alert(`${newDemands.length} new demands generated successfully for Slab 1 Casting milestone.`);
  };

  const handleTransferSubmit = (e) => {
    e.preventDefault();
    const qtyToTransfer = parseInt(transferData.qty);
    if(isNaN(qtyToTransfer) || qtyToTransfer <= 0) return alert("Enter valid quantity");
    
    const item = boq.find(b => b.id === transferData.boqId);
    if(qtyToTransfer > item.act_qty) return alert("Cannot transfer more than currently consumed/available at site.");

    setBoq(boq.map(b => b.id === transferData.boqId ? { ...b, act_qty: b.act_qty - qtyToTransfer } : b));
    alert(`Successfully transferred ${qtyToTransfer} ${item.uom} of ${item.item} to ${transferData.site}. Ledger updated.`);
    setIsTransferModalOpen(false);
    setTransferData({...transferData, qty: ''});
  };

  const handleCopilotSubmit = (e) => {
    e.preventDefault();
    if (!copilotInput.trim()) return;
    
    const userMsg = copilotInput.trim();
    setCopilotMsgs(prev => [...prev, { role: 'user', text: userMsg }]);
    setCopilotInput('');

    setTimeout(() => {
      let aiResponse = "I've analyzed the current module data. I can help you filter reports or take bulk actions.";
      const q = userMsg.toLowerCase();
      
      if (q.includes('3bhk') || q.includes('available')) {
        const count = units.filter(u => u.type === '3BHK' && u.status === 'Available').length;
        aiResponse = `I found **${count} available 3BHK units** in Tower A currently.`;
      } else if (q.includes('delay') || q.includes('token') || q.includes('queue')) {
        const pending = units.filter(u => u.status === 'Blocked');
        aiResponse = `There are currently **${pending.length} units** pending token verification in the Finance queue.`;
      } else if (q.includes('cement') || q.includes('boq')) {
        const cement = boq.find(b => b.category === 'Cement');
        aiResponse = `Cement BOQ is currently marked as **${cement.status}**. The actual rate is ${formatCurrency(cement.act_rate)} vs the estimated ${formatCurrency(cement.est_rate)}.`;
      } else if (q.includes('transfer') || q.includes('site')) {
        aiResponse = `You can transfer materials between sites using the **Site Transfer** button in the Ops module. It will automatically deduct from this project's BOQ ledger.`;
      }

      setCopilotMsgs(prev => [...prev, { role: 'ai', text: aiResponse }]);
    }, 600);
  };

  // --- CALCULATIONS ---
  const generateCostSheet = (unit) => {
    const agreementValue = unit.carpet_area * unit.base_rate;
    const stampDuty = agreementValue * 0.06;
    const gst = agreementValue * 0.05;
    const infraCharges = 350000;
    return { agreementValue, stampDuty, gst, infraCharges, total: agreementValue + stampDuty + gst + infraCharges };
  };

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  const formatNumber = (val) => new Intl.NumberFormat('en-IN').format(val);

  const metrics = useMemo(() => {
    const inv = units.reduce((acc, curr) => {
      acc.total++;
      if (curr.status === 'Available') acc.available++;
      if (curr.status === 'Blocked') acc.blocked++;
      if (curr.status === 'Booked') acc.booked++;
      if (curr.status === 'Booked' || curr.status === 'Blocked') acc.totalValue += (curr.carpet_area * curr.base_rate);
      return acc;
    }, { total: 0, available: 0, blocked: 0, booked: 0, totalValue: 0 });

    const col = demands.reduce((acc, curr) => {
      acc.totalDemanded += curr.amount;
      if (curr.status === 'Overdue') acc.totalOverdue += curr.amount;
      if (curr.status === 'Paid') acc.totalCollected += curr.amount;
      return acc;
    }, { totalDemanded: 0, totalOverdue: 0, totalCollected: 0 });

    return { inv, col };
  }, [units, demands]);

  // --- RENDER FUNCTIONS ---
  const MetricCard = ({ title, value, subtitle, icon: Icon, colorClass, trend, delayClass }) => (
    <div className={`bg-white p-5 rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1 group anim-scale-pop ${delayClass}`}>
      <div className="flex justify-between items-start mb-3">
        <div className={`p-2.5 rounded-lg ${colorClass} bg-opacity-15 transition-transform group-hover:scale-110 duration-300`}>
          <Icon className={`w-5 h-5 ${colorClass.replace('bg-', 'text-').replace('-100', '-600')}`} />
        </div>
        {trend && (
          <span className="flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
            <TrendingUp className="w-3 h-3 mr-1" /> {trend}
          </span>
        )}
      </div>
      <h3 className="text-slate-500 text-[11px] font-bold tracking-widest uppercase">{title}</h3>
      <p className="text-2xl font-extrabold text-slate-800 mt-1 tracking-tight">{value}</p>
      {subtitle && <p className="text-[11px] text-slate-400 mt-1.5 font-medium">{subtitle}</p>}
    </div>
  );

  const renderDashboardView = () => (
    <div className="p-6 space-y-6 overflow-y-auto h-full bg-slate-50/50 flex-1 w-full">
      <div className="flex justify-between items-end anim-fade-in">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Command Center</h2>
          <p className="text-slate-500 mt-1 text-[13px] font-medium">Real-time performance across OP Altura</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setAiEnabled(!aiEnabled)} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border shadow-sm hover:-translate-y-0.5 ${aiEnabled ? 'bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
            <Sparkles className="w-3.5 h-3.5" /> {aiEnabled ? 'AI Enabled' : 'AI Disabled'}
          </button>
        </div>
      </div>
      
      {aiEnabled && (
        <div className="bg-gradient-to-r from-violet-600 to-indigo-700 p-5 rounded-xl text-white shadow-md flex items-start gap-4 relative overflow-hidden anim-slide-up stagger-1">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white opacity-10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          <div className="bg-white/20 p-2.5 rounded-lg backdrop-blur-sm shrink-0 border border-white/10 shadow-inner">
            <BrainCircuit className="w-5 h-5 text-white" />
          </div>
          <div className="z-10">
            <h4 className="font-bold text-[13px] flex items-center gap-1.5 tracking-wide">OP Copilot Briefing</h4>
            <p className="text-indigo-50 mt-1 text-[13px] max-w-4xl leading-relaxed font-medium">
              Sales velocity is up 15% WoW. Tower A 3BHKs show high demand. We have {formatCurrency(metrics.col.totalOverdue)} in overdue collections with a high probability of default.
            </p>
          </div>
        </div>
      )}

      <div>
        <h3 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5 anim-fade-in stagger-1"><LayoutDashboard className="w-3.5 h-3.5"/> Sales Pipeline</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard title="Total Inventory" value={`${metrics.inv.total}`} subtitle="Across 1 active tower" icon={Building} colorClass="bg-blue-100" delayClass="stagger-1" />
          <MetricCard title="Units Sold" value={`${metrics.inv.booked}`} subtitle={`${metrics.inv.available} units remaining`} icon={CheckCircle} colorClass="bg-emerald-100" trend="+12% WoW" delayClass="stagger-2" />
          <MetricCard title="Pending Verifications" value={`${metrics.inv.blocked}`} subtitle="Awaiting Finance Check" icon={Clock} colorClass="bg-amber-100" delayClass="stagger-3" />
          <MetricCard title="Pipeline Value" value={formatCurrency(metrics.inv.totalValue)} subtitle="Total Booked & Blocked" icon={IndianRupee} colorClass="bg-indigo-100" delayClass="stagger-4" />
        </div>
      </div>

      <div className="pt-2">
        <h3 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5 anim-fade-in stagger-2"><CreditCard className="w-3.5 h-3.5"/> Finance Health</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard title="Total Demanded" value={formatCurrency(metrics.col.totalDemanded)} subtitle="Construction-linked billing" icon={FileSpreadsheet} colorClass="bg-slate-100" delayClass="stagger-3" />
          <MetricCard title="Overdue Collections" value={formatCurrency(metrics.col.totalOverdue)} subtitle="High priority follow-ups" icon={AlertTriangle} colorClass="bg-rose-100" delayClass="stagger-4" />
          <MetricCard title="Amount Reconciled" value={formatCurrency(metrics.col.totalCollected)} subtitle="Bank verified receipts" icon={ShieldCheck} colorClass="bg-emerald-100" delayClass="stagger-5" />
        </div>
      </div>
    </div>
  );

  const renderLeadManagementView = () => {
    const columns = ['New', 'Contacted', 'Site Visit', 'Negotiation'];
    
    return (
      <div className="flex flex-col h-full bg-slate-50/50 flex-1 overflow-hidden relative w-full">
        <div className="px-6 py-5 shrink-0 flex justify-between items-center bg-white border-b border-slate-200 z-10 anim-fade-in">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Pre-Sales CRM</h2>
            <p className="text-slate-500 text-[13px] mt-0.5 font-medium">Manage prospects and track conversions</p>
          </div>
          <button 
            onClick={() => setIsLeadModalOpen(true)}
            className="bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 hover:bg-slate-800 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4"/> New Lead
          </button>
        </div>
        
        <div className="flex-1 overflow-x-auto overflow-y-hidden p-6 hide-scrollbar">
          <div className="flex gap-5 h-full w-max">
            {columns.map((colStatus, colIndex) => (
              <div key={colStatus} className={`bg-slate-100/60 rounded-xl w-[280px] flex flex-col h-full border border-slate-200/80 anim-slide-up stagger-${colIndex + 1}`}>
                <div className="p-3 border-b border-slate-200/80 flex justify-between items-center bg-slate-100 rounded-t-xl shrink-0">
                  <h3 className="font-extrabold text-slate-700 text-[11px] uppercase tracking-widest">{colStatus}</h3>
                  <span className="bg-white text-slate-600 text-[10px] font-black px-2 py-0.5 rounded shadow-sm border border-slate-200 transition-all">
                    {leads.filter(l => l.status === colStatus).length}
                  </span>
                </div>
                
                <div className="p-3 overflow-y-auto flex-1 space-y-3 hide-scrollbar">
                  {leads.filter(l => l.status === colStatus).map(lead => (
                    <div key={lead.id} className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 hover:border-violet-300 hover:shadow-md hover:-translate-y-1 transition-all duration-300 group relative">
                      <div className="flex justify-between items-start mb-2.5">
                        <h4 className="font-bold text-slate-900 text-[13px]">{lead.name}</h4>
                        {aiEnabled && (
                          <div className={`flex items-center gap-1 text-[9px] font-black px-1.5 py-0.5 rounded border ${lead.ai_score > 90 ? 'bg-rose-50 text-rose-600 border-rose-100' : lead.ai_score > 70 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                            <Sparkles className="w-2.5 h-2.5" /> {lead.ai_score}
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-1.5 mb-3">
                        <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500"><Phone className="w-3 h-3 text-slate-400"/> {lead.phone}</div>
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500"><IndianRupee className="w-3 h-3 text-slate-400"/> {lead.budget}</div>
                           <div className="text-[10px] font-bold text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">{lead.source}</div>
                        </div>
                      </div>

                      {aiEnabled && (
                        <div className="bg-violet-50/50 p-2.5 rounded border border-violet-100 mb-3 cursor-pointer hover:bg-violet-100 transition-colors" onClick={() => setSelectedEmailLead(lead)}>
                          <div className="flex items-center justify-between mb-1">
                             <div className="flex items-center gap-1 text-violet-800 text-[9px] font-black uppercase tracking-widest">
                               <BrainCircuit className="w-2.5 h-2.5" /> Action Suggestion
                             </div>
                             <div className="opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-0 -translate-x-2"><Mail className="w-3 h-3 text-violet-500"/></div>
                          </div>
                          <p className="text-[11px] text-violet-700 leading-tight font-medium">{lead.ai_action}</p>
                        </div>
                      )}

                      {(role === ROLES.PRE_SALES || role === ROLES.MANAGEMENT || role === ROLES.SALES) && (
                        <div className="pt-2 border-t border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity">
                          <select 
                            className="w-full text-[11px] border border-slate-200 rounded p-1.5 bg-slate-50 text-slate-700 font-bold outline-none focus:ring-1 focus:ring-violet-500 cursor-pointer hover:bg-white transition-colors"
                            value={lead.status}
                            onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                          >
                            <option value="" disabled>Move to...</option>
                            {columns.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modals */}
        {isLeadModalOpen && (
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center anim-fade-in">
            <div className="bg-white rounded-xl shadow-2xl w-[400px] border border-slate-200 overflow-hidden anim-scale-pop">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="font-bold text-slate-800 text-sm">Add New Lead</h3>
                <button onClick={() => setIsLeadModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><X className="w-4 h-4"/></button>
              </div>
              <form onSubmit={handleAddLead} className="p-5 space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Customer Name</label>
                  <input required type="text" className="w-full text-sm p-2 border border-slate-200 rounded outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all" value={newLeadData.name} onChange={e => setNewLeadData({...newLeadData, name: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Phone</label>
                     <input required type="text" className="w-full text-sm p-2 border border-slate-200 rounded outline-none focus:border-violet-500 transition-all" value={newLeadData.phone} onChange={e => setNewLeadData({...newLeadData, phone: e.target.value})} />
                   </div>
                   <div>
                     <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Budget</label>
                     <input required type="text" placeholder="e.g. 1.2 Cr" className="w-full text-sm p-2 border border-slate-200 rounded outline-none focus:border-violet-500 transition-all" value={newLeadData.budget} onChange={e => setNewLeadData({...newLeadData, budget: e.target.value})} />
                   </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Source</label>
                  <select className="w-full text-sm p-2 border border-slate-200 rounded outline-none focus:border-violet-500 transition-all" value={newLeadData.source} onChange={e => setNewLeadData({...newLeadData, source: e.target.value})}>
                     <option>Walk-in</option><option>Website</option><option>Meta Ads</option><option>Referral</option>
                  </select>
                </div>
                <button type="submit" className="w-full py-2.5 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 hover:shadow-lg hover:-translate-y-0.5 transition-all mt-2">Save Lead</button>
              </form>
            </div>
          </div>
        )}

        {/* AI Email Modal */}
        {selectedEmailLead && (
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center anim-fade-in">
             <div className="bg-white rounded-xl shadow-2xl w-[500px] border border-slate-200 overflow-hidden anim-scale-pop">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-violet-50">
                   <div className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-violet-600"/><h3 className="font-bold text-violet-900 text-sm">AI Copilot: Email Draft</h3></div>
                   <button onClick={() => setSelectedEmailLead(null)} className="text-violet-400 hover:text-violet-600 transition-colors"><X className="w-4 h-4"/></button>
                </div>
                <div className="p-5 space-y-4">
                   <div className="text-[13px] text-slate-700 bg-slate-50 p-4 rounded border border-slate-100 leading-relaxed font-medium">
                     Subject: Updates on OP Altura & Your Next Steps<br/><br/>
                     Hi {selectedEmailLead.name},<br/><br/>
                     Thank you for your continued interest in OP Altura. Based on our last interaction, {selectedEmailLead.ai_action.toLowerCase()}<br/><br/>
                     I have attached the latest construction updates and cost sheet for your review. Let's connect tomorrow at 11 AM.<br/><br/>
                     Best,<br/>Sales Team, OP Developers
                   </div>
                   <div className="flex gap-3 justify-end">
                      <button onClick={() => setSelectedEmailLead(null)} className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 transition-colors rounded border border-slate-200">Cancel</button>
                      <button onClick={() => setSelectedEmailLead(null)} className="px-4 py-2 text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 hover:shadow-lg hover:-translate-y-0.5 transition-all rounded flex items-center gap-1.5"><Send className="w-3 h-3"/> Send Email</button>
                   </div>
                </div>
             </div>
          </div>
        )}
      </div>
    );
  };

  const renderInventoryGrid = () => {
    const floors = [...new Set(units.map(u => u.floor))].sort((a, b) => b - a);
    return (
      <div className="flex-1 p-6 overflow-auto bg-slate-50/50 w-full anim-slide-up">
        <div className="flex justify-between items-center mb-6 bg-white p-3.5 rounded-xl shadow-sm border border-slate-200 sticky top-0 z-10">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Tower A Matrix</h2>
            <p className="text-slate-500 text-[11px] font-medium uppercase tracking-wider">Live Availability Engine</p>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-sm"></div><span className="text-[11px] font-bold text-slate-600 uppercase">Available</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-amber-400 rounded-full shadow-sm"></div><span className="text-[11px] font-bold text-slate-600 uppercase">Blocked</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-rose-500 rounded-full shadow-sm"></div><span className="text-[11px] font-bold text-slate-600 uppercase">Booked</span></div>
          </div>
        </div>

        <div className="max-w-4xl space-y-3">
          {floors.map((floor, floorIndex) => (
            <div key={floor} className={`flex gap-4 items-center anim-slide-up stagger-${(floorIndex % 5) + 1}`}>
              <div className="w-12 text-[11px] font-black text-slate-400 text-center bg-white py-2 rounded shadow-sm border border-slate-100">
                F{floor}
              </div>
              <div className="flex gap-3 w-full">
                {units.filter(u => u.floor === floor).sort((a,b) => a.unit_number.localeCompare(b.unit_number)).map(unit => {
                  let styleClass = "bg-white border-slate-200 hover:border-emerald-400 hover:shadow-md text-slate-700";
                  let dotColor = "bg-emerald-500";
                  
                  if (unit.status === 'Blocked') { 
                    styleClass = "bg-amber-50/50 border-amber-300 text-amber-900"; 
                    dotColor = "bg-amber-400"; 
                  }
                  if (unit.status === 'Booked') { 
                    styleClass = "bg-rose-50/50 border-rose-300 text-rose-900"; 
                    dotColor = "bg-rose-500"; 
                  }
                  
                  const isSelected = selectedUnit?.id === unit.id;

                  return (
                    <button
                      key={unit.id}
                      onClick={() => handleSelectUnit(unit)}
                      className={`flex-1 p-3.5 rounded-xl border transition-all duration-300 text-left relative overflow-hidden ${styleClass} ${isSelected ? 'ring-2 ring-violet-500 shadow-lg scale-[1.03] z-10' : 'shadow-sm'}`}
                    >
                      <div className="flex justify-between items-start mb-1.5">
                        <span className="font-extrabold text-[15px] tracking-tight">{unit.unit_number}</span>
                        <div className={`w-2 h-2 rounded-full ${dotColor}`}></div>
                      </div>
                      <div className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-0.5">{unit.type}</div>
                      <div className="text-[11px] font-medium opacity-80">{unit.carpet_area} sqft</div>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderRightPanel = () => {
    if (!selectedUnit) return (
      <div className="w-[360px] bg-white border-l border-slate-200 p-6 flex items-center justify-center text-slate-400 shadow-[-5px_0_15px_rgba(0,0,0,0.02)] z-20 shrink-0 anim-slide-right">
        <div className="text-center flex flex-col items-center">
          <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
            <Building className="w-5 h-5 text-slate-300" />
          </div>
          <p className="font-bold text-slate-500 text-sm">No Unit Selected</p>
          <p className="text-[11px] mt-1 text-slate-400">Select a unit to view cost sheet</p>
        </div>
      </div>
    );

    const costs = generateCostSheet(selectedUnit);

    return (
      <div key={selectedUnit.id} className="w-[360px] bg-white border-l border-slate-200 flex flex-col h-full shadow-[-5px_0_15px_rgba(0,0,0,0.02)] z-20 shrink-0 relative anim-slide-right">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-30">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className={`w-2 h-2 rounded-full ${selectedUnit.status === 'Available' ? 'bg-emerald-500' : selectedUnit.status === 'Blocked' ? 'bg-amber-400' : 'bg-rose-500'}`}></span>
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{selectedUnit.status}</span>
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">{selectedUnit.id}</h3>
          </div>
          <button onClick={() => setSelectedUnit(null)} className="p-1.5 hover:bg-slate-100 rounded text-slate-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 flex-1 overflow-y-auto space-y-6 pb-28 hide-scrollbar">
          
          {selectedUnit.status === 'Blocked' && (
            <div className="p-3.5 bg-amber-50 rounded-lg border border-amber-200 shadow-sm text-[13px] anim-fade-in">
              <div className="flex items-center gap-1.5 text-amber-900 font-extrabold mb-2 text-[10px] tracking-widest uppercase"><Clock className="w-3.5 h-3.5" /> Finance Verification</div>
              <div className="text-amber-900 font-medium">Blocked by: <span className="font-bold">{selectedUnit.customer}</span></div>
              <div className="text-amber-900 font-medium mt-0.5">Token: <span className="font-bold">{formatCurrency(selectedUnit.token_amount)}</span></div>
            </div>
          )}
          
          {selectedUnit.status === 'Booked' && (
            <div className="p-3.5 bg-rose-50 rounded-lg border border-rose-200 shadow-sm text-[13px] anim-fade-in">
              <div className="flex items-center gap-1.5 text-rose-900 font-extrabold mb-2 text-[10px] tracking-widest uppercase"><CheckCircle className="w-3.5 h-3.5" /> Verified</div>
              <div className="text-rose-900 font-medium">Owner: <span className="font-bold">{selectedUnit.customer}</span></div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 anim-slide-up stagger-1">
             <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-center transition-all hover:bg-slate-100">
               <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-0.5">Typology</span>
               <span className="font-extrabold text-slate-800 text-base">{selectedUnit.type}</span>
             </div>
             <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-center transition-all hover:bg-slate-100">
               <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-0.5">Area</span>
               <span className="font-extrabold text-slate-800 text-base">{selectedUnit.carpet_area} <span className="text-[10px] font-medium">sqft</span></span>
             </div>
          </div>

          {aiEnabled && selectedUnit.status === 'Available' && (
            <div className="p-4 bg-gradient-to-br from-violet-50/50 to-indigo-50/50 rounded-lg border border-violet-100 anim-slide-up stagger-2">
              <div className="flex items-center gap-1.5 text-violet-800 font-black text-[9px] tracking-widest uppercase mb-1.5">
                <Sparkles className="w-3 h-3" /> Pricing Engine
              </div>
              <p className="text-[11px] text-violet-800 font-medium">{selectedUnit.ai_insight}</p>
            </div>
          )}

          <div className="anim-slide-up stagger-3">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3 hover:shadow-md transition-shadow">
              <div className="flex justify-between text-[13px]"><span className="text-slate-500 font-medium">Base Rate</span><span className="font-bold text-slate-800">{formatCurrency(selectedUnit.base_rate)} <span className="text-[10px] text-slate-400 font-normal">/sqft</span></span></div>
              <div className="flex justify-between text-[13px]"><span className="text-slate-500 font-medium">Agreement Value</span><span className="font-bold text-slate-800">{formatCurrency(costs.agreementValue)}</span></div>
              <div className="flex justify-between text-[13px]"><span className="text-slate-500 font-medium">Infrastructure</span><span className="font-bold text-slate-800">{formatCurrency(costs.infraCharges)}</span></div>
              <div className="w-full h-px bg-slate-100 my-1.5"></div>
              <div className="flex justify-between text-[13px]"><span className="text-slate-500 font-medium">Stamp Duty (6%)</span><span className="font-bold text-slate-800">{formatCurrency(costs.stampDuty)}</span></div>
              <div className="flex justify-between text-[13px]"><span className="text-slate-500 font-medium">GST (5%)</span><span className="font-bold text-slate-800">{formatCurrency(costs.gst)}</span></div>
              <div className="w-full h-px bg-slate-200 my-2 border-dashed border-t"></div>
              <div className="flex justify-between items-end pt-1">
                <span className="text-slate-500 font-black uppercase text-[10px] tracking-widest">Total Value</span>
                <span className="text-xl font-extrabold text-indigo-700 tracking-tight">{formatCurrency(costs.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {selectedUnit.status === 'Available' && (role === ROLES.SALES || role === ROLES.MANAGEMENT) && (
          <div className="absolute bottom-0 left-0 right-0 p-5 bg-white border-t border-slate-200 z-40 shadow-[0_-5px_15px_rgba(0,0,0,0.03)] anim-slide-up">
            <div className="space-y-2">
              <input type="text" placeholder="Customer Name" className="w-full px-3 py-2 bg-white border border-slate-200 rounded text-[13px] font-bold placeholder:font-medium focus:ring-1 focus:ring-violet-500 outline-none transition-all" value={customerName} onChange={e => setCustomerName(e.target.value)} />
              <input type="number" placeholder="Token Amount (INR)" className="w-full px-3 py-2 bg-white border border-slate-200 rounded text-[13px] font-bold placeholder:font-medium focus:ring-1 focus:ring-violet-500 outline-none transition-all" value={tokenAmount} onChange={e => setTokenAmount(e.target.value)} />
              <button onClick={handleBlockUnit} className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black tracking-widest uppercase text-[10px] rounded shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-1.5 mt-1 group">
                <Lock className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" /> Send to Finance
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderFinanceView = () => {
    const pendingUnits = units.filter(u => u.status === 'Blocked');
    return (
      <div className="p-6 space-y-6 w-full bg-slate-50/50 overflow-y-auto anim-fade-in">
        <div className="anim-slide-up stagger-1">
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Maker-Checker Queue</h2>
          <p className="text-slate-500 text-[13px] mt-0.5 font-medium">Strict compliance token verification</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden anim-slide-up stagger-2">
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center gap-1.5 text-slate-700 font-bold text-[11px] uppercase tracking-widest">
             <ShieldCheck className="w-4 h-4 text-indigo-600" /> Pending Token Reconciliations
          </div>
          <table className="w-full text-left">
            <thead className="bg-white border-b border-slate-100">
              <tr>
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Unit</th>
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer</th>
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Token Claimed</th>
                {aiEnabled && <th className="p-4 text-[10px] font-black text-violet-500 uppercase tracking-widest flex items-center gap-1"><Sparkles className="w-3 h-3"/> AI Fraud Check</th>}
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {pendingUnits.length === 0 ? (
                <tr><td colSpan="5" className="p-12 text-center text-slate-400 font-bold text-[13px] bg-slate-50/50">Queue is clear.</td></tr>
              ) : pendingUnits.map(u => (
                <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4 font-extrabold text-slate-900 text-[15px]">{u.id}</td>
                  <td className="p-4 font-bold text-slate-600 text-[13px]">{u.customer}</td>
                  <td className="p-4 text-emerald-600 font-extrabold text-lg tracking-tight">{formatCurrency(u.token_amount)}</td>
                  {aiEnabled && (
                    <td className="p-4">
                      <div className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded text-[10px] font-bold">
                        <CheckCircle className="w-3 h-3" /> Safe (Standard Token)
                      </div>
                    </td>
                  )}
                  <td className="p-4 space-x-2 text-right">
                    <button onClick={() => handleCancelBlock(u.id)} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded text-xs font-bold hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 hover:shadow-sm transition-all">Reject</button>
                    <button onClick={() => handleApproveToken(u.id)} className="px-4 py-2 bg-slate-900 text-white rounded text-xs font-bold shadow-sm hover:bg-slate-800 hover:-translate-y-0.5 hover:shadow-md transition-all">Verify & Book</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderCollectionsView = () => {
    return (
      <div className="p-6 space-y-6 w-full bg-slate-50/50 overflow-y-auto anim-fade-in">
        <div className="flex justify-between items-center anim-slide-up stagger-1">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Demand Ledger</h2>
            <p className="text-slate-500 text-[13px] mt-0.5 font-medium">Construction-linked collections</p>
          </div>
          <button onClick={handleAutoGenerateDemands} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-md hover:bg-indigo-700 hover:-translate-y-0.5 transition-all flex items-center gap-1.5">
            <Wand2 className="w-3.5 h-3.5"/> Auto-Generate Demands
          </button>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden anim-slide-up stagger-2">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">ID</th>
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer & Unit</th>
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Milestone</th>
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount Due</th>
                {aiEnabled && <th className="p-4 text-[10px] font-black text-violet-500 uppercase tracking-widest"><div className="flex items-center gap-1"><Sparkles className="w-3 h-3"/> Default Risk</div></th>}
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {demands.map(d => (
                <tr key={d.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 font-bold text-slate-600 text-[13px]">{d.id}</td>
                  <td className="p-4">
                    <div className="font-extrabold text-slate-900 text-[13px]">{d.unitId}</div>
                    <div className="text-[11px] text-slate-500 font-semibold">{d.customer}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-[13px] font-bold text-slate-800">{d.milestone}</div>
                    <div className="text-[10px] text-slate-400 font-medium mt-0.5">Due: {d.dueDate}</div>
                  </td>
                  <td className="p-4 font-extrabold text-slate-900 text-[15px]">{formatCurrency(d.amount)}</td>
                  
                  {aiEnabled && (
                    <td className="p-4">
                      {d.status !== 'Paid' ? (
                        <div className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-bold border ${
                          d.ai_risk.includes('High') ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                        }`}>
                          {d.ai_risk}
                        </div>
                      ) : (
                        <span className="text-slate-300 text-[13px] font-bold">—</span>
                      )}
                    </td>
                  )}

                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest border ${
                      d.status === 'Overdue' ? 'bg-rose-100 text-rose-800 border-rose-200' : 
                      d.status === 'Paid' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 
                      'bg-amber-100 text-amber-800 border-amber-200'
                    }`}>
                      {d.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {d.status !== 'Paid' && (role === ROLES.CRM || role === ROLES.FINANCE || role === ROLES.MANAGEMENT) ? (
                      <button onClick={() => handleRecordPayment(d.id)} className="text-violet-700 hover:text-white font-bold bg-violet-50 hover:bg-violet-600 border border-violet-200 transition-colors px-3 py-1.5 rounded text-[11px] shadow-sm">
                        Receipt
                      </button>
                    ) : (
                      <CheckCircle className="w-5 h-5 text-emerald-500 ml-auto mr-2" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderOperationsView = () => {
    return (
      <div className="p-6 space-y-6 w-full bg-slate-50/50 overflow-y-auto flex-1 hide-scrollbar anim-fade-in relative">
        <div className="flex justify-between items-center anim-slide-up stagger-1">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Project Ops & BOQ</h2>
            <p className="text-slate-500 text-[13px] mt-0.5 font-medium">Construction tracking & material consumption</p>
          </div>
          <button onClick={() => setIsTransferModalOpen(true)} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-md hover:bg-slate-800 hover:-translate-y-0.5 transition-all flex items-center gap-1.5">
            <ArrowRight className="w-3.5 h-3.5"/> Site Transfer
          </button>
        </div>

        <div className="anim-slide-up stagger-2">
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5"><ClipboardList className="w-3.5 h-3.5"/> BOQ Consumption Tracker</h3>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Material</th>
                  <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Usage vs Est</th>
                  <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Rate Var</th>
                  {aiEnabled && <th className="p-4 text-[10px] font-black text-violet-500 uppercase tracking-widest flex items-center gap-1"><Sparkles className="w-3 h-3"/> AI Predict</th>}
                  <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                 {boq.map((item, idx) => {
                    const consumptionPct = Math.round((item.act_qty / item.est_qty) * 100);
                    const rateDiff = item.act_rate - item.est_rate;
                    const isRateOver = rateDiff > 0;
                    
                    return (
                       <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4">
                             <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{item.category}</div>
                             <div className="font-bold text-slate-800 text-[13px]">{item.item}</div>
                          </td>
                          <td className="p-4">
                             <div className="flex justify-between text-[11px] font-bold text-slate-600 mb-1">
                                <span>{formatNumber(item.act_qty)} / {formatNumber(item.est_qty)} {item.uom}</span>
                                <span>{consumptionPct}%</span>
                             </div>
                             <div className="w-48 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                <div className={`h-1.5 rounded-full transition-all duration-1000 ${consumptionPct > 90 ? 'bg-rose-500' : 'bg-blue-500'}`} style={{width: `${Math.min(consumptionPct, 100)}%`}}></div>
                             </div>
                          </td>
                          <td className="p-4">
                             <div className="font-bold text-slate-700 text-[13px]">{formatCurrency(item.act_rate)} <span className="text-[10px] text-slate-400">/{item.uom}</span></div>
                             <div className={`text-[10px] font-black mt-0.5 ${isRateOver ? 'text-rose-600' : rateDiff === 0 ? 'text-slate-400' : 'text-emerald-600'}`}>
                                {isRateOver ? '▲' : rateDiff === 0 ? '-' : '▼'} {rateDiff !== 0 ? formatCurrency(Math.abs(rateDiff)) : 'Match'}
                             </div>
                          </td>
                          {aiEnabled && (
                            <td className="p-4 text-[11px] font-medium text-slate-600 max-w-[200px]">
                               {item.ai_pred}
                            </td>
                          )}
                          <td className="p-4 text-right">
                             <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest border ${
                                item.status === 'Over Budget' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                item.status === 'Savings' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                'bg-blue-50 text-blue-700 border-blue-200'
                             }`}>
                                {item.status}
                             </span>
                          </td>
                       </tr>
                    );
                 })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Transfer Modal */}
        {isTransferModalOpen && (
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center anim-fade-in">
            <div className="bg-white rounded-xl shadow-2xl w-[400px] border border-slate-200 overflow-hidden anim-scale-pop">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div className="flex items-center gap-2 font-bold text-slate-800 text-sm"><Truck className="w-4 h-4"/> Site Material Transfer</div>
                <button onClick={() => setIsTransferModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><X className="w-4 h-4"/></button>
              </div>
              <form onSubmit={handleTransferSubmit} className="p-5 space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Select Material to Transfer</label>
                  <select className="w-full text-sm p-2 border border-slate-200 rounded outline-none focus:border-violet-500 font-medium" value={transferData.boqId} onChange={e => setTransferData({...transferData, boqId: e.target.value})}>
                     {boq.map(b => <option key={b.id} value={b.id}>{b.item} (Available: {b.act_qty} {b.uom})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Quantity</label>
                  <input required type="number" placeholder="Enter amount..." className="w-full text-sm p-2 border border-slate-200 rounded outline-none focus:border-violet-500 font-medium" value={transferData.qty} onChange={e => setTransferData({...transferData, qty: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Destination Site</label>
                  <select className="w-full text-sm p-2 border border-slate-200 rounded outline-none focus:border-violet-500 font-medium" value={transferData.site} onChange={e => setTransferData({...transferData, site: e.target.value})}>
                     <option>OP Tech-Park (Kharadi)</option><option>OP Serenity (Hinjewadi)</option>
                  </select>
                </div>
                
                {aiEnabled && (
                  <div className="bg-indigo-50 p-2.5 rounded border border-indigo-100 flex items-start gap-2 text-[11px] text-indigo-700 font-medium mt-2">
                     <Sparkles className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                     <p>Transferring {transferData.qty || 'this'} will trigger a low-stock alert at the current site in 12 days based on velocity.</p>
                  </div>
                )}

                <button type="submit" className="w-full py-2.5 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 hover:shadow-lg hover:-translate-y-0.5 transition-all mt-2">Initiate Transfer</button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderCustomerView = () => {
    // Specifically for Role: Customer Portal
    const customerUnit = units.find(u => u.customer === 'Rahul Sharma') || units[0];
    const customerDemands = demands.filter(d => d.customer === 'Rahul Sharma');
    
    return (
      <div className="flex-1 w-full h-full bg-slate-50 overflow-y-auto relative anim-fade-in text-slate-900">
        <header className="bg-slate-900 text-white p-6 shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
          <div className="max-w-4xl mx-auto flex justify-between items-center relative z-10">
             <div>
               <h1 className="text-2xl font-extrabold tracking-tight">Welcome back, Rahul!</h1>
               <p className="text-slate-300 text-[13px] font-medium mt-1">Your Property Dashboard: OP Altura, Baner</p>
             </div>
             <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center font-bold text-white border border-white/20 shadow-inner">
               RS
             </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto p-6 space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 anim-slide-up stagger-1">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm col-span-2">
                 <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">My Property Specs</h3>
                 <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-4xl font-extrabold tracking-tighter text-slate-900">{customerUnit.unit_number}</h4>
                      <p className="text-sm font-bold text-slate-500 mt-1">Tower A • {customerUnit.floor}th Floor</p>
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] text-slate-400 uppercase font-black tracking-widest mb-1">Typology</div>
                      <div className="text-xl font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100">{customerUnit.type}</div>
                    </div>
                 </div>
              </div>
              <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-5 rounded-xl text-white shadow-md relative overflow-hidden">
                 <h3 className="text-[11px] font-black text-indigo-200 uppercase tracking-widest mb-4 relative z-10">Amount Due</h3>
                 <div className="text-3xl font-extrabold tracking-tighter relative z-10">{formatCurrency(1700000)}</div>
                 <div className="text-xs text-indigo-100 mt-2 font-medium relative z-10 flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5"/> Due by 10 Apr 2026</div>
                 <button className="w-full mt-4 bg-white text-indigo-700 text-xs font-bold py-2.5 rounded shadow-sm hover:shadow-md transition-all relative z-10">Pay Now</button>
              </div>
           </div>

           <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 anim-slide-up stagger-2">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-1.5"><HardHat className="w-4 h-4"/> Construction Updates</h3>
              <div className="flex items-center gap-4">
                 <div className="w-24 h-24 bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200 overflow-hidden shrink-0 group cursor-pointer relative">
                    <ImageIcon className="w-6 h-6 text-slate-300" />
                    <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                       <span className="text-white text-[10px] font-bold">View Gallery</span>
                    </div>
                 </div>
                 <div className="flex-1">
                    <h4 className="font-bold text-slate-800 text-[15px]">Plinth Level Completed</h4>
                    <p className="text-[13px] text-slate-500 font-medium mt-1">Great news! The plinth work for Tower A has concluded this week. We are now preparing for Slab 1 casting. Your investment is taking shape rapidly.</p>
                    <div className="mt-3 flex gap-2">
                       <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded border border-emerald-100">On Schedule</span>
                       <span className="text-slate-400 text-[11px] font-bold py-1">Updated 2 days ago</span>
                    </div>
                 </div>
              </div>
           </div>

           <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden anim-slide-up stagger-3">
              <div className="p-4 bg-slate-50 border-b border-slate-200">
                 <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><FileSpreadsheet className="w-4 h-4"/> Payment Ledger</h3>
              </div>
              <table className="w-full text-left">
                 <thead className="bg-white border-b border-slate-100">
                    <tr>
                       <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Milestone</th>
                       <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                       <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50 text-[13px]">
                    <tr className="bg-slate-50/50">
                       <td className="p-4 font-bold text-slate-600">Booking Token</td>
                       <td className="p-4 font-extrabold text-slate-900">{formatCurrency(500000)}</td>
                       <td className="p-4"><span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase px-2 py-1 rounded">Paid</span></td>
                    </tr>
                    {customerDemands.map(d => (
                       <tr key={d.id}>
                          <td className="p-4 font-bold text-slate-600">{d.milestone}</td>
                          <td className="p-4 font-extrabold text-rose-600">{formatCurrency(d.amount)}</td>
                          <td className="p-4"><span className="bg-rose-100 text-rose-800 text-[10px] font-black uppercase px-2 py-1 rounded border border-rose-200">Overdue</span></td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>

        {/* Customer AI Bot Overlay */}
        <div className="fixed bottom-6 right-6 z-50">
          <button className="bg-indigo-600 text-white p-3.5 rounded-full shadow-xl hover:-translate-y-1 hover:shadow-2xl transition-all flex items-center gap-2 group border border-indigo-500">
            <HelpCircle className="w-5 h-5 text-indigo-200 group-hover:text-white" />
            <span className="max-w-0 overflow-hidden whitespace-nowrap font-bold text-[13px] group-hover:max-w-xs transition-all duration-300 ease-in-out opacity-0 group-hover:opacity-100 px-1">
              Ask AI Support
            </span>
          </button>
        </div>
      </div>
    );
  };

  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard, roles: [ROLES.MANAGEMENT, ROLES.SALES, ROLES.FINANCE, ROLES.CRM, ROLES.OPS] },
    { id: 'leads', label: 'Pre-Sales', icon: Users, roles: [ROLES.MANAGEMENT, ROLES.PRE_SALES, ROLES.SALES] },
    { id: 'inventory', label: 'Inventory Matrix', icon: Building, roles: [ROLES.MANAGEMENT, ROLES.SALES, ROLES.PRE_SALES, ROLES.FINANCE] },
    { id: 'finance', label: 'Maker/Checker', icon: ShieldCheck, roles: [ROLES.MANAGEMENT, ROLES.FINANCE], badge: metrics.inv.blocked },
    { id: 'collections', label: 'Ledger & Demands', icon: FileSpreadsheet, roles: [ROLES.MANAGEMENT, ROLES.CRM, ROLES.FINANCE] },
    { id: 'operations', label: 'Ops & BOQ', icon: ClipboardList, roles: [ROLES.MANAGEMENT, ROLES.OPS] },
  ];

  // If customer role, render entirely different layout
  if (role === ROLES.CUSTOMER) {
    return (
      <div className="h-screen w-full flex font-sans selection:bg-indigo-200">
         <style>{customStyles}</style>
         
         <div className="absolute top-4 right-4 z-50">
             <select 
              className="bg-white border border-slate-200 text-slate-800 text-[11px] font-bold py-1.5 px-2 rounded outline-none shadow-md cursor-pointer hover:bg-slate-50 uppercase tracking-widest"
              value={role}
              onChange={(e) => {
                setRole(e.target.value);
                setActiveTab('dashboard');
              }}
            >
              {Object.values(ROLES).map(r => <option key={r} value={r}>{r}</option>)}
            </select>
         </div>
         {renderCustomerView()}
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-[#0F172A] flex font-sans text-slate-900 overflow-hidden selection:bg-violet-200 text-[13px]">
      <style>{customStyles}</style>
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#0F172A] border-r border-slate-800 flex flex-col z-20 text-white shrink-0">
        <div className="p-5 flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-indigo-600 rounded flex items-center justify-center border border-white/10 shadow-[0_0_15px_rgba(139,92,246,0.5)]">
            <Building className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight leading-tight">OP Platform</h1>
            <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">Enterprise</p>
          </div>
        </div>

        <div className="px-5 py-3 border-b border-slate-800">
          <select 
            className="w-full bg-slate-900 border border-slate-700 text-white text-xs font-bold py-1.5 px-2 rounded outline-none focus:border-violet-500 transition-colors cursor-pointer hover:bg-slate-800"
            value={role}
            onChange={(e) => {
              const newRole = e.target.value;
              setRole(newRole);
              setSelectedUnit(null);
              const allowedTabs = navItems.filter(n => n.roles.includes(newRole)).map(n => n.id);
              if (!allowedTabs.includes(activeTab)) setActiveTab(allowedTabs[0]);
            }}
          >
            {Object.values(ROLES).map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        <div className="p-3 flex-1 overflow-y-auto hide-scrollbar mt-2">
          <nav className="space-y-1">
            {navItems.filter(item => item.roles.includes(role)).map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button 
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-[13px] font-bold transition-all ${isActive ? 'bg-violet-600/20 text-violet-400 shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:translate-x-1'}`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 transition-transform ${isActive ? 'text-violet-400 scale-110' : 'text-slate-500'}`} />
                    {item.label}
                  </div>
                  {item.badge > 0 && (
                    <span className="bg-rose-500 text-white text-[9px] px-1.5 py-0.5 rounded font-black shadow-sm">{item.badge}</span>
                  )}
                </button>
              )
            })}
          </nav>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col overflow-hidden bg-white z-30 relative">
        <header className="h-14 border-b border-slate-200 flex items-center justify-between px-6 shrink-0 bg-white z-20">
          <div className="flex items-center gap-2 text-[13px] font-bold text-slate-500">
            <span className="uppercase tracking-widest text-[10px]">OP Altura</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className="text-slate-900 capitalize anim-fade-in" key={activeTab}>{activeTab.replace('-', ' ')}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input type="text" placeholder="Search..." className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-[13px] font-medium outline-none focus:ring-1 focus:ring-violet-500 focus:bg-white transition-all w-56 hover:w-64" />
            </div>
            <button className="text-slate-500 hover:text-slate-900 transition-colors relative hover:scale-110">
              <Bell className="w-4 h-4" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-rose-500 rounded-full border border-white"></span>
            </button>
          </div>
        </header>

        <div key={activeTab} className="flex-1 overflow-hidden flex relative bg-white w-full h-full">
          {activeTab === 'dashboard' && renderDashboardView()}
          {activeTab === 'leads' && renderLeadManagementView()}
          {activeTab === 'finance' && renderFinanceView()}
          {activeTab === 'collections' && renderCollectionsView()}
          {activeTab === 'operations' && renderOperationsView()}
          {activeTab === 'inventory' && (
            <>
              {renderInventoryGrid()}
              {renderRightPanel()}
            </>
          )}
        </div>
      </main>

      {/* AI COPILOT OVERLAY */}
      {aiEnabled && (
        <div className="fixed bottom-6 right-6 z-50">
          {showCopilot ? (
            <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-[320px] overflow-hidden flex flex-col anim-slide-up">
              <div className="bg-slate-900 p-3 flex justify-between items-center text-white">
                <div className="flex items-center gap-2 font-bold text-[13px]">
                  <Bot className="w-4 h-4 text-violet-400" /> OP Copilot
                </div>
                <button onClick={() => setShowCopilot(false)} className="text-slate-400 hover:text-white transition-colors"><X className="w-4 h-4"/></button>
              </div>
              
              <div className="p-4 space-y-3 h-64 overflow-y-auto text-[13px] bg-slate-50 hide-scrollbar">
                {copilotMsgs.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} anim-fade-in`}>
                    <div className={`p-2.5 rounded-lg max-w-[85%] font-medium leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-violet-600 text-white rounded-br-sm' : 'bg-white border border-slate-200 text-slate-700 rounded-bl-sm'}`}>
                      {msg.role === 'ai' && msg.text.includes('**') ? (
                         <span dangerouslySetInnerHTML={{__html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-extrabold text-slate-900">$1</strong>')}} />
                      ) : msg.text}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              
              <form onSubmit={handleCopilotSubmit} className="p-3 border-t border-slate-200 bg-white">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Ask about inventory, leads, or BOQ..." 
                    className="w-full bg-slate-50 border border-slate-200 rounded py-2 pl-3 pr-10 outline-none text-[13px] font-medium focus:ring-1 focus:ring-violet-500 transition-shadow"
                    value={copilotInput}
                    onChange={(e) => setCopilotInput(e.target.value)}
                  />
                  <button type="submit" className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 bg-violet-600 text-white rounded hover:bg-violet-700 disabled:opacity-50 transition-colors" disabled={!copilotInput.trim()}>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <button 
              onClick={() => setShowCopilot(true)}
              className="bg-slate-900 text-white p-3 rounded-full shadow-lg hover:-translate-y-1 hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2 group border border-slate-700"
            >
              <Bot className="w-5 h-5 text-violet-400 group-hover:rotate-12 transition-transform" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
