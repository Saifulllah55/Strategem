import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTasksByProjectId } from '../../Store/features/taskSlice';

const Schedule = ({ projectId }) => {
  const dispatch = useDispatch();
  const tasks = useSelector((state) => {
    const tasksById = state.tasks.byId;
    const allIds = state.tasks.allIds;
    return allIds.map(id => tasksById[id]);
  });

  useEffect(() => {
    if (projectId) {
      dispatch(fetchTasksByProjectId(projectId));
    }
  }, [dispatch, projectId]);

  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const groupTasksByDate = () => {
    const grouped = {};
    tasks.forEach(task => {
      const date = task.dueDate ? formatDate(task.dueDate) : 'No Due Date';
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(task);
    });
    return grouped;
  };

  const groupedTasks = groupTasksByDate();
  const sortedDates = Object.keys(groupedTasks).sort((a, b) => {
    if (a === 'No Due Date') return 1;
    if (b === 'No Due Date') return -1;
    return new Date(a) - new Date(b);
  });

  return (
    <div className="p-6 bg-[#121620] min-h-screen">
      <h1 className="text-2xl font-semibold text-white mb-6">Project Timeline</h1>
      
      <div className="space-y-8">
        {sortedDates.map(date => (
          <div key={date} className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-700" />
            
            {/* Date header */}
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center z-10 relative">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="ml-4 text-lg font-medium text-gray-300">{date}</h2>
            </div>

            {/* Tasks for this date */}
            <div className="ml-12 space-y-4">
              {groupedTasks[date].map(task => (
                <div 
                  key={task._id}
                  className="bg-[#1c2331] rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-white font-medium">{task.title}</h3>
                      {task.description && (
                        <p className="text-gray-400 text-sm mt-1">{task.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {task.assignee && (
                        <div className="flex items-center gap-1">
                          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                            {task.assignee.username?.[0]?.toUpperCase() || '?'}
                          </div>
                          <span className="text-sm text-gray-300">{task.assignee.username}</span>
                        </div>
                      )}
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        task.status === 'approved' ? 'bg-green-900 text-green-300' :
                        task.status === 'submitted' ? 'bg-yellow-900 text-yellow-300' :
                        task.status === 'revision' ? 'bg-purple-900 text-purple-300' :
                        task.status === 'assigned' ? 'bg-blue-900 text-blue-300' :
                        'bg-gray-900 text-gray-300'
                      }`}>
                        {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Schedule;
