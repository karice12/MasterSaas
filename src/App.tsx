/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ShieldCheck, LayoutDashboard, Utensils, Receipt, Settings, ExternalLink, Database, Lock, ArrowRight, Store, X, Zap, Globe, MousePointer2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import React, { type ReactNode, useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import MasterDashboard from './components/master/MasterDashboard';
import CompanyDashboard from './components/company/CompanyDashboard';
import PublicMenu from './components/public/PublicMenu';

function FeatureCard({ icon, title, description }: { icon: ReactNode, title: string, description: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-dark-card p-6 rounded-xl border border-dark-border shadow-xl hover:border-primary/50 transition-all group"
    >
      <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-primary">
        {icon}
      </div>
      <h3 className="font-bold text-lg text-white mb-2 tracking-tight">{title}</h3>
      <p className="text-sm text-slate-400 leading-relaxed font-medium">{description}</p>
    </motion.div>
  );
}

function AuthScreen({ title, subtitle, icon, onSubmit, password, setPassword, error, onBack }: {
  title: string,
  subtitle: string,
  icon: ReactNode,
  onSubmit: (e: React.FormEvent) => void,
  password: string,
  setPassword: (val: string) => void,
  error: string,
  onBack: () => void
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className="min-h-screen flex items-center justify-center p-4 bg-dark-bg"
    >
      <div className="bg-dark-card p-8 rounded-xl border border-dark-border shadow-2xl w-full max-w-md text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
        
        <div className="w-20 h-20 bg-primary/10 text-primary rounded-xl flex items-center justify-center mx-auto mb-6 shadow-inner border border-primary/20">
          {icon}
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
        <p className="text-slate-400 mt-2 text-base font-medium">{subtitle}</p>

        <form onSubmit={onSubmit} className="mt-8 space-y-6 text-left">
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Chave de Segurança</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-dark-bg border border-dark-border rounded-xl py-3.5 px-6 text-white text-center text-lg tracking-[0.5em] font-bold focus:ring-4 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all placeholder:text-slate-700"
              required
            />
          </div>
          
          {error && (
            <motion.p 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-400 text-[10px] font-bold text-center uppercase tracking-wider"
            >
              {error}
            </motion.p>
          )}

          <motion.button 
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-primary text-white py-3.5 rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-primary-hover transition-all flex items-center justify-center gap-3 shadow-xl shadow-primary/20"
          >
            Acessar Painel
            <ArrowRight size={20} />
          </motion.button>

          <button 
            type="button"
            onClick={onBack}
            className="w-full text-slate-500 text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors py-2"
          >
            Voltar para o Início
          </button>
        </form>
        
        <div className="mt-12 pt-8 border-t border-dark-border/50">
          <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em] leading-relaxed">
            Ambiente Seguro • Encriptado
            <br />© 2026 MenuMaster SaaS
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function LandingPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-dark-bg font-sans text-slate-200">
      <div className="flex flex-col min-h-screen">
        {/* Nav */}
        <header className="border-b border-dark-border sticky top-0 z-50 bg-dark-bg/80 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary p-2 rounded-xl text-white shadow-lg shadow-primary/20">
                <Utensils size={24} />
              </div>
              <span className="font-bold text-xl tracking-tighter text-white uppercase italic">MENU<span className="text-primary font-light">MASTER</span></span>
            </div>
            
            <div className="hidden md:flex items-center gap-4">
              <button onClick={() => navigate('/menu')} className="text-xs font-bold text-slate-400 hover:text-white uppercase tracking-widest transition-all px-4 py-2 hover:bg-dark-card rounded-lg">Demo</button>
              <button onClick={() => navigate('/admin')} className="text-xs font-bold text-slate-400 hover:text-white uppercase tracking-widest transition-all px-4 py-2 hover:bg-dark-card rounded-lg">Empresa</button>
              <button 
                onClick={() => navigate('/admin-master')}
                className="bg-primary text-white px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-primary-hover shadow-lg shadow-primary/10 transition-all flex items-center gap-2"
              >
                <ShieldCheck size={16} />
                Área Master
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-7xl mx-auto px-6 py-20 w-full">
          {/* Hero */}
          <div className="text-center max-w-4xl mx-auto mb-32">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-2 rounded-full text-primary text-[9px] font-bold uppercase tracking-[0.2em] mb-8"
            >
              <Zap size={12} fill="currentColor" />
              SaaS de Cardápio Digital Premium
            </motion.div>
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-6 tracking-tighter leading-tight uppercase italic">
              A PRÓXIMA GERAÇÃO DE <span className="text-primary">SISTEMAS</span> PARA RESTAURANTES.
            </h1>
            <p className="text-sm text-slate-400 mb-10 max-w-2xl mx-auto font-medium leading-relaxed italic">
              Uma arquitetura robusta com isolamento total de dados, escalabilidade global e design que converte. O futuro do seu negócio começa aqui.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
               <button onClick={() => navigate('/admin')} className="w-full sm:w-auto bg-white text-dark-bg px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center justify-center gap-3 shadow-xl">
                  Começar Agora <MousePointer2 size={16} />
               </button>
               <button onClick={() => navigate('/menu')} className="w-full sm:w-auto bg-dark-card border border-dark-border text-white px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-3 shadow-xl">
                  Ver Demo <Globe size={16} />
               </button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<ShieldCheck size={28} />}
              title="Arquitetura de Segurança"
              description="Isolamento nativo de dados por empresa (RLS) garantindo que cada negócio tenha total privacidade e segurança."
            />
            <FeatureCard 
              icon={<Zap size={28} />}
              title="Performance Extrema"
              description="Carregamento instantâneo para clientes e painel administrativo ultra responsivo para o dia a dia."
            />
            <FeatureCard 
              icon={<LayoutDashboard size={28} />}
              title="Controle Administrativo"
              description="Gerenciamento completo do ecossistema, métricas financeiras e saúde da plataforma em tempo real."
            />
          </div>
        </main>

        <footer className="border-t border-dark-border py-12">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2 opacity-50">
              <Utensils size={18} />
              <span className="font-bold text-lg tracking-tighter">MENUMASTER</span>
            </div>
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.3em]">
              © 2026 Digital Architecture • Made for Professionals
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

