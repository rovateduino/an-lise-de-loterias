import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import AIExplanation from './AIExplanation';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

type Game = 'mega_sena' | 'quina' | 'lotofacil' | 'mais_milionaria';
type ConcursoData = {
  concurso: number;
  data: string;
  dezenas: string[];
  trevos?: string[];
  acumulou: boolean;
  premiacoes: { descricao: string; faixa: number; ganhadores: number; valorPremio: number }[];
};

export default function AnalysisTab() {
  const [game, setGame] = useState<Game>('mega_sena');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentes, setRecentes] = useState<ConcursoData[]>([]);
  const [loadingRecentes, setLoadingRecentes] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE_URL}/api/loteria/${game}`)
      .then(res => res.json())
      .then(data => {
        setData(Object.values(data));
        setLoading(false);
      });
  }, [game]);

  useEffect(() => {
    setLoadingRecentes(true);
    fetch(`${API_BASE_URL}/api/loteria/${game}/recentes?n=5`)
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(data => {
        setRecentes(data);
        setLoadingRecentes(false);
      })
      .catch(() => {
        setLoadingRecentes(false);
      });
  }, [game]);

  const frequencyData = data.reduce((acc: any, row: any) => {
    row.forEach((n: any) => {
      acc[n] = (acc[n] || 0) + 1;
    });
    return acc;
  }, {});

  const chartData = Object.keys(frequencyData).map(key => ({
    name: key,
    freq: frequencyData[key]
  })).sort((a, b) => parseInt(a.name) - parseInt(b.name));

  const formatCurrency = (value: number) => {
    if (!value || value === 0) return '-';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="space-y-8">
      <select 
        value={game} 
        onChange={(e) => setGame(e.target.value as Game)}
        className="w-full pl-4 pr-10 py-3 text-base border border-bg-void bg-bg-panel text-text-primary rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-electric"
      >
        <option value="mega_sena">Mega-Sena</option>
        <option value="quina">Quina</option>
        <option value="lotofacil">Lotofácil</option>
        <option value="mais_milionaria">+Milionária</option>
      </select>

      {/* Últimos Sorteios */}
      <div className="bg-bg-panel p-6 rounded-xl shadow-[0_4px_6px_rgba(0,0,0,0.1),0_1px_3px_rgba(0,0,0,0.08)]">
        <h3 className="text-lg font-medium leading-6 text-text-primary mb-4 font-display">Últimos Sorteios</h3>
        {loadingRecentes ? (
          <div className="text-center py-4 text-text-muted">Carregando...</div>
        ) : recentes.length === 0 ? (
          <div className="text-center py-4 text-text-muted">Resultados indisponíveis no momento</div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-bg-void">
            <table className="min-w-full divide-y divide-bg-void">
              <thead className="bg-bg-void">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Concurso</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Data</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Dezenas</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Acumulou</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Prêmio</th>
                </tr>
              </thead>
              <tbody className="bg-bg-panel divide-y divide-bg-void">
                {recentes.slice().reverse().map((concurso, index) => (
                  <tr key={concurso.concurso}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-text-primary font-mono">{concurso.concurso}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-text-muted">{concurso.data}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-text-primary">
                      <div className="flex flex-wrap gap-1">
                        {concurso.dezenas.map((d, i) => (
                          <span key={i} className="w-7 h-7 flex items-center justify-center bg-bg-void rounded-full text-xs font-mono border border-blue-electric">
                            {d}
                          </span>
                        ))}
                        {concurso.trevos && concurso.trevos.length > 0 && (
                          <>
                            <span className="text-xs text-text-muted self-center ml-2">Trevos:</span>
                            {concurso.trevos.map((t, i) => (
                              <span key={`trevo-${i}`} className="w-7 h-7 flex items-center justify-center bg-bg-void rounded-full text-xs font-mono border border-red-alert">
                                {t}
                              </span>
                            ))}
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-text-muted">
                      {concurso.acumulou ? (
                        <span className="text-orange-signal font-bold">Sim</span>
                      ) : (
                        <span>Não</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-text-primary font-mono">
                      {formatCurrency(concurso.premiacoes[0]?.valorPremio)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Frequência das Dezenas */}
      {loading ? (
        <div className="text-center py-10 text-text-muted">Carregando...</div>
      ) : (
        <div className="bg-bg-panel p-6 rounded-xl shadow-[0_4px_6px_rgba(0,0,0,0.1),0_1px_3px_rgba(0,0,0,0.08)]">
          <h3 className="text-lg font-medium leading-6 text-text-primary mb-4 font-display">Frequência das Dezenas</h3>
          <div className="h-64 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke="#8A8FA3" />
                <YAxis stroke="#8A8FA3" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#14141C', 
                    border: '1px solid #0A0A0F',
                    borderRadius: '8px',
                    color: '#F4F5F7'
                  }} 
                />
                <Bar dataKey="freq" fill="#2B6CFF" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      <AIExplanation userMessage="Explique os padrões de frequência observados nestes dados." context={chartData} />
      <p className="text-sm text-text-muted italic">Nota: Estes números são apenas descritivos do histórico recente e não constituem previsões.</p>
    </div>
  );
}
