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
  AlertCircle
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
    <div className="flex min-h-screen bg-dark-bg font-sans text-slate-200 overflow-hidden">
      {/* Mobile Top Bar */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-dark-card border-b border-dark-border absolute top-0 left-0 right-0 z-[60]">
         <div className="flex items-center gap-2">
            <div className="bg-primary p-2 rounded-lg text-white">
              <Store size={18} />
            </div>
            <span className="font-bold text-sm tracking-tighter text-white uppercase italic">MENU<span className="text-primary font-light">MASTER</span></span>
         </div>
         <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-dark-bg rounded-lg text-slate-400">
            {isSidebarOpen ? <X size={20} /> : <MenuIcon size={20} />}
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
          fixed inset-y-0 left-0 w-64 bg-dark-card border-r border-dark-border z-[80] transition-transform duration-300 lg:static lg:translate-x-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="h-full flex flex-col">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center text-white shadow-lg shadow-primary/20">
                <Store size={20} />
              </div>
              <div>
                <h2 className="font-bold text-sm text-white leading-none tracking-tight italic uppercase">MINHA<span className="text-primary font-light">LOJA</span></h2>
                <p className="text-[9px] text-primary font-bold uppercase tracking-[0.2em] mt-1 italic">Painel Gerencial</p>
              </div>
            </div>

            <nav className="space-y-1.5">
              <CompanyNavItem 
                active={activeTab === 'dashboard'} 
                onClick={() => setActiveTab('dashboard')}
                icon={<LayoutDashboard size={18} />}
                label="Visão Geral"
              />
              <CompanyNavItem 
                active={activeTab === 'menu'} 
                onClick={() => setActiveTab('menu')}
                icon={<ShoppingBag size={18} />}
                label="Cardápio"
              />
              <CompanyNavItem 
                active={activeTab === 'settings'} 
                onClick={() => setActiveTab('settings')}
                icon={<Store size={18} />}
                label="Dados da Loja"
              />
            </nav>
          </div>

          <div className="mt-auto p-4 border-t border-dark-border/50">
             <div className="bg-dark-bg/40 p-4 rounded-xl mb-4 flex flex-col gap-2 border border-dark-border/50 group cursor-pointer hover:border-primary/30 transition-all">
                <div className="flex justify-between items-center text-primary">
                   <p className="text-[9px] font-bold uppercase tracking-[0.2em]">Link Público</p>
                   <ExternalLink size={12} />
                </div>
                <div className="flex items-center justify-between">
                   <p className="text-[11px] font-bold text-white overflow-hidden text-ellipsis whitespace-nowrap">burguerchef.link</p>
                   <ChevronRight size={12} className="text-slate-600 group-hover:translate-x-1 transition-transform" />
                </div>
             </div>
             
             <button className="flex items-center gap-3 w-full p-3.5 text-slate-500 hover:text-red-400 hover:bg-red-500/5 rounded-xl transition-all font-bold text-[9px] uppercase tracking-[0.2em]">
                <LogOut size={18} />
                Encerrar Sessão
             </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 w-full overflow-y-auto pt-20 lg:pt-0 no-scrollbar">
        <header className="h-20 px-4 lg:px-10 flex items-center justify-between sticky top-0 bg-dark-bg/80 backdrop-blur-xl z-40 border-b border-dark-border/30">
           <div className="flex flex-col">
              <h1 className="text-lg font-bold text-white tracking-tight uppercase italic">
                 {activeTab === 'dashboard' && 'Bom trabalho, João! 👋'}
                 {activeTab === 'menu' && 'Gestão de Cardápio'}
                 {activeTab === 'settings' && 'Personalização'}
              </h1>
              <p className="text-xs text-slate-500 font-bold italic">
                 {activeTab === 'dashboard' && 'Aqui estão as métricas da sua loja hoje.'}
                 {activeTab === 'menu' && 'Organize categorias, produtos e preços.'}
                 {activeTab === 'settings' && 'Mantenha seus dados sempre atualizados.'}
              </p>
           </div>
           <div className="flex items-center gap-6">
              <div className="hidden sm:flex items-center gap-2 bg-emerald-400/10 text-emerald-400 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] border border-emerald-400/20">
                 <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                 Ativa
              </div>
              <div className="w-10 h-10 rounded-xl border border-dark-border bg-dark-card p-0.5 shadow-xl flex items-center justify-center text-primary">
                 <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=John" alt="Avatar" className="w-full h-full rounded-lg bg-dark-bg" />
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
        flex items-center gap-3.5 w-full p-3.5 rounded-xl transition-all duration-300 group relative
        ${active ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-slate-500 hover:text-white hover:bg-dark-bg'}
      `}
    >
      <span className={`${active ? 'scale-110' : 'group-hover:scale-110'} transition-transform`}>
        {icon}
      </span>
      <span className="font-bold text-xs uppercase tracking-tight">{label}</span>
      {active && (
        <motion.div 
          layoutId="company-nav-glow" 
          className="absolute left-0 w-0.5 h-4 bg-white rounded-r-full shadow-[0_0_8px_rgba(255,255,255,0.8)]" 
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
