export default function SeloGarantia({ cenarios, falhas }: { cenarios: number, falhas: number }) {
  const isVerified = falhas === 0;
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${isVerified ? 'border-green-verified' : 'border-red-alert'} bg-green-verified/10`}>
      <span className={`w-2 h-2 rounded-full ${isVerified ? 'bg-green-verified' : 'bg-red-alert'}`} />
      <span className="text-xs text-text-primary font-mono">
        {cenarios} cenários testados · {falhas} falhas
      </span>
    </div>
  );
}
