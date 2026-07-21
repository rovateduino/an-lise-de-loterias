
import type { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { jogo } = req.query;
  const urls: Record<string, string> = {
    "mega_sena": "https://raw.githubusercontent.com/guilhermeasn/loteria.json/master/data/megasena.json",
    "quina": "https://raw.githubusercontent.com/guilhermeasn/loteria.json/master/data/quina.json",
    "lotofacil": "https://raw.githubusercontent.com/guilhermeasn/loteria.json/master/data/lotofacil.json",
    "mais_milionaria": "https://raw.githubusercontent.com/guilhermeasn/loteria.json/master/data/maismilionaria.json",
  };

  const url = urls[jogo as string];
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
}
