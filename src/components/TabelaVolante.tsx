export default function TabelaVolante({ tickets }: { tickets: number[][] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {tickets.map((t, i) => (
        <div key={i} className="border-t-4 border-blue-electric p-4 bg-bg-panel rounded-lg font-mono relative border border-bg-void">
          <div className="flex flex-wrap gap-2">
            {t.sort((a, b) => a - b).map(n => (
              <span key={n} className="w-8 h-8 flex items-center justify-center bg-bg-void text-text-primary rounded-full text-xs font-bold border border-blue-electric">{n.toString().padStart(2, '0')}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
