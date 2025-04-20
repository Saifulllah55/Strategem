import React, { useEffect, useState } from "react";
import { api } from "../lib/axios";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

const AuthForm = ({ signUp }) => {
  const [isSignup, setIsSignup] = useState(false);

  let navigate = useNavigate();

  useEffect(() => {
    setIsSignup(signUp);
  }, []);

  const [credentials, setCredentials] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [responseMsg, setResponseMsg] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isSignup ? "/signup" : "/login";

    const payload = isSignup
      ? credentials
      : {
          email: credentials.email,
          password: credentials.password,
        };

    console.log(payload);

    try {
      const { data } = await api.post(endpoint, payload);
      setResponseMsg(`Success: ${data.message || "Authenticated"}`);
      navigate("/home");

      if (data.token) {
        localStorage.setItem("authToken", data.token);
      }
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || "Authentication failed";
      setResponseMsg(`Error: ${msg}`);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen ">
      <div className="flex bg-white rounded-lg shadow-lg overflow-hidden max-w-4xl w-full">

        <div className="w-1/2">
          <img
            src={logo}
            alt="Pattern"
            className="object-cover h-full w-full"
          />
        </div>

        <div className="w-1/2 p-8 flex-col content-center">
          <h2 className="text-2xl font-bold text-center mb-6">
            {isSignup ? "Sign Up" : "Log In"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={credentials.username}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            )}

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={credentials.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={credentials.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-200"
            >
              {isSignup ? "Sign Up" : "Log In"}
            </button>

            <p
              className="text-sm text-center text-blue-600 cursor-pointer hover:underline"
              onClick={() => {
                setIsSignup(!isSignup);
                setResponseMsg("");
              }}
            >
              {isSignup
                ? "Already have an account? Log in"
                : "Don't have an account? Sign up"}
            </p>

            {responseMsg && (
              <p className="text-center text-sm text-red-500 mt-2">
                {responseMsg}
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
