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
  name: string;
  slug: string;
  whatsapp: string;
  status: 'active' | 'blocked' | 'expired';
  menu_visibility: 'online' | 'offline';
}

interface Category {
  id: string;
  name: string;
  display_order: number;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category_id: string;
  is_featured: boolean;
}

interface CartItem {
  product: Product;
  quantity: number;
}

export default function PublicMenu({ overrideSlug }: { overrideSlug?: string }) {
  const { slug: paramSlug } = useParams();
  const slug = overrideSlug || paramSlug;
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
        .from('companies')
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
        supabase.from('categories').select('*').eq('company_id', compData.id).order('display_order'),
        supabase.from('products').select('*').eq('company_id', compData.id).eq('is_active', true)
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
    return cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  }, [cart]);

  const handleCheckout = () => {
    if (!company) return;
    const itemsText = cart.map(item => `${item.quantity}x ${item.product.name}`).join(', ');
    const totalFormatted = cartTotal.toFixed(2).replace('.', ',');
    const message = `Olá! Gostaria de fazer um pedido:\n\n*Itens:* ${itemsText}\n\n*Total:* R$ ${totalFormatted}\n\nPor favor, confirmem o recebimento!`;
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${company.whatsapp.replace(/\D/g, '')}&text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="animate-spin text-amber-500 mb-4" size={40} />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-[8px] animate-pulse">Sincronizando Nodes...</p>
      </div>
    );
  }

  // Critical Business Rule: Both status active and menu online
  if (!company || company.status !== 'active' || company.menu_visibility !== 'online') {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-10 text-center">
        <div className="bg-gray-900 p-10 rounded border border-white/5 shadow-2xl max-w-sm relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-1 bg-amber-600/20" />
           <div className="mb-8 mx-auto w-16 h-16 bg-red-500/5 border border-red-500/10 rounded flex items-center justify-center text-red-500">
              <Lock size={32} />
           </div>
           <h1 className="text-lg font-bold text-white uppercase italic tracking-widest mb-4">Acesso <span className="text-red-500">Restrito</span></h1>
           <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-8 leading-relaxed opacity-60">
             O cardápio deste estabelecimento encontra-se indisponível ou em manutenção preventiva.
           </p>
           <button 
            onClick={() => navigate('/')}
            className="w-full bg-gray-800 border border-white/5 text-white py-3 rounded font-bold text-[9px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-gray-700 transition-all"
           >
             <ArrowLeft size={16} /> Voltar ao Início
           </button>
        </div>
      </div>
    );
  }

  const featuredProducts = products.filter(p => p.is_featured);

  return (
    <div className="min-h-screen bg-gray-950 text-slate-300 font-sans pb-32">
      {/* Header Profile */}
      <div className="bg-gray-900 border-b border-white/5 sticky top-0 z-50 backdrop-blur-md bg-opacity-80">
        <div className="max-w-xl mx-auto p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-600 rounded flex items-center justify-center text-white shadow-lg shadow-amber-900/40">
             <ChefHat size={24} />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white uppercase italic tracking-widest">{company.name}</h1>
            <div className="flex items-center gap-3 mt-1">
               <span className="flex items-center gap-1.5 text-[8px] font-bold text-emerald-500 uppercase bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10">
                 <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" /> Operacional
               </span>
               <span className="text-[8px] text-slate-600 font-bold uppercase tracking-widest flex items-center gap-1 opacity-60">
                 <Clock size={10} /> 25-40 MIN
               </span>
            </div>
          </div>
        </div>

        {/* Categories Navbar */}
        <div className="max-w-xl mx-auto px-5 pb-4 overflow-x-auto no-scrollbar flex items-center gap-2">
          {categories.map(cat => (
            <button 
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id);
                document.getElementById(`category-${cat.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
              }}
              className={`
                whitespace-nowrap px-4 py-1.5 rounded text-[9px] font-bold uppercase tracking-widest transition-all
                ${activeCategory === cat.id ? 'bg-amber-600 text-white shadow shadow-amber-900/20' : 'bg-gray-800 text-slate-500 border border-white/5 hover:text-white'}
              `}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-xl mx-auto p-5 space-y-12">
        {/* Featured Section */}
        {featuredProducts.length > 0 && (
          <div>
            <h2 className="flex items-center gap-2 text-[10px] font-bold text-white uppercase italic tracking-widest mb-6 opacity-80">
              <Star size={14} className="text-amber-500 fill-amber-500" /> Seleção Premium
            </h2>
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
               {featuredProducts.map(product => (
                 <motion.div 
                   key={product.id} 
                   whileTap={{ scale: 0.98 }}
                   onClick={() => addToCart(product)}
                   className="min-w-[240px] bg-gray-900 rounded border border-white/5 p-4 shadow-sm relative overflow-hidden group cursor-pointer"
                 >
                   <div className="aspect-[4/3] bg-gray-800 rounded mb-4 overflow-hidden relative">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
                      ) : (
                        <Utensils size={24} className="text-slate-800 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                      )}
                      <div className="absolute top-2 right-2 bg-gray-950/80 backdrop-blur-md px-2 py-1 rounded border border-white/5 text-amber-500 font-bold text-[10px]">
                        R$ {product.price.toFixed(2).replace('.', ',')}
                      </div>
                   </div>
                   <h3 className="font-bold text-white text-[11px] uppercase italic mb-1 truncate tracking-tight">{product.name}</h3>
                   <p className="text-[9px] text-slate-600 line-clamp-2 italic font-medium leading-relaxed">{product.description}</p>
                 </motion.div>
               ))}
            </div>
          </div>
        )}

        {/* Regular Categories */}
        {categories.map(cat => (
          <div key={cat.id} id={`category-${cat.id}`} className="space-y-6">
             <h2 className="text-[11px] font-bold text-white uppercase italic tracking-widest border-l-2 border-amber-600 pl-4">{cat.name}</h2>
             <div className="grid grid-cols-1 gap-4">
                {products.filter(p => p.category_id === cat.id).map(product => (
                  <motion.div 
                    key={product.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => addToCart(product)}
                    className="bg-gray-900 p-4 rounded border border-white/5 flex gap-4 cursor-pointer hover:border-amber-500/20 transition-all group"
                  >
                    <div className="w-20 h-20 bg-gray-800 rounded shrink-0 overflow-hidden relative">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                      ) : (
                        <Utensils size={20} className="text-slate-800 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                       <div>
                          <h3 className="font-bold text-white text-[11px] tracking-tight mb-1 uppercase italic">{product.name}</h3>
                          <p className="text-[9px] text-slate-600 line-clamp-2 italic font-medium leading-relaxed">{product.description}</p>
                       </div>
                       <div className="mt-auto pt-3 flex items-center justify-between">
                          <span className="text-amber-500 font-bold text-[11px]">R$ {product.price.toFixed(2).replace('.', ',')}</span>
                          <div className="w-6 h-6 bg-gray-800 border border-white/5 rounded flex items-center justify-center text-slate-500 group-hover:text-amber-500 transition-colors">
                            <Plus size={14} />
                          </div>
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
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] bg-amber-600 text-white p-4 rounded border border-amber-500 shadow-2xl flex items-center gap-6 min-w-[280px] shadow-amber-900/20 active:scale-95 transition-transform"
          >
            <div className="relative">
              <ShoppingBag size={20} />
              <span className="absolute -top-2 -right-2 bg-white text-amber-600 text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-amber-600">
                {cart.reduce((s, i) => s + i.quantity, 0)}
              </span>
            </div>
            <div className="flex-1 text-left">
               <p className="text-[8px] font-bold uppercase tracking-widest opacity-80 italic">Confirmar Seleção</p>
               <p className="text-sm font-bold tracking-tight italic">R$ {cartTotal.toFixed(2).replace('.', ',')}</p>
            </div>
            <ChevronRight size={20} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Cart Sidebar Modal */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCartOpen(false)} className="absolute inset-0 bg-black/90 backdrop-blur-sm z-[110]" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="bg-gray-900 w-full max-w-sm h-full shadow-2xl border-l border-white/5 flex flex-col z-[120]">
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/10">
                <div className="flex items-center gap-3">
                  <div className="bg-amber-600/10 p-2 rounded text-amber-500 border border-amber-600/10"><ShoppingBag size={20} /></div>
                  <div>
                     <h2 className="text-xs font-bold text-white uppercase italic tracking-widest">Pedido <span className="text-amber-500 font-light">Sincronizado</span></h2>
                     <p className="text-[8px] text-slate-600 font-bold uppercase tracking-widest italic">Análise de itens selecionados</p>
                  </div>
                </div>
                <button onClick={() => setIsCartOpen(false)} className="text-slate-500 hover:text-white p-1.5 bg-gray-800 rounded border border-white/5"><X size={18} /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
                {cart.map(item => (
                  <div key={item.product.id} className="flex gap-4 p-4 bg-gray-800/40 rounded border border-white/5 relative group">
                    <div className="w-14 h-14 rounded overflow-hidden bg-gray-800 shrink-0">
                       <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-[10px] font-bold text-white uppercase italic tracking-widest">{item.product.name}</h4>
                      <p className="text-amber-500 font-bold text-xs mt-1">R$ {(item.product.price * item.quantity).toFixed(2).replace('.', ',')}</p>
                      <div className="flex items-center gap-4 mt-3">
                         <button onClick={() => updateQuantity(item.product.id, -1)} className="p-1.5 bg-gray-900 border border-white/5 rounded text-slate-500 hover:text-white"><Minus size={12} /></button>
                         <span className="text-[9px] font-bold text-white font-mono">{item.quantity}</span>
                         <button onClick={() => updateQuantity(item.product.id, 1)} className="p-1.5 bg-gray-900 border border-amber-500/20 rounded text-amber-500"><Plus size={12} /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-6 border-t border-white/5 bg-black/20 space-y-6">
                <div className="flex justify-between items-center px-2">
                  <span className="text-slate-600 text-[10px] font-bold uppercase tracking-widest">Montante Total</span>
                  <span className="text-xl font-bold text-white tracking-tighter italic">R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
                </div>
                <button 
                  onClick={handleCheckout}
                  className="w-full bg-amber-600 text-white py-4 rounded font-bold text-[10px] uppercase tracking-widest shadow-xl shadow-amber-900/20 hover:bg-amber-700 flex items-center justify-center gap-3 transition-all active:scale-95"
                >
                  Confirmar no WhatsApp <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white] animate-pulse" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
