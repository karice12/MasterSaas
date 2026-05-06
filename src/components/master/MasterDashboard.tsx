import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  TrendingUp, 
  TrendingDown, 
  Settings, 
  Plus, 
  Search, 
  Eye, 
  Trash2, 
  MoreVertical, 
  LayoutDashboard, 
  Globe, 
  LogOut,
  ChevronRight,
  Shield,
  Clock,
  History,
  Download,
  Receipt,
  Link as LinkIcon,
  Phone,
  Calendar,
  ArrowRight,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { formatBRL, toCents, fromCents } from '../../lib/currency';

// --- Types ---
interface Company {
  id: string;
  name: string;
  slug: string;
  whatsapp: string;
  access_expires_at: string;
  status: 'active' | 'expired' | 'blocked';
  created_at: string;
}

interface MasterIncome {
  id: string;
  company_id: string;
  amount: number;
  payment_date: string;
  plan: string;
  status: 'pago' | 'pendente' | 'atrasado';
  companies?: { name: string };
}

interface MasterExpense {
  id: string;
  description: string;
  amount: number;
  spent_at: string;
  category: string;
  status: 'pago' | 'pendente' | 'atrasado';
}

export default function MasterDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'companies' | 'finance' | 'logs'>('dashboard');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFinanceModal, setShowFinanceModal] = useState(false);
  const [financeType, setFinanceType] = useState<'income' | 'expense'>('income');
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [incomeList, setIncomeList] = useState<MasterIncome[]>([]);
  const [expenseList, setExpenseList] = useState<MasterExpense[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    whatsapp: '',
    access_expires_at: ''
  });

  const [financeFormData, setFinanceFormData] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: 'Infraestrutura',
    company_id: '',
    plan: 'mensal'
  });

  useEffect(() => {
    fetchCompanies();
    fetchFinance();
  }, []);

  async function fetchCompanies() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchFinance() {
    try {
      const [incomeRes, expenseRes] = await Promise.all([
        supabase.from('master_income').select('*, companies(name)').order('payment_date', { ascending: false }),
        supabase.from('master_expenses').select('*').order('spent_at', { ascending: false })
      ]);

      if (incomeRes.data) setIncomeList(incomeRes.data);
      if (expenseRes.data) setExpenseList(expenseRes.data);
    } catch (error) {
      console.error('Error fetching finance:', error);
    }
  }

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('companies')
        .insert([{
          name: formData.name,
          slug: formData.slug,
          whatsapp: formData.whatsapp,
          access_expires_at: formData.access_expires_at,
          status: 'active'
        }])
        .select();

      if (error) throw error;
      
      await fetchCompanies();
      setShowAddModal(false);
      setFormData({ name: '', slug: '', whatsapp: '', access_expires_at: '' });
    } catch (error) {
      console.error('Erro ao cadastrar:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFinance = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Conversion to numeric decimal for Supabase (which expects DECIMAL)
      // But we process as integer in logic if needed
      const numAmount = parseFloat(financeFormData.amount.replace(',', '.'));

      if (financeType === 'income') {
        const { error } = await supabase.from('master_income').insert([{
          company_id: financeFormData.company_id || null,
          amount: numAmount,
          payment_date: financeFormData.date,
          plan: financeFormData.plan,
          status: 'pago'
        }]);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('master_expenses').insert([{
          description: financeFormData.description,
          amount: numAmount,
          spent_at: financeFormData.date,
          category: financeFormData.category,
          status: 'pago'
        }]);
        if (error) throw error;
      }

      await fetchFinance();
      setShowFinanceModal(false);
      setFinanceFormData({
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        category: 'Infraestrutura',
        company_id: '',
        plan: 'mensal'
      });
    } catch (error) {
      console.error('Erro ao registrar finanças:', error);
    } finally {
      setLoading(false);
    }
  };

  // Financial Stats
  const stats = useMemo(() => {
    const totalIncome = incomeList.filter(i => i.status === 'pago').reduce((acc, curr) => acc + Number(curr.amount), 0);
    const totalExpenses = expenseList.filter(e => e.status === 'pago').reduce((acc, curr) => acc + Number(curr.amount), 0);
    const profit = totalIncome - totalExpenses;
    
    return {
      income: formatBRL(totalIncome),
      expenses: formatBRL(totalExpenses),
      profit: formatBRL(profit),
      companiesCount: companies.length
    };
  }, [incomeList, expenseList, companies]);

  const handleDownloadPDF = (type: string) => {
    console.log('Baixando relatório:', type);
    alert('Relatório PDF gerado com sucesso (Simulado)');
  };

  const filteredCompanies = companies.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-950 text-slate-300 font-sans selection:bg-amber-600/30">
      {/* Sidebar - Compacta */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? '224px' : '64px' }}
        className="bg-gray-900 border-r border-white/5 flex flex-col z-50 shadow-2xl relative"
      >
        <div className="p-4 flex items-center justify-between border-b border-white/5 bg-black/20">
          {isSidebarOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2"
            >
              <div className="w-6 h-6 bg-amber-600 rounded flex items-center justify-center text-white shadow-lg shadow-amber-900/20">
                <Shield size={14} />
              </div>
              <span className="font-bold text-[11px] tracking-widest text-white uppercase italic">Master<span className="text-amber-500 font-light">SaaS</span></span>
            </motion.div>
          )}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1.5 hover:bg-white/5 rounded text-slate-500 hover:text-amber-500 transition-colors"
          >
            <ChevronRight size={14} className={`transition-transform duration-300 ${isSidebarOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-2">
          <NavItem 
            icon={<LayoutDashboard size={16} />} 
            label="Centro de Operações" 
            active={activeTab === 'dashboard'} 
            collapsed={!isSidebarOpen}
            onClick={() => setActiveTab('dashboard')}
          />
          <NavItem 
            icon={<Globe size={16} />} 
            label="Empresas & Slugs" 
            active={activeTab === 'companies'} 
            collapsed={!isSidebarOpen}
            onClick={() => setActiveTab('companies')}
          />
          <NavItem 
            icon={<TrendingUp size={16} />} 
            label="Fluxo Financeiro" 
            active={activeTab === 'finance'} 
            collapsed={!isSidebarOpen}
            onClick={() => setActiveTab('finance')}
          />
          <NavItem 
            icon={<History size={16} />} 
            label="Registros Logs" 
            active={activeTab === 'logs'} 
            collapsed={!isSidebarOpen}
            onClick={() => setActiveTab('logs')}
          />
        </nav>

        <div className="p-4 border-t border-white/5 bg-black/10">
          <button className="flex items-center gap-3 w-full p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/5 rounded transition-all text-[9px] font-bold uppercase tracking-widest">
            <LogOut size={16} />
            {isSidebarOpen && <span>Encerrar Sessão</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header - Sutil */}
        <header className="h-14 border-b border-white/5 flex items-center justify-between px-8 bg-gray-900/50 backdrop-blur-md z-40">
          <div>
            <h1 className="text-white font-bold text-xs tracking-[0.2em] uppercase italic flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
              Visão Estratégica
            </h1>
            <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mt-0.5 opacity-60 italic">Node Principal: Master-Alpha-01</p>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-[9px] font-bold text-white uppercase italic tracking-widest">Erika Master</span>
              <span className="text-[7px] text-amber-500 uppercase font-black tracking-widest opacity-80">Administradora Root</span>
            </div>
            <div className="w-8 h-8 rounded border border-white/10 bg-gray-800 flex items-center justify-center text-amber-500 shadow-inner font-black text-[10px]">
              E
            </div>
          </div>
        </header>

        {/* Dashboard Area */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                {/* Stats Grid - Densa */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard label="Receita Bruta" value={stats.income} trend="Sincronizado" icon={<TrendingUp size={14} />} color="emerald" />
                  <StatCard label="Empresas Ativas" value={stats.companiesCount.toString()} trend="+8" icon={<Users size={14} />} color="amber" />
                  <StatCard label="Fluxo Operacional" value={stats.expenses} trend="Custos" icon={<TrendingDown size={14} />} color="rose" />
                  <StatCard label="Lucro Líquido" value={stats.profit} trend="Real" icon={<TrendingUp size={14} />} color="blue" />
                </div>

                {/* Charts Area - Simplified */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                   <div className="lg:col-span-2 bg-gray-900 p-6 rounded border border-white/5 shadow-sm">
                      <div className="flex items-center justify-between mb-8">
                         <div>
                            <h3 className="text-white text-[10px] font-bold uppercase tracking-widest italic">Crescimento de Receita</h3>
                            <p className="text-[8px] text-slate-500 font-medium italic mt-0.5">Performance anual de licenciamento</p>
                         </div>
                         <select className="bg-gray-800 border border-white/5 text-[9px] text-slate-400 p-1.5 rounded focus:outline-none focus:border-amber-500 uppercase font-bold tracking-widest italic cursor-pointer transition-all">
                            <option>Últimos 12 meses</option>
                            <option>Ano anterior</option>
                         </select>
                      </div>
                      <div className="h-[240px] flex items-end gap-3 px-2">
                         {[40, 65, 45, 90, 65, 80, 100, 85, 70, 95, 110, 130].map((h, i) => (
                            <div key={i} className="flex-1 bg-amber-600/10 hover:bg-amber-600/30 transition-all rounded-t relative group border-x border-t border-amber-600/5">
                               <motion.div 
                                  initial={{ height: 0 }}
                                  animate={{ height: `${h}%` }}
                                  transition={{ delay: i * 0.05, duration: 0.8 }}
                                  className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-amber-600 to-amber-500 group-hover:from-amber-500 group-hover:to-amber-400 transition-all shadow-[0_0_15px_rgba(245,158,11,0.1)]"
                               />
                               <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-[7px] text-white font-bold p-1 rounded border border-white/10 z-10 whitespace-nowrap">
                                  R$ {h * 1.2}k
                               </div>
                            </div>
                         ))}
                      </div>
                   </div>
                   
                   <div className="bg-gray-900 p-6 rounded border border-white/5 shadow-sm relative overflow-hidden">
                      <h3 className="text-white text-[10px] font-bold uppercase tracking-widest italic mb-6">Status dos Planos</h3>
                      <div className="space-y-6 pt-4">
                         <PlanStat label="Plano Basic" percent={65} color="emerald" companies={82} />
                         <PlanStat label="Plano Premium" percent={45} color="amber" companies={34} />
                         <PlanStat label="Plano Enterprise" percent={20} color="rose" companies={12} />
                      </div>
                      <div className="mt-12 pt-6 border-t border-white/5">
                         <button className="w-full py-2 bg-gray-800 border border-white/5 rounded text-[8px] font-bold uppercase tracking-widest text-slate-400 hover:text-white hover:bg-gray-700 transition-all cursor-pointer">
                            Exportar Analytics (CSV)
                         </button>
                      </div>
                   </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'companies' && (
              <motion.div 
                key="companies"
                initial={{ opacity: 0, scale: 0.99 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.99 }}
                className="bg-gray-900 rounded border border-white/5 shadow-sm overflow-hidden flex flex-col h-full max-h-[calc(100vh-140px)]"
              >
                <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 bg-black/10">
                   <div>
                      <h2 className="text-[10px] font-bold text-white tracking-widest uppercase italic">Gerenciamento de Slugs</h2>
                      <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mt-1 italic opacity-60">Diretório Central de Licenciados</p>
                   </div>
                   
                   <div className="flex items-center gap-3 w-full sm:w-auto">
                      <div className="relative flex-1 sm:flex-initial">
                         <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={12} />
                         <input 
                            type="text" 
                            placeholder="Filtrar..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full sm:w-48 pl-9 pr-3 py-1.5 bg-gray-800 border border-white/5 rounded text-[10px] font-medium text-white focus:outline-none focus:border-amber-500 transition-all placeholder:text-gray-600"
                         />
                      </div>
                      <button 
                         onClick={() => setShowAddModal(true)}
                         className="bg-amber-600 text-white px-4 py-1.5 rounded shadow shadow-amber-900/10 hover:bg-amber-700 transition-all flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest whitespace-nowrap"
                      >
                         <Plus size={14} /> Novo Cadastro
                      </button>
                   </div>
                </div>

                <div className="flex-1 overflow-auto no-scrollbar">
                   <table className="w-full text-left table-auto">
                      <thead className="sticky top-0 bg-gray-900 z-10 shadow-sm">
                        <tr className="bg-gray-800/50 text-slate-500 text-[8px] font-bold uppercase tracking-[0.2em] border-b border-white/5">
                          <th className="px-5 py-3">Empresa</th>
                          <th className="px-5 py-3">WhatsApp</th>
                          <th className="px-5 py-3">Expiração</th>
                          <th className="px-5 py-3">Status</th>
                          <th className="px-5 py-3 text-right">Ação</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.03]">
                        {loading ? (
                          <tr>
                            <td colSpan={5} className="px-5 py-20 text-center text-slate-500 font-bold uppercase tracking-widest text-[8px]">
                              <div className="flex flex-col items-center gap-4">
                                <div className="w-6 h-6 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
                                Processando integridade de dados...
                              </div>
                            </td>
                          </tr>
                        ) : filteredCompanies.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-5 py-20 text-center text-slate-500 font-bold uppercase tracking-widest text-[9px] italic">
                              Nenhum registro encontrado no cluster atual.
                            </td>
                          </tr>
                        ) : (
                          filteredCompanies.map((company, index) => (
                            <CompanyRow 
                              key={company.id}
                              index={index}
                              name={company.name} 
                              slug={company.slug} 
                              whatsapp={company.whatsapp}
                              expiry={new Date(company.access_expires_at).toLocaleDateString('pt-BR')} 
                              status={company.status} 
                            />
                          ))
                        )}
                      </tbody>
                   </table>
                </div>
              </motion.div>
            )}

            {activeTab === 'finance' && (
              <motion.div 
                key="finance"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              >
                 <FinanceSection 
                    title="Entradas Financeiras" 
                    subtitle="Pagamentos e renovações de licenças"
                    icon={<TrendingUp size={16} className="text-emerald-500" />}
                    type="income"
                    onDownload={() => handleDownloadPDF('income')}
                 />
                 <FinanceSection 
                    title="Investimentos & Custos" 
                    subtitle="Manutenção de infra e expansão SaaS"
                    icon={<Receipt size={16} className="text-amber-500" />}
                    type="expense"
                    onDownload={() => handleDownloadPDF('expense')}
                 />
              </motion.div>
            )}

            {activeTab === 'logs' && (
              <motion.div 
                key="logs"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-gray-900 p-6 rounded border border-white/5 overflow-hidden"
              >
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-2.5 bg-gray-800 rounded border border-white/5 text-amber-500">
                    <History size={18} />
                  </div>
                  <div>
                    <h2 className="text-[10px] font-bold text-white tracking-widest uppercase italic">Logs do Sistema</h2>
                    <p className="text-[9px] text-slate-500 font-medium italic mt-0.5">Auditoria administrativa e eventos root</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <LogItem time="14:20 - Hoje" user="Master Admin" action="Empresa 'Burguer King' cadastrada" detail="Slug: burguer-king | Termo: 12m" />
                  <LogItem time="09:15 - Hoje" user="System Root" action="Scan de Integridade concluído" detail="Todos os clusters operando em normalidade" />
                  <LogItem time="18:30 - Ontem" user="Master Admin" action="Receita registrada R$ 499,90" detail="Venda PIX | Pizzaria 01" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Modal Adicionar Empresa */}
        <AnimatePresence>
          {showAddModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowAddModal(false)}
                className="absolute inset-0 bg-black/90 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="bg-gray-900 w-full max-w-sm rounded border border-white/5 shadow-2xl relative overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="bg-amber-600/10 p-2 rounded text-amber-500 border border-amber-600/10">
                        <Plus size={16} />
                      </div>
                      <div>
                        <h2 className="text-xs font-bold text-white uppercase italic tracking-wider">Cadastrar <span className="text-amber-500 font-light">Empresa</span></h2>
                        <p className="text-[9px] text-slate-500 font-medium italic">Novo licenciado SaaS</p>
                      </div>
                    </div>
                    <button onClick={() => setShowAddModal(false)} className="p-1.5 hover:bg-white/5 rounded text-slate-500 hover:text-white transition-colors">
                      <X size={16} />
                    </button>
                  </div>

                  <form onSubmit={handleCreateCompany} className="space-y-4">
                    <div className="space-y-3">
                      <FormInput 
                        label="Nome Fantasia" 
                        icon={<Globe size={14} />} 
                        placeholder="Ex: Burguer"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        required
                      />
                      <FormInput 
                        label="Slug (Subdomínio)" 
                        icon={<LinkIcon size={14} />} 
                        placeholder="ex: burguer-01"
                        value={formData.slug}
                        onChange={(e) => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                        required
                      />
                      <FormInput 
                        label="WhatsApp" 
                        icon={<Phone size={14} />} 
                        placeholder="55..."
                        value={formData.whatsapp}
                        onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                        required
                      />
                      <FormInput 
                        label="Expiração" 
                        icon={<Calendar size={14} />} 
                        type="date"
                        value={formData.access_expires_at}
                        onChange={(e) => setFormData({...formData, access_expires_at: e.target.value})}
                        required
                      />
                    </div>

                    <div className="pt-2">
                      <button 
                        type="submit"
                        disabled={loading}
                        className="w-full bg-amber-600 text-white py-2.5 rounded font-bold text-[10px] uppercase tracking-widest hover:bg-amber-700 shadow-lg shadow-amber-900/10 transition-all flex items-center justify-center gap-2"
                      >
                        {loading ? 'PROCESSANDO...' : 'FINALIZAR CADASTRO'}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>

      {/* Modal Financeiro */}
      <AnimatePresence>
        {showFinanceModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowFinanceModal(false)}
                className="absolute inset-0 bg-black/90 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="bg-gray-900 w-full max-w-sm rounded border border-white/5 shadow-2xl relative"
              >
                 <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                       <h2 className="text-xs font-bold text-white uppercase italic tracking-wider">Registrar {financeType === 'income' ? 'Receita' : 'Despesa'}</h2>
                       <button onClick={() => setShowFinanceModal(false)} className="text-slate-500 hover:text-white"><X size={16} /></button>
                    </div>

                    <form onSubmit={handleCreateFinance} className="space-y-4">
                       {financeType === 'income' ? (
                          <div className="space-y-3">
                             <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1 italic">Empresa Relacionada</label>
                             <select 
                                value={financeFormData.company_id}
                                onChange={(e) => setFinanceFormData({...financeFormData, company_id: e.target.value})}
                                className="w-full bg-gray-800 border border-white/5 rounded py-2 px-3 text-[10px] font-medium text-white focus:outline-none focus:border-amber-500 transition-all uppercase"
                             >
                                <option value="">Sem empresa específica</option>
                                {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                             </select>
                             
                             <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1 italic">Plano</label>
                             <select 
                                value={financeFormData.plan}
                                onChange={(e) => setFinanceFormData({...financeFormData, plan: e.target.value})}
                                className="w-full bg-gray-800 border border-white/5 rounded py-2 px-3 text-[10px] font-medium text-white focus:outline-none focus:border-amber-500 transition-all"
                             >
                                <option value="mensal">Mensal</option>
                                <option value="trimestral">Trimestral</option>
                                <option value="anual">Anual</option>
                                <option value="avulso">Avulso</option>
                             </select>
                          </div>
                       ) : (
                          <FormInput 
                             label="Descrição" 
                             icon={<Receipt size={14} />} 
                             placeholder="Ex: AWS Server"
                             value={financeFormData.description}
                             onChange={(e) => setFinanceFormData({...financeFormData, description: e.target.value})}
                             required
                          />
                       )}

                       <FormInput 
                          label="Valor (R$)" 
                          icon={<TrendingUp size={14} />} 
                          placeholder="0,00"
                          value={financeFormData.amount}
                          onChange={(e) => setFinanceFormData({...financeFormData, amount: e.target.value})}
                          required
                       />

                       <FormInput 
                          label="Data" 
                          icon={<Calendar size={14} />} 
                          type="date"
                          value={financeFormData.date}
                          onChange={(e) => setFinanceFormData({...financeFormData, date: e.target.value})}
                          required
                       />

                       <button 
                          type="submit"
                          disabled={loading}
                          className="w-full bg-amber-600 text-white py-2.5 rounded font-bold text-[10px] uppercase tracking-widest hover:bg-amber-700 shadow-lg shadow-amber-900/10 transition-all"
                       >
                          {loading ? 'SALVANDO...' : 'CONFIRMAR REGISTRO'}
                       </button>
                    </form>
                 </div>
              </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ label, value, trend, icon, color }: { 
  label: string, 
  value: string, 
  trend: string, 
  icon: React.ReactNode, 
  color: 'emerald' | 'amber' | 'rose' | 'blue'
}) {
  const colorMap = {
    emerald: 'text-emerald-500 bg-emerald-500/5',
    amber: 'text-amber-500 bg-amber-500/5',
    rose: 'text-rose-500 bg-rose-500/5',
    blue: 'text-blue-500 bg-blue-500/5'
  };

  return (
    <div className="bg-gray-900 p-4 rounded border border-white/5 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-3 text-slate-800 opacity-20 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest italic">{label}</p>
      <div className="flex items-baseline gap-2 mt-1">
        <h3 className="text-lg font-bold text-white tracking-tight italic">{value}</h3>
        <span className={`text-[8px] font-black uppercase tracking-tighter ${trend.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>
          {trend}
        </span>
      </div>
    </div>
  );
}

