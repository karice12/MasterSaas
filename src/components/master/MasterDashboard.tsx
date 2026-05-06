import React, { useState, useEffect } from 'react';
import { 
  Users, 
  TrendingUp, 
  Receipt, 
  Settings, 
  LogOut, 
  Menu as MenuIcon, 
  X, 
  LayoutDashboard,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  History,
  FileText,
  Search,
  Filter,
  Download,
  ExternalLink,
  ShieldCheck,
  Plus,
  Calendar,
  Phone,
  Link as LinkIcon,
  Globe,
  Lock,
  Eye,
  Trash2,
  AlertCircle,
  ArrowRight,
  MousePointer2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  Cell 
} from 'recharts';
import { generatePDFReport } from '../../lib/reports';
import { supabase } from '../../lib/supabase';

interface Company {
  id: string;
  nome: string;
  slug: string;
  whatsapp: string;
  data_expiracao: string;
  status: 'active' | 'blocked' | 'expired';
  created_at: string;
}

const mockChartData = [
  { name: 'Jan', gains: 4000, expenses: 2400 },
  { name: 'Fev', gains: 3000, expenses: 1398 },
  { name: 'Mar', gains: 5000, expenses: 3800 },
  { name: 'Abr', gains: 4500, expenses: 3200 },
  { name: 'Mai', gains: 6000, expenses: 4000 },
  { name: 'Jun', gains: 7500, expenses: 4200 },
];

const COLORS = ['#f97316', '#fb923c', '#fdba74', '#fed7aa'];

