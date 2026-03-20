export default function StatCard({ title, value, growth }) {
  return (
    <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 hover:border-indigo-500 transition">
      <div className="flex justify-between items-center">
        <p className="text-gray-400 text-sm">{title}</p>
        <span className="text-green-400 text-xs">{growth}</span>
      </div>

      <h2 className="text-2xl font-bold mt-2">{value}</h2>
    </div>
  );
}