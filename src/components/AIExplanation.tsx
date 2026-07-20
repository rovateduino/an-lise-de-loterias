import { useState } from 'react';

interface Props {
  userMessage: string;
  context: any;
}

export default function AIExplanation({ userMessage, context }: Props) {
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const explain = async () => {
    setLoading(true);
    setError(null);
    const config = JSON.parse(localStorage.getItem('ai-config') || '{}');
    if (!config.apiKey) {
      setError('Configure uma API key em Configurações.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/ai/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...config,
          systemPrompt: "Você é um assistente educativo de estatística aplicada a loterias. Sorteios de loteria são eventos independentes — frequência histórica não prediz resultados futuros. Você NUNCA recomenda números como 'prováveis de sair', NUNCA afirma ter identificado tendências preditivas, e NUNCA gera combinações de números — essas vêm sempre do algoritmo determinístico do sistema. Sua função é apenas explicar, em linguagem simples, os cálculos e resultados que já foram gerados pelo código. Se o usuário pedir previsões, explique por que isso não é matematicamente possível.",
          userMessage: `${userMessage}\nDados: ${JSON.stringify(context)}`
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setExplanation(data.text);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const config = JSON.parse(localStorage.getItem('ai-config') || '{}');

  return (
    <div className="mt-4">
      <button 
        onClick={explain} 
        disabled={loading || !config.apiKey}
        className="bg-indigo-100 text-indigo-700 py-2 px-4 rounded-md text-sm font-medium hover:bg-indigo-200 disabled:opacity-50"
      >
        {loading ? 'Pensando...' : 'Explicar com IA'}
      </button>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      {explanation && (
        <div className="mt-4 p-4 bg-gray-100 rounded-md border-l-4 border-indigo-500">
          <h4 className="font-semibold text-gray-900 mb-1">Explicação da IA:</h4>
          <p className="text-sm text-gray-700">{explanation}</p>
        </div>
      )}
    </div>
  );
}
