import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import darkTheme from './themes/darkTheme';
import { AppProvider } from './context/AppContext';
import { NotificationProvider } from './context/NotificationContext';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './components/dashboard/Dashboard';
import Reports from './components/reports/Reports';
import TaskReminders from './components/reminders/TaskReminders';
import CustomReminders from './components/reminders/CustomReminders';
import './App.css';

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <AppProvider>
        <NotificationProvider>
          <Router>
            <Routes>
              <Route path="/" element={<MainLayout />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="tasks" element={<div>Tasks Page (Coming Soon)</div>} />
                <Route path="reports" element={<Reports />} />
                <Route path="reminders" element={<TaskReminders />} />
                <Route path="custom-reminders" element={<CustomReminders />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </Router>
        </NotificationProvider>
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;