function PlanStat({ label, percent, color, companies }: { 
  label: string, 
  percent: number, 
  color: 'emerald' | 'amber' | 'rose',
  companies: number
}) {
  const colorMap = {
    emerald: 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.2)]',
    amber: 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.2)]',
    rose: 'bg-rose-500 shadow-[0_0_10_rgba(244,63,94,0.2)]'
  };

  return (
    <div className="space-y-1.5">
       <div className="flex items-center justify-between text-[9px] font-bold uppercase italic tracking-widest">
          <span className="text-white">{label}</span>
          <span className="text-slate-500 font-medium">{companies} empresas</span>
       </div>
       <div className="h-1 bg-gray-800 rounded-full overflow-hidden border border-white/5">
          <motion.div 
             initial={{ width: 0 }}
             animate={{ width: `${percent}%` }}
             transition={{ duration: 1, ease: "easeOut" }}
             className={`h-full ${colorMap[color]}`}
          />
       </div>
    </div>
  );
}

function NavItem({ icon, label, active, collapsed, onClick }: { 
  icon: React.ReactNode, 
  label: string, 
  active: boolean, 
  collapsed: boolean,
  onClick: () => void 
}) {
  return (
    <button 
      onClick={onClick}
      className={`
        flex items-center gap-3 w-full p-2.5 rounded transition-all duration-200 group relative
        ${active ? 'bg-amber-600 text-white shadow shadow-amber-900/10' : 'text-slate-500 hover:text-white hover:bg-white/5'}
      `}
    >
      <span className={`${active ? 'scale-105' : 'group-hover:scale-105'} transition-transform shrink-0`}>{icon}</span>
      {!collapsed && <span className="font-bold text-[9px] uppercase tracking-widest truncate">{label}</span>}
      {active && !collapsed && (
        <motion.div 
          layoutId="nav-glow" 
          className="absolute left-0 w-0.5 h-3 bg-white rounded-r-full" 
        />
      )}
    </button>
  );
}

