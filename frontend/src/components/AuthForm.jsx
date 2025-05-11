import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, signupUser } from "../Store/features/userSlice";

const AuthForm = ({ signUp }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [credentials, setCredentials] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [responseMsg, setResponseMsg] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/dashboard";

  const { user, error } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    setIsSignup(signUp);
  }, [signUp]);

  useEffect(() => {
    if (error && hasSubmitted) {
      setResponseMsg(error);
    }
  }, [error, hasSubmitted]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResponseMsg("");
    setHasSubmitted(true);

    const payload = isSignup
      ? credentials
      : {
          email: credentials.email,
          password: credentials.password,
        };

    const action = isSignup ? signupUser : loginUser;
    const result = await dispatch(action(payload));
    
    if (!result.error) {
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#121620]">
      <div className="flex bg-[#1c2331] rounded-lg shadow-lg overflow-hidden max-w-4xl w-full">
        <div className="w-1/2">
          <img
            src={logo}
            alt="Pattern"
            className="object-cover h-full w-full"
          />
        </div>

        <div className="w-1/2 p-8 flex-col content-center">
          <h2 className="text-2xl font-bold text-center mb-6 text-white">
            {isSignup ? "Sign Up" : "Log In"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={credentials.username}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[#2c323f] border border-[#3d4451] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={credentials.email}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-[#2c323f] border border-[#3d4451] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={credentials.password}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-[#2c323f] border border-[#3d4451] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 px-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-md transition-colors"
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
