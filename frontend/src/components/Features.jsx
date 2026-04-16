import React from "react";
import  { FEATURES }  from "./Constant.jsx";

const Features = () => {
  return (
    <section className="py-24 text-white">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight drop-shadow-lg text-zinc-100">
            Built for <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-violet-400">Engineering Velocity</span>
          </h2>
          <p className="text-zinc-400 max-w-xl mx-auto text-lg">
            Everything you need for documentation that scales.
          </p>
        </div>

        <div className="grid md:grid-cols-3 sm:grid-cols-2 gap-8">
          {FEATURES.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-white/[0.02] border border-white/5 backdrop-blur-xl rounded-2xl p-7 hover:border-indigo-500/30 hover:bg-white/[0.04] hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10">
                <div className="text-indigo-400 mb-5 group-hover:scale-110 group-hover:text-indigo-300 transition-transform duration-300">
                  {feature.icon}
                </div>

                <h3 className="text-xl font-semibold mb-3 text-zinc-100 group-hover:text-indigo-300 transition-colors">
                  {feature.title}
                </h3>

                <p className="text-zinc-400 text-sm leading-relaxed group-hover:text-zinc-300 transition-colors">
                  {feature.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Features;
