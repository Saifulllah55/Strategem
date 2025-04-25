import { useState } from "react";

import { BrowserRouter, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./components/Dashboard";
import CreatePage from "./pages/CreatePage";
import PrivateRoute from "./components/PrivateRoute";
import { Provider } from "react-redux";
import store from "./Store/store";

function App() {

  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />}></Route>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/home" element={<HomePage></HomePage>}></Route>
          <Route path="/dashboard" element={<Dashboard></Dashboard>} />
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
    </Provider>
  );
}

export default App;
