// Local storage utility functions
// These functions help manage data in local storage as a replacement for database functionality

// Initialize local storage with default data if it doesn't exist
export const initializeLocalStorage = () => {
  const storageKeys = ['projects', 'tasks', 'reminders'];
  
  // Initialize each storage key if it doesn't exist
  storageKeys.forEach(key => {
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, JSON.stringify([]));
    }
  });
  
  // Add some sample data for demonstration if no data exists
  const projects = getData('projects');
  if (projects.length === 0) {
    const sampleProjects = [
      {
        id: '1',
        title: 'Website Redesign',
        description: 'Redesign the company website with modern UI components',
        createdAt: '2025-04-01T08:00:00.000Z',
        updatedAt: '2025-04-01T08:00:00.000Z',
        dueDate: '2025-05-30T16:00:00.000Z'
      },
      {
        id: '2',
        title: 'Mobile App Development',
        description: 'Create a mobile application for iOS and Android platforms',
        createdAt: '2025-03-15T10:30:00.000Z',
        updatedAt: '2025-03-15T10:30:00.000Z',
        dueDate: '2025-06-15T16:00:00.000Z'
      },
      {
        id: '3',
        title: 'Marketing Campaign',
        description: 'Plan and execute Q2 marketing campaign',
        createdAt: '2025-04-01T09:00:00.000Z',
        updatedAt: '2025-04-01T09:00:00.000Z',
        dueDate: '2025-06-10T16:00:00.000Z'
      }
    ];
    
    saveData('projects', sampleProjects);
    
    // Sample tasks
    const sampleTasks = [
      {
        id: '1',
        title: 'Design Homepage Mockup',
        description: 'Create a mockup of the new homepage design',
        projectId: '1',
        status: 'completed',
        priority: 'high',
        createdAt: '2025-04-02T08:00:00.000Z',
        updatedAt: '2025-04-10T14:30:00.000Z',
        completedAt: '2025-04-10T14:30:00.000Z',
        dueDate: '2025-04-15T16:00:00.000Z'
      },
      {
        id: '2',
        title: 'Implement Navigation Menu',
        description: 'Create responsive navigation menu for the website',
        projectId: '1',
        status: 'in-progress',
        priority: 'medium',
        createdAt: '2025-04-03T09:00:00.000Z',
        updatedAt: '2025-04-03T09:00:00.000Z',
        dueDate: '2025-04-20T16:00:00.000Z'
      },
      {
        id: '3',
        title: 'Create User Authentication Flow',
        description: 'Implement user login and registration functionality',
        projectId: '2',
        status: 'pending',
        priority: 'high',
        createdAt: '2025-03-16T11:00:00.000Z',
        updatedAt: '2025-03-16T11:00:00.000Z',
        dueDate: '2025-04-30T16:00:00.000Z'
      },
      {
        id: '4',
        title: 'Design App Logo',
        description: 'Create a logo for the mobile application',
        projectId: '2',
        status: 'completed',
        priority: 'medium',
        createdAt: '2025-03-16T13:00:00.000Z',
        updatedAt: '2025-03-25T10:15:00.000Z',
        completedAt: '2025-03-25T10:15:00.000Z',
        dueDate: '2025-03-30T16:00:00.000Z'
      },
      {
        id: '5',
        title: 'Create Social Media Content Calendar',
        description: 'Plan content for social media posts for Q2 campaign',
        projectId: '3',
        status: 'in-progress',
        priority: 'medium',
        createdAt: '2025-04-02T14:00:00.000Z',
        updatedAt: '2025-04-02T14:00:00.000Z',
        dueDate: '2025-04-25T16:00:00.000Z'
      },
      {
        id: '6',
        title: 'Design Email Newsletter Template',
        description: 'Create email template for the marketing campaign',
        projectId: '3',
        status: 'pending',
        priority: 'medium',
        createdAt: '2025-04-03T10:00:00.000Z',
        updatedAt: '2025-04-03T10:00:00.000Z',
        dueDate: '2025-05-05T16:00:00.000Z'
      }
    ];
    
    saveData('tasks', sampleTasks);
    
    // Sample reminders
    const sampleReminders = [
      {
        id: '1',
        taskId: '2',
        title: 'Reminder: Implement Navigation Menu',
        message: 'Don\'t forget to complete the navigation menu implementation',
        recipients: 'user@example.com',
        timeBeforeDeadline: 24,
        status: 'pending',
        createdAt: '2025-04-15T09:00:00.000Z'
      },
      {
        id: '2',
        taskId: '5',
        title: 'Reminder: Social Media Content Calendar',
        message: 'Social media content calendar deadline approaching',
        recipients: 'user@example.com, manager@example.com',
        timeBeforeDeadline: 48,
        status: 'pending',
        createdAt: '2025-04-20T14:30:00.000Z'
      }
    ];
    
    saveData('reminders', sampleReminders);
  }
};

// Get all data for a collection
export const getData = (key) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`Error retrieving ${key} from local storage:`, error);
    return [];
  }
};

// Save data to local storage
export const saveData = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Error saving ${key} to local storage:`, error);
    return false;
  }
};

// Get a specific item by ID
export const getItemById = (key, id) => {
  try {
    const items = getData(key);
    return items.find(item => item.id === id) || null;
  } catch (error) {
    console.error(`Error getting item from ${key} by id:`, error);
    return null;
  }
};

// Add a new item to a collection
export const addItem = (key, item) => {
  try {
    const items = getData(key);
    
    // If no ID is provided, generate one
    if (!item.id) {
      item.id = Date.now().toString();
    }
    
    items.push(item);
    saveData(key, items);
    
    return item;
  } catch (error) {
    console.error(`Error adding item to ${key}:`, error);
    return null;
  }
};

// Update an existing item
export const updateItem = (key, id, updates) => {
  try {
    const items = getData(key);
    const index = items.findIndex(item => item.id === id);
    
    if (index !== -1) {
      items[index] = { ...items[index], ...updates };
      saveData(key, items);
      return items[index];
    }
    
    return null;
  } catch (error) {
    console.error(`Error updating item in ${key}:`, error);
    return null;
  }
};

// Delete an item
export const deleteItem = (key, id) => {
  try {
    const items = getData(key);
    const updatedItems = items.filter(item => item.id !== id);
    
    if (items.length !== updatedItems.length) {
      saveData(key, updatedItems);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error deleting item from ${key}:`, error);
    return false;
  }
};

// Get items by a specific field value
export const getItemsByField = (key, field, value) => {
  try {
    const items = getData(key);
    return items.filter(item => item[field] === value);
  } catch (error) {
    console.error(`Error getting items from ${key} by field:`, error);
    return [];
  }
};