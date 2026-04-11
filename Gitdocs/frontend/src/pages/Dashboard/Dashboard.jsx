import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import StatCard from "../../components/StatCard";
import { fetchDocumentsRequest } from "../../store/slices/documentSlice";
import { fetchCommitsRequest } from "../../store/slices/commitSlice";

export default function Dashboard() {
  const dispatch = useDispatch();
  const { documents, loading: docsLoading } = useSelector(
    (state) => state.documents,
  );
  const { commits, loading: commitsLoading } = useSelector(
    (state) => state.commits,
  );
  const { projects } = useSelector((state) => state.projects);

  useEffect(() => {
    dispatch(fetchDocumentsRequest());
    dispatch(fetchCommitsRequest());
  }, [dispatch]);

  // Get recent documents (sorted by createdAt)
  const recentDocuments = [...documents]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 6);

  // Calculate stats
  const totalDocuments = documents.length;
  const totalCommits = commits.length;
  const uniqueAuthors = new Set(commits.map((c) => c.authorId)).size;

  return (
    <div className="bg-[#0B0F19] min-h-screen text-white">
      <div className="ml-64 pt-20 px-6 space-y-6">
        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Total Documents"
            value={totalDocuments.toLocaleString()}
            growth={`${Math.min(totalDocuments, 100)}%`}
          />
          <StatCard
            title="Recent Commits"
            value={totalCommits.toLocaleString()}
            growth={`+${Math.min(totalCommits, 100)}%`}
          />
          <StatCard
            title="Contributors"
            value={uniqueAuthors}
            growth={`+${Math.min(uniqueAuthors, 50)}%`}
          />
        </div>

        {/* RECENT DOCUMENTS */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Recent Documents</h2>

          {docsLoading ? (
            <div className="text-gray-400">Loading documents...</div>
          ) : recentDocuments.length === 0 ? (
            <div className="bg-[#111827] border border-gray-800 rounded-xl p-8 text-center text-gray-400">
              No documents yet. Create one to get started.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-[#111827] border border-gray-800 rounded-xl p-4 hover:border-indigo-500 transition"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs bg-indigo-600 px-2 py-1 rounded">
                      {doc.branch || "main"}
                    </span>
                  </div>

                  <h3 className="font-medium truncate">{doc.name}</h3>
                  <p className="text-xs text-gray-400 mt-2">
                    Updated {new Date(doc.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              ))}

              <div className="flex items-center justify-center border border-dashed border-gray-700 rounded-xl h-32 text-gray-400 hover:border-indigo-500 cursor-pointer">
                + Add new item
              </div>
            </div>
          )}
        </div>

        {/* ACTIVITY VISUALIZATION */}
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-6">
          <h2 className="mb-4 font-semibold">Contribution Activity</h2>

          {commitsLoading ? (
            <div className="text-gray-400">Loading activity...</div>
          ) : commits.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              No activity yet. Start committing to see activity here.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-12 gap-1">
                {Array.from({ length: 84 }).map((_, i) => {
                  // Create a simple visual representation of commits over time
                  const commitIndex = Math.floor((commits.length * i) / 84);
                  const opacity = commitIndex < commits.length ? 1 : 0.2;
                  return (
                    <div
                      key={i}
                      className="w-4 h-4 bg-indigo-500 rounded-sm transition hover:bg-indigo-400"
                      style={{ opacity }}
                    ></div>
                  );
                })}
              </div>

              <p className="text-xs text-gray-500 mt-4">
                Total Commits: {commits.length}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
