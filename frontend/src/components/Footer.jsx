import { FolderGit2 } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";
import { WebRoutes } from "../routes/WebRoutes";

const Footer = () => {
  return (
    <footer className="bg-[#09090b] border-t border-white/5 text-zinc-400">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-4 gap-12">
          <div>
            <div className="flex gap-2 items-center mb-4">
              <span className="text-white bg-gradient-to-br from-indigo-500 to-violet-600 p-2 rounded-lg shadow-lg shadow-indigo-500/20">
                <FolderGit2 size={18} />
              </span>
              <h2 className="text-xl font-bold text-zinc-100">
                Git<span className="text-indigo-400">Docs</span>
              </h2>
            </div>
            <p className="text-sm leading-relaxed text-zinc-500">
              Modern version control for engineering documentation.
              Built for teams that move fast.
            </p>
          </div>

          <div>
            <h3 className="text-zinc-100 font-semibold mb-4">Product</h3>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Integrations</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Changelog</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-zinc-100 font-semibold mb-4">Resources</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  to={WebRoutes.DOCS()}
                  className="hover:text-indigo-400 transition-colors"
                >
                  Documentation
                </Link>
              </li>
              <li>
                <Link
                  to={WebRoutes.DOCS()}
                  className="hover:text-indigo-400 transition-colors"
                >
                  Guides
                </Link>
              </li>
              <li>
                <Link
                  to={`${WebRoutes.DOCS()}#api`}
                  className="hover:text-indigo-400 transition-colors"
                >
                  API Reference
                </Link>
              </li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Community</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-zinc-100 font-semibold mb-4">Company</h3>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-indigo-400 transition-colors">About</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Privacy Policy</a></li>
            </ul>
          </div>

        </div>
        
        <div className="border-t border-white/5 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-zinc-500">
          <p>© {new Date().getFullYear()} GitDocs. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-zinc-300 transition-colors">Terms</a>
            <a href="#" className="hover:text-zinc-300 transition-colors">Privacy</a>
            <a href="#" className="hover:text-zinc-300 transition-colors">Contact</a>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
