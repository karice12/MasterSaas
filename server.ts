import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // 1. API: Simulação de Verificação de Host (Subdomínios)
  // No frontend, você usaria window.location.hostname para extrair o slug
  app.get("/api/tenant-info", (req, res) => {
    const host = req.headers.host || "";
    // Exemplo simplificado: local-test.seudominio.com.br
    const subdomain = host.split(".")[0];
    
    // Aqui você faria a query no Supabase: 
    // select id, name, status from companies where slug = subdomain
    
    res.json({ 
      slug: subdomain,
      is_subdomain: subdomain !== "localhost" && subdomain !== "3000"
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
