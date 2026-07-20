import { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SettingsPanel() {
  const [config, setConfig] = useState(() => JSON.parse(localStorage.getItem('ai-config') || '{}'));
  const [showKey, setShowKey] = useState(false);
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

  useEffect(() => {
    localStorage.setItem('ai-config', JSON.stringify(config));
  }, [config]);

  const testConnection = async () => {
    setStatus('testing');
    try {
      const response = await fetch('/api/ai/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...config,
          systemPrompt: "Responda apenas 'ok'.",
          userMessage: "Teste"
        })
      });
      if (response.ok) setStatus('success');
      else setStatus('error');
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="space-y-6 bg-bg-surface p-8 rounded-lg">
      <h2 className="text-2xl font-bold text-text-primary font-display">Configurações de IA</h2>
      <p className="text-sm text-text-muted">Sua chave fica salva apenas no seu navegador.</p>
      
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-muted">Provedor</label>
          <select value={config.provider || ''} onChange={e => setConfig({...config, provider: e.target.value})} className="mt-1 block w-full border border-bg-surface-raised bg-bg-surface rounded-md shadow-sm p-2 text-text-primary">
            <option value="">Selecione...</option>
            <option value="openrouter">OpenRouter</option>
            <option value="groq">Groq</option>
            <option value="google">Google Gemini</option>
            <option value="deepseek">DeepSeek</option>
          </select>
        </div>
        
        <div className="relative">
          <label className="block text-sm font-medium text-text-muted">API Key</label>
          <input type={showKey ? 'text' : 'password'} value={config.apiKey || ''} onChange={e => setConfig({...config, apiKey: e.target.value})} className="mt-1 block w-full border border-bg-surface-raised bg-bg-surface rounded-md shadow-sm p-2 text-text-primary" />
          <button type="button" onClick={() => setShowKey(!showKey)} className="absolute right-2 top-8 text-text-muted">
            {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-muted">Modelo (ex: gemini-1.5-flash)</label>
          <input type="text" value={config.model || ''} onChange={e => setConfig({...config, model: e.target.value})} className="mt-1 block w-full border border-bg-surface-raised bg-bg-surface rounded-md shadow-sm p-2 text-text-primary" />
        </div>

        <button onClick={testConnection} className="bg-accent-gold text-bg-base py-2 px-4 rounded-md font-bold uppercase hover:opacity-90">
          {status === 'testing' ? 'Testando...' : 'Testar Conexão'}
        </button>
        {status === 'success' && <p className="text-accent-emerald">Conexão bem-sucedida!</p>}
        {status === 'error' && <p className="text-alert-amber">Erro na conexão.</p>}
      </div>
    </div>
  );
}
