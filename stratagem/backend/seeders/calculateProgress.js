import mongoose from 'mongoose';
import Project from '../models/project.model.js';
import dotenv from 'dotenv';

dotenv.config();

const calculateAllProjectsProgress = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const projects = await Project.find();
    console.log(`Found ${projects.length} projects. Calculating progress for each...`);
    
    for (const project of projects) {
      try {
        console.log(`Calculating progress for project: ${project.name}`);
        
        // Manually calculate progress without using the model method
        const Task = mongoose.model('Task');
        const tasks = await Task.find({ project: project._id });
        
        console.log(`Found ${tasks.length} tasks for ${project.name}`);
        
        if (tasks.length === 0) {
          project.progress = 0;
        } else {
          // Calculate progress
          function getTaskProgress(status) {
            if (status === 'submitted') return 25;
            if (status === 'revision') return 50;
            if (status === 'approved') return 75;
            if (status === 'completed') return 100;
            // created, assigned
            return 0;
          }
          
          const total = tasks.reduce((sum, task) => {
            const progress = getTaskProgress(task.status);
            console.log(`  - Task "${task.title}": status=${task.status}, progress=${progress}%`);
            return sum + progress;
          }, 0);
          
          project.progress = Math.round(total / tasks.length);
        }
        
        // Save the updated progress
        await project.save();
        console.log(`Project ${project.name} progress: ${project.progress}%`);
      } catch (projectError) {
        console.error(`Error calculating progress for project ${project.name}:`, projectError);
      }
    }
    
    console.log('Progress calculation completed for all projects!');
    process.exit(0);
  } catch (err) {
    console.error('Error calculating project progress:', err);
    process.exit(1);
  }
};

calculateAllProjectsProgress(); 