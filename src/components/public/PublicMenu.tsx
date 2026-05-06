import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShoppingBag, 
  ChevronRight, 
  Clock, 
  MapPin, 
  Smartphone, 
  Star, 
  Plus, 
  Minus, 
  X,
  ChefHat,
  Utensils,
  AlertCircle,
  Loader2,
  Lock,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

interface Company {
  id: string;
  nome: string;
  slug: string;
  whatsapp: string;
  status: 'active' | 'blocked' | 'expired';
}

interface Category {
  id: string;
  nome: string;
  ordem: number;
}

interface Product {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  imagem_url: string;
  categoria_id: string;
  is_featured: boolean;
}

interface CartItem {
  product: Product;
  quantity: number;
}

export default function PublicMenu() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState<Company | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    if (slug) fetchData();
  }, [slug]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Company
      const { data: compData, error: compErr } = await supabase
        .from('empresas')
        .select('*')
        .eq('slug', slug)
        .single();

      if (compErr || !compData) {
        setLoading(false);
        return;
      }
      setCompany(compData);

      // 2. Fetch Categories and Products
      const [catRes, prodRes] = await Promise.all([
        supabase.from('categorias').select('*').eq('empresa_id', compData.id).order('ordem'),
        supabase.from('produtos').select('*').eq('empresa_id', compData.id).eq('status', 'ativo')
      ]);

      if (catRes.error) throw catRes.error;
      if (prodRes.error) throw prodRes.error;

      setCategories(catRes.data || []);
      setProducts(prodRes.data || []);
      if (catRes.data && catRes.data.length > 0) setActiveCategory(catRes.data[0].id);

    } catch (err) {
      console.error('Error fetching menu data:', err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.product.preco * item.quantity), 0);
  }, [cart]);

  const handleCheckout = () => {
    if (!company) return;
    const itemsText = cart.map(item => `${item.quantity}x ${item.product.nome}`).join(', ');
    const totalFormatted = cartTotal.toFixed(2).replace('.', ',');
    const message = `Olá! Gostaria de fazer um pedido:\n\n*Itens:* ${itemsText}\n\n*Total:* R$ ${totalFormatted}\n\nPor favor, confirmem o recebimento!`;
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${company.whatsapp.replace(/\D/g, '')}&text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="animate-spin text-primary mb-4" size={48} />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs animate-pulse">Consultando Cozinha...</p>
      </div>
    );
  }

  if (!company || company.status !== 'active') {
    return (
      <div className="min-h-screen bg-dark-bg flex flex-col items-center justify-center p-10 text-center">
        <div className="bg-dark-card p-10 rounded-[40px] border border-dark-border shadow-2xl max-w-sm">
           <div className="mb-6 mx-auto w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center text-red-500">
              <Lock size={40} />
           </div>
           <h1 className="text-xl font-bold text-white uppercase italic tracking-tight mb-4">Loja Temporariamente <span className="text-primary">Indisponível</span></h1>
           <p className="text-sm text-slate-500 font-medium italic mb-8 leading-relaxed">
             Este estabelecimento não está aceitando pedidos online no momento. Entre em contato diretamente.
           </p>
           <button 
            onClick={() => navigate('/')}
            className="w-full bg-white text-dark-bg py-4 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-3"
           >
             <ArrowLeft size={18} /> Voltar ao Início
           </button>
        </div>
      </div>
    );
  }

  const featuredProducts = products.filter(p => p.is_featured);

  return (
    <div className="min-h-screen bg-dark-bg text-slate-200 font-sans pb-32">
      {/* Header Profile */}
      <div className="bg-dark-card border-b border-dark-border sticky top-0 z-50">
        <div className="max-w-3xl mx-auto p-6 flex items-center gap-6">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
             <Utensils size={32} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white uppercase italic tracking-tight">{company.nome}</h1>
            <div className="flex items-center gap-3 mt-1">
               <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-400 uppercase bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Aberto
               </span>
               <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1">
                 <Clock size={10} /> 30-45 min
               </span>
            </div>
          </div>
        </div>

        {/* Categories Navbar */}
        <div className="max-w-3xl mx-auto px-6 pb-4 overflow-x-auto no-scrollbar flex items-center gap-3">
          {categories.map(cat => (
            <button 
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id);
                document.getElementById(`category-${cat.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
              className={`
                whitespace-nowrap px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border
                ${activeCategory === cat.id ? 'bg-primary text-white border-primary shadow-lg shadow-primary/10' : 'bg-dark-bg text-slate-500 border-dark-border hover:text-white'}
              `}
            >
              {cat.nome}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-3xl mx-auto p-6 space-y-10">
        {/* Featured Section */}
        {featuredProducts.length > 0 && (
          <div>
            <h2 className="flex items-center gap-2 text-sm font-bold text-white uppercase italic tracking-tight mb-6">
              <Star size={18} className="text-amber-400 fill-amber-400" /> Destaques Incríveis
            </h2>
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
               {featuredProducts.map(product => (
                 <motion.div 
                   key={product.id} 
                   whileTap={{ scale: 0.95 }}
                   onClick={() => addToCart(product)}
                   className="min-w-[280px] bg-dark-card rounded-[32px] border border-dark-border p-4 shadow-xl relative overflow-hidden group cursor-pointer"
                 >
                   <div className="aspect-video bg-dark-bg rounded-2xl mb-4 overflow-hidden relative">
                      {product.imagem_url ? (
                        <img src={product.imagem_url} alt={product.nome} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
                      ) : (
                        <ChefHat size={32} className="text-slate-800 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                      )}
                      <div className="absolute bottom-2 right-2 bg-dark-card/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-dark-border text-white font-bold text-xs shadow-xl">
                        R$ {product.preco.toFixed(2).replace('.', ',')}
                      </div>
                   </div>
                   <h3 className="font-bold text-white text-sm uppercase italic mb-1 truncate">{product.nome}</h3>
                   <p className="text-[10px] text-slate-500 line-clamp-2 italic font-medium">{product.descricao}</p>
                   <div className="mt-4 flex justify-center">
                      <div className="bg-primary/10 text-primary p-2 rounded-xl border border-primary/20 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Plus size={20} />
                      </div>
                   </div>
                 </motion.div>
               ))}
            </div>
          </div>
        )}

        {/* Regular Categories */}
        {categories.map(cat => (
          <div key={cat.id} id={`category-${cat.id}`} className="space-y-6 pt-4">
             <h2 className="text-base font-bold text-white uppercase italic tracking-tighter border-l-4 border-primary pl-4">{cat.nome}</h2>
             <div className="grid grid-cols-1 gap-4">
                {products.filter(p => p.categoria_id === cat.id).map(product => (
                  <motion.div 
                    key={product.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => addToCart(product)}
                    className="bg-dark-card p-4 rounded-2xl border border-dark-border flex gap-4 cursor-pointer hover:border-primary/20 transition-all group"
                  >
                    <div className="w-24 h-24 bg-dark-bg rounded-xl shrink-0 overflow-hidden relative">
                      {product.imagem_url ? (
                        <img src={product.imagem_url} alt={product.nome} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                      ) : (
                        <Utensils size={24} className="text-slate-800 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                       <h3 className="font-bold text-white text-sm tracking-tight mb-1 uppercase italic">{product.nome}</h3>
                       <p className="text-[10px] text-slate-500 line-clamp-2 italic font-medium leading-relaxed">{product.descricao}</p>
                       <div className="mt-3 flex items-center justify-between">
                          <span className="text-primary font-bold text-sm tracking-tighter">R$ {product.preco.toFixed(2).replace('.', ',')}</span>
                          <button className="bg-dark-bg border border-dark-border p-2 rounded-lg text-slate-400 group-hover:text-primary transition-colors">
                            <Plus size={16} />
                          </button>
                       </div>
                    </div>
                  </motion.div>
                ))}
             </div>
          </div>
        ))}
      </main>

      {/* Floating Cart Launcher */}
      <AnimatePresence>
        {cart.length > 0 && (
          <motion.button 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            onClick={() => setIsCartOpen(true)}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] bg-primary text-white p-6 rounded-[32px] shadow-2xl flex items-center gap-6 min-w-[280px] shadow-primary/30 active:scale-95 transition-transform"
          >
            <div className="relative">
              <ShoppingBag size={24} />
              <span className="absolute -top-2 -right-2 bg-white text-primary text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-primary">
                {cart.reduce((s, i) => s + i.quantity, 0)}
              </span>
            </div>
            <div className="flex-1 text-left">
               <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Ver Pedido</p>
               <p className="text-base font-bold tracking-tighter">R$ {cartTotal.toFixed(2).replace('.', ',')}</p>
            </div>
            <ChevronRight size={24} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Cart Sidebar Modal */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCartOpen(false)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-[110]" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="bg-dark-card w-full max-w-md h-full shadow-2xl border-l border-dark-border flex flex-col pt-safe z-[120]">
              <div className="p-8 border-b border-dark-border flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-xl text-primary"><ShoppingBag size={24} /></div>
                  <h2 className="text-xl font-bold text-white uppercase italic tracking-tight">Meus <span className="text-primary font-light">Itens</span></h2>
                </div>
                <button onClick={() => setIsCartOpen(false)} className="text-slate-500 hover:text-white p-2 bg-dark-bg rounded-xl border border-dark-border"><X size={24} /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar">
                {cart.map(item => (
                  <div key={item.product.id} className="flex gap-4 p-4 bg-dark-bg/40 rounded-[28px] border border-dark-border/50">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-dark-bg shrink-0">
                       <img src={item.product.imagem_url} alt={item.product.nome} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-white uppercase italic tracking-tight">{item.product.nome}</h4>
                      <p className="text-primary font-bold text-xs mt-1">R$ {(item.product.preco * item.quantity).toFixed(2).replace('.', ',')}</p>
                      <div className="flex items-center gap-4 mt-3">
                         <button onClick={() => updateQuantity(item.product.id, -1)} className="p-1.5 bg-dark-bg border border-dark-border rounded-lg text-slate-500 hover:text-white"><Minus size={14} /></button>
                         <span className="text-xs font-bold text-white font-mono">{item.quantity}</span>
                         <button onClick={() => updateQuantity(item.product.id, 1)} className="p-1.5 bg-dark-bg border border-dark-border rounded-lg text-primary border-primary/20"><Plus size={14} /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-8 border-t border-dark-border bg-dark-bg/20 space-y-6">
                <div className="flex justify-between items-center px-2">
                  <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">Valor Total</span>
                  <span className="text-2xl font-bold text-white tracking-tighter">R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
                </div>
                <button 
                  onClick={handleCheckout}
                  className="w-full bg-primary text-white py-5 rounded-[24px] font-bold text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:bg-primary-hover flex items-center justify-center gap-3 transition-all active:scale-95"
                >
                  Confirmar Pedido <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_white]" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
