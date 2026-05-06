# 🛠️ Guia de Implementação Backend - MenuMaster SaaS

O backend foi projetado para ser **zero-config** após a execução do script SQL. Aqui está como tudo funciona e como você deve finalizar as configurações:

## 1. Segurança e Isolamento (RLS)
- **Tabela `profiles`**: Cada usuário está vinculado a um `company_id`. 
- **Políticas**: O sistema verifica em tempo real se o `company_id` do usuário logado corresponde ao dado que ele tenta acessar.
- **Área Mestra**: Usuários com `role = 'master'` ignoram todas as restrições e veem dados de todas as empresas e financeiro central.

## 2. Automações de Banco de Dados (PostgreSQL)
- **Slugs Automáticos**: Ao criar uma empresa (ex: "Pastelaria do João"), o banco gera automaticamente o slug `pastelaria-do-joao`. Isso define seu link: `pastelaria-do-joao.seudominio.com.br`.
- **Manutenção Diária**: A função `daily_maintenance_task()` faz duas coisas:
  1. Verifica empresas cuja `access_expires_at` é menor que hoje e muda o status para `expired`.
  2. Atualiza um registro de tempo para manter o projeto Supabase ativo no plano gratuito.

## 3. Como Finalizar a Configuração no Supabase
Para que o sistema de login automático funcione (vincular novos usuários à tabela de perfis), cole este comando no SQL Editor do Supabase:

```sql
-- Cria o gatilho para novos usuários do Auth
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## 4. Roteamento de Subdomínios
O arquivo `server.ts` contém um middleware que extrai o subdomínio. 
- **Público**: `empresa.dominio.com.br` -> Backend filtra pelo slug.
- **Admin**: `empresa.dominio.com.br/admin` -> Backend exige login do tenant.
- **Mestre**: `dominio.com.br/master` -> Backend exige login master.

## 5. Tarefa Automática (Cron)
Recomenda-se usar a extensão `pg_cron` do Supabase ou uma Edge Function agendada para chamar a função `daily_maintenance_task()` uma vez ao dia às 00:00.
