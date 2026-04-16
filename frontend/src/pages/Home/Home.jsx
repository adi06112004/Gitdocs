import { useNavigate } from "react-router-dom";
import Features from "../../components/Features";
import Footer from "../../components/Footer";
import { useSelector } from "react-redux";
import { WebRoutes } from "../../routes/WebRoutes";

const Home = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  return (
    <section className="relative pt-32 pb-20 bg-[#09090b] text-zinc-100 overflow-hidden min-h-[calc(100vh-64px)]">
      <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-indigo-600/15 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-[-100px] right-[-100px] w-[500px] h-[500px] bg-violet-600/15 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="relative max-w-6xl mx-auto px-6 text-center">
        <span className="inline-block text-xs font-semibold bg-indigo-500/10 text-indigo-400 px-4 py-1.5 rounded-full mb-8 border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.15)] tracking-wide uppercase">
          Now in Public Beta
        </span>
        <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6 tracking-tighter drop-shadow-xl">
          Version Control for Documents
          <div className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-violet-400 mt-2">Not Just Code</div>
        </h1>
        <p className="text-zinc-400 max-w-2xl mx-auto mb-12 text-lg leading-relaxed">
          Manage technical documentation with the power of Git.
          Branch, commit, and merge content seamlessly across your entire organization.
        </p>
        <div className="flex justify-center gap-4 mb-20">
          <button onClick={() => navigate(isAuthenticated ? WebRoutes.DASHBOARD() : WebRoutes.AUTH())} className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 px-8 py-3.5 rounded-xl text-sm font-semibold shadow-xl shadow-indigo-500/25 border border-indigo-500/50 transition-all duration-300 active:scale-95 text-white">
            Start Committing →
          </button>
          <button onClick={() => navigate(WebRoutes.DOCS())} className="bg-white/[0.03] border border-white/10 hover:bg-white/[0.08] px-8 py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 text-zinc-300">
            Read Documentation
          </button>
        </div>
        <div className="relative mx-auto max-w-xl bg-white/[0.02] border border-white/5 rounded-3xl p-8 backdrop-blur-2xl shadow-2xl mt-12 text-left group hover:border-white/10 transition-colors duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 rounded-3xl transition-opacity duration-500 pointer-events-none" />
          <div className="space-y-6 relative z-10">
            <div className="flex items-start gap-4">
              <div className="w-2.5 h-2.5 mt-1.5 bg-indigo-500 rounded-full shrink-0 shadow-[0_0_10px_rgba(99,102,241,0.6)]"></div>
              <div>
                <h4 className="font-semibold text-zinc-100 mb-1">
                  Git-Powered History
                </h4>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Every edit creates an immutable snapshot with full audit trail.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-2.5 h-2.5 mt-1.5 bg-violet-500 rounded-full shrink-0 shadow-[0_0_10px_rgba(139,92,246,0.6)]"></div>
              <div>
                <h4 className="font-semibold text-zinc-100 mb-1">
                  Real-Time Sync
                </h4>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Collaborate with your team instantly with live synchronization.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-2.5 h-2.5 mt-1.5 bg-emerald-500 rounded-full shrink-0 shadow-[0_0_10px_rgba(16,185,129,0.6)]"></div>
              <div>
                <h4 className="font-semibold text-zinc-100 mb-1">
                  Role-Based Security
                </h4>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Control access with Admin, Editor, and Viewer roles.
                </p>
              </div>
            </div>
          </div>
        </div>
        <Features />
      </div>
      <Footer/>
    </section>
  );
};

export default Home;