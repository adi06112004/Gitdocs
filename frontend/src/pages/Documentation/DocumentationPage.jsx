import { Link } from "react-router-dom";
import {
  BookOpen,
  FolderGit2,
  Users,
  GitBranch,
  FileText,
  Activity,
  Settings,
  Search,
  Bell,
  Server,
} from "lucide-react";
import { WebRoutes } from "../../routes/WebRoutes";

const Section = ({ id, icon: Icon, title, children }) => (
  <section id={id} className="scroll-mt-24">
    <h2 className="text-lg sm:text-xl font-semibold text-white flex items-center gap-2 mb-3 mt-10 first:mt-0">
      {Icon ? <Icon className="text-indigo-400 shrink-0" size={22} /> : null}
      {title}
    </h2>
    <div className="text-sm text-gray-300 space-y-3 leading-relaxed">{children}</div>
  </section>
);

export default function DocumentationPage() {
  return (
    <div className="w-full max-w-3xl mx-auto pb-12">
      <div className="border border-white/5 bg-white/[0.02] rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/3" />
        <div className="flex items-start gap-4 mb-2 relative z-10">
          <span className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 text-indigo-400 shadow-lg shadow-indigo-500/10 border border-indigo-500/20">
            <BookOpen size={28} />
          </span>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              GitDocs documentation
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              How to use the product and where things live in the app.
            </p>
          </div>
        </div>

        <nav
          aria-label="On this page"
          className="mt-8 p-5 rounded-2xl bg-white/[0.03] border border-white/5 shadow-inner relative z-10"
        >
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">
            On this page
          </p>
          <ul className="grid sm:grid-cols-2 gap-x-4 gap-y-1 text-indigo-300">
            <li>
              <a href="#start" className="hover:text-white">
                Getting started
              </a>
            </li>
            <li>
              <a href="#projects" className="hover:text-white">
                Projects & collaboration
              </a>
            </li>
            <li>
              <a href="#documents" className="hover:text-white">
                Documents & editor
              </a>
            </li>
            <li>
              <a href="#branches" className="hover:text-white">
                Branches & versions
              </a>
            </li>
            <li>
              <a href="#activity" className="hover:text-white">
                Activity & notifications
              </a>
            </li>
            <li>
              <a href="#search" className="hover:text-white">
                Search
              </a>
            </li>
            <li>
              <a href="#settings" className="hover:text-white">
                Account settings
              </a>
            </li>
            <li>
              <a href="#api" className="hover:text-white">
                API reference
              </a>
            </li>
          </ul>
        </nav>

        <Section id="start" icon={FolderGit2} title="Getting started">
          <p>
            <strong className="text-gray-200">Sign in</strong> from the home page,
            then use the sidebar to open{" "}
            <Link
              to={WebRoutes.DASHBOARD()}
              className="text-indigo-400 hover:underline"
            >
              Dashboard
            </Link>
            ,{" "}
            <Link
              to={WebRoutes.PROJECTS()}
              className="text-indigo-400 hover:underline"
            >
              Projects
            </Link>
            , or{" "}
            <Link
              to={WebRoutes.DOCUMENTS()}
              className="text-indigo-400 hover:underline"
            >
              Documents
            </Link>
            . Create a project first, then add documents and branches inside a
            project.
          </p>
        </Section>

        <Section id="projects" icon={Users} title="Projects & collaboration">
          <p>
            Open any project from{" "}
            <Link
              to={WebRoutes.PROJECTS()}
              className="text-indigo-400 hover:underline"
            >
              Projects
            </Link>{" "}
            to see the <strong className="text-gray-200">Workspace</strong> tab
            (documents, branch sync, history) and the{" "}
            <strong className="text-gray-200">Settings</strong> tab.
          </p>
          <ul className="list-disc pl-5 space-y-2 text-gray-400">
            <li>
              <strong className="text-gray-200">Read</strong> — view the project
              and documents.
            </li>
            <li>
              <strong className="text-gray-200">Write</strong> — edit documents and
              manage branches (not archived-only admin actions).
            </li>
            <li>
              <strong className="text-gray-200">Admin</strong> — invite/remove
              collaborators, change roles, and set{" "}
              <strong className="text-gray-200">Public</strong> /{" "}
              <strong className="text-gray-200">Archived</strong>.
            </li>
          </ul>
          <p>
            Invites use the collaborator&apos;s <strong className="text-gray-200">registered email</strong>.
            <strong className="text-gray-200"> Invite history</strong> is listed in
            project settings. Archived projects only allow admins to make changes.
          </p>
        </Section>

        <Section id="documents" icon={FileText} title="Documents & editor">
          <p>
            Under{" "}
            <Link
              to={WebRoutes.DOCUMENTS()}
              className="text-indigo-400 hover:underline"
            >
              Documents
            </Link>
            , filter by branch, paginate, and create docs tied to a project. Open a
            document to edit in the editor. Documents are scoped by{" "}
            <strong className="text-gray-200">project</strong> and{" "}
            <strong className="text-gray-200">branch</strong>.
          </p>
        </Section>

        <Section id="branches" icon={GitBranch} title="Branches & versions">
          <p>
            Use{" "}
            <Link
              to={WebRoutes.VERSIONS()}
              className="text-indigo-400 hover:underline"
            >
              Versions
            </Link>{" "}
            for a global branch list, or manage branches inside a{" "}
            <strong className="text-gray-200">project</strong>. You can{" "}
            <strong className="text-gray-200">push/pull</strong> document content
            between branches from the project workspace when you have write access.
          </p>
        </Section>

        <Section id="activity" icon={Activity} title="Activity & notifications">
          <p>
            <Link
              to={WebRoutes.ACTIVITY()}
              className="text-indigo-400 hover:underline"
            >
              Activity
            </Link>{" "}
            shows commits and project events with filters. The navbar{" "}
            <strong className="text-gray-200">bell</strong> opens{" "}
            <strong className="text-gray-200">recent activity</strong> (latest
            commits); the badge counts items since you last opened the panel.
          </p>
        </Section>

        <Section id="search" icon={Search} title="Search">
          <p>
            The navbar search (desktop always; mobile via the search icon) loads
            your workspace data and matches{" "}
            <strong className="text-gray-200">projects</strong>,{" "}
            <strong className="text-gray-200">documents</strong>,{" "}
            <strong className="text-gray-200">branches</strong>, and{" "}
            <strong className="text-gray-200">commit messages</strong> after two or
            more characters. Pick a result to jump to the editor, project, versions
            page, or activity.
          </p>
        </Section>

        <Section id="settings" icon={Settings} title="Account settings">
          <p>
            <Link
              to={WebRoutes.SETTINGS()}
              className="text-indigo-400 hover:underline"
            >
              Settings
            </Link>{" "}
            (dashboard, not per-project) saves{" "}
            <strong className="text-gray-200">profile</strong>,{" "}
            <strong className="text-gray-200">password</strong>, and{" "}
            <strong className="text-gray-200">notification preferences</strong> to
            the server.
          </p>
        </Section>

        <Section id="api" icon={Server} title="API reference (backend)">
          <p className="text-gray-400">
            Base URL: <code className="text-indigo-300 bg-black/40 border border-white/10 px-1.5 py-0.5 rounded-md">http://localhost:5000/api</code>{" "}
            (use your deployed URL in production). Send{" "}
            <code className="text-indigo-300 bg-black/40 border border-white/10 px-1.5 py-0.5 rounded-md">Authorization: Bearer &lt;token&gt;</code>{" "}
            for protected routes.
          </p>
          <div className="overflow-x-auto rounded-xl border border-white/5 bg-white/[0.01] mt-6 shadow-xl">
            <table className="w-full text-xs sm:text-sm text-left">
              <thead className="bg-white/[0.02] text-zinc-400 border-b border-white/5">
                <tr>
                  <th className="px-4 py-3 font-semibold tracking-wider">Method</th>
                  <th className="px-4 py-3 font-semibold tracking-wider">Path</th>
                  <th className="px-4 py-3 font-semibold tracking-wider">Purpose</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-zinc-300">
                {[
                  ["POST", "/auth/register", "Create account"],
                  ["POST", "/auth/login", "Get JWT"],
                  ["GET", "/auth/me", "Current user"],
                  ["GET", "/users/me", "Profile + preferences"],
                  ["PATCH", "/users/me", "Update name/email"],
                  ["PATCH", "/users/me/password", "Change password"],
                  ["PATCH", "/users/me/preferences", "Notification toggles"],
                  ["GET/POST", "/projects", "List / create projects"],
                  ["GET/PUT/DELETE", "/projects/:id", "Project CRUD"],
                  ["GET/POST", "/projects/:id/collaborators", "List / invite"],
                  ["PUT/DELETE", "/projects/:id/collaborators/:userId", "Role / remove"],
                  ["GET/POST", "/documents", "List / create documents"],
                  ["GET/PUT/DELETE", "/documents/:id", "Document by id"],
                  ["GET/POST", "/commits", "List / create commits"],
                  ["GET/POST/DELETE", "/versions", "Branches"],
                  ["POST", "/versions/sync", "Branch document sync"],
                ].map(([method, path, purpose]) => (
                  <tr key={path + method} className="hover:bg-white/[0.04] transition-colors">
                    <td className="px-4 py-3 text-emerald-400 font-medium whitespace-nowrap">{method}</td>
                    <td className="px-4 py-3 font-mono text-indigo-300 whitespace-nowrap text-xs">
                      {path}
                    </td>
                    <td className="px-4 py-3 text-zinc-400">{purpose}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section id="tips" icon={Bell} title="Tips">
          <ul className="list-disc pl-5 space-y-2 text-gray-400">
            <li>
              Use the <strong className="text-gray-200">menu button</strong> (mobile)
              to open the sidebar; the layout is tuned for small screens.
            </li>
            <li>
              Project data refreshes periodically while you stay on a project page;
              you can also switch away and back to pull latest collaborators.
            </li>
          </ul>
        </Section>
      </div>
    </div>
  );
}
