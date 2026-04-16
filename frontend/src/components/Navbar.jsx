import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  FolderGit2,
  Search,
  Bell,
  Plus,
  User,
  LogOut,
  FileText,
  FolderKanban,
  GitBranch,
  History,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/slices/authSlice";
import { WebRoutes } from "../routes/WebRoutes";
import { fetchCommitsRequest } from "../store/slices/commitSlice";
import { fetchDocumentsRequest } from "../store/slices/documentSlice";
import { fetchProjectsRequest } from "../store/slices/projectSlice";
import { fetchVersionsRequest } from "../store/slices/versionSlice";
import { useDebouncedValue } from "../hooks/useDebouncedValue";

const NOTIF_LAST_OPENED_KEY = "gitdocs-notif-last-opened";

function readNotifBaseline() {
  const raw = localStorage.getItem(NOTIF_LAST_OPENED_KEY);
  const n = parseInt(raw || "0", 10);
  return Number.isFinite(n) ? n : 0;
}

function writeNotifBaseline(ts) {
  localStorage.setItem(NOTIF_LAST_OPENED_KEY, String(ts));
}

function SearchField({
  isAuthenticated,
  searchQuery,
  setSearchQuery,
  searchOpen,
  setSearchOpen,
  debouncedQuery,
  searchResults,
  hasSearchHits,
  onPrimeData,
  onSelectDoc,
  onSelectProject,
  onSelectBranch,
  onSelectCommit,
}) {
  return (
    <div className="relative flex-1 min-w-0 w-full">
      <div className="flex items-center gap-2 bg-white/[0.03] px-3 py-2 rounded-lg border border-white/5 focus-within:border-indigo-500/50 hover:bg-white/[0.05] transition-all duration-300">
        <Search size={16} className="text-zinc-500 shrink-0" />
        <input
          type="search"
          autoComplete="off"
          placeholder={
            isAuthenticated
              ? "Search projects, documents, branches, activity…"
              : "Sign in to search your workspace"
          }
          disabled={!isAuthenticated}
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            if (isAuthenticated) {
              onPrimeData();
              setSearchOpen(true);
            }
          }}
          onFocus={() => {
            if (isAuthenticated) {
              onPrimeData();
              setSearchOpen(true);
            }
          }}
          className="bg-transparent outline-none text-sm w-full text-zinc-300 placeholder-zinc-500 min-w-0"
        />
        {isAuthenticated && debouncedQuery.length >= 2 && !hasSearchHits ? (
          <span className="text-xs text-gray-500 shrink-0 hidden sm:inline">
            No matches
          </span>
        ) : null}
      </div>

      {isAuthenticated &&
      searchOpen &&
      debouncedQuery.length >= 2 &&
      hasSearchHits ? (
        <div className="absolute left-0 right-0 top-full mt-1 bg-[#111827] border border-gray-700 rounded-lg shadow-xl max-h-[min(70vh,320px)] overflow-y-auto z-[70]">
          {searchResults.projects.length > 0 ? (
            <div className="p-2 border-b border-gray-800">
              <p className="text-[10px] uppercase tracking-wide text-gray-500 px-2 py-1">
                Projects
              </p>
              {searchResults.projects.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onSelectProject(p.id)}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-800/80 flex items-center gap-2 text-sm"
                >
                  <FolderKanban size={14} className="text-indigo-400 shrink-0" />
                  <span className="truncate">{p.name}</span>
                </button>
              ))}
            </div>
          ) : null}
          {searchResults.documents.length > 0 ? (
            <div className="p-2 border-b border-gray-800">
              <p className="text-[10px] uppercase tracking-wide text-gray-500 px-2 py-1">
                Documents
              </p>
              {searchResults.documents.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => onSelectDoc(d.id)}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-800/80 flex items-center gap-2 text-sm"
                >
                  <FileText size={14} className="text-emerald-400 shrink-0" />
                  <span className="truncate">{d.name}</span>
                </button>
              ))}
            </div>
          ) : null}
          {searchResults.branches.length > 0 ? (
            <div className="p-2 border-b border-gray-800">
              <p className="text-[10px] uppercase tracking-wide text-gray-500 px-2 py-1">
                Branches
              </p>
              {searchResults.branches.map((b) => (
                <button
                  key={b.id || `${b.projectId}-${b.name}`}
                  type="button"
                  onClick={() => onSelectBranch()}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-800/80 flex items-center gap-2 text-sm"
                >
                  <GitBranch size={14} className="text-amber-400 shrink-0" />
                  <span className="truncate">
                    {b.name}
                    <span className="text-gray-500 text-xs ml-2">
                      ({b.projectId})
                    </span>
                  </span>
                </button>
              ))}
            </div>
          ) : null}
          {searchResults.commits.length > 0 ? (
            <div className="p-2">
              <p className="text-[10px] uppercase tracking-wide text-gray-500 px-2 py-1">
                Activity
              </p>
              {searchResults.commits.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => onSelectCommit(c)}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-800/80 flex items-start gap-2 text-sm"
                >
                  <History size={14} className="text-gray-400 shrink-0 mt-0.5" />
                  <span className="truncate text-gray-200">{c.message}</span>
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function NotificationPanel({ recentActivity, onClose, onViewAll, onOpenCommit }) {
  return (
    <div className="absolute right-0 top-full mt-2 w-[min(calc(100vw-1rem),24rem)] max-h-[min(70vh,400px)] overflow-y-auto rounded-lg border border-gray-700 bg-[#111827] shadow-2xl z-[70] p-2">
      <div className="flex items-center justify-between px-2 py-1 border-b border-gray-800 mb-2">
        <span className="text-sm font-semibold text-white">Recent activity</span>
        <button
          type="button"
          className="text-xs text-indigo-400 hover:underline"
          onClick={() => {
            onClose();
            onViewAll();
          }}
        >
          View all
        </button>
      </div>
      {recentActivity.length === 0 ? (
        <p className="text-sm text-gray-500 px-2 py-6 text-center">
          No activity yet. Commits and changes appear here.
        </p>
      ) : (
        <ul className="space-y-1">
          {recentActivity.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                className="w-full text-left px-2 py-2 rounded-md hover:bg-gray-800/90 text-sm"
                onClick={() => onOpenCommit(c)}
              >
                <p className="text-gray-200 line-clamp-2">{c.message}</p>
                <p className="text-[11px] text-gray-500 mt-1">
                  {c.branch ? `${c.branch} · ` : ""}
                  {c.createdAt
                    ? new Date(c.createdAt).toLocaleString()
                    : ""}
                </p>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { documents } = useSelector((state) => state.documents);
  const { projects } = useSelector((state) => state.projects);
  const { branches } = useSelector((state) => state.versions);
  const { commits } = useSelector((state) => state.commits);

  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebouncedValue(searchQuery.trim(), 200);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [notifBaseline, setNotifBaseline] = useState(readNotifBaseline);

  const dataPrimed = useRef(false);
  const searchDesktopRef = useRef(null);
  const searchMobileRef = useRef(null);
  const notifWrapRef = useRef(null);

  const primeSearchData = useCallback(() => {
    if (!isAuthenticated || dataPrimed.current) return;
    dataPrimed.current = true;
    dispatch(fetchDocumentsRequest());
    dispatch(fetchProjectsRequest());
    dispatch(fetchVersionsRequest());
    dispatch(fetchCommitsRequest({}));
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCommitsRequest({}));
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    const onDocClick = (e) => {
      const t = e.target;
      if (searchDesktopRef.current?.contains(t)) return;
      if (searchMobileRef.current?.contains(t)) return;
      if (notifWrapRef.current?.contains(t)) return;
      setSearchOpen(false);
      setNotifOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const searchResults = useMemo(() => {
    const q = debouncedQuery.toLowerCase();
    if (q.length < 2) {
      return { projects: [], documents: [], branches: [], commits: [] };
    }

    const lim = (arr, n = 6) => arr.slice(0, n);

    const projectHits = projects.filter(
      (p) =>
        (p.name && String(p.name).toLowerCase().includes(q)) ||
        (p.description && String(p.description).toLowerCase().includes(q)),
    );

    const docHits = documents.filter(
      (d) =>
        (d.name && String(d.name).toLowerCase().includes(q)) ||
        (d.content && String(d.content).toLowerCase().includes(q)),
    );

    const branchHits = branches.filter(
      (b) =>
        b &&
        typeof b === "object" &&
        b.name &&
        String(b.name).toLowerCase().includes(q),
    );

    const commitHits = commits.filter(
      (c) => c.message && String(c.message).toLowerCase().includes(q),
    );

    return {
      projects: lim(projectHits),
      documents: lim(docHits),
      branches: lim(branchHits, 5),
      commits: lim(commitHits, 8),
    };
  }, [debouncedQuery, projects, documents, branches, commits]);

  const hasSearchHits =
    searchResults.projects.length +
      searchResults.documents.length +
      searchResults.branches.length +
      searchResults.commits.length >
    0;

  const recentActivity = useMemo(() => {
    return [...commits]
      .sort(
        (a, b) =>
          new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
      )
      .slice(0, 20);
  }, [commits]);

  const unreadCount = useMemo(() => {
    return recentActivity.filter(
      (c) => new Date(c.createdAt || 0).getTime() > notifBaseline,
    ).length;
  }, [recentActivity, notifBaseline]);

  const clearSearchUi = () => {
    setSearchOpen(false);
    setMobileSearchOpen(false);
    setSearchQuery("");
  };

  const toggleNotifications = () => {
    setNotifOpen((prev) => {
      const opening = !prev;
      if (opening) {
        const now = Date.now();
        writeNotifBaseline(now);
        setNotifBaseline(now);
        primeSearchData();
        dispatch(fetchCommitsRequest({}));
      }
      return opening;
    });
    setSearchOpen(false);
  };

  const searchProps = {
    isAuthenticated,
    searchQuery,
    setSearchQuery,
    searchOpen,
    setSearchOpen,
    debouncedQuery,
    searchResults,
    hasSearchHits,
    onPrimeData: primeSearchData,
    onSelectDoc: (id) => {
      clearSearchUi();
      navigate(`/editor?docId=${id}`);
    },
    onSelectProject: (id) => {
      clearSearchUi();
      navigate(`/project/${id}`);
    },
    onSelectBranch: () => {
      clearSearchUi();
      navigate(WebRoutes.VERSIONS());
    },
    onSelectCommit: (c) => {
      clearSearchUi();
      if (c.projectId) navigate(`/project/${c.projectId}`);
      else navigate(WebRoutes.ACTIVITY());
    },
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate(WebRoutes.HOME());
  };

  const openCommitFromNotif = (c) => {
    setNotifOpen(false);
    if (c.projectId) navigate(`/project/${c.projectId}`);
    else navigate(WebRoutes.ACTIVITY());
  };

  return (
    <nav className="w-full fixed top-0 z-50 border-b border-white/5 bg-[#09090b]/80 backdrop-blur-2xl supports-[backdrop-filter]:bg-[#09090b]/60">
      <div className="px-3 sm:px-6 py-2 sm:py-3 flex items-center justify-between gap-2 min-w-0">
        <div
          className="flex items-center gap-2 cursor-pointer shrink-0 min-w-0"
          onClick={() => navigate("/")}
          onKeyDown={(e) => {
            if (e.key === "Enter") navigate("/");
          }}
          role="button"
          tabIndex={0}
        >
          <span className="text-white bg-indigo-600 p-2 rounded-lg shadow-md">
            <FolderGit2 size={18} />
          </span>
          <div className="text-white text-lg sm:text-xl font-bold tracking-tight truncate">
            Git<span className="text-indigo-400">Docs</span>
          </div>
        </div>

        <div
          ref={searchDesktopRef}
          className="hidden md:flex flex-1 min-w-0 max-w-xl mx-3 lg:mx-6"
        >
          <SearchField {...searchProps} />
        </div>

        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {isAuthenticated ? (
            <button
              type="button"
              aria-label="Search"
              className="md:hidden p-2 rounded-lg bg-[#111827] border border-gray-800 text-gray-300 active:bg-gray-800"
              onClick={() => {
                setMobileSearchOpen((v) => !v);
                if (!mobileSearchOpen) primeSearchData();
              }}
            >
              <Search size={18} />
            </button>
          ) : null}

          {isAuthenticated ? (
            <div className="relative" ref={notifWrapRef}>
              <button
                type="button"
                aria-label="Notifications"
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/80 relative"
                onClick={toggleNotifications}
              >
                <Bell size={18} />
                {unreadCount > 0 ? (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                ) : null}
              </button>
              {notifOpen ? (
                <NotificationPanel
                  recentActivity={recentActivity}
                  onClose={() => setNotifOpen(false)}
                  onViewAll={() => navigate(WebRoutes.ACTIVITY())}
                  onOpenCommit={openCommitFromNotif}
                />
              ) : null}
            </div>
          ) : null}

          {isAuthenticated ? (
            <>
              <button
                type="button"
                onClick={() => navigate(WebRoutes.PROJECTS())}
                className="hidden lg:flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-lg shadow-indigo-500/25 border border-indigo-500/50 transition-all duration-300 active:scale-95"
              >
                <Plus size={16} />
                New Project
              </button>
              <div className="hidden sm:flex items-center gap-2 text-white max-w-[120px] lg:max-w-[160px]">
                <User size={16} className="shrink-0" />
                <span className="text-sm truncate">
                  {user?.name || user?.email}
                </span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2 text-gray-300 hover:text-white text-sm font-medium px-2 py-1 transition-colors"
              >
                <LogOut size={16} />
                <span className="hidden lg:inline">Logout</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => navigate(WebRoutes.AUTH())}
                className="text-gray-300 hover:text-white text-sm font-medium px-2 py-1"
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => navigate(WebRoutes.AUTH())}
                className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-lg shadow-indigo-500/25 border border-indigo-500/50 transition-all duration-300 active:scale-95"
              >
                Get Started
              </button>
            </>
          )}
        </div>
      </div>

      {isAuthenticated && mobileSearchOpen ? (
        <div
          ref={searchMobileRef}
          className="md:hidden border-t border-gray-800/80 px-3 py-2"
        >
          <SearchField {...searchProps} />
        </div>
      ) : null}
    </nav>
  );
};

export default Navbar;
