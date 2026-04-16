export default function StatCard({ title, value, growth }) {
  return (
    <div className="relative overflow-hidden bg-white/[0.02] border border-white/5 rounded-2xl p-6 transition-all duration-300 hover:bg-white/[0.04] hover:border-white/10 hover:shadow-lg hover:shadow-indigo-500/10 group cursor-default">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      <div className="relative z-10">
        <div className="flex justify-between items-center">
          <p className="text-zinc-400 text-sm font-medium">{title}</p>
          <span className="text-emerald-400 text-xs font-semibold tracking-wide px-2 py-1 bg-emerald-400/10 border border-emerald-400/20 rounded-full">{growth}</span>
        </div>
        <h2 className="text-3xl font-bold mt-4 tracking-tight drop-shadow-sm">{value}</h2>
      </div>
    </div>
  );
}