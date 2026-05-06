import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Image as ImageIcon, 
  Trash2, 
  Edit3, 
  Layers, 
  Package, 
  PlusCircle, 
  CheckCircle2,
  XCircle,
  X,
  Save,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import ProductManagement from './ProductManagement';

// Mock Company ID for testing (will be dynamic via Auth later)
const MOCK_COMPANY_ID = 'e9c8b7a6-d5c4-4b3a-a2f1-0e9d8c7b6a54';

interface Category {
  id: string;
  nome: string;
  ordem: number;
}

export default function MenuManagement() {
  const [activeSubTab, setActiveSubTab] = useState<'categories' | 'products' | 'extras'>('categories');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');

  useEffect(() => {
    if (activeSubTab === 'categories') {
      fetchCategories();
    }
  }, [activeSubTab]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('categorias')
        .select('*')
        .eq('empresa_id', MOCK_COMPANY_ID)
        .order('ordem', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingCategory) {
        const { error } = await supabase
          .from('categorias')
          .update({ nome: categoryName })
          .eq('id', editingCategory.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('categorias')
          .insert([{ 
            nome: categoryName, 
            empresa_id: MOCK_COMPANY_ID,
            ordem: categories.length 
          }]);
        if (error) throw error;
      }
      
      setShowModal(false);
      setCategoryName('');
      setEditingCategory(null);
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Erro ao salvar categoria.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Deseja realmente excluir esta categoria? Todos os produtos vinculados poderão ficar sem categoria.')) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('categorias')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Erro ao excluir categoria.');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setCategoryName(cat.nome);
    setShowModal(true);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Sub Navigation */}
      <div className="flex gap-1 bg-white/5 backdrop-blur-md p-1 rounded border border-white/5 w-full max-w-sm shadow-2xl overflow-hidden">
        <SubNavItem 
          active={activeSubTab === 'categories'} 
          onClick={() => setActiveSubTab('categories')} 
          label="Categorias" 
          icon={<Layers size={14} />} 
        />
        <SubNavItem 
          active={activeSubTab === 'products'} 
          onClick={() => setActiveSubTab('products')} 
          label="Produtos" 
          icon={<Package size={14} />} 
        />
        <SubNavItem 
          active={activeSubTab === 'extras'} 
          onClick={() => setActiveSubTab('extras')} 
          label="Adicionais" 
          icon={<PlusCircle size={14} />} 
        />
      </div>

      <AnimatePresence mode="wait">
        {activeSubTab === 'categories' && (
          <motion.div 
            key="cat" 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <AddCard 
                label="Nova Categoria" 
                onClick={() => {
                  setEditingCategory(null);
                  setCategoryName('');
                  setShowModal(true);
                }} 
              />
              {loading && categories.length === 0 ? (
                <div className="col-span-full py-20 text-center text-slate-500 font-bold uppercase tracking-widest text-[8px]">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-6 h-6 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
                    Sincronizando banco...
                  </div>
                </div>
              ) : categories.map(cat => (
                <CategoryCard 
                  key={cat.id}
                  name={cat.nome} 
                  itemsCount={0} 
                  onEdit={() => openEditModal(cat)}
                  onDelete={() => handleDeleteCategory(cat.id)}
                />
              ))}
            </div>
          </motion.div>
        )}

        {activeSubTab === 'products' && (
          <motion.div 
            key="prod" 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10 }}
          >
            <ProductManagement />
          </motion.div>
        )}

        {/* ... (Extras tab remains mock for now) */}
      </AnimatePresence>

      {/* Modal Categoria */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-dark-card w-full max-w-md rounded-[32px] border border-dark-border shadow-2xl relative overflow-hidden"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-xl text-primary border border-primary/20">
                      {editingCategory ? <Edit3 size={24} /> : <Plus size={24} />}
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white uppercase italic tracking-tight">
                        {editingCategory ? 'Editar' : 'Nova'} <span className="text-primary font-light">Categoria</span>
                      </h2>
                    </div>
                  </div>
                  <button onClick={() => setShowModal(false)} className="p-2 hover:bg-dark-bg rounded-lg text-slate-500 hover:text-white transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSaveCategory} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 italic">Nome da Categoria</label>
                    <input 
                      type="text"
                      value={categoryName}
                      onChange={(e) => setCategoryName(e.target.value)}
                      required
                      placeholder="Ex: Lanches, Pizzas, Bebidas"
                      className="w-full bg-dark-bg border border-dark-border rounded-xl py-3.5 px-4 text-xs font-medium text-white focus:outline-none focus:border-primary transition-all shadow-inner"
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary text-white py-4 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-primary-hover shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-3"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>Salvar Categoria <Save size={18} /></>
                    )}
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

