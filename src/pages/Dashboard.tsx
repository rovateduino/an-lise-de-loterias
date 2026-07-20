import { useState } from 'react';
import { LayoutDashboard, Zap, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import AnalysisTab from '../components/AnalysisTab';
import GeradorFechamento from '../components/GeradorFechamento';
import SettingsPanel from '../components/SettingsPanel';
import TabelaVolante from '../components/TabelaVolante';
import { selecionarGrupoTipico, gerarFechamento, verificarCobertura } from '../lib/lottery';
import SeloGarantia from '../components/SeloGarantia';
import ResumoSorteio from '../components/ResumoSorteio';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'analysis' | 'generator' | 'settings'>('dashboard');
  const [step, setStep] = useState(1);
  const [selectedJogo, setSelectedJogo] = useState<any | null>(null);
  const [grupo, setGrupo] = useState<number[]>([]);
  const [tickets, setTickets] = useState<number[][]>([]);
  const [coverage, setCoverage] = useState<{total: number, falhas: number} | null>(null);

  const loterias = [
    { id: 'mega_sena', name: 'Mega-Sena', color: 'border-green-verified', desc: 'Grupo de 12 dezenas · Garantia de quadra', k: 6, garantia: 4 },
    { id: 'quina', name: 'Quina', color: 'border-blue-electric', desc: 'Grupo de 10 dezenas · Garantia de terno', k: 5, garantia: 3 },
    { id: 'lotofacil', name: 'Lotofácil', color: 'border-orange-signal', desc: 'Grupo de 18 dezenas · Garantia de 14 acertos', k: 15, garantia: 14 },
    { id: 'mais_milionaria', name: '+Milionária', color: 'border-red-alert', desc: 'Grupo de 10 dezenas + trevos', k: 6, garantia: 3 },
  ];

  const iniciarFluxo = (jogo: any) => {
    setSelectedJogo(jogo);
    setGrupo(selecionarGrupoTipico(jogo.id));
    setStep(1);
    setActiveTab('generator');
  };

  return (
    <div className="min-h-screen bg-bg-void text-text-primary font-sans">
      <nav className="bg-bg-panel border-b border-bg-void">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <span className="text-xl font-bold font-display tracking-widest text-blue-electric cursor-pointer" onClick={() => setActiveTab('dashboard')}>ANALISE.MATH</span>
            <div className="flex gap-4">
                {[
                  { id: 'dashboard', label: 'Painel' },
                  { id: 'analysis', label: 'Análise' },
                  { id: 'generator', label: 'Gerador' },
                  { id: 'settings', label: 'Configurações' }
                ].map(t => (
                    <button key={t.id} onClick={() => setActiveTab(t.id as any)} className={cn("text-sm font-medium uppercase tracking-wider", activeTab === t.id ? "text-blue-electric" : "text-text-muted")}>{t.label}</button>
                ))}
            </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-8 px-4">
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {loterias.map(l => (
              <div key={l.id} className={cn("p-6 rounded-lg bg-bg-panel border-l-4 shadow", l.color)}>
                <h3 className="text-2xl font-display uppercase tracking-tighter">{l.name}</h3>
                <p className="text-sm text-text-muted mt-2">{l.desc}</p>
                <ResumoSorteio jogoId={l.id} />
                <button className="mt-6 w-full py-2 bg-orange-signal text-text-primary font-bold rounded uppercase tracking-widest hover:opacity-90" onClick={() => iniciarFluxo(l)}>Gerar Aposta</button>
              </div>
            ))}
          </div>
        )}
        {activeTab === 'generator' && (
          <div className="bg-bg-panel p-8 rounded-lg">
            <div className="flex mb-8 gap-2">
                {[1,2,3].map(s => <div key={s} className={cn("flex-1 h-1 rounded", step >= s ? "bg-green-verified" : "bg-bg-void")}></div>)}
            </div>
            {step === 1 && (
                <div>
                    <h3 className="font-display text-2xl mb-4">Selecione o Grupo</h3>
                    <div className="flex flex-wrap gap-3">{grupo.map(n => <span key={n} className="w-10 h-10 flex items-center justify-center bg-bg-void rounded-full font-mono text-text-primary border border-blue-electric">{n}</span>)}</div>
                    <button onClick={() => setStep(2)} className="mt-6 bg-orange-signal text-text-primary px-6 py-2 rounded font-bold uppercase hover:opacity-90">Confirmar Grupo</button>
                </div>
            )}
            {step === 2 && (
                <button onClick={() => {
                    if (!selectedJogo) return;
                    const t = gerarFechamento(grupo, selectedJogo.k, selectedJogo.garantia);
                    const cov = verificarCobertura(grupo, selectedJogo.k, selectedJogo.garantia, t);
                    setTickets(t);
                    setCoverage(cov);
                    setStep(3);
                }} className="bg-orange-signal text-text-primary px-6 py-2 rounded font-bold uppercase hover:opacity-90">Gerar Fechamento</button>
            )}
            {step === 3 && (
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-display text-2xl">Aposta Estruturada</h3>
                        <SeloGarantia cenarios={coverage?.total || 0} falhas={coverage?.falhas || 0} />
                    </div>
                    <TabelaVolante tickets={tickets} />
                </div>
            )}
          </div>
        )}
        {activeTab === 'analysis' && <AnalysisTab />}
        {activeTab === 'settings' && <SettingsPanel />}
      </main>
    </div>
  );
}

