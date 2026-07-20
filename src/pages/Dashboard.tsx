import { useState } from 'react';
import { LayoutDashboard, TrendingUp, Zap, Settings } from 'lucide-react';
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

  const navItems = [
    { id: 'dashboard', label: 'Painel', icon: LayoutDashboard },
    { id: 'analysis', label: 'Análise', icon: TrendingUp },
    { id: 'generator', label: 'Gerador', icon: Zap },
    { id: 'settings', label: 'Config', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-bg-void text-text-primary font-sans flex flex-col">
      {/* Top navigation for desktop */}
      <nav className="hidden md:flex bg-bg-panel border-b border-bg-void px-4 h-16 items-center justify-between max-w-7xl w-full mx-auto">
        <span 
          className="text-xl font-bold font-display tracking-widest text-blue-electric cursor-pointer" 
          onClick={() => setActiveTab('dashboard')}
        >
          Analise Math
        </span>
        <div className="flex gap-6">
          {navItems.map(item => (
            <button 
              key={item.id} 
              onClick={() => setActiveTab(item.id as any)} 
              className={cn(
                "text-sm font-medium uppercase tracking-wider transition-colors",
                activeTab === item.id ? "text-blue-electric" : "text-text-muted hover:text-text-primary"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-1 max-w-7xl w-full mx-auto py-6 px-4 pb-24 md:pb-6">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-display font-bold text-text-primary md:hidden">Painel</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {loterias.map(l => (
                <div 
                  key={l.id} 
                  className={cn(
                    "p-6 rounded-xl bg-bg-panel border-l-4 shadow-[0_4px_6px_rgba(0,0,0,0.1),0_1px_3px_rgba(0,0,0,0.08)]",
                    l.color
                  )}
                >
                  <h3 className="text-2xl font-display uppercase tracking-tighter">{l.name}</h3>
                  <p className="text-sm text-text-muted mt-2">{l.desc}</p>
                  <ResumoSorteio jogoId={l.id} />
                  <button 
                    className="mt-6 w-full py-3 bg-orange-signal text-bg-void font-bold rounded-lg uppercase tracking-widest transition-transform active:scale-95 min-h-[44px]" 
                    onClick={() => iniciarFluxo(l)}
                  >
                    Gerar Aposta
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'generator' && (
          <div className="bg-bg-panel p-6 rounded-xl shadow-[0_4px_6px_rgba(0,0,0,0.1),0_1px_3px_rgba(0,0,0,0.08)]">
            <h1 className="text-2xl font-display font-bold text-text-primary mb-6 md:hidden">Gerador</h1>
            
            {/* Stepper */}
            <div className="flex gap-2 mb-8">
              {[1,2,3].map(s => (
                <div 
                  key={s} 
                  className={cn(
                    "flex-1 h-2 rounded-full transition-all",
                    step >= s ? "bg-green-verified" : "bg-bg-void"
                  )}
                />
              ))}
            </div>

            {step === 1 && (
              <div className="space-y-6">
                <h3 className="font-display text-xl md:text-2xl">Selecione o Grupo</h3>
                <div className="flex flex-wrap gap-3">
                  {grupo.map(n => (
                    <span 
                      key={n} 
                      className="w-10 h-10 flex items-center justify-center bg-bg-void rounded-full font-mono text-text-primary border border-blue-electric transition-transform active:scale-110"
                    >
                      {n}
                    </span>
                  ))}
                </div>
                <button 
                  onClick={() => setStep(2)} 
                  className="w-full md:w-auto py-3 bg-orange-signal text-bg-void px-8 rounded-lg font-bold uppercase transition-transform active:scale-95 min-h-[44px]"
                >
                  Confirmar Grupo
                </button>
              </div>
            )}

            {step === 2 && (
              <button 
                onClick={() => {
                  if (!selectedJogo) return;
                  const t = gerarFechamento(grupo, selectedJogo.k, selectedJogo.garantia);
                  const cov = verificarCobertura(grupo, selectedJogo.k, selectedJogo.garantia, t);
                  setTickets(t);
                  setCoverage(cov);
                  setStep(3);
                }} 
                className="w-full md:w-auto py-3 bg-orange-signal text-bg-void px-8 rounded-lg font-bold uppercase transition-transform active:scale-95 min-h-[44px]"
              >
                Gerar Fechamento
              </button>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <h3 className="font-display text-xl md:text-2xl">Aposta Estruturada</h3>
                  <SeloGarantia cenarios={coverage?.total || 0} falhas={coverage?.falhas || 0} />
                </div>
                <TabelaVolante tickets={tickets} />
              </div>
            )}
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-display font-bold text-text-primary md:hidden">Análise</h1>
            <AnalysisTab />
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-display font-bold text-text-primary md:hidden">Configurações</h1>
            <SettingsPanel />
          </div>
        )}
      </main>

      {/* Bottom navigation for mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-bg-panel border-t border-bg-void z-50 pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around h-16">
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 min-h-[44px] min-w-[44px] transition-colors",
                  activeTab === item.id ? "text-blue-electric" : "text-text-muted"
                )}
              >
                <Icon size={20} />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

