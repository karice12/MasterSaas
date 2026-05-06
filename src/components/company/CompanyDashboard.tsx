import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Store, 
  TrendingUp, 
  LogOut, 
  Menu as MenuIcon, 
  X, 
  LayoutDashboard,
  ExternalLink,
  ChevronRight,
  Lock,
  AlertCircle,
  Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import FinancialPanel from './FinancialPanel';
import MenuManagement from './MenuManagement';
import StoreSettings from './StoreSettings';

type AccountState = 'active' | 'blocked' | 'expired';

export default function CompanyDashboard() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'menu' | 'settings'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [accountStatus, setAccountStatus] = useState<AccountState>('active'); // Simulação

  if (accountStatus !== 'active') {
    return <BlockedScreen status={accountStatus} onRetry={() => setAccountStatus('active')} />;
  }

  return (
    <div className="flex h-screen bg-gray-950 font-sans text-slate-300 overflow-hidden">
      {/* Mobile Top Bar */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-gray-900 border-b border-white/5 absolute top-0 left-0 right-0 z-[60]">
         <div className="flex items-center gap-2">
            <div className="bg-amber-600 p-1.5 rounded text-white shadow-lg shadow-amber-900/20">
              <Store size={16} />
            </div>
            <span className="font-bold text-[10px] tracking-widest text-white uppercase italic">MENU<span className="text-amber-500 font-light">MASTER</span></span>
         </div>
         <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-white/5 rounded text-slate-500">
            {isSidebarOpen ? <X size={18} /> : <MenuIcon size={18} />}
         </button>
      </div>

      {/* Sidebar Overlay for Mobile */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[70] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside 
        className={`
          fixed inset-y-0 left-0 w-56 bg-gray-900 border-r border-white/5 z-[80] transition-transform duration-300 lg:static lg:translate-x-0 shadow-2xl
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="h-full flex flex-col">
          <div className="p-5">
            <div className="flex items-center gap-2.5 mb-8">
              <div className="w-7 h-7 bg-amber-600 rounded flex items-center justify-center text-white shadow-lg shadow-amber-900/40">
                <Store size={16} />
              </div>
              <div>
                <h2 className="font-bold text-[10px] text-white leading-none tracking-widest italic uppercase">MENU<span className="text-amber-500 font-light">MASTER</span></h2>
                <p className="text-[7px] text-amber-500/60 font-bold uppercase tracking-[0.2em] mt-1 italic">Company Cluster</p>
              </div>
            </div>

            <nav className="space-y-1">
              <CompanyNavItem 
                active={activeTab === 'dashboard'} 
                onClick={() => setActiveTab('dashboard')}
                icon={<LayoutDashboard size={14} />}
                label="Visão Geral"
              />
              <CompanyNavItem 
                active={activeTab === 'menu'} 
                onClick={() => setActiveTab('menu')}
                icon={<ShoppingBag size={14} />}
                label="Cardápio"
              />
              <CompanyNavItem 
                active={activeTab === 'settings'} 
                onClick={() => setActiveTab('settings')}
                icon={<Settings size={14} />}
                label="Configurações"
              />
            </nav>
          </div>

          <div className="mt-auto p-4 border-t border-white/5 bg-black/10">
             <div className="bg-gray-800/40 p-3 rounded mb-4 flex flex-col gap-2 border border-white/5 group cursor-pointer hover:border-amber-500/20 transition-all">
                <div className="flex justify-between items-center text-amber-500/70">
                   <p className="text-[7px] font-bold uppercase tracking-[0.2em]">Link Público</p>
                   <ExternalLink size={10} />
                </div>
                <div className="flex items-center justify-between">
                   <p className="text-[10px] font-bold text-white overflow-hidden text-ellipsis whitespace-nowrap opacity-60">burguerchef.link</p>
                   <ChevronRight size={10} className="text-slate-700 group-hover:translate-x-1 transition-transform" />
                </div>
             </div>
             
             <button className="flex items-center gap-3 w-full p-2.5 text-slate-500 hover:text-red-400 hover:bg-red-500/5 rounded transition-all font-bold text-[8px] uppercase tracking-widest">
                <LogOut size={14} />
                Encerrar Sessão
             </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 w-full overflow-y-auto pt-14 lg:pt-0 no-scrollbar">
        <header className="h-14 px-6 lg:px-10 flex items-center justify-between sticky top-0 bg-gray-950/80 backdrop-blur-xl z-40 border-b border-white/5">
           <div className="flex flex-col">
              <h1 className="text-xs font-bold text-white tracking-widest uppercase italic">
                 {activeTab === 'dashboard' && 'Visão Geral Operacional'}
                 {activeTab === 'menu' && 'Catálogo de Produtos'}
                 {activeTab === 'settings' && 'Identidade Visual & Info'}
              </h1>
              <p className="text-[8px] text-slate-600 font-bold uppercase tracking-widest mt-0.5">
                 Cluster: Sampa-East-01 • Status: Online
              </p>
           </div>
           <div className="flex items-center gap-6">
              <div className="hidden sm:flex items-center gap-2 bg-emerald-500/5 text-emerald-500 px-3 py-1 rounded border border-emerald-500/10 text-[8px] font-bold uppercase tracking-widest">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                 Loja Aberta
              </div>
              <div className="w-8 h-8 rounded border border-white/10 bg-gray-900 p-0.5 shadow-xl flex items-center justify-center text-amber-500 shadow-inner">
                 <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=John" alt="Avatar" className="w-full h-full rounded opacity-80" />
              </div>
           </div>
        </header>

        <div className="px-4 lg:px-12 py-8">
           <AnimatePresence mode="wait">
              {activeTab === 'dashboard' && (
                <motion.div key="dashboard" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.3 }}>
                   <FinancialPanel />
                </motion.div>
              )}
              {activeTab === 'menu' && (
                <motion.div key="menu" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.3 }}>
                   <MenuManagement />
                </motion.div>
              )}
              {activeTab === 'settings' && (
                <motion.div key="settings" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.3 }}>
                   <StoreSettings />
                </motion.div>
              )}
           </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function CompanyNavItem({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`
        flex items-center gap-3 w-full p-2.5 rounded transition-all duration-300 group relative
        ${active ? 'bg-amber-600 text-white shadow shadow-amber-900/20' : 'text-slate-500 hover:text-white hover:bg-white/5'}
      `}
    >
      <span className={`${active ? 'scale-105' : 'group-hover:scale-105'} transition-transform shrink-0`}>
        {icon}
      </span>
      <span className="font-bold text-[9px] uppercase tracking-widest">{label}</span>
      {active && (
        <motion.div 
          layoutId="company-nav-glow" 
          className="absolute left-0 w-0.5 h-3 bg-white rounded-r-full" 
        />
      )}
    </button>
  );
}

function BlockedScreen({ status, onRetry }: { status: AccountState, onRetry: () => void }) {
  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-6 text-center">
       <motion.div 
         initial={{ opacity: 0, y: 30 }} 
         animate={{ opacity: 1, y: 0 }}
         className="max-w-md bg-dark-card p-10 rounded-xl shadow-2xl border border-dark-border relative overflow-hidden"
       >
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 blur-3xl pointer-events-none rounded-full" />
          
          <div className="w-20 h-20 bg-primary/10 text-primary border border-primary/20 rounded-xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-primary/10">
             {status === 'blocked' ? <Lock size={40} /> : <AlertCircle size={40} />}
          </div>
          <h2 className="text-xl font-bold text-white mb-4 tracking-tighter leading-tight uppercase italic">ACESSO<br /><span className="text-primary font-light">INTERROMPIDO</span></h2>
          <p className="text-slate-400 font-medium mb-8 text-sm leading-relaxed italic">
             {status === 'blocked' 
               ? "Seu acesso foi bloqueado manualmente pelo administrador do sistema." 
               : "Sua licença expirou devido ao prazo de acesso ter se encerrado."}
             <br />
             <strong className="text-primary mt-4 block uppercase tracking-widest text-[9px] font-bold italic underline decoration-primary/30">Entre em contato com o suporte para regularizar.</strong>
          </p>
          <button 
            onClick={onRetry}
            className="w-full bg-primary text-white py-4 rounded-xl font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-primary-hover transition-all shadow-xl shadow-primary/20"
          >
             Tentar Novamente
          </button>
       </motion.div>
    </div>
  );
}
