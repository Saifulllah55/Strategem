import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchProjects } from "../Store/features/projectSlice";
import { fetchTasks } from "../Store/features/taskSlice";
import { calculateProjectProgress, getTaskStatusGrouped } from "../utils/projectUtils";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { FiDownload, FiInfo, FiBarChart2, FiPieChart } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const ProjectAnalyticsPage = () => {
  const dispatch = useDispatch();
  const { projects } = useSelector((state) => state.projects);
  const { tasks } = useSelector((state) => state.tasks);
  const [selectedProject, setSelectedProject] = useState(null);
  const [viewMode, setViewMode] = useState('graphs');
  const reportRef = useRef(null);

  useEffect(() => {
    dispatch(fetchProjects());
    dispatch(fetchTasks());
  }, [dispatch]);

  // Group tasks by project
  const getProjectTasks = (projectId) => {
    return tasks.filter(task => task.project === projectId);
  };

  // Get all project data with progress calculations
  const projectsWithProgress = projects.map(project => {
    const projectTasks = getProjectTasks(project._id);
    const progress = calculateProjectProgress(projectTasks);
    const taskStats = getTaskStatusGrouped(projectTasks);
    
    return {
      ...project,
      progress,
      taskStats
    };
  });

  // Progress chart data (doughnut chart)
  const progressChartData = {
    labels: projectsWithProgress.map(p => p.name),
    datasets: [
      {
        label: 'Project Progress (%)',
        data: projectsWithProgress.map(p => p.progress),
        backgroundColor: [
          'rgba(54, 162, 235, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(153, 102, 255, 0.8)',
          'rgba(255, 99, 132, 0.8)',
          'rgba(255, 159, 64, 0.8)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Task status chart for selected project or all projects
  const getTaskStatusChartData = () => {
    let combinedStats;
    
    if (selectedProject) {
      const project = projectsWithProgress.find(p => p._id === selectedProject);
      combinedStats = project ? project.taskStats : { notStarted: 0, inProgress: 0, completed: 0, inReview: 0 };
    } else {
      // Combine all project stats
      combinedStats = projectsWithProgress.reduce((acc, project) => {
        acc.notStarted += project.taskStats.notStarted;
        acc.inProgress += project.taskStats.inProgress;
        acc.completed += project.taskStats.completed;
        acc.inReview += project.taskStats.inReview;
        return acc;
      }, { notStarted: 0, inProgress: 0, completed: 0, inReview: 0 });
    }

    return {
      labels: ['Not Started', 'In Progress', 'In Review', 'Completed'],
      datasets: [
        {
          label: 'Number of Tasks',
          data: [
            combinedStats.notStarted,
            combinedStats.inProgress, 
            combinedStats.inReview,
            combinedStats.completed
          ],
          backgroundColor: [
            'rgba(255, 99, 132, 0.8)',
            'rgba(255, 206, 86, 0.8)',
            'rgba(54, 162, 235, 0.8)',
            'rgba(75, 192, 192, 0.8)',
          ],
        },
      ],
    };
  };

  // Bar chart options
  const barChartOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: selectedProject 
          ? `Task Status for ${projectsWithProgress.find(p => p._id === selectedProject)?.name || 'Selected Project'}`
          : 'Task Status Across All Projects',
        font: {
          size: 16,
        },
      },
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0
        }
      }
    }
  };

  // Generate PDF report for a project
  const generateReport = async (project) => {
    if (!reportRef.current) return;
    
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        logging: false,
        useCORS: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210;
      const imgHeight = canvas.height * imgWidth / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`${project.name}_report.pdf`);
    } catch (error) {
      console.error("Error generating report:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)] p-6">
      <h1 className="text-3xl font-bold mb-6">Project Analytics</h1>
      
      {/* Project Selector */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <select 
          value={selectedProject || ""}
          onChange={(e) => setSelectedProject(e.target.value || null)}
          className="bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] rounded-md px-4 py-2"
        >
          <option value="">All Projects</option>
          {projectsWithProgress.map(project => (
            <option key={project._id} value={project._id}>
              {project.name}
            </option>
          ))}
        </select>
        
        {/* View Toggle */}
        <div className="flex rounded-md overflow-hidden">
          <button 
            onClick={() => setViewMode('graphs')}
            className={`flex items-center gap-2 px-4 py-2 ${
              viewMode === 'graphs' 
                ? 'bg-[var(--color-primary)] text-white' 
                : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)]'
            }`}
          >
            <FiBarChart2 />
            Graphs
          </button>
          <button 
            onClick={() => setViewMode('details')}
            className={`flex items-center gap-2 px-4 py-2 ${
              viewMode === 'details' 
                ? 'bg-[var(--color-primary)] text-white' 
                : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)]'
            }`}
          >
            <FiInfo />
            Project Details
          </button>
        </div>
      </div>
      
      {viewMode === 'graphs' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Progress Chart */}
          <div className="bg-[var(--color-surface)] p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Project Progress</h2>
            <div className="h-80">
              <Doughnut 
                data={progressChartData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                    },
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          return `${context.label}: ${context.raw}% complete`;
                        }
                      }
                    }
                  }
                }}
              />
            </div>
          </div>
          
          {/* Task Status Chart */}
          <div className="bg-[var(--color-surface)] p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Task Status Distribution</h2>
            <div className="h-80">
              <Bar 
                data={getTaskStatusChartData()} 
                options={barChartOptions} 
              />
            </div>
          </div>
        </div>
      ) : (
        <div>
          {/* Project Details Table */}
          <div className="bg-[var(--color-surface)] rounded-lg shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-[var(--color-surface-hover)]">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium">Project Name</th>
                  <th className="px-6 py-3 text-left text-sm font-medium">Progress</th>
                  <th className="px-6 py-3 text-left text-sm font-medium">Tasks</th>
                  <th className="px-6 py-3 text-left text-sm font-medium">Last Updated</th>
                  <th className="px-6 py-3 text-left text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {projectsWithProgress.map(project => {
                  const projectTasks = getProjectTasks(project._id);
                  return (
                    <tr key={project._id} className="hover:bg-[var(--color-surface-hover)]">
                      <td className="px-6 py-4 text-sm font-medium">{project.name}</td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                            <div 
                              className="bg-blue-600 h-2.5 rounded-full" 
                              style={{ width: `${project.progress}%` }}
                            ></div>
                          </div>
                          <span>{project.progress}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex flex-col">
                          <span>Total: {projectTasks.length}</span>
                          <span className="text-xs text-green-500">Completed: {project.taskStats.completed}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {project.updatedAt ? 
                          formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true }) : 
                          'N/A'
                        }
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button 
                          onClick={() => {
                            setSelectedProject(project._id);
                            setTimeout(() => generateReport(project), 100);
                          }}
                          className="text-blue-500 hover:text-blue-700 flex items-center gap-1"
                        >
                          <FiDownload /> Report
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {/* Project Report Template (hidden, used for PDF generation) */}
          {selectedProject && (
            <div className="hidden">
              <div ref={reportRef} className="bg-white p-8 w-[800px]">
                {(() => {
                  const project = projectsWithProgress.find(p => p._id === selectedProject);
                  if (!project) return null;
                  
                  const projectTasks = getProjectTasks(project._id);
                  return (
                    <>
                      <h1 className="text-3xl font-bold mb-6 text-center">Project Report</h1>
                      <h2 className="text-2xl font-bold mb-4">{project.name}</h2>
                      
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-2">Project Overview</h3>
                        <p className="mb-2"><strong>Description:</strong> {project.description || 'No description provided'}</p>
                        <p className="mb-2"><strong>Progress:</strong> {project.progress}% complete</p>
                        <p className="mb-2"><strong>Total Tasks:</strong> {projectTasks.length}</p>
                        {project.dueDate && (
                          <p className="mb-2"><strong>Due Date:</strong> {new Date(project.dueDate).toLocaleDateString()}</p>
                        )}
                      </div>
                      
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-2">Task Status Summary</h3>
                        <ul>
                          <li>Not Started: {project.taskStats.notStarted}</li>
                          <li>In Progress: {project.taskStats.inProgress}</li>
                          <li>In Review: {project.taskStats.inReview}</li>
                          <li>Completed: {project.taskStats.completed}</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Task Details</h3>
                        <table className="w-full border-collapse border border-gray-300">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="border border-gray-300 px-4 py-2">Task Name</th>
                              <th className="border border-gray-300 px-4 py-2">Status</th>
                              <th className="border border-gray-300 px-4 py-2">Assigned To</th>
                              <th className="border border-gray-300 px-4 py-2">Due Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {projectTasks.map(task => (
                              <tr key={task._id}>
                                <td className="border border-gray-300 px-4 py-2">{task.title}</td>
                                <td className="border border-gray-300 px-4 py-2 capitalize">{task.status}</td>
                                <td className="border border-gray-300 px-4 py-2">
                                  {task.assignedTo ? task.assignedTo.username || 'User' : 'Unassigned'}
                                </td>
                                <td className="border border-gray-300 px-4 py-2">
                                  {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      
                      <div className="mt-8 text-center text-sm text-gray-500">
                        <p>Report generated on {new Date().toLocaleString()}</p>
                        <p>Stratagem Project Management</p>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectAnalyticsPage;
