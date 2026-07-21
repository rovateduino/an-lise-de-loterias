
const jogoToApiName = {
  "mega_sena": "megasena",
  "quina": "quina",
  "lotofacil": "lotofacil",
  "mais_milionaria": "maismilionaria"
};

export default async function handler(req, res) {
  const { jogo, n = "5" } = req.query;
  const num = Math.min(Math.max(Number(n), 1), 20);
  const apiName = jogoToApiName[jogo];
  if (!apiName) {
    return res.status(404).json({ error: "Jogo não encontrado" });
  }

  try {
    const response = await fetch(`https://loteriascaixa-api.herokuapp.com/api/${apiName}`);
    if (!response.ok) throw new Error("API unavailable");
    const data = await response.json();
    const recentes = data.slice(-num);
    res.json(recentes);
  } catch (error) {
    res.status(503).json({ error: "Não foi possível obter os resultados recentes" });
  }
}
