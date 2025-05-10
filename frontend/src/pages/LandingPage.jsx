import React from "react";

import { Link } from "react-router-dom";
import HomeNav from "../components/HomeNav";

function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-cyan-500 via-black to-purple-700 text-white font-sans">
      {<HomeNav />}

      <section className="text-center px-6 py-24 md:py-36">
        <p className="uppercase text-sm tracking-widest text-gray-400 mb-2">
          Project Management App
        </p>
        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
          Create. Collaborate. Dominate.
        </h1>{" "}
        <p className="mt-4 text-lg text-gray-300 max-w-xl mx-auto">
          Create, share, and get feedback turning ideas into actions, together..
        </p>
        <Link to={"/create"}>
          <button className="mt-8 px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded shadow-lg transition duration-300">
            Create Project
          </button>
        </Link>
      </section>

      <footer className="text-center text-sm text-gray-500 py-8">
        © 2025 RollingBoard. Built with 💙 by Bilal.
      </footer>
    </div>
  );
}
export default HomePage;
