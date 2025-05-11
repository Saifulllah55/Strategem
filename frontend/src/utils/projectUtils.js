// Helper functions for calculating project progress and statistics

/**
 * Calculate the progress percentage of a task based on its status
 * @param {string} status - The current status of the task
 * @returns {number} - The progress percentage (0-100)
 */
export const calculateTaskProgress = (status) => {
  switch (status) {
    case 'created':
      return 0;
    case 'assigned':
      return 25;
    case 'submitted':
      return 50;
    case 'revision':
      return 75;
    case 'approved':
      return 100;
    default:
      return 0;
  }
};

/**
 * Calculate the overall progress of a project based on its tasks
 * @param {Array} tasks - Array of tasks associated with the project
 * @returns {number} - The project progress percentage (0-100)
 */
export const calculateProjectProgress = (tasks) => {
  if (!tasks || tasks.length === 0) {
    return 0;
  }
  
  const totalProgress = tasks.reduce((sum, task) => {
    return sum + calculateTaskProgress(task.status);
  }, 0);
  
  return Math.round(totalProgress / tasks.length);
};

/**
 * Get task statistics by status
 * @param {Array} tasks - Array of tasks to analyze
 * @returns {Object} - Object with counts for each status
 */
export const getTaskStatusCounts = (tasks) => {
  const statusCounts = {
    created: 0,
    assigned: 0,
    submitted: 0,
    revision: 0,
    approved: 0
  };
  
  if (!tasks || tasks.length === 0) {
    return statusCounts;
  }
  
  tasks.forEach(task => {
    if (statusCounts.hasOwnProperty(task.status)) {
      statusCounts[task.status]++;
    }
  });
  
  return statusCounts;
};

/**
 * Group tasks by status for visualization
 * @param {Array} tasks - Array of tasks to analyze 
 * @returns {Object} - Object with grouped task counts for chart display
 */
export const getTaskStatusGrouped = (tasks) => {
  const statusCounts = getTaskStatusCounts(tasks);
  
  return {
    notStarted: statusCounts.created,
    inProgress: statusCounts.assigned + statusCounts.revision,
    completed: statusCounts.approved,
    inReview: statusCounts.submitted
  };
};
