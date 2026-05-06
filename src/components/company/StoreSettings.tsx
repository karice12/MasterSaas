import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  MessageSquareText, 
  MapPin, 
  Clock, 
  Phone, 
  Truck, 
  Save, 
  Eye, 
  EyeOff 
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function StoreSettings() {
  const [isOpen, setIsOpen] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const handleSave = () => {
    setSaveStatus('saving');
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }, 1500);
  };

  return (
    <div className="max-w-5xl space-y-8 pb-32">
      {/* Header Profile Toggle */}
      <div className={`p-8 rounded-xl border transition-all duration-500 shadow-xl relative overflow-hidden group ${isOpen ? 'bg-emerald-400/5 border-emerald-400/20' : 'bg-dark-card border-dark-border'}`}>
         <div className="absolute -right-20 -bottom-20 w-48 h-48 bg-emerald-400/5 blur-3xl pointer-events-none rounded-full group-hover:scale-150 transition-transform" />
         
         <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6">
               <div className={`w-16 h-16 rounded-xl flex items-center justify-center transition-all shadow-xl ${isOpen ? 'bg-emerald-400 text-dark-bg shadow-emerald-400/20' : 'bg-dark-bg text-slate-500 shadow-inner'}`}>
                  <Building2 size={32} />
               </div>
               <div>
                  <h2 className="text-lg font-bold text-white tracking-tight uppercase italic">STATUS DA <span className="text-primary font-light">OPERAÇÃO</span></h2>
                  <p className="text-xs text-slate-500 font-medium italic">Controle se a loja está aceitando pedidos agora</p>
               </div>
            </div>
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className={`px-8 py-3.5 rounded-lg font-bold text-[10px] uppercase tracking-[0.2em] flex items-center gap-3 transition-all shadow-xl hover:-translate-y-1 ${
                isOpen 
                ? 'bg-emerald-400 text-dark-bg shadow-emerald-400/20 hover:bg-emerald-300' 
                : 'bg-dark-bg text-slate-400 border border-dark-border hover:bg-dark-card hover:text-white'
              }`}
            >
              {isOpen ? <Eye size={18} /> : <EyeOff size={18} />}
              {isOpen ? 'Loja ABERTA' : 'Loja FECHADA'}
            </button>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Info Geral */}
        <section className="space-y-6 bg-dark-card p-8 rounded-xl border border-dark-border shadow-xl">
          <SectionTitle icon={<Building2 size={20} />} title="Dados Básicos" />
          
          <div className="space-y-5 mt-4">
             <InputGroup label="Nome do Estabelecimento" icon={<Building2 size={16} />} placeholder="Ex: Burguer do Chef" defaultValue="Burguer do Chef" />
             <InputGroup label="WhatsApp (para pedidos)" icon={<Phone size={16} />} placeholder="55 (00) 00000-0000" defaultValue="5511999999999" />
             <InputGroup label="Endereço Completo" icon={<MapPin size={16} />} placeholder="Rua das Acácias, 123..." defaultValue="Av. Paulista, 1000 - São Paulo" />
          </div>
        </section>

        {/* Mensagens e Taxas */}
        <section className="space-y-6 bg-dark-card p-8 rounded-xl border border-dark-border shadow-xl">
          <SectionTitle icon={<MessageSquareText size={20} />} title="Comunicação" />
          
          <div className="space-y-5 mt-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-2 italic">Mensagem de Destaque</label>
              <textarea 
                className="w-full bg-dark-bg border border-dark-border rounded-lg p-5 text-xs text-white focus:ring-1 focus:ring-primary focus:outline-none min-h-[120px] shadow-inner transition-all resize-none italic"
                defaultValue="O melhor hambúrguer artesanal da região. Peça agora e receba em casa com agilidade!"
                placeholder="Escreva sua frase de efeito..."
              />
            </div>
            <InputGroup 
              label="Taxa de Entrega Fixa (R$)" 
              icon={<Truck size={16} />} 
              placeholder="0.00" 
              defaultValue="7.00" 
              type="number"
            />
          </div>
        </section>
      </div>

      {/* Horários */}
      <section className="space-y-6 bg-dark-card p-8 rounded-xl border border-dark-border shadow-xl">
        <SectionTitle icon={<Clock size={20} />} title="Horário de Funcionamento" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
           {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'].map((day, idx) => (
              <motion.div 
                key={day} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="p-5 bg-dark-bg/60 rounded-xl border border-dark-border/50 flex flex-col gap-3 shadow-inner group hover:border-primary/30 transition-all"
              >
                 <span className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] italic group-hover:text-primary">{day}</span>
                 <input 
                  type="text" 
                  defaultValue={day === 'Dom' ? 'Fechado' : '18:00 - 23:00'}
                  className="bg-dark-card border border-dark-border rounded-lg py-2.5 px-4 text-[11px] font-bold text-white focus:outline-none focus:border-primary transition-all shadow-lg italic"
                 />
              </motion.div>
           ))}
        </div>
      </section>

      {/* Floating Save Button */}
      <div className="fixed bottom-10 right-10 z-50">
         <motion.button 
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSave}
            disabled={saveStatus === 'saving'}
            className={`flex items-center gap-4 px-10 py-4 rounded-xl font-bold text-[11px] uppercase tracking-[0.2em] shadow-2xl transition-all ${
              saveStatus === 'saved' 
              ? 'bg-emerald-500 text-white' 
              : 'bg-primary text-white shadow-primary/20'
            }`}
         >
            {saveStatus === 'saving' ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : saveStatus === 'saved' ? (
              <Save size={20} />
            ) : (
              <Save size={20} />
            )}
            {saveStatus === 'saving' ? 'Salvando...' : saveStatus === 'saved' ? 'Salvo!' : 'Salvar Alterações'}
         </motion.button>
      </div>
    </div>
  );
}

function SectionTitle({ icon, title }: { icon: React.ReactNode, title: string }) {
  return (
    <div className="flex items-center gap-3 ml-1">
      <div className="p-2.5 bg-primary/10 rounded-lg text-primary border border-primary/20">
         {icon}
      </div>
      <h3 className="text-base font-bold text-white uppercase tracking-tight italic">{title}</h3>
    </div>
  );
}

function InputGroup({ label, icon, placeholder, defaultValue, type = "text" }: { 
  label: string, 
  icon: React.ReactNode, 
  placeholder: string, 
  defaultValue: string,
  type?: string
}) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-2 italic">{label}</label>
      <div className="relative group">
         <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors">
            {icon}
         </div>
         <input 
            type={type}
            placeholder={placeholder}
            defaultValue={defaultValue}
            className="w-full bg-dark-bg border border-dark-border rounded-lg py-4 pl-14 pr-5 text-xs font-medium text-white focus:ring-1 focus:ring-primary focus:outline-none transition-all shadow-inner"
         />
      </div>
    </div>
  );
}