export default function MasterDashboard() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'companies' | 'finance' | 'logs'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    nome: '',
    slug: '',
    whatsapp: '',
    data_expiracao: ''
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('empresas')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    console.log('🚀 Iniciando cadastro de empresa...', formData);
    
    try {
      const { data, error } = await supabase
        .from('empresas')
        .insert([{
          nome: formData.nome,
          slug: formData.slug,
          whatsapp: formData.whatsapp,
          data_expiracao: formData.data_expiracao,
          status: 'active'
        }])
        .select();

      console.log('📡 Resposta do Supabase:', { data, error });

      if (error) throw error;
      
      alert('Empresa cadastrada com sucesso!');
      setShowAddModal(false);
      setFormData({ nome: '', slug: '', whatsapp: '', data_expiracao: '' });
      await fetchCompanies();
    } catch (error: any) {
      console.error('❌ Erro crítico ao criar empresa:', error);
      alert(`Erro ao cadastrar empresa: ${error.message || 'Verifique se o slug é único.'}`);
    } finally {
      setLoading(false);
      console.log('🏁 Processo de cadastro finalizado.');
    }
  };

  const handleDownloadPDF = (type: 'income' | 'expense') => {
    const title = type === 'income' ? 'Relatório de Ganhos - MenuMaster' : 'Relatório de Despesas - MenuMaster';
    const headers = type === 'income' 
      ? ['Empresa', 'Data', 'Valor', 'Plano', 'Método']
      : ['Descrição', 'Data', 'Valor', 'Categoria', 'Método'];
    
    const rows = type === 'income' 
      ? [
          ['Burguer do Chef', '04/05/2026', 'R$ 599,00', 'Anual', 'Pix'],
          ['Pizzaria Napoli', '02/05/2026', 'R$ 89,00', 'Mensal', 'Cartão'],
          ['Sushi Gourmet', '01/05/2026', 'R$ 249,00', 'Trimestral', 'Boleto']
        ]
      : [
          ['Hospedagem Servidor', '04/05/2026', 'R$ 120,00', 'Infraestrutura', 'Pix'],
          ['Domínio .com.br', '02/05/2026', 'R$ 40,00', 'Manutenção', 'Boleto'],
          ['Marketing Google Ads', '01/05/2026', 'R$ 500,00', 'Melhoria', 'Cartão']
        ];

    generatePDFReport({
      title,
      headers,
      rows,
      filename: `Relatorio_${type}_${new Date().toISOString().split('T')[0]}`
    });
  };

  const stats = [
    { label: 'Recebido Total', value: 'R$ 45.200,00', change: '+12%', sub: 'vs mês passado', icon: <ArrowUpRight className="text-emerald-400" /> },
    { label: 'Investimento', value: 'R$ 12.400,00', change: '+5%', sub: 'vs mês passado', icon: <ArrowDownRight className="text-primary" /> },
    { label: 'Lucro Líquido', value: 'R$ 32.800,00', change: '+18%', sub: 'vs mês passado', icon: <TrendingUp className="text-blue-400" /> },
    { label: 'Empresas Ativas', value: companies.filter(c => c.status === 'active').length.toString(), change: '+8', sub: 'novas este mês', icon: <Users className="text-purple-400" /> },
  ];

  const filteredCompanies = companies.filter(c => 
    c.nome.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-dark-bg text-slate-200 overflow-hidden font-sans">
      {/* Sidebar Overlay for Mobile */}
      <AnimatePresence>
        {!isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(true)}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[60] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside 
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } bg-dark-card border-r border-dark-border transition-all duration-300 flex flex-col z-[70] h-screen`}
      >
        <div className="p-6 flex items-center justify-between">
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2"
              >
                <div className="bg-primary p-2 rounded-lg text-white shadow-lg shadow-primary/20">
                  <ShieldCheck size={18} />
                </div>
                <span className="font-bold text-base tracking-tighter text-white uppercase italic">MASTER<span className="text-primary font-light">SaaS</span></span>
              </motion.div>
            )}
          </AnimatePresence>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-dark-bg rounded-lg transition-colors text-slate-500 hover:text-primary"
          >
            {isSidebarOpen ? <X size={18} /> : <MenuIcon size={18} />}
          </button>
        </div>

        <nav className="flex-1 px-3 space-y-1.5 py-4">
          <NavItem 
            icon={<LayoutDashboard size={20} />} 
            label="Centro de Operações" 
            active={activeTab === 'dashboard'} 
            collapsed={!isSidebarOpen}
            onClick={() => setActiveTab('dashboard')}
          />
          <NavItem 
            icon={<Users size={20} />} 
            label="Empresas & Licenças" 
            active={activeTab === 'companies'} 
            collapsed={!isSidebarOpen}
            onClick={() => setActiveTab('companies')}
          />
          <NavItem 
            icon={<Wallet size={20} />} 
            label="Finanças Globais" 
            active={activeTab === 'finance'} 
            collapsed={!isSidebarOpen}
            onClick={() => setActiveTab('finance')}
          />
          <NavItem 
            icon={<History size={20} />} 
            label="Logs do Sistema" 
            active={activeTab === 'logs'} 
            collapsed={!isSidebarOpen}
            onClick={() => setActiveTab('logs')}
          />
        </nav>

        <div className="p-4 border-t border-dark-border">
          <motion.button 
            whileHover={{ x: 5 }}
            className="flex items-center gap-3 w-full p-3.5 text-slate-500 hover:text-red-400 hover:bg-red-500/5 rounded-xl transition-all font-bold text-xs uppercase tracking-widest"
          >
            <LogOut size={18} />
            {isSidebarOpen && <span>Encerrar Acesso</span>}
          </motion.button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto no-scrollbar relative">
        <header className="h-20 bg-dark-bg/80 backdrop-blur-xl border-b border-dark-border px-8 flex items-center justify-between sticky top-0 z-40">
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight uppercase italic">
              {activeTab === 'dashboard' && 'Visão Estratégica'}
              {activeTab === 'companies' && 'Controle de Licenciados'}
              {activeTab === 'finance' && 'Inteligência Financeira'}
              {activeTab === 'logs' && 'Auditoria Completa'}
            </h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
              Olá, Administrador Mestre • Acesso Restrito
            </p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end hidden sm:flex">
               <span className="text-xs font-bold text-white">Administrador</span>
               <span className="text-[10px] text-primary font-bold uppercase tracking-widest leading-none mt-1">Super User</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-dark-card border border-dark-border flex items-center justify-center text-primary font-bold shadow-xl">
              KP
            </div>
          </div>
        </header>

        <div className="p-10 pb-20">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-10"
              >
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {stats.map((stat, idx) => (
                    <motion.div 
                      key={idx} 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      whileHover={{ y: -5 }}
                      className="bg-dark-card p-8 rounded-[32px] border border-dark-border shadow-2xl relative group overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                         {React.cloneElement(stat.icon as React.ReactElement, { size: 64 })}
                      </div>
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-2.5 bg-dark-bg rounded-xl border border-dark-border">{stat.icon}</div>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider ${stat.change.startsWith('+') ? 'text-emerald-400 bg-emerald-400/10' : 'text-primary bg-primary/10'}`}>
                          {stat.change}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">{stat.label}</p>
                      <h3 className="text-xl font-bold text-white leading-tight">{stat.value}</h3>
                      <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-2">{stat.sub}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Charts Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="lg:col-span-2 bg-dark-card p-8 rounded-xl border border-dark-border shadow-xl"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                      <div>
                        <h3 className="text-base font-bold text-white tracking-tight uppercase italic">Performance Mensal</h3>
                        <p className="text-xs text-slate-500 font-medium mt-1">Evolução de ganhos reais vs despesas operacionais</p>
                      </div>
                      <select className="bg-dark-bg border border-dark-border text-[10px] font-bold uppercase tracking-widest rounded-lg px-4 py-2 text-slate-400 focus:outline-none focus:border-primary">
                        <option>Último Semestre</option>
                        <option>Ano fiscal 2026</option>
                      </select>
                    </div>
                    <div className="h-[350px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={mockChartData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                          <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fill: '#475569', fontSize: 10, fontWeight: 'bold'}}
                            dy={15}
                          />
                          <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fill: '#475569', fontSize: 10, fontWeight: 'bold'}}
                            dx={-10}
                          />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#1e293b', borderRadius: '16px', border: '1px solid #334155', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'}}
                            itemStyle={{fontWeight: 'bold', fontSize: '10px'}}
                          />
                          <Line type="monotone" dataKey="gains" stroke="#f97316" strokeWidth={5} dot={{ r: 6, fill: '#f97316', strokeWidth: 0 }} activeDot={{ r: 8 }} />
                          <Line type="monotone" dataKey="expenses" stroke="#1e293b" strokeWidth={3} strokeDasharray="5 5" dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </motion.div>

                  <div className="bg-dark-card p-8 rounded-xl border border-dark-border shadow-xl">
                    <h3 className="text-base font-bold text-white tracking-tight mb-8 uppercase italic">Receita por Plano</h3>
                    <div className="h-[280px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={[
                          { name: 'Mensal', val: 15 },
                          { name: 'Trim.', val: 25 },
                          { name: 'Anual', val: 55 },
                          { name: 'Avulso', val: 5 },
                        ]}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 9, fill: '#475569', fontWeight: 'bold'}} dy={10} />
                          <Tooltip cursor={{fill: 'rgba(249, 115, 22, 0.05)'}} contentStyle={{backgroundColor: '#0f172a', border: 'none', borderRadius: '8px'}} />
                          <Bar dataKey="val" radius={[6, 6, 0, 0]} barSize={35}>
                            {[1,2,3,4].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-8 space-y-4">
                       <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest">
                          <span className="text-slate-500">Conversão Anual</span>
                          <span className="text-primary">55%</span>
                       </div>
                       <div className="w-full bg-dark-bg h-1.5 rounded-full overflow-hidden border border-dark-border">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: '55%' }}
                            className="bg-primary h-full shadow-[0_0_8px_rgba(249,115,22,0.5)]" 
                          />
                       </div>
                       <p className="text-[9px] text-slate-600 font-bold italic leading-relaxed">
                          * O plano anual representa a maior parte da retenção e fluxo de caixa antecipado.
                       </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'companies' && (
              <motion.div 
                key="companies"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="bg-dark-card rounded-xl border border-dark-border shadow-xl overflow-hidden">
                   <div className="p-8 border-b border-dark-border flex flex-col sm:flex-row justify-between items-center bg-dark-card/30 gap-6">
                      <div>
                         <h2 className="text-lg font-bold text-white tracking-tight uppercase italic">Gestão de Empresas</h2>
                         <p className="text-xs text-slate-500 font-medium italic">Controle de links, licenças e visibilidade pública</p>
                      </div>
                      <div className="flex items-center gap-3 w-full sm:w-auto">
                         <div className="relative flex-1 sm:flex-none">
                            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input 
                               type="text" 
                               placeholder="Buscar empresa..." 
                               value={searchQuery}
                               onChange={(e) => setSearchQuery(e.target.value)}
                               className="w-full sm:w-60 pl-10 pr-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-xs font-medium text-white focus:outline-none focus:border-primary transition-all"
                            />
                         </div>
                         <button 
                            onClick={() => setShowAddModal(true)}
                            className="bg-primary text-white px-6 py-3 rounded-lg shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest"
                         >
                            <Plus size={18} /> Novo Cadastro
                         </button>
                      </div>
                   </div>

                   <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-dark-bg/30 text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">
                            <th className="px-8 py-4">Empresa / Subdomínio</th>
                            <th className="px-8 py-4">WhatsApp</th>
                            <th className="px-8 py-4">Expiração</th>
                            <th className="px-8 py-4">Status</th>
                            <th className="px-8 py-4 text-right">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-dark-border/50">
                          {loading ? (
                            <tr>
                              <td colSpan={5} className="px-8 py-20 text-center text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                                <div className="flex flex-col items-center gap-4">
                                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                  Carregando base de dados...
                                </div>
                              </td>
                            </tr>
                          ) : filteredCompanies.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="px-8 py-20 text-center text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                                Nenhuma empresa encontrada.
                              </td>
                            </tr>
                          ) : (
                            filteredCompanies.map(company => (
                              <CompanyRow 
                                key={company.id}
                                name={company.nome} 
                                slug={company.slug} 
                                whatsapp={company.whatsapp}
                                expiry={new Date(company.data_expiracao).toLocaleDateString('pt-BR')} 
                                status={company.status} 
                              />
                            ))
                          )}
                        </tbody>
                      </table>
                   </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'finance' && (
              <motion.div 
                key="finance"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-8"
              >
                 <FinanceSection 
                    title="Entradas Financeiras" 
                    subtitle="Pagamentos e renovações de licenças"
                    icon={<TrendingUp size={20} className="text-emerald-400" />}
                    type="income"
                    onDownload={() => handleDownloadPDF('income')}
                 />
                 <FinanceSection 
                    title="Investimentos & Custos" 
                    subtitle="Manutenção de infra e expansão SaaS"
                    icon={<Receipt size={20} className="text-primary" />}
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
                className="bg-dark-card p-8 rounded-xl border border-dark-border shadow-xl overflow-hidden relative"
              >
                <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
                
                <div className="flex items-center gap-4 mb-10 relative z-10">
                  <div className="p-3.5 bg-dark-bg rounded-xl border border-dark-border text-primary shadow-inner">
                    <History size={24} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white tracking-tight uppercase italic">Registro de Atividades</h2>
                    <p className="text-xs text-slate-500 font-medium italic">Monitoramento de segurança e auditoria administrativa</p>
                  </div>
                </div>
                
                <div className="space-y-3 relative z-10">
                  <LogItem time="14:20 - Hoje" user="Master Admin" action="Segurança: Nova empresa 'Burguer King' cadastrada" detail="Slug: burguer-king | Prazo: 12 meses" />
                  <LogItem time="09:15 - Hoje" user="System Root" action="Integridade: Rotina de verificação concluída" detail="Nenhum acesso expirado detectado nesta carga" />
                  <LogItem time="18:30 - Ontem" user="Master Admin" action="Financeiro: Receita registrada R$ 499,90" detail="Licença Semestral | Pizzaria do Bairro" />
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
                className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-dark-card w-full max-w-lg rounded-[32px] border border-dark-border shadow-2xl relative overflow-hidden"
              >
                <div className="p-10">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="bg-primary/10 p-3 rounded-xl text-primary border border-primary/20">
                        <Plus size={24} />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white uppercase italic tracking-tight">Cadastrar <span className="text-primary font-light">Empresa</span></h2>
                        <p className="text-xs text-slate-500 font-medium italic">Configure o acesso do novo licenciado</p>
                      </div>
                    </div>
                    <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-dark-bg rounded-lg text-slate-500 hover:text-white transition-colors">
                      <X size={20} />
                    </button>
                  </div>

                  <form onSubmit={handleCreateCompany} className="space-y-6">
                    <div className="space-y-4">
                      <FormInput 
                        label="Nome Fantasia" 
                        icon={<Globe size={18} />} 
                        placeholder="Ex: Burguer do Chef"
                        value={formData.nome}
                        onChange={(e) => setFormData({...formData, nome: e.target.value})}
                        required
                      />
                      <FormInput 
                        label="Slug (Subdomínio)" 
                        icon={<LinkIcon size={18} />} 
                        placeholder="ex: burguer-chef"
                        value={formData.slug}
                        onChange={(e) => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                        required
                      />
                      <FormInput 
                        label="WhatsApp de Contato" 
                        icon={<Phone size={18} />} 
                        placeholder="55 (00) 00000-0000"
                        value={formData.whatsapp}
                        onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                        required
                      />
                      <FormInput 
                        label="Data de Expiração" 
                        icon={<Calendar size={18} />} 
                        type="date"
                        value={formData.data_expiracao}
                        onChange={(e) => setFormData({...formData, data_expiracao: e.target.value})}
                        required
                      />
                    </div>

                    <div className="pt-4">
                      <button 
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-white py-4 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-primary-hover shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-3"
                      >
                        {loading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Cadastrando...
                          </>
                        ) : (
                          <>Finalizar Cadastro <ArrowRight size={18} /></>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
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
        flex items-center gap-3 w-full p-3.5 rounded-xl transition-all duration-300 group relative
        ${active ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-slate-500 hover:text-white hover:bg-dark-bg'}
      `}
    >
      <span className={`${active ? 'scale-110' : 'group-hover:scale-110'} transition-transform shrink-0`}>{icon}</span>
      {!collapsed && <span className="font-bold text-[10px] uppercase tracking-widest truncate">{label}</span>}
      {active && !collapsed && (
        <motion.div 
          layoutId="nav-glow" 
          className="absolute left-0 w-0.5 h-4 bg-white rounded-r-full shadow-[0_0_8px_white]" 
        />
      )}
    </button>
  );
}

function CompanyRow({ name, slug, whatsapp, expiry, status }: { 
  name: string, 
  slug: string, 
  whatsapp: string,
  expiry: string, 
  status: string
}) {
  return (
    <tr className="hover:bg-dark-bg/20 transition-colors group">
      <td className="px-8 py-6 border-b border-dark-border/10">
        <div>
          <p className="font-bold text-white tracking-tight text-sm uppercase italic">{name}</p>
          <p className="text-[9px] text-primary font-bold uppercase tracking-widest mt-1 italic flex items-center gap-1">
            <Globe size={10} />
            {slug}.menumaster.com.br
          </p>
        </div>
      </td>
      <td className="px-8 py-6 text-xs font-bold text-slate-400 border-b border-dark-border/10">
        <div className="flex items-center gap-2">
           <Phone size={14} className="text-slate-600" />
           {whatsapp}
        </div>
      </td>
      <td className="px-8 py-6 text-xs font-bold text-slate-400 font-mono tracking-wider border-b border-dark-border/10">
        <div className="flex items-center gap-2">
           <Calendar size={14} className="text-slate-600" />
           {expiry}
        </div>
      </td>
      <td className="px-8 py-6 border-b border-dark-border/10">
        <span className={`px-3 py-1 rounded-lg text-[8px] font-bold uppercase tracking-[0.2em] shadow-sm border
          ${status === 'active' ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20' : ''}
          ${status === 'expired' ? 'bg-amber-400/10 text-amber-400 border-amber-400/20' : ''}
          ${status === 'blocked' ? 'bg-red-400/10 text-red-400 border-red-400/20' : ''}
        `}>
          {status === 'active' ? 'Ativo' : status === 'expired' ? 'Vencido' : 'Suspenso'}
        </span>
      </td>
      <td className="px-8 py-6 text-right border-b border-dark-border/10">
        <div className="flex items-center gap-2 justify-end opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100">
          <button className="p-2.5 bg-dark-bg border border-dark-border rounded-lg text-slate-400 hover:text-white hover:bg-primary/20 hover:border-primary/50 transition-all"><Eye size={14} /></button>
          <button className="p-2.5 bg-dark-bg border border-dark-border rounded-lg text-slate-400 hover:text-white hover:bg-primary/20 hover:border-primary/50 transition-all"><Settings size={14} /></button>
          <button className="p-2.5 bg-dark-bg border border-dark-border rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-400/10 hover:border-red-400/50 transition-all"><Trash2 size={14} /></button>
        </div>
      </td>
    </tr>
  );
}

function FinanceSection({ title, subtitle, icon, type, onDownload }: { 
  title: string, 
  subtitle: string, 
  icon: React.ReactNode, 
  type: 'income' | 'expense',
  onDownload: () => void
}) {
  return (
    <div className="bg-dark-card p-8 rounded-xl border border-dark-border shadow-xl relative overflow-hidden group">
       <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-700" />
       
       <div className="flex items-start justify-between mb-8 relative z-10">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-dark-bg border border-dark-border rounded-lg text-white shadow-inner">{icon}</div>
             <div>
                <h3 className="font-bold text-white text-sm tracking-tight uppercase italic">{title}</h3>
                <p className="text-[10px] text-slate-500 font-medium italic mt-1">{subtitle}</p>
             </div>
          </div>
          <button 
            onClick={onDownload}
            className="p-2.5 bg-dark-bg border border-dark-border rounded-lg text-slate-500 hover:text-primary transition-all"
          >
            <Download size={18} />
          </button>
       </div>

       <div className="space-y-3 mb-8 relative z-10">
          {[1,2,3].map(i => (
             <div key={i} className="flex items-center justify-between p-4 bg-dark-bg/40 rounded-xl border border-dark-border/50 hover:border-primary/20 transition-all group/item">
                <div className="flex items-center gap-4">
                   <div className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold text-xs border ${type === 'income' ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20' : 'bg-primary/10 text-primary border-primary/20'}`}>
                      {type === 'income' ? '+' : '-'}
                   </div>
                   <div>
                      <p className="font-bold text-white text-xs tracking-tight uppercase italic">{type === 'income' ? 'Assinatura Anual' : 'Cloud Infra'}</p>
                      <p className="text-[9px] text-slate-500 uppercase font-bold tracking-[0.1em] mt-1 italic">04 MAI • TRANS. SEGURA</p>
                   </div>
                </div>
                <div className="text-right">
                   <p className={`font-bold text-sm ${type === 'income' ? 'text-emerald-400' : 'text-primary'}`}>
                      R$ {type === 'income' ? '599,00' : '1.240,00'}
                   </p>
                   <p className="text-[8px] text-slate-600 font-bold uppercase mt-0.5 tracking-tighter">Liquidado</p>
                </div>
             </div>
          ))}
       </div>

       <button className={`w-full py-3.5 rounded-lg font-bold text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all relative z-10
          ${type === 'income' ? 'bg-primary text-white shadow-xl shadow-primary/20 hover:bg-primary-hover hover:-translate-y-1' : 'bg-white text-dark-bg border border-white hover:bg-slate-100 hover:-translate-y-1'}
       `}>
          Registrar {type === 'income' ? 'Entrada' : 'Despesa'}
          <Plus size={16} />
       </button>
    </div>
  );
}