function CompanyRow({ index, name, slug, whatsapp, expiry, status }: { 
  index: number,
  name: string, 
  slug: string, 
  whatsapp: string,
  expiry: string, 
  status: string
}) {
  return (
    <tr className={`hover:bg-amber-500/5 transition-colors group ${index % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.01]'}`}>
      <td className="px-5 py-3 border-b border-white/5">
        <div>
          <p className="font-bold text-white tracking-tight text-[11px] uppercase italic">{name}</p>
          <p className="text-[8px] text-amber-500 font-bold uppercase tracking-widest mt-0.5 italic flex items-center gap-1 opacity-70">
            <Globe size={8} />
            {slug}.menumaster.com.br
          </p>
        </div>
      </td>
      <td className="px-5 py-3 text-[10px] font-bold text-slate-500 border-b border-white/5">
        <div className="flex items-center gap-2">
           <Phone size={11} className="text-gray-700" />
           {whatsapp}
        </div>
      </td>
      <td className="px-5 py-3 text-[10px] font-bold text-slate-500 font-mono tracking-wider border-b border-white/5">
        <div className="flex items-center gap-2">
           <Calendar size={11} className="text-gray-700" />
           {expiry}
        </div>
      </td>
      <td className="px-5 py-3 border-b border-white/5">
        <span className={`px-2 py-0.5 rounded text-[7px] font-bold uppercase tracking-[0.2em] border shadow-sm
          ${status === 'active' ? 'bg-emerald-500/5 text-emerald-500 border-emerald-500/10' : ''}
          ${status === 'expired' ? 'bg-amber-500/5 text-amber-500 border-amber-500/10' : ''}
          ${status === 'blocked' ? 'bg-red-500/5 text-red-500 border-red-500/10' : ''}
        `}>
          {status === 'active' ? 'Ativo' : status === 'expired' ? 'Vencido' : 'Suspenso'}
        </span>
      </td>
      <td className="px-5 py-3 text-right border-b border-white/5">
        <div className="flex items-center gap-1.5 justify-end">
          <button className="p-1.5 bg-gray-800 border border-white/5 rounded text-slate-500 hover:text-white hover:bg-gray-700 transition-all"><Eye size={12} /></button>
          <button className="p-1.5 bg-gray-800 border border-white/5 rounded text-slate-500 hover:text-white hover:bg-gray-700 transition-all"><Settings size={12} /></button>
          <button className="p-1.5 bg-gray-800 border border-white/5 rounded text-slate-500 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all"><Trash2 size={12} /></button>
        </div>
      </td>
    </tr>
  );
}

