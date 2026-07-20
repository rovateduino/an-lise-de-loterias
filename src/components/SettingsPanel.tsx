import { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

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
      const response = await fetch(`${API_BASE_URL}/api/ai/query`, {
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
    <div className="space-y-6 bg-bg-panel p-6 rounded-xl shadow-[0_4px_6px_rgba(0,0,0,0.1),0_1px_3px_rgba(0,0,0,0.08)]">
      <h2 className="text-2xl font-bold text-text-primary font-display">Configurações de IA</h2>
      <p className="text-sm text-text-muted">Sua chave fica salva apenas no seu navegador.</p>
      
      <div className="grid grid-cols-1 gap-5">
        <div>
          <label className="block text-sm font-medium text-text-muted mb-2">Provedor</label>
          <select 
            value={config.provider || ''} 
            onChange={e => setConfig({...config, provider: e.target.value})} 
            className="w-full border border-bg-void bg-bg-panel rounded-xl p-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-electric"
          >
            <option value="">Selecione...</option>
            <option value="openrouter">OpenRouter</option>
            <option value="groq">Groq</option>
            <option value="google">Google Gemini</option>
            <option value="deepseek">DeepSeek</option>
          </select>
        </div>
        
        <div className="relative">
          <label className="block text-sm font-medium text-text-muted mb-2">API Key</label>
          <input 
            type={showKey ? 'text' : 'password'} 
            value={config.apiKey || ''} 
            onChange={e => setConfig({...config, apiKey: e.target.value})} 
            className="w-full border border-bg-void bg-bg-panel rounded-xl p-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-electric pr-12"
          />
          <button 
            type="button" 
            onClick={() => setShowKey(!showKey)} 
            className="absolute right-3 top-11 text-text-muted hover:text-text-primary min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            {showKey ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-muted mb-2">Modelo (ex: gemini-1.5-flash)</label>
          <input 
            type="text" 
            value={config.model || ''} 
            onChange={e => setConfig({...config, model: e.target.value})} 
            className="w-full border border-bg-void bg-bg-panel rounded-xl p-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-electric"
          />
        </div>

        <button 
          onClick={testConnection} 
          className="w-full md:w-auto py-3 bg-orange-signal text-bg-void px-8 rounded-xl font-bold uppercase transition-transform active:scale-95 min-h-[44px]"
        >
          {status === 'testing' ? 'Testando...' : 'Testar Conexão'}
        </button>
        {status === 'success' && <p className="text-green-verified font-medium">Conexão bem-sucedida!</p>}
        {status === 'error' && <p className="text-red-alert font-medium">Erro na conexão.</p>}
      </div>
    </div>
  );
}
