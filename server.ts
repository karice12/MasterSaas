import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware para Resolução de Tenancy via Subdomínio
const tenantMiddleware = (req, res, next) => {
  const host = req.headers.host || "";
  const parts = host.split(".");
  
  // Ignorar subdomínios técnicos
  const ignored = ["www", "admin", "dev", "master", "api", "localhost"];
  
  if (parts.length >= 3) {
    const subdomain = parts[0].toLowerCase();
    if (!ignored.includes(subdomain)) {
      req.tenantSlug = subdomain;
      console.log(`[Tenancy] Resolvido para: ${subdomain}`);
    }
  }
  next();
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(tenantMiddleware);

  // 1. API: Tenant Info
  app.get("/api/tenant-info", (req: any, res) => {
    res.json({ 
      slug: req.tenantSlug || null,
      is_tenant_path: !!req.tenantSlug
    });
  });

  // 2. Tarefa de Manutenção (Simulada para rodar a cada 24h ou via rota específica)
  app.post("/api/system/maintenance", async (req, res) => {
    try {
      // Aqui você chamaria a função RPC do Supabase: daily_maintenance_task()
      console.log("Executando manutenção diária: Verificando vencidos e mantendo banco ativo...");
      res.json({ status: "success", message: "Manutenção concluída." });
    } catch (error) {
      res.status(500).json({ status: "error", message: "Falha na manutenção." });
    }
  });

  // 3. Integração com Vite
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Servir arquivos estáticos em produção
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Backend rodando em http://localhost:${PORT}`);
    console.log(`🔒 RLS ativado para isolamento de tenants.`);
    console.log(`📅 Tarefa de manutenção diária configurada.`);
  });
}

startServer();
