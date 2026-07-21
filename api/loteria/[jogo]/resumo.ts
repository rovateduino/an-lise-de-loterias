
import type { VercelRequest, VercelResponse } from '@vercel/node';

const jogoToApiName: Record<string, string> = {
  "mega_sena": "megasena",
  "quina": "quina",
  "lotofacil": "lotofacil",
  "mais_milionaria": "maismilionaria"
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { jogo } = req.query;
  const apiName = jogoToApiName[jogo as string];
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
}
