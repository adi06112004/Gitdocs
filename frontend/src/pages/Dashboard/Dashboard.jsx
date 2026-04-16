import { useEffect, useMemo } from "react";
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
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchDocumentsRequest());
    dispatch(fetchCommitsRequest());
  }, [dispatch]);

  const userDocuments = user
    ? documents.filter(
        (doc) => doc.createdBy === user.id || doc.lastEditedBy === user.id,
      )
    : [];

  const userCommits = user
    ? commits.filter((commit) => commit.author === user.id)
    : [];

  // Get recent documents (sorted by createdAt)
  const recentDocuments = [...userDocuments]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 6);

  // Calculate stats
  const totalDocuments = userDocuments.length;
  const totalCommits = userCommits.length;
  const uniqueAuthors = new Set(userCommits.map((c) => c.author)).size;

  const commitsByDay = useMemo(() => {
    return userCommits.reduce((acc, commit) => {
      const date = new Date(commit.createdAt || commit.updatedAt || new Date().getTime());
      if (Number.isNaN(date.getTime())) return acc;
      const key = date.toISOString().slice(0, 10);
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }, [userCommits]);

  const maxCommitsPerDay = Math.max(...Object.values(commitsByDay), 1);

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto">
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
          <div className="text-zinc-500 animate-pulse">Loading documents...</div>
        ) : recentDocuments.length === 0 ? (
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-8 text-center text-zinc-500">
            No documents yet. Create one to get started.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentDocuments.map((doc) => (
              <div
                key={doc.id}
                className="group relative bg-white/[0.02] border border-white/5 rounded-2xl p-5 hover:bg-white/[0.04] hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-300" />
                <div className="relative z-10">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] uppercase tracking-wider font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                      {doc.branch || "main"}
                    </span>
                  </div>

                  <h3 className="font-semibold text-zinc-100 group-hover:text-indigo-300 transition-colors truncate">{doc.name}</h3>
                  <p className="text-xs text-zinc-500 mt-2">
                    Updated {new Date(doc.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}

            <div className="flex flex-col gap-2 items-center justify-center border-2 border-dashed border-white/10 rounded-2xl h-[120px] text-zinc-500 hover:border-indigo-500/50 hover:bg-indigo-500/5 hover:text-indigo-400 transition-all duration-300 cursor-pointer">
              <span className="text-sm font-medium">+ Add new item</span>
            </div>
          </div>
        )}
      </div>

      {/* ACTIVITY VISUALIZATION */}
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 shadow-xl shadow-black/50">
        <h2 className="mb-4 font-semibold">Contribution Activity</h2>

        {commitsLoading ? (
          <div className="text-gray-400">Loading activity...</div>
        ) : !user ? (
          <div className="text-center text-gray-400 py-8">
            Sign in to view your contribution history.
          </div>
        ) : userCommits.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            No activity yet. Start committing to see activity here.
          </div>
        ) : (
          <>
            <div className="w-full overflow-x-auto pb-4 custom-scrollbar">
              <div className="flex min-w-max">
                {/* DAYS OF WEEK LABELS */}
                <div className="flex flex-col text-[10px] text-zinc-500 font-medium justify-between pr-3 pt-[26px] pb-1 h-[142px]">
                  <span className="leading-none"></span>
                  <span className="leading-none">Mon</span>
                  <span className="leading-none"></span>
                  <span className="leading-none">Wed</span>
                  <span className="leading-none"></span>
                  <span className="leading-none">Fri</span>
                  <span className="leading-none"></span>
                </div>

                <div className="flex flex-col flex-1">
                  {/* MONTH LABELS */}
                  <div className="grid grid-flow-col gap-1.5 text-[10px] text-zinc-500 font-medium mb-2 relative h-4">
                    {(() => {
                      const today = new Date();
                      const currentDayOfWeek = today.getDay();
                      const numCols = 53;
                      const indexOfToday = 52 * 7 + currentDayOfWeek;
                      
                      return Array.from({ length: numCols }).map((_, col) => {
                        const dateOfCol = new Date(today);
                        dateOfCol.setDate(today.getDate() - (indexOfToday - col * 7));
                        const monthName = dateOfCol.toLocaleString("default", { month: "short" });
                        
                        const prevDateOfCol = new Date(today);
                        prevDateOfCol.setDate(today.getDate() - (indexOfToday - (col - 1) * 7));
                        const prevMonthName = col > 0 ? prevDateOfCol.toLocaleString("default", { month: "short" }) : null;
                        
                        const showMonth = col === 0 || monthName !== prevMonthName;
                        return (
                          <div key={col} className="w-[14px] relative">
                            {showMonth ? <span className="absolute left-0 bg-[#09090b] px-0.5 z-10 truncate">{monthName}</span> : null}
                          </div>
                        );
                      });
                    })()}
                  </div>

                  {/* GRAPH CELLS */}
                  <div className="grid grid-rows-7 grid-flow-col gap-1.5 h-[112px]">
                    {(() => {
                      const today = new Date();
                      const currentDayOfWeek = today.getDay(); // 0 is Sunday
                      const totalCells = 53 * 7; 
                      const indexOfToday = 52 * 7 + currentDayOfWeek;
                      
                      return Array.from({ length: totalCells }).map((_, i) => {
                        if (i > indexOfToday) {
                          // Future days in the final week (transparent placeholder)
                          return <div key={`empty-${i}`} className="w-[14px] h-[14px]"></div>;
                        }

                        const day = new Date(today);
                        day.setDate(day.getDate() - (indexOfToday - i));
                        const dayKey = day.toISOString().slice(0, 10);
                        const count = commitsByDay[dayKey] || 0;
                        
                        let intensityClass = "bg-white/[0.03] border border-white/5";
                        if (count > 0) {
                          const ratio = count / maxCommitsPerDay;
                          if (ratio <= 0.25) intensityClass = "bg-indigo-900/60 border border-indigo-700/50";
                          else if (ratio <= 0.5) intensityClass = "bg-indigo-600/80 border border-indigo-500/50";
                          else if (ratio <= 0.75) intensityClass = "bg-indigo-500 border border-indigo-400";
                          else intensityClass = "bg-violet-500 border border-violet-400 shadow-[0_0_8px_rgba(139,92,246,0.6)] z-10";
                        }

                        return (
                          <div
                            key={dayKey}
                            title={`${dayKey}: ${count} commit${count === 1 ? "" : "s"}`}
                            className={`w-[14px] h-[14px] rounded-[3px] transition-all hover:scale-125 hover:z-20 relative cursor-crosshair ${intensityClass}`}
                          ></div>
                        );
                      });
                    })()}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-zinc-400">
              <span className="font-medium text-zinc-300">
                {totalCommits} contributions <span className="text-zinc-500 font-normal">in the last year</span>
              </span>
              <div className="flex items-center gap-2.5">
                <span>Less</span>
                <div className="flex gap-1.5">
                  <span className="w-3.5 h-3.5 rounded-[3px] bg-white/[0.03] border border-white/5" title="0 commits"></span>
                  <span className="w-3.5 h-3.5 rounded-[3px] bg-indigo-900/60 border border-indigo-700/50"></span>
                  <span className="w-3.5 h-3.5 rounded-[3px] bg-indigo-600/80 border border-indigo-500/50"></span>
                  <span className="w-3.5 h-3.5 rounded-[3px] bg-indigo-500 border border-indigo-400"></span>
                  <span className="w-3.5 h-3.5 rounded-[3px] bg-violet-500 border border-violet-400 shadow-[0_0_8px_rgba(139,92,246,0.5)]"></span>
                </div>
                <span>More</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
