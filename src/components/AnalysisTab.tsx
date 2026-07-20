import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import AIExplanation from './AIExplanation';

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
    fetch(`/api/loteria/${game}`)
      .then(res => res.json())
      .then(data => {
        setData(Object.values(data));
        setLoading(false);
      });
  }, [game]);

  useEffect(() => {
    setLoadingRecentes(true);
    fetch(`/api/loteria/${game}/recentes?n=5`)
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
      <h2 className="text-2xl font-bold text-gray-900">Análise Histórica</h2>
      <select 
        value={game} 
        onChange={(e) => setGame(e.target.value as Game)}
        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
      >
        <option value="mega_sena">Mega-Sena</option>
        <option value="quina">Quina</option>
        <option value="lotofacil">Lotofácil</option>
        <option value="mais_milionaria">+Milionária</option>
      </select>

      {/* Últimos Sorteios */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Últimos Sorteios</h3>
        {loadingRecentes ? (
          <div className="text-center py-4">Carregando...</div>
        ) : recentes.length === 0 ? (
          <div className="text-center py-4 text-gray-500">Resultados indisponíveis no momento</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Concurso</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dezenas</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acumulou</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prêmio Principal</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentes.slice().reverse().map((concurso, index) => (
                  <tr key={concurso.concurso}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{concurso.concurso}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{concurso.data}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex flex-wrap gap-1">
                        {concurso.dezenas.map((d, i) => (
                          <span key={i} className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded-full text-xs font-mono">
                            {d}
                          </span>
                        ))}
                        {concurso.trevos && concurso.trevos.length > 0 && (
                          <>
                            <span className="text-xs text-gray-400">Trevos:</span>
                            {concurso.trevos.map((t, i) => (
                              <span key={`trevo-${i}`} className="w-6 h-6 flex items-center justify-center bg-red-100 rounded-full text-xs font-mono">
                                {t}
                              </span>
                            ))}
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {concurso.acumulou ? 'Sim' : 'Não'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
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
        <div className="text-center py-10">Carregando...</div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Frequência das Dezenas</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="freq" fill="#4f46e5" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      <AIExplanation userMessage="Explique os padrões de frequência observados nestes dados." context={chartData} />
      <p className="text-sm text-gray-500 italic">Nota: Estes números são apenas descritivos do histórico recente e não constituem previsões.</p>
    </div>
  );
}
