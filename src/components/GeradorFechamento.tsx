import { useState } from 'react';
import { gerarFechamento } from '../lib/lottery';
import AIExplanation from './AIExplanation';

export default function GeradorFechamento() {
  const [grupoInput, setGrupoInput] = useState('1,2,3,4,5,6,7,8,9,10,11,12');
  const [k, setK] = useState(6);
  const [garantia, setGarantia] = useState(4);
  const [result, setResult] = useState<number[][]>([]);

  const handleGerar = () => {
    const grupo = grupoInput.split(',').map(Number);
    const tickets = gerarFechamento(grupo, k, garantia);
    setResult(tickets);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-text-primary">Gerador de Fechamentos</h2>
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-muted">Grupo de Dezenas (separadas por vírgula)</label>
          <input 
            value={grupoInput}
            onChange={(e) => setGrupoInput(e.target.value)}
            className="mt-1 block w-full border border-bg-surface-raised bg-bg-surface rounded-md shadow-sm p-2 text-text-primary"
          />
        </div>
        <div className="flex space-x-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-text-muted">Tamanho da Aposta (k)</label>
            <input type="number" value={k} onChange={e => setK(Number(e.target.value))} className="mt-1 block w-full border border-bg-surface-raised bg-bg-surface rounded-md shadow-sm p-2 text-text-primary" />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-text-muted">Garantia</label>
            <input type="number" value={garantia} onChange={e => setGarantia(Number(e.target.value))} className="mt-1 block w-full border border-bg-surface-raised bg-bg-surface rounded-md shadow-sm p-2 text-text-primary" />
          </div>
        </div>
        <button onClick={handleGerar} className="w-full bg-accent-gold text-bg-base py-2 px-4 rounded-md font-bold uppercase hover:opacity-90">Gerar Fechamento</button>
      </div>

      {result.length > 0 && (
        <div className="bg-bg-surface p-6 rounded-lg shadow mt-6">
          <h3 className="text-lg font-medium mb-4 text-text-primary">Cartões Gerados ({result.length})</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {result.map((t, i) => (
              <div key={i} className="border border-bg-surface-raised p-2 rounded text-sm text-text-primary">{t.join(' - ')}</div>
            ))}
          </div>
          <AIExplanation userMessage="Explique a redução de custo deste fechamento matemático em comparação com jogar todas as combinações." context={{num_cartoes: result.length, grupo_size: grupoInput.split(',').length, k, garantia}} />
        </div>
      )}
    </div>
  );
}
