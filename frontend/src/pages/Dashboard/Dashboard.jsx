import StatCard from "../../components/StatCard";

const documents = [
  { name: "api-documentation.md", tag: "main", author: "Alex" },
  { name: "auth-service-v2.ts", tag: "feature/auth", author: "Sarah" },
  { name: "user-schema.sql", tag: "main", author: "Mike" },
  { name: "deployment-log.log", tag: "production", author: "System" },
  { name: "design-specs.fig", tag: "main", author: "Maria" },
  { name: "env-config.yaml", tag: "main", author: "Alex" },
];

export default function Dashboard() {
  return (
    <div className="bg-[#0B0F19] min-h-screen text-white">

      <div className="ml-64 pt-20 px-6 space-y-6">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Total Documents" value="1,284" growth="+12%" />
          <StatCard title="Recent Commits" value="42" growth="+5.2%" />
          <StatCard title="Contributors" value="12" growth="+3%" />
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Recent Documents</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc, index) => (
              <div
                key={index}
                className="bg-[#111827] border border-gray-800 rounded-xl p-4 hover:border-indigo-500 transition"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs bg-indigo-600 px-2 py-1 rounded">
                    {doc.tag}
                  </span>
                </div>

                <h3 className="font-medium">{doc.name}</h3>
                <p className="text-xs text-gray-400 mt-2">
                  Modified by {doc.author}
                </p>
              </div>
            ))}

            <div className="flex items-center justify-center border border-dashed border-gray-700 rounded-xl h-32 text-gray-400 hover:border-indigo-500 cursor-pointer">
              + Add new item
            </div>
          </div>
        </div>

        <div className="bg-[#111827] border border-gray-800 rounded-xl p-6">
          <h2 className="mb-4 font-semibold">Contribution Activity</h2>

          <div className="grid grid-cols-12 gap-1">
            {Array.from({ length: 84 }).map((_, i) => (
              <div
                key={i}
                className="w-4 h-4 bg-indigo-500/30 rounded-sm hover:bg-indigo-500"
              ></div>
            ))}
          </div>

          <p className="text-xs text-gray-500 mt-4">
            Activity timeline visualization
          </p>
        </div>

      </div>
    </div>
  );
}
