import { useEffect } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./components/Dashboard";
import CreatePage from "./pages/CreatePage";
import PrivateRoute from "./components/PrivateRoute";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "./Store/features/userSlice";
import LoginPage from "./pages/LoginPage";
import ProjectPage from "./pages/ProjectPage";
import ProjectsPage from "./pages/ProjectsPage";
import { fetchProjects } from "./Store/features/projectSlice";
import ModalComponent from "./components/ModalComponent";
import Navbar from "./components/NavBar";

// Layout component that conditionally renders the Navbar
const Layout = ({ children }) => {
  const location = useLocation();
  const user = useSelector((state) => state.auth.user);
  
  // Don't show navbar on landing and login pages
  const hideNavbar = ['/', '/login'].includes(location.pathname);

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      {!hideNavbar && <Navbar />}
      <main>{children}</main>
    </div>
  );
};

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
        dispatch(setUser(null));
      }
    } else {
      dispatch(setUser(null));
    }
  }, [dispatch]);

  return (    
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/home" element={
          <Layout>
            <HomePage />
          </Layout>
        } />
        <Route
          path="/dashboard"
          element={
            <Layout>
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            </Layout>
          }
        />
        <Route
          path="/projects"
          element={
            <Layout>
              <PrivateRoute>
                <ProjectsPage />
              </PrivateRoute>
            </Layout>
          }
        />
        <Route
          path="/create"
          element={
            <Layout>
              <PrivateRoute>
                <CreatePage />
              </PrivateRoute>
            </Layout>
          }
        />
        <Route 
          path="/project/:projectId" 
          element={
            <Layout>
              <PrivateRoute>
                <ProjectPage />
              </PrivateRoute>
            </Layout>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