function FinanceSection({ title, subtitle, icon, type, data, onAdd, onDownload }: { 
  title: string, 
  subtitle: string, 
  icon: React.ReactNode, 
  type: 'income' | 'expense',
  data: any[],
  onAdd: () => void,
  onDownload: () => void
}) {
  return (
    <div className="bg-gray-900 p-5 rounded border border-white/5 shadow-sm relative overflow-hidden group">
       <div className="flex items-start justify-between mb-6 relative z-10">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-gray-800 border border-white/5 rounded text-white shadow-inner">{icon}</div>
             <div>
                <h3 className="font-bold text-white text-[10px] tracking-wider uppercase italic">{title}</h3>
                <p className="text-[8px] text-slate-500 font-medium italic mt-0.5">{subtitle}</p>
             </div>
          </div>
          <button 
            onClick={onDownload}
            className="p-1.5 bg-gray-800 border border-white/5 rounded text-slate-500 hover:text-amber-500 transition-all"
          >
            <Download size={14} />
          </button>
       </div>

       <div className="space-y-2 mb-6 relative z-10 h-[240px] overflow-y-auto no-scrollbar">
          {data.length === 0 ? (
             <div className="h-full flex items-center justify-center text-[8px] font-bold text-slate-600 uppercase tracking-widest italic opacity-40">
                Nenhum registro encontrado
             </div>
          ) : data.map(item => (
             <div key={item.id} className="flex items-center justify-between p-3 bg-gray-800/40 rounded border border-white/5 hover:border-amber-500/20 transition-all group/item">
                <div className="flex items-center gap-3">
                   <div className={`w-8 h-8 flex items-center justify-center rounded font-bold text-[10px] border ${type === 'income' ? 'bg-emerald-500/5 text-emerald-500 border-emerald-500/10' : 'bg-gray-700/5 text-amber-500 border-white/5'}`}>
                      {type === 'income' ? '+' : '-'}
                   </div>
                   <div>
                      <p className="font-bold text-white text-[9px] tracking-tight uppercase italic truncate max-w-[120px]">
                         {type === 'income' ? (item.companies?.name || 'Assinatura') : item.description}
                      </p>
                      <p className="text-[7px] text-slate-600 uppercase font-bold tracking-widest mt-0.5 italic">
                         {new Date(type === 'income' ? item.payment_date : item.spent_at).toLocaleDateString('pt-BR')} • {item.plan || item.category || 'GERAL'}
                      </p>
                   </div>
                </div>
                <div className="text-right">
                   <p className={`font-bold text-[11px] ${type === 'income' ? 'text-emerald-500' : 'text-amber-500'}`}>
                      {formatBRL(Number(item.amount))}
                   </p>
                   <p className="text-[7px] text-slate-700 font-bold uppercase mt-0.5 tracking-tighter">Liquidado</p>
                </div>
             </div>
          ))}
       </div>

       <button 
          onClick={onAdd}
          className={`w-full py-2.5 rounded font-bold text-[9px] uppercase tracking-widest flex items-center justify-center gap-3 transition-all relative z-10
          ${type === 'income' ? 'bg-amber-600 text-white shadow shadow-amber-900/10 hover:bg-amber-700' : 'bg-white text-gray-950 hover:bg-slate-200'}
       `}>
          Registrar {type === 'income' ? 'Entrada' : 'Despesa'}
          <Plus size={14} />
       </button>
    </div>
  );
}

