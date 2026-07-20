export default function TabelaVolante({ tickets }: { tickets: number[][] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {tickets.map((t, i) => (
        <div key={i} className="border-t-4 border-blue-electric p-4 bg-bg-panel rounded-xl font-mono relative border border-bg-void shadow-[0_4px_6px_rgba(0,0,0,0.1),0_1px_3px_rgba(0,0,0,0.08)]">
          <div className="flex flex-wrap gap-2">
            {t.sort((a, b) => a - b).map(n => (
              <span key={n} className="w-9 h-9 flex items-center justify-center bg-bg-void text-text-primary rounded-full text-sm font-bold border border-blue-electric">
                {n.toString().padStart(2, '0')}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
