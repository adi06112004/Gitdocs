import React from "react";
import  { FEATURES }  from "./Constant.jsx";

const Features = () => {
  return (
    <section className="py-24 text-white">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Built for Engineering Velocity
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Everything you need for documentation that scales
          </p>
        </div>

        <div className="grid md:grid-cols-3 sm:grid-cols-2 gap-8">
          {FEATURES.map((feature, index) => (
            <div
              key={index}
              className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6 hover:border-indigo-500/40 hover:shadow-xl hover:shadow-indigo-600/10 transition duration-300"
            >
              <div className="text-indigo-500 mb-4">
                {feature.icon}
              </div>

              <h3 className="text-lg font-semibold mb-2">
                {feature.title}
              </h3>

              <p className="text-gray-400 text-sm leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Features;