function LogItem({ time, user, action, detail }: { time: string, user: string, action: string, detail: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="flex gap-4 p-5 bg-dark-bg/10 border border-transparent hover:border-dark-border hover:bg-dark-bg/30 rounded-xl transition-all group"
    >
      <div className="shrink-0 mt-1.5">
        <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_8px_rgba(249,115,22,0.6)] group-hover:scale-125 transition-transform" />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-3">
             <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">{time}</span>
             <span className="px-2 py-0.5 bg-primary/10 text-primary text-[8px] font-bold uppercase rounded border border-primary/20">
                {user}
             </span>
          </div>
          <p className="text-[8px] text-slate-600 font-bold uppercase tracking-widest opacity-40 group-hover:opacity-100 transition-opacity">ID-719283-OK</p>
        </div>
        <p className="font-bold text-white text-xs tracking-tight uppercase italic">{action}</p>
        <p className="text-xs text-slate-500 mt-1.5 font-medium leading-relaxed italic">{detail}</p>
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
    <div className="space-y-2">
      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 italic">{label}</label>
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors">
          {icon}
        </div>
        <input 
          type={type}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          className="w-full bg-dark-bg border border-dark-border rounded-xl py-3.5 pl-12 pr-4 text-xs font-medium text-white focus:outline-none focus:border-primary transition-all shadow-inner"
        />
      </div>
    </div>
  );
}
