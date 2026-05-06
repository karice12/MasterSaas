import React, { useState, useEffect, useRef } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Image as ImageIcon, 
  Edit3, 
  Trash2, 
  Star, 
  Upload, 
  X, 
  Save,
  Loader2,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';

// Mock Company ID para testes
const MOCK_COMPANY_ID = 'e9c8b7a6-d5c4-4b3a-a2f1-0e9d8c7b6a54';

interface Category {
  id: string;
  nome: string;
}

interface Product {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  imagem_url: string;
  categoria_id: string;
  status: 'ativo' | 'inativo';
  is_featured: boolean;
}

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploading, setUploading] = useState(false);

  // Form State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    preco: '',
    categoria_id: '',
    status: 'ativo' as 'ativo' | 'inativo',
    is_featured: false,
    imagem_url: ''
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        supabase.from('produtos').select('*').eq('empresa_id', MOCK_COMPANY_ID).order('created_at', { ascending: false }),
        supabase.from('categorias').select('id, nome').eq('empresa_id', MOCK_COMPANY_ID)
      ]);

      if (prodRes.error) throw prodRes.error;
      if (catRes.error) throw catRes.error;

      setProducts(prodRes.data || []);
      setCategories(catRes.data || []);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${MOCK_COMPANY_ID}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, imagem_url: data.publicUrl }));
    } catch (error) {
      console.error('Erro no upload:', error);
      alert('Erro ao enviar imagem.');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        preco: parseFloat(formData.preco),
        empresa_id: MOCK_COMPANY_ID
      };

      if (editingProduct) {
        const { error } = await supabase
          .from('produtos')
          .update(payload)
          .eq('id', editingProduct.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('produtos')
          .insert([payload]);
        if (error) throw error;
      }

      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      alert('Erro ao salvar produto.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este produto?')) return;
    try {
      const { error } = await supabase.from('produtos').delete().eq('id', id);
      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error('Erro ao deletar:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      descricao: '',
      preco: '',
      categoria_id: categories[0]?.id || '',
      status: 'ativo',
      is_featured: false,
      imagem_url: ''
    });
    setEditingProduct(null);
  };

  const filteredProducts = products.filter(p => 
    p.nome.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
        <div className="relative w-full sm:w-72 group">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Buscar produto..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-dark-card border border-dark-border rounded-lg py-3 pl-12 pr-4 text-xs text-white focus:outline-none focus:border-primary transition-all shadow-inner" 
          />
        </div>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="w-full sm:w-auto bg-primary text-white px-6 py-3 rounded-lg text-[9px] font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-primary-hover transition-all shadow-lg shadow-primary/20 hover:-translate-y-1"
        >
          <Plus size={18} /> Novo Produto
        </button>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading && products.length === 0 ? (
          <div className="col-span-full py-20 flex flex-col items-center gap-4 text-slate-500 font-bold uppercase tracking-widest text-[9px]">
            <Loader2 className="animate-spin text-primary" size={32} />
            Sincronizando estoque...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="col-span-full py-20 text-center text-slate-500 font-bold uppercase tracking-widest text-[9px]">
            Nenhum produto cadastrado.
          </div>
        ) : filteredProducts.map((product) => (
          <ProductCard 
            key={product.id} 
            product={product} 
            categoryName={categories.find(c => c.id === product.categoria_id)?.nome || 'Sem Categoria'}
            onEdit={() => {
              setEditingProduct(product);
              setFormData({
                nome: product.nome,
                descricao: product.descricao,
                preco: product.preco.toString(),
                categoria_id: product.categoria_id,
                status: product.status,
                is_featured: product.is_featured,
                imagem_url: product.imagem_url
              });
              setIsModalOpen(true);
            }}
            onDelete={() => handleDelete(product.id)}
          />
        ))}
      </div>

      {/* Modal Form */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-dark-card w-full max-w-2xl rounded-[32px] border border-dark-border shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-8 border-b border-dark-border flex justify-between items-center">
                <div className="flex items-center gap-4">
                   <div className="bg-primary/10 p-3 rounded-xl text-primary border border-primary/20"><Package size={24} /></div>
                   <h2 className="text-xl font-bold text-white uppercase italic tracking-tight">{editingProduct ? 'Editar' : 'Novo'} <span className="text-primary font-light">Produto</span></h2>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white"><X size={24} /></button>
              </div>

              <form onSubmit={handleSaveProduct} className="p-8 space-y-6 overflow-y-auto no-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Image Upload Area */}
                  <div className="space-y-2 col-span-full">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 italic">Imagem do Produto</label>
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-video bg-dark-bg border-2 border-dashed border-dark-border rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-all overflow-hidden relative group"
                    >
                      {formData.imagem_url ? (
                        <>
                          <img src={formData.imagem_url} className="w-full h-full object-cover" alt="Preview" referrerPolicy="no-referrer" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                             <Upload className="text-white" />
                          </div>
                        </>
                      ) : (
                        <div className="text-center p-6">
                          {uploading ? <Loader2 className="animate-spin text-primary mx-auto mb-2" /> : <ImageIcon className="text-slate-700 mx-auto mb-2" size={32} />}
                          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{uploading ? 'Enviando...' : 'Clique para subir foto'}</p>
                        </div>
                      )}
                      <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                    </div>
                  </div>

                  <div className="space-y-2 col-span-full">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 italic">Nome do Produto</label>
                    <input type="text" required value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} className="w-full bg-dark-bg border border-dark-border rounded-xl py-3 px-4 text-xs text-white focus:border-primary transition-all shadow-inner" placeholder="Ex: X-Salada Especial" />
                  </div>

                  <div className="space-y-2 col-span-full">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 italic">Descrição (Ingredientes/Detalhes)</label>
                    <textarea value={formData.descricao} onChange={e => setFormData({...formData, descricao: e.target.value})} className="w-full bg-dark-bg border border-dark-border rounded-xl py-3 px-4 text-xs text-white focus:border-primary transition-all min-h-[80px] resize-none italic" placeholder="Ex: Carne 180g, queijo cheddar, alface, tomate..." />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 italic">Preço (R$)</label>
                    <input type="number" step="0.01" required value={formData.preco} onChange={e => setFormData({...formData, preco: e.target.value})} className="w-full bg-dark-bg border border-dark-border rounded-xl py-3 px-4 text-xs text-white focus:border-primary transition-all" placeholder="0.00" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 italic">Categoria</label>
                    <select value={formData.categoria_id} onChange={e => setFormData({...formData, categoria_id: e.target.value})} className="w-full bg-dark-bg border border-dark-border rounded-xl py-3 px-4 text-xs text-white focus:border-primary transition-all italic">
                      {categories.map(cat => <option key={cat.id} value={cat.id} className="bg-dark-card">{cat.nome}</option>)}
                    </select>
                  </div>

                  <div className="col-span-full flex items-center justify-between p-4 bg-dark-bg rounded-2xl border border-dark-border">
                    <div className="flex items-center gap-3">
                       <Star size={18} className={formData.is_featured ? "text-amber-400 fill-amber-400" : "text-slate-600"} />
                       <div>
                          <p className="text-[10px] font-bold text-white uppercase italic">Destaque do Cardápio</p>
                          <p className="text-[8px] text-slate-500 uppercase tracking-widest mt-0.5">Exibir no topo da página pública</p>
                       </div>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setFormData({...formData, is_featured: !formData.is_featured})}
                      className={`w-12 h-6 rounded-full transition-all relative ${formData.is_featured ? 'bg-amber-400' : 'bg-slate-700'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${formData.is_featured ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>
                </div>

                <div className="pt-6">
                  <button type="submit" disabled={loading || uploading} className="w-full bg-primary text-white py-4 rounded-xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-primary-hover flex items-center justify-center gap-3">
                    {loading ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> Salvar Produto</>}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ProductCard({ product, categoryName, onEdit, onDelete }: { product: Product, categoryName: string, onEdit: () => void, onDelete: () => void }) {
  return (
    <div className="bg-dark-card rounded-xl border border-dark-border overflow-hidden hover:shadow-xl hover:shadow-primary/5 transition-all group flex flex-col h-full">
      <div className="aspect-[4/3] bg-dark-bg relative overflow-hidden flex items-center justify-center border-b border-dark-border">
        {product.imagem_url ? (
          <img src={product.imagem_url} alt={product.nome} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
        ) : (
          <ImageIcon size={32} className="text-slate-800" />
        )}
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
           {product.is_featured && (
             <div className="p-1.5 bg-amber-400 text-dark-bg rounded-lg shadow-lg"><Star size={12} fill="currentColor" /></div>
           )}
           {product.status === 'inativo' && (
             <div className="px-2 py-1 bg-red-500/20 text-red-500 border border-red-500/30 rounded-md text-[8px] font-bold uppercase tracking-widest backdrop-blur-md">Inativo</div>
           )}
        </div>

        <div className="absolute top-3 right-3 flex gap-2">
           <button onClick={onEdit} className="p-2 bg-dark-card/80 backdrop-blur-md rounded-lg text-slate-400 hover:text-primary transition-all border border-dark-border/50 shadow-xl"><Edit3 size={14} /></button>
           <button onClick={onDelete} className="p-2 bg-dark-card/80 backdrop-blur-md rounded-lg text-slate-400 hover:text-red-400 transition-all border border-dark-border/50 shadow-xl"><Trash2 size={14} /></button>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
           <span className="text-[8px] bg-primary/10 text-primary font-bold px-2.5 py-0.5 rounded-full uppercase tracking-[0.1em] border border-primary/20">{categoryName}</span>
           <span className="text-white font-bold text-sm tracking-tighter italic">R$ {product.preco.toFixed(2).replace('.', ',')}</span>
        </div>
        <h4 className="font-bold text-white text-xs tracking-tight uppercase italic mb-2">{product.nome}</h4>
        <p className="text-[10px] text-slate-500 line-clamp-2 italic font-medium mt-auto">{product.descricao || 'Sem descrição cadastrada.'}</p>
      </div>
    </div>
  );
}