function LogItem({ time, user, action, detail }: { time: string, user: string, action: string, detail: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -5 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="flex gap-4 p-4 bg-gray-800/10 border border-transparent hover:border-white/5 hover:bg-gray-800/20 rounded transition-all group"
    >
      <div className="shrink-0 mt-1.5">
        <div className="w-1.5 h-1.5 rounded-full bg-amber-600 group-hover:scale-125 transition-transform" />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-3">
             <span className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">{time}</span>
             <span className="px-1.5 py-0.5 bg-amber-600/5 text-amber-500 text-[7px] font-bold uppercase rounded border border-amber-600/10">
                {user}
             </span>
          </div>
        </div>
        <p className="text-[10px] font-bold text-white uppercase italic tracking-tight">{action}</p>
        <p className="text-[9px] text-slate-500 font-medium italic mt-1 leading-relaxed">{detail}</p>
      </div>
    </motion.div>
  );
}

function FormInput({ label, icon, value, onChange, placeholder, type = "text", required = false }: {
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1 italic">{label}</label>
      <div className="relative group">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-amber-500 transition-colors">
          {icon}
        </div>
        <input 
          type={type}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          className="w-full bg-gray-800 border border-white/5 rounded py-2 pl-9 pr-3 text-[10px] font-medium text-white focus:outline-none focus:border-amber-500 transition-all placeholder:text-gray-600"
        />
      </div>
    </div>
  );
}
