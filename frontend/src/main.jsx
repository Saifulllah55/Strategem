import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
// import HomePage from "./Components/HomePage.jsx";
// import ErrorPg from "./Components/ErrorPg.jsx";
// import Dashboard from "./Components/Dashboard.jsx";
import App from "./App.jsx";
import "./index.css";

// const router = createBrowserRouter([
//   { path: "/", element: <HomePage /> },
//   {
//     path: "/dashboard",
//     element: <Dashboard />,
//   },
//   {
//     path: "/dashboard/profile",
//     // element: <{Profiles} />,
//   },
//   {
//     path: "/dashboard/Projects",
//     // element: <{Projects} />,
//   },
//   {
//     path: "/dashboard/About/:id",
//     // element: <{About} />,
//   },
// ]);
createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* <RouterProvider router={router} /> */}
    <App></App>
  </StrictMode>
);
