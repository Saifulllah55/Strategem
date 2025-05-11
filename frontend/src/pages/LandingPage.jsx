import React from "react";
import { Link } from "react-router-dom";
import HomeNav from "../components/HomeNav";

function HomePage() {
  return (
    <div className="min-h-screen bg-[#121620] text-white font-sans relative overflow-x-hidden">
      <HomeNav />
      <section className="flex flex-col items-center justify-center min-h-[80vh] px-4">
        
        {/* Headline */}
        <h1 className="text-4xl md:text-6xl font-extrabold text-center mb-4 tracking-tight">
          All your projects. <span className="text-cyan-400">One place.</span>
        </h1>
        {/* Subheadline */}
        <p className="text-lg md:text-2xl text-gray-300 text-center max-w-2xl mb-8">
          Strategem helps you organize, collaborate, and deliver projects with clarity and confidence. No more chaos—just results.
        </p>
        {/* CTA Button */}
        <Link to="/create">
          <button className="px-10 py-4 bg-cyan-600 hover:bg-cyan-500 text-white text-lg font-bold rounded-full shadow-lg transition-all duration-200">
            Get Started Free
          </button>
        </Link>
      </section>
      {/* Footer */}
      <footer className="text-center text-sm text-gray-500 py-8 mt-8">
        © 2025 RollingBoard. Built with 💙 by Bilal.
      </footer>
    </div>
  );
}

export default HomePage;
