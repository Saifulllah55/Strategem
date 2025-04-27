import { useEffect } from "react";

import { BrowserRouter, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./components/Dashboard";
import CreatePage from "./pages/CreatePage";
import PrivateRoute from "./components/PrivateRoute";
import { useDispatch } from "react-redux";
import { setUser } from "./Store/features/userSlice";
import LoginPage from "./pages/LoginPage";
import SignupForm from "./components/SignupForm";


function App() {

  const dispatch = useDispatch();

  useEffect(() => {
    const localUser = localStorage.getItem("user");
    if (localUser) {
      try {
        const parsedUser = JSON.parse(localUser);
        dispatch(setUser(parsedUser));
      } catch (err) {
        console.error("Failed to parse user from localStorage", err);
      }
    }
  }, [dispatch]);

  return (

      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />}></Route>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/home" element={<HomePage></HomePage>}></Route>
          <Route path="/signup" element={<SignupForm/>}></Route>
          
          <Route
            path="/dashboard/:id"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/create"
            element={
              <PrivateRoute>
                <CreatePage />
              </PrivateRoute>
            }
          ></Route>
        </Routes>
      </BrowserRouter>
  );
}

export default App;
