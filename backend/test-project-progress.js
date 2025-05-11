import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Project from './models/project.model.js';
import Task from './models/task.model.js';
import { connectDB } from './lib/database.js';

dotenv.config();

// Test function to calculate and test project progress
async function testProjectProgress() {
  console.log('Testing project progress calculation...');
  
  try {
    // Connect to the database
    await connectDB();
    console.log('Connected to MongoDB');
    
    // Find a project to test with
    const projects = await Project.find().limit(1);
    
    if (projects.length === 0) {
      console.log('No projects found. Create some projects first.');
      return;
    }
    
    const project = projects[0];
    console.log(`Working with project: ${project.name} (${project._id})`);
    
    // Get all tasks for the project
    const tasks = await Task.find({ project: project._id });
    console.log(`Found ${tasks.length} tasks for the project`);
    
    if (tasks.length === 0) {
      console.log('This project has no tasks. Creating test tasks...');
      
      // Create some test tasks with different statuses
      const statuses = ['todo', 'in-progress', 'completed', 'revision', 'submitted', 'approved'];
      
      for (const status of statuses) {
        const task = new Task({
          title: `Test task - ${status}`,
          description: `A test task with status ${status}`,
          project: project._id,
          status: status,
          createdBy: project.owner,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Due 1 week from now
        });
        
        await task.save();
        console.log(`Created test task with status: ${status}`);
      }
      
      // Refresh tasks list
      const newTasks = await Task.find({ project: project._id });
      console.log(`Now we have ${newTasks.length} tasks for the project`);
    }
    
    // Calculate progress before
    console.log(`Project progress before: ${project.progress}%`);
    
    // Call the calculateProgress method
    await project.calculateProgress();
    
    // Reload project to get updated progress
    const updatedProject = await Project.findById(project._id);
    console.log(`Project progress after: ${updatedProject.progress}%`);
    
    // Manually calculate progress to verify
    const statusValues = {
      'todo': 0,
      'pending': 0,
      'in-progress': 50,
      'completed': 100,
      'revision': 50,
      'submitted': 25,
      'approved': 75
    };
    
    const tasks2 = await Task.find({ project: project._id });
    const total = tasks2.reduce((sum, task) => {
      return sum + (statusValues[task.status] || 0);
    }, 0);
    
    const manualProgress = Math.round(total / tasks2.length);
    console.log(`Manually calculated progress: ${manualProgress}%`);
    
    // Verify the results
    if (updatedProject.progress === manualProgress) {
      console.log('✅ Progress calculation is working correctly!');
    } else {
      console.log('❌ Progress calculation mismatch!');
      console.log('Tasks and their statuses:');
      for (const task of tasks2) {
        console.log(`- ${task.title}: ${task.status} (${statusValues[task.status] || 0}%)`);
      }
    }
    
  } catch (error) {
    console.error('Error testing project progress:', error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the test
testProjectProgress();
