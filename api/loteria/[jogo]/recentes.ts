
import type { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch';

const jogoToApiName: Record<string, string> = {
  "mega_sena": "megasena",
  "quina": "quina",
  "lotofacil": "lotofacil",
  "mais_milionaria": "maismilionaria"
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { jogo, n = "5" } = req.query;
  const num = Math.min(Math.max(Number(n), 1), 20);
  const apiName = jogoToApiName[jogo as string];
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
}
