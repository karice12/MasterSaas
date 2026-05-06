-- SUPABASE DATABASE SCHEMA COMPLETO
-- Projeto: MenuMaster SaaS (Cardápio Digital Multi-Tenant)
-- Data: 2026-05-06

-- 1. EXTENSÕES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TIPOS CUSTOMIZADOS
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'account_status') THEN
        CREATE TYPE account_status AS ENUM ('active', 'blocked', 'expired');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'menu_status') THEN
        CREATE TYPE menu_status AS ENUM ('online', 'offline');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'plan_type') THEN
        CREATE TYPE plan_type AS ENUM ('mensal', 'trimestral', 'anual', 'avulso');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
        CREATE TYPE payment_status AS ENUM ('pago', 'pendente', 'atrasado');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'expense_category') THEN
        CREATE TYPE expense_category AS ENUM ('Manutenção', 'Melhoria', 'Infraestrutura', 'Outros');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('master', 'company');
    END IF;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. TABELAS

-- Tabela de Empresas
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE, -- Usado para subdomínios: slug.seudominio.com.br
    status account_status DEFAULT 'active',
    menu_visibility menu_status DEFAULT 'online',
    access_expires_at DATE NOT NULL,
    
    -- Dados da Loja
    whatsapp TEXT,
    address TEXT,
    delivery_fee DECIMAL(10,2) DEFAULT 0,
    welcome_message TEXT DEFAULT 'Seja bem-vindo ao nosso cardápio!',
    is_open BOOLEAN DEFAULT true,
    opening_hours JSONB DEFAULT '{"seg": "08:00-18:00", "ter": "08:00-18:00", "qua": "08:00-18:00", "qui": "08:00-18:00", "sex": "08:00-18:00", "sab": "08:00-14:00", "dom": "fechado"}'::jsonb,
    
    last_activity_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Perfis vinculados ao Auth
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role user_role DEFAULT 'company',
    company_id UUID REFERENCES companies(id),
    full_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categorias e Produtos
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Adicionais / Extras
CREATE TABLE IF NOT EXISTS product_extras (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price DECIMAL(10,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true
);

-- Pedidos (Analytics da Empresa)
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    total_amount DECIMAL(10,2) NOT NULL,
    payment_method TEXT,
    items_summary JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Financeiro Mestre (Seu Controle)
CREATE TABLE IF NOT EXISTS master_income (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id),
    amount DECIMAL(10,2) NOT NULL,
    payment_date DATE DEFAULT CURRENT_DATE,
    plan plan_type NOT NULL,
    payment_method TEXT,
    status payment_status DEFAULT 'pago',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS master_expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    description TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    spent_at DATE DEFAULT CURRENT_DATE,
    category expense_category NOT NULL,
    payment_method TEXT,
    status payment_status DEFAULT 'pago',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Logs de Auditoria
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id),
    action TEXT NOT NULL,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. FUNÇÕES E GATILHOS (AUTOMATIZAÇÃO)

-- Função para gerar Slug automaticamente (nomedaempresa.seudominio.com.br)
CREATE OR REPLACE FUNCTION generate_company_slug()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        NEW.slug := lower(regexp_replace(NEW.name, '[^a-zA-Z0-9]+', '-', 'g'));
        NEW.slug := trim(both '-' from NEW.slug);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_generate_slug
BEFORE INSERT ON companies
FOR EACH ROW EXECUTE FUNCTION generate_company_slug();

-- Função para sincronizar Perfil ao criar usuário Auth
-- Nota: Rodar no SQL Editor do Supabase para vincular ao auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, role, company_id)
    VALUES (
        NEW.id, 
        NEW.email, 
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'company'),
        (NEW.raw_user_meta_data->>'company_id')::uuid
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- TAREFA DIÁRIA: Bloqueio de vencidos e Atividade do Banco
-- Rodar isso via pg_cron ou Edge Function agendada
CREATE OR REPLACE FUNCTION daily_maintenance_task()
RETURNS void AS $$
BEGIN
    -- 1. Bloqueio automático de vencidos (Data de término passou)
    UPDATE companies 
    SET status = 'expired', menu_visibility = 'offline'
    WHERE access_expires_at < CURRENT_DATE AND status = 'active';
    
    -- 2. Registro de Atividade (Garante que o banco não durma no plano gratuito)
    UPDATE companies 
    SET last_activity_at = NOW()
    WHERE id = (SELECT id FROM companies LIMIT 1);
    
    RAISE NOTICE 'Manutenção diária concluída em %', NOW();
END;
$$ LANGUAGE plpgsql;

-- 5. SEGURANÇA (RLS - ROW LEVEL SECURITY)

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_extras ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_income ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper: Verificadores de Acesso
CREATE OR REPLACE FUNCTION is_master() RETURNS BOOLEAN AS $$
  SELECT role = 'master' FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_user_company_id() RETURNS UUID AS $$
  SELECT company_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- POLÍTICAS: ÁREA MESTRA (Acesso Total)
CREATE POLICY "Master total companies" ON companies FOR ALL USING (is_master());
CREATE POLICY "Master total profiles" ON profiles FOR ALL USING (is_master());
CREATE POLICY "Master total income" ON master_income FOR ALL USING (is_master());
CREATE POLICY "Master total expenses" ON master_expenses FOR ALL USING (is_master());
CREATE POLICY "Master total audit" ON audit_logs FOR ALL USING (is_master());

-- POLÍTICAS: EMPRESAS (Isolamento de Dados)
CREATE POLICY "Company select own" ON companies FOR SELECT USING (id = get_user_company_id());
CREATE POLICY "Company update own store" ON companies FOR UPDATE 
USING (id = get_user_company_id())
WITH CHECK (
    -- Impede a empresa de alterar seu próprio status ou vencimento
    (SELECT status FROM companies WHERE id = NEW.id) = NEW.status AND
    (SELECT access_expires_at FROM companies WHERE id = NEW.id) = NEW.access_expires_at
);

CREATE POLICY "Company manage categories" ON categories FOR ALL 
USING (company_id = get_user_company_id());

CREATE POLICY "Company manage products" ON products FOR ALL 
USING (company_id = get_user_company_id());

CREATE POLICY "Company manage extras" ON product_extras FOR ALL 
USING (company_id = get_user_company_id());

CREATE POLICY "Company view orders" ON orders FOR SELECT 
USING (company_id = get_user_company_id());

-- POLÍTICAS: ÁREA PÚBLICA (Sem Auth)
CREATE POLICY "Public menu access" ON companies FOR SELECT TO anon 
USING (status = 'active' AND menu_visibility = 'online');

CREATE POLICY "Public categories access" ON categories FOR SELECT TO anon 
USING (EXISTS (SELECT 1 FROM companies WHERE id = categories.company_id AND status = 'active' AND menu_visibility = 'online'));

CREATE POLICY "Public products access" ON products FOR SELECT TO anon 
USING (EXISTS (SELECT 1 FROM companies WHERE id = products.company_id AND status = 'active' AND menu_visibility = 'online' AND is_active = true));
