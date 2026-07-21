
import type { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch';
import { gerarFechamento, selecionarGrupoTipico, obterEstatisticasJogo, verificarCobertura } from '../../src/lib/lottery';

const lotteryFunctions: Record<string, Function> = {
  obter_estatisticas_jogo: obterEstatisticasJogo,
  selecionar_grupo_tipico: selecionarGrupoTipico,
  gerar_fechamento: gerarFechamento,
  verificar_cobertura: verificarCobertura
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Método não permitido" });
  }

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
    console.error("Erro na chamada de IA:", error);
    res.status(500).json({ error: "Erro na chamada de IA" });
  }
}