function SubNavItem({ active, onClick, label, icon }: { active: boolean, onClick: () => void, label: string, icon: React.ReactNode }) {
  return (
    <button 
      onClick={onClick}
      className={`flex-1 px-3 py-1.5 rounded flex items-center justify-center gap-2 text-[8px] font-bold uppercase tracking-widest transition-all ${
        active ? 'bg-amber-600 text-white shadow shadow-amber-900/20' : 'text-slate-500 hover:text-white hover:bg-white/5'
      }`}
    >
      {icon}
      <span className="hidden md:inline">{label}</span>
    </button>
  );
}

function CategoryCard({ name, itemsCount, onEdit, onDelete }: { name: string, itemsCount: number, onEdit: () => void, onDelete: () => void }) {
  return (
    <div className="bg-gray-900 p-4 rounded border border-white/5 flex flex-col justify-between group hover:border-amber-500/20 transition-all shadow-sm relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div className="w-8 h-8 bg-gray-800 border border-white/5 text-amber-500/70 rounded flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
          <Layers size={14} />
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
          <button onClick={onEdit} className="p-1.5 bg-gray-800 border border-white/5 rounded text-slate-500 hover:text-amber-500 transition-colors">
            <Edit3 size={12} />
          </button>
          <button onClick={onDelete} className="p-1.5 bg-gray-800 border border-white/5 rounded text-slate-500 hover:text-red-400 transition-colors">
            <Trash2 size={12} />
          </button>
        </div>
      </div>
      <div className="mt-4">
        <h4 className="font-bold text-white text-[10px] tracking-widest italic uppercase">{name}</h4>
        <p className="text-[7px] text-slate-600 font-bold uppercase tracking-widest mt-1 italic">{itemsCount} produtos ativos</p>
      </div>
      <div className="absolute top-0 right-0 w-24 h-24 bg-amber-600/5 blur-3xl pointer-events-none rounded-full -mr-12 -mt-12" />
    </div>
  );
}

function AddCard({ label, onClick }: { label: string, onClick: () => void }) {
  return (
    <button onClick={onClick} className="border border-dashed border-white/10 bg-white/[0.02] rounded p-4 flex flex-col items-center justify-center gap-3 text-slate-600 hover:border-amber-500/30 hover:text-amber-500 hover:bg-amber-600/5 transition-all group shadow-inner min-h-[100px]">
      <div className="w-8 h-8 bg-gray-900 border border-white/10 rounded flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg group-hover:text-amber-500">
         <Plus size={18} />
      </div>
      <span className="text-[8px] font-bold uppercase tracking-widest opacity-60 group-hover:opacity-100">{label}</span>
    </button>
  );
}

function ExtraRow({ name, price, active }: { name: string, price: string, active: boolean }) {
  return (
    <tr className="hover:bg-dark-bg/20 group transition-colors">
      <td className="px-6 py-4 font-bold text-white text-xs tracking-tight border-b border-dark-border/5 italic uppercase">{name}</td>
      <td className="px-6 py-4 font-bold text-xs text-primary italic tracking-tighter border-b border-dark-border/5">R$ {price}</td>
      <td className="px-6 py-4 border-b border-dark-border/5">
        <div className="flex items-center gap-2">
          {active ? (
            <div className="flex items-center gap-1.5 bg-emerald-400/10 px-2 py-0.5 rounded-lg border border-emerald-400/20">
               <CheckCircle2 size={10} className="text-emerald-400" />
               <span className="text-[8px] font-bold text-emerald-400 uppercase tracking-widest">Ativo</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-slate-500/10 px-2 py-0.5 rounded-lg border border-slate-500/20">
               <XCircle size={10} className="text-slate-500" />
               <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Inativo</span>
            </div>
          )}
        </div>
      </td>
      <td className="px-6 py-4 text-right border-b border-dark-border/5">
        <div className="flex gap-1.5 justify-end opacity-0 group-hover:opacity-100 transition-all">
          <button className="p-2 bg-dark-bg border border-dark-border shadow-lg rounded-lg text-slate-500 hover:text-primary transition-all"><Edit3 size={14} /></button>
          <button className="p-2 bg-dark-bg border border-dark-border shadow-lg rounded-lg text-slate-500 hover:text-red-400 transition-all"><Trash2 size={14} /></button>
        </div>
      </td>
    </tr>
  );
}
