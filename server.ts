import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { fileURLToPath } from "url";
import fetch from "node-fetch";
import { gerarFechamento, selecionarGrupoTipico, obterEstatisticasJogo, verificarCobertura } from "./src/lib/lottery.js";

// Fix __dirname para CJS/ESM compatível
declare const __dirname: string;
declare const __filename: string;
let currentFilename: string;
try {
  currentFilename = __filename;
} catch {
  currentFilename = fileURLToPath(import.meta.url);
}
const dirname = path.dirname(currentFilename);

const lotteryFunctions: Record<string, Function> = {
  obter_estatisticas_jogo: obterEstatisticasJogo,
  selecionar_grupo_tipico: selecionarGrupoTipico,
  gerar_fechamento: gerarFechamento,
  verificar_cobertura: verificarCobertura
};

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  
  app.use(express.json());

  // Proxy for loteria historical data
  app.get("/api/loteria/:jogo", async (req, res) => {
    const { jogo } = req.params;
    const urls: Record<string, string> = {
      "mega_sena": "https://raw.githubusercontent.com/guilhermeasn/loteria.json/master/data/megasena.json",
      "quina": "https://raw.githubusercontent.com/guilhermeasn/loteria.json/master/data/quina.json",
      "lotofacil": "https://raw.githubusercontent.com/guilhermeasn/loteria.json/master/data/lotofacil.json",
      "mais_milionaria": "https://raw.githubusercontent.com/guilhermeasn/loteria.json/master/data/maismilionaria.json",
    };

    const url = urls[jogo];
    if (!url) {
      return res.status(404).json({ error: "Jogo não encontrado" });
    }

    try {
      const response = await fetch(url);
      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar dados históricos" });
    }
  });

  // Proxy for loteria latest results and recent draws
  const jogoToApiName: Record<string, string> = {
    "mega_sena": "megasena",
    "quina": "quina",
    "lotofacil": "lotofacil",
    "mais_milionaria": "maismilionaria"
  };

  app.get("/api/loteria/:jogo/resumo", async (req, res) => {
    const { jogo } = req.params;
    const apiName = jogoToApiName[jogo];
    if (!apiName) {
      return res.status(404).json({ error: "Jogo não encontrado" });
    }

    try {
      const response = await fetch(`https://loteriascaixa-api.herokuapp.com/api/${apiName}/latest`);
      if (!response.ok) throw new Error("API unavailable");
      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(503).json({ error: "Não foi possível obter o resultado mais recente" });
    }
  });

  app.get("/api/loteria/:jogo/recentes", async (req, res) => {
    const { jogo } = req.params;
    const { n = 5 } = req.query;
    const num = Math.min(Math.max(Number(n), 1), 20);
    const apiName = jogoToApiName[jogo];
    if (!apiName) {
      return res.status(404).json({ error: "Jogo não encontrado" });
    }

    try {
      const response = await fetch(`https://loteriascaixa-api.herokuapp.com/api/${apiName}`);
      if (!response.ok) throw new Error("API unavailable");
      const data = (await response.json()) as any[];
      // Get last N entries
      const recentes = data.slice(-num);
      res.json(recentes);
    } catch (error) {
      res.status(503).json({ error: "Não foi possível obter os resultados recentes" });
    }
  });

  // Proxy for AI queries
  app.post("/api/ai/query", async (req, res) => {
    const { provider, apiKey, model, systemPrompt, userMessage, tools } = req.body;
    let url = "";
    let headers: Record<string, string> = { "Content-Type": "application/json" };
    let body: any = {};

    switch (provider) {
      case "openrouter":
      case "groq":
      case "deepseek":
        url = provider === "openrouter" ? "https://openrouter.ai/api/v1/chat/completions" : 
              provider === "groq" ? "https://api.groq.com/openai/v1/chat/completions" :
              "https://api.deepseek.com/chat/completions";
        headers["Authorization"] = `Bearer ${apiKey}`;
        body = {
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage }
          ],
          tools
        };
        break;
      case "google":
        url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        body = {
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: "user", parts: [{ text: userMessage }] }],
          tools: tools ? [{ functionDeclarations: tools.map((t: any) => t.function) }] : undefined
        };
        break;
      default:
        return res.status(400).json({ error: "Provedor inválido" });
    }

    try {
      const response = await fetch(url, { method: "POST", headers, body: JSON.stringify(body) });
      if (response.status === 401 || response.status === 403) return res.status(401).json({ error: "Chave inválida para este provedor" });
      if (response.status === 429) return res.status(429).json({ error: "Limite de requisições excedido, tente novamente em instantes" });
      
      const data = await response.json() as any;
      
      // Handle tool calls
      let toolCalls = provider === "google" ? data.candidates?.[0]?.content?.parts?.[0]?.functionCall : data.choices?.[0]?.message?.tool_calls;
      if (toolCalls) {
          if (provider === "google") toolCalls = [toolCalls];
          
          const toolResults = [];
          for (const call of toolCalls) {
            const funcName = provider === "google" ? call.name : call.function.name;
            const args = provider === "google" ? call.args : JSON.parse(call.function.arguments);
            
            const func = lotteryFunctions[funcName];
            if (func) {
              const result = func(...Object.values(args));
              toolResults.push({ name: funcName, result });
            }
          }
          return res.json({ toolCalls: toolResults });
      }

      let text = "";
      if (provider === "google") {
        text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      } else {
        text = data.choices?.[0]?.message?.content || "";
      }
      res.json({ text });
    } catch (error) {
      res.status(500).json({ error: "Erro na chamada de IA" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
