import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  ShoppingBag, 
  Calendar, 
  Download, 
  ArrowUpRight, 
  ChevronRight 
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { generatePDFReport } from '../../lib/reports';

const mockOrderHistory = [
  { id: '1', time: '14:30', items: '2x X-Salada, 1x Coca-Cola', total: 65.50, method: 'Pix' },
  { id: '2', time: '13:15', items: '1x Combo Familia', total: 120.00, method: 'Cartão' },
  { id: '3', time: '12:05', items: '3x Hot Dog Especial', total: 45.00, method: 'Dinheiro' },
];

const mockChartData = [
  { name: 'Seg', orders: 12 },
  { name: 'Ter', orders: 18 },
  { name: 'Qua', orders: 15 },
  { name: 'Qui', orders: 25 },
  { name: 'Sex', orders: 42 },
  { name: 'Sab', orders: 55 },
  { name: 'Dom', orders: 48 },
];

export default function FinancialPanel() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleDownloadReport = () => {
    generatePDFReport({
      title: 'Relatório de Desempenho - Minha Loja',
      headers: ['Horário', 'Itens', 'Valor Total', 'Pagamento'],
      rows: mockOrderHistory.map(o => [o.time, o.items, `R$ ${o.total.toFixed(2)}`, o.method]),
      filename: `Relatorio_Pedidos_${new Date().toISOString().split('T')[0]}`
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {[1,2,3].map(i => (
             <div key={i} className="bg-dark-card p-6 rounded-xl border border-dark-border animate-pulse h-40" />
           ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           <div className="lg:col-span-2 bg-dark-card p-8 rounded-xl border border-dark-border animate-pulse h-[400px]" />
           <div className="bg-dark-card p-8 rounded-xl border border-dark-border animate-pulse h-[400px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
          title="Pedidos (Hoje)" 
          value="48" 
          detail="+12% que ontem"
          trend="up"
          color="primary"
          icon={<ShoppingBag size={24} className="text-primary" />}
        />
        <StatCard 
          title="Faturamento (Hoje)" 
          value="R$ 1.250,00" 
          detail="+8% que ontem"
          trend="up"
          color="emerald"
          icon={<TrendingUp size={24} className="text-emerald-400" />}
        />
        <div className="bg-primary p-8 rounded-xl text-white shadow-xl shadow-primary/20 flex flex-col justify-between relative overflow-hidden group">
           <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-white/10 blur-2xl rounded-full pointer-events-none group-hover:scale-150 transition-transform duration-700" />
           <div className="relative z-10">
              <p className="text-white/60 text-[9px] font-bold uppercase tracking-[0.2em] mb-2">Relatório Completo</p>
              <h3 className="text-lg font-bold tracking-tighter leading-none italic uppercase">EXPORTAR<br /><span className="font-light">DESEMPENHO</span></h3>
           </div>
           <button 
            onClick={handleDownloadReport}
            className="mt-6 flex items-center justify-center gap-3 bg-white text-dark-bg py-3.5 rounded-lg transition-all font-bold text-xs uppercase tracking-[0.2em] shadow-lg hover:-translate-y-1 relative z-10"
           >
              <Download size={16} />
              Baixar PDF
           </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Column */}
        <div className="lg:col-span-2 bg-dark-card p-8 rounded-xl border border-dark-border shadow-xl">
           <div className="flex items-center justify-between mb-8">
              <div>
                 <h3 className="font-bold text-white text-lg tracking-tight uppercase italic">VOLUME DE <span className="text-primary font-light">PEDIDOS</span></h3>
                 <p className="text-xs text-slate-500 font-medium italic">Fluxo semanal de vendas</p>
              </div>
              <select className="bg-dark-bg border border-dark-border text-slate-400 text-[9px] font-bold uppercase tracking-[0.1em] rounded-lg px-4 py-2 focus:outline-none focus:border-primary transition-colors cursor-pointer">
                 <option>Esta Semana</option>
                 <option>Semana Passada</option>
              </select>
           </div>
           <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={mockChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#475569', fontSize: 9, fontWeight: 'bold'}}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#475569', fontSize: 9, fontWeight: 'bold'}}
                    />
                    <Tooltip 
                      cursor={{fill: '#1e293b30'}} 
                      contentStyle={{backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #1e293b', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)'}}
                      itemStyle={{color: '#f97316', fontWeight: 'bold'}}
                    />
                    <Bar dataKey="orders" fill="#f97316" radius={[6, 6, 0, 0]} barSize={35}>
                       {mockChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.orders > 40 ? '#f97316' : '#1e293b'} />
                       ))}
                    </Bar>
                 </BarChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Recent Orders List */}
        <div className="bg-dark-card p-8 rounded-xl border border-dark-border shadow-xl flex flex-col">
           <h3 className="font-bold text-white text-base tracking-tight uppercase italic mb-8">ÚLTIMOS <span className="text-primary font-light">PEDIDOS</span></h3>
           <div className="flex-1 space-y-5">
              {mockOrderHistory.map(order => (
                 <div key={order.id} className="group cursor-pointer">
                    <div className="flex justify-between items-start">
                       <div className="flex gap-3">
                          <div className="w-10 h-10 bg-dark-bg border border-dark-border rounded-lg flex items-center justify-center text-slate-500 group-hover:text-primary group-hover:border-primary/30 transition-all shadow-inner">
                             <ShoppingBag size={16} />
                          </div>
                          <div>
                             <p className="text-xs font-bold text-white tracking-tight group-hover:text-primary transition-colors">{order.items}</p>
                             <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1 italic">{order.time} • <span className="text-primary/70">{order.method}</span></p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="text-sm font-bold text-white">R$ {order.total.toFixed(2).replace('.', ',')}</p>
                          <ChevronRight size={12} className="ml-auto text-slate-700 mt-1 transition-transform group-hover:translate-x-1" />
                       </div>
                    </div>
                 </div>
              ))}
           </div>
           <button className="mt-8 bg-dark-bg border border-dark-border text-primary py-3 rounded-lg text-[9px] font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-primary hover:text-white transition-all shadow-inner">
              Ver todos os pedidos <ArrowUpRight size={12} />
           </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, detail, icon, trend, color }: { title: string, value: string, detail: string, icon: React.ReactNode, trend: 'up' | 'down', color: string }) {
  return (
    <div className="bg-dark-card p-6 rounded-xl border border-dark-border shadow-xl hover:border-primary/20 transition-all group relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none">
        {icon}
      </div>
      <div className="flex justify-between items-start mb-5">
        <div className="p-3 bg-dark-bg border border-dark-border rounded-lg shadow-inner group-hover:scale-110 transition-transform">
           {icon}
        </div>
        <div className="flex flex-col items-end">
           <span className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] italic">{title}</span>
           <h4 className="text-xl font-bold text-white italic tracking-tighter mt-1">{value}</h4>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-4 px-3 py-1.5 bg-dark-bg/50 rounded-lg w-fit border border-dark-border/50">
         <div className={`w-4 h-4 rounded-full ${color === 'primary' ? 'bg-primary/10 text-primary' : 'bg-emerald-400/10 text-emerald-400'} flex items-center justify-center`}>
            {trend === 'up' ? <ArrowUpRight size={10} /> : <TrendingUp size={10} className="rotate-180" />}
         </div>
         <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 italic">{detail}</p>
      </div>
    </div>
  );
}
