import {
    GitBranch,
    Clock,
    Shield,
    Users,
    Search,
    Zap,
  } from "lucide-react";

export const FEATURES = [
    {
      icon: <GitBranch size={22} />,
      title: "Git-Powered History",
      desc: "Every change is tracked with full version history and immutable commits.",
    },
    {
      icon: <Clock size={22} />,
      title: "Real-Time Sync",
      desc: "Changes synchronize instantly across all team members viewing the document.",
    },
    {
      icon: <Shield size={22} />,
      title: "Role-Based Security",
      desc: "Control document access with Admin, Editor, and Viewer role management.",
    },
    {
      icon: <Users size={22} />,
      title: "Team Collaboration",
      desc: "Built-in branching for teams to work on experimental versions safely.",
    },
    {
      icon: <Search size={22} />,
      title: "Powerful Search",
      desc: "Find documents, commits, and changes across your entire organization.",
    },
    {
      icon: <Zap size={22} />,
      title: "Lightning Fast",
      desc: "Optimized performance for large documents and frequent updates.",
    },
  ];