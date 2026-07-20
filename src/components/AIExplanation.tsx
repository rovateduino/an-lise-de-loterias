import { useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

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
      const response = await fetch(`${API_BASE_URL}/api/ai/query`, {
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
        className="w-full md:w-auto py-3 bg-blue-electric/10 text-blue-electric px-6 rounded-xl text-sm font-bold hover:bg-blue-electric/20 disabled:opacity-50 transition-colors min-h-[44px]"
      >
        {loading ? 'Pensando...' : 'Explicar com IA'}
      </button>
      {error && <p className="text-red-alert text-sm mt-3">{error}</p>}
      {explanation && (
        <div className="mt-4 p-4 bg-bg-panel rounded-xl border-l-4 border-blue-electric shadow-[0_4px_6px_rgba(0,0,0,0.1),0_1px_3px_rgba(0,0,0,0.08)]">
          <h4 className="font-bold text-text-primary mb-2 font-display">Explicação da IA:</h4>
          <p className="text-sm text-text-muted leading-relaxed">{explanation}</p>
        </div>
      )}
    </div>
  );
}
