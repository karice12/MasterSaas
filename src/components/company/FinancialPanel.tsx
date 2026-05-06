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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
           {[1,2,3].map(i => (
             <div key={i} className="bg-gray-900 p-4 rounded border border-white/5 animate-pulse h-28" />
           ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
           <div className="lg:col-span-2 bg-gray-900 p-6 rounded border border-white/5 animate-pulse h-[350px]" />
           <div className="bg-gray-900 p-6 rounded border border-white/5 animate-pulse h-[350px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-10">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard 
          title="Pedidos de Hoje" 
          value="48" 
          detail="+12% que ontem"
          trend="up"
          color="amber"
          icon={<ShoppingBag size={14} />}
        />
        <StatCard 
          title="Receita Gerada" 
          value="R$ 1.250,90" 
          detail="+8.5% que ontem"
          trend="up"
          color="emerald"
          icon={<TrendingUp size={14} />}
        />
        <div className="bg-amber-600 p-4 rounded border border-amber-500 shadow-lg shadow-amber-900/10 flex flex-col justify-between relative overflow-hidden group">
           <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-white/10 blur-xl rounded-full pointer-events-none group-hover:scale-150 transition-transform duration-700" />
           <div className="relative z-10">
              <p className="text-white/70 text-[7px] font-bold uppercase tracking-[0.2em]">Fluxo Operacional</p>
              <h3 className="text-xs font-bold tracking-widest leading-none italic uppercase mt-1">Exportar<br /><span className="font-light">Dados PDF</span></h3>
           </div>
           <button 
            onClick={handleDownloadReport}
            className="mt-4 flex items-center justify-center gap-2 bg-white text-gray-950 py-1.5 rounded transition-all font-bold text-[9px] uppercase tracking-widest shadow-lg hover:bg-slate-100 relative z-10"
           >
              <Download size={12} />
              Baixar Relatório
           </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Chart Column */}
        <div className="lg:col-span-2 bg-gray-900 p-6 rounded border border-white/5 shadow-sm">
           <div className="flex items-center justify-between mb-8">
              <div>
                 <h3 className="font-bold text-white text-[10px] tracking-widest uppercase italic">Volume de Vendas</h3>
                 <p className="text-[8px] text-slate-600 font-bold uppercase tracking-widest mt-0.5 opacity-60">Frequência Semanal</p>
              </div>
              <select className="bg-gray-800 border border-white/5 text-slate-500 text-[8px] font-bold uppercase tracking-widest rounded px-3 py-1.5 focus:outline-none focus:border-amber-500 transition-colors cursor-pointer italic">
                 <option>Ciclo Atual</option>
                 <option>Ciclo Anterior</option>
              </select>
           </div>
           <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={mockChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#475569', fontSize: 8, fontWeight: 'bold'}}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#475569', fontSize: 8, fontWeight: 'bold'}}
                    />
                    <Tooltip 
                      cursor={{fill: '#ffffff05'}} 
                      contentStyle={{backgroundColor: '#030712', borderRadius: '4px', border: '1px solid #ffffff08', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)'}}
                      itemStyle={{color: '#f59e0b', fontSize: '9px', fontWeight: 'bold'}}
                    />
                    <Bar dataKey="orders" fill="#f59e0b" radius={[2, 2, 0, 0]} barSize={28}>
                       {mockChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.orders > 40 ? '#f59e0b' : '#334155'} />
                       ))}
                    </Bar>
                 </BarChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Recent Orders List */}
        <div className="bg-gray-900 p-6 rounded border border-white/5 shadow-sm flex flex-col">
           <h3 className="font-bold text-white text-[10px] tracking-widest uppercase italic mb-6">Últimos Pedidos</h3>
           <div className="flex-1 space-y-4">
              {mockOrderHistory.map(order => (
                 <div key={order.id} className="group cursor-pointer">
                    <div className="flex justify-between items-start">
                       <div className="flex gap-3">
                          <div className="w-8 h-8 bg-gray-800 border border-white/5 rounded flex items-center justify-center text-slate-600 group-hover:text-amber-500 group-hover:border-amber-500/20 transition-all shadow-inner">
                             <ShoppingBag size={14} />
                          </div>
                          <div>
                             <p className="text-[10px] font-bold text-white tracking-tight group-hover:text-amber-500 transition-colors uppercase italic">{order.items.split(',')[0]}</p>
                             <p className="text-[7px] text-slate-600 font-bold uppercase tracking-widest mt-0.5 italic">{order.time} • <span className="text-amber-500/60">{order.method}</span></p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="text-[11px] font-bold text-white">R$ {order.total.toFixed(2).replace('.', ',')}</p>
                          <ChevronRight size={10} className="ml-auto text-slate-800 mt-0.5 transition-transform group-hover:translate-x-0.5" />
                       </div>
                    </div>
                 </div>
              ))}
           </div>
           <button className="mt-6 bg-gray-800/40 border border-white/5 text-amber-500 py-2 rounded text-[8px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-amber-600 hover:text-white transition-all shadow-inner">
              Histórico Completo <ArrowUpRight size={10} />
           </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, detail, icon, trend, color }: { title: string, value: string, detail: string, icon: React.ReactNode, trend: 'up' | 'down', color: string }) {
  return (
    <div className="bg-gray-900 p-4 rounded border border-white/5 shadow-sm hover:border-amber-500/20 transition-all group relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 text-slate-800 opacity-20 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div className="flex justify-between items-start mb-3">
        <div className="p-2 bg-gray-800 border border-white/5 rounded shadow-inner group-hover:scale-110 transition-transform text-slate-400 group-hover:text-amber-500">
           {icon}
        </div>
        <div className="flex flex-col items-end">
           <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest italic">{title}</span>
           <h4 className="text-lg font-bold text-white italic tracking-tight mt-0.5">{value}</h4>
        </div>
      </div>
      <div className="flex items-center gap-1.5 mt-2 opacity-60">
         <div className={`w-3.5 h-3.5 rounded-full ${color === 'emerald' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-600/10 text-amber-500'} flex items-center justify-center`}>
            {trend === 'up' ? <ArrowUpRight size={10} /> : <TrendingUp size={10} className="rotate-180" />}
         </div>
         <p className="text-[8px] font-bold uppercase tracking-widest text-slate-500 italic">{detail}</p>
      </div>
    </div>
  );
}
