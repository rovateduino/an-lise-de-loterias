import { useState, useEffect } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

type ResumoData = {
  loteria: string;
  concurso: number;
  data: string;
  dezenas: string[];
  trevos?: string[];
  acumulou: boolean;
  dataProximoConcurso: string;
  valorEstimadoProximoConcurso: number;
  premiacoes: { descricao: string; faixa: number; ganhadores: number; valorPremio: number }[];
};

export default function ResumoSorteio({ jogoId }: { jogoId: string }) {
  const [data, setData] = useState<ResumoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE_URL}/api/loteria/${jogoId}/resumo`)
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [jogoId]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (loading) {
    return <div className="mt-4 text-sm text-text-muted">Carregando...</div>;
  }

  if (error || !data) {
    return <div className="mt-4 text-sm text-text-muted">Resultado indisponível no momento — tente novamente em instantes</div>;
  }

  return (
    <div className="mt-4 space-y-4">
      {/* Último resultado */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-text-primary">
            Último sorteio: {data.data}
          </span>
          {data.acumulou ? (
            <span className="px-3 py-1 text-xs font-bold rounded-full bg-orange-signal text-bg-void">
              ACUMULOU
            </span>
          ) : (
            <span className="text-xs text-text-muted">não acumulou</span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {data.dezenas.map((d, i) => (
            <span
              key={i}
              className="w-9 h-9 flex items-center justify-center bg-bg-void rounded-full font-mono text-sm border border-blue-electric text-text-primary"
            >
              {d}
            </span>
          ))}
          {data.trevos && data.trevos.length > 0 && (
            <>
              <span className="text-xs text-text-muted self-center">Trevos:</span>
              {data.trevos.map((t, i) => (
                <span
                  key={`trevo-${i}`}
                  className="w-9 h-9 flex items-center justify-center bg-bg-void rounded-full font-mono text-sm border border-red-alert text-text-primary"
                >
                  {t}
                </span>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Próximo sorteio */}
      <div className="space-y-1 pt-3 border-t border-bg-void">
        <div className="text-sm text-text-primary">
          Próximo sorteio: {data.dataProximoConcurso}
        </div>
        <div className="text-xl md:text-2xl font-bold text-green-verified font-mono">
          {formatCurrency(data.valorEstimadoProximoConcurso)}
        </div>
      </div>
    </div>
  );
}