function MasterRouter() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleMasterAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'master123') {
      setIsAuthenticated(true);
      setPassword('');
    } else {
      setError('Senha incorreta.');
      setTimeout(() => setError(''), 3000);
    }
  };

  if (isAuthenticated) return <MasterDashboard />;

  return (
    <AuthScreen 
      title="Acesso Restrito: Mestre"
      subtitle="Painel de controle global do ecossistema"
      icon={<ShieldCheck size={32} />}
      onSubmit={handleMasterAuth}
      password={password}
      setPassword={setPassword}
      error={error}
      onBack={() => navigate('/')}
    />
  );
}

function CompanyRouter() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleCompanyAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'empresa123') {
      setIsAuthenticated(true);
      setPassword('');
    } else {
      setError('Chave inválida.');
      setTimeout(() => setError(''), 3000);
    }
  };

  if (isAuthenticated) return <CompanyDashboard />;

  return (
    <AuthScreen 
      title="Portal da Empresa"
      subtitle="Gerencie seu cardápio e visualize resultados"
      icon={<Store size={32} />}
      onSubmit={handleCompanyAuth}
      password={password}
      setPassword={setPassword}
      error={error}
      onBack={() => navigate('/')}
    />
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/admin-master" element={<MasterRouter />} />
        <Route path="/admin" element={<CompanyRouter />} />
        <Route path="/menu/:slug" element={<PublicMenu />} />
        <Route path="/menu" element={<Navigate to="/menu/demo" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}



