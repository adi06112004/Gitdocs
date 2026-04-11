import { useNavigate } from "react-router-dom";
import Features from "../../components/Features";
import Footer from "../../components/Footer";
import { useSelector } from "react-redux";
import { WebRoutes } from "../../routes/WebRoutes";

const Home = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  return (
    <section className="relative pt-32 pb-20 bg-gradient-to-b from-[#0a0a0f] via-[#0f0f1a] to-black text-white overflow-hidden">
      <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-indigo-600/20 rounded-full blur-[150px]"></div>

      <div className="relative max-w-6xl mx-auto px-6 text-center">
        <span className="inline-block text-xs bg-indigo-600/20 text-indigo-400 px-4 py-1 rounded-full mb-6 border border-indigo-500/30">
          Now in Public Beta
        </span>
        <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
          Version Control for Documents
          <div className="text-indigo-500">Not Just Code</div>
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto mb-10 text-lg">
          Manage technical documentation with the power of Git.
          Branch, commit, and merge content seamlessly across your entire organization.
        </p>
        <div className="flex justify-center gap-4 mb-16">
          <button onClick={() => navigate(isAuthenticated ? WebRoutes.DASHBOARD() : WebRoutes.AUTH())} className="bg-indigo-600 hover:cursor-pointer hover:bg-indigo-500 px-6 py-3 rounded-lg text-sm font-medium shadow-xl shadow-indigo-600/40 transition">
            Start Committing →
          </button>
          <button className="bg-white/5 border border-white/10 hover:bg-white/10 px-6 py-3 rounded-lg text-sm font-medium transition">
            View Demo
          </button>
        </div>
        <div className="relative mx-auto max-w-xl bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl shadow-xl mt-12 text-left">
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-2 h-2 mt-2 bg-indigo-500 rounded-full shrink-0 shadow-md shadow-indigo-500/40"></div>
              <div>
                <h4 className="font-semibold text-white mb-1">
                  Git-Powered History
                </h4>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Every edit creates an immutable snapshot with full audit trail.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-2 h-2 mt-2 bg-indigo-500 rounded-full shrink-0 shadow-md shadow-indigo-500/40"></div>
              <div>
                <h4 className="font-semibold text-white mb-1">
                  Real-Time Sync
                </h4>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Collaborate with your team instantly with live synchronization.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-2 h-2 mt-2 bg-indigo-500 rounded-full shrink-0 shadow-md shadow-indigo-500/40"></div>
              <div>
                <h4 className="font-semibold text-white mb-1">
                  Role-Based Security
                </h4>
                <p className="text-gray-400 text-sm leading-relaxed">
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