// This script tests PDF generation capabilities from the backend
// You can run this script with: node test-pdf-generation.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Project from './models/project.model.js';
import Task from './models/task.model.js';
import User from './models/user.model.js';

// Since we're using ES modules, __dirname is not available directly
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Function to generate a simple report for a project
const generateProjectReport = async (projectId) => {
  try {
    // For actual PDF generation, you would use jspdf or a similar library
    // This is just a simple text-based representation for testing purposes
    
    const project = await Project.findById(projectId)
      .populate('members', 'name email')
      .populate({
        path: 'tasks',
        select: 'title status dueDate assignedTo',
        populate: {
          path: 'assignedTo',
          select: 'name'
        }
      });
    
    if (!project) {
      console.error('Project not found');
      return null;
    }
    
    // Calculate project statistics
    const totalTasks = project.tasks.length;
    const completedTasks = project.tasks.filter(task => task.status === 'completed').length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    // Format project report content
    let reportContent = `
PROJECT REPORT
--------------
Project: ${project.name}
Description: ${project.description}
Start Date: ${new Date(project.startDate).toLocaleDateString()}
End Date: ${new Date(project.endDate).toLocaleDateString()}
Status: ${project.status}
Progress: ${completionRate}% (${completedTasks}/${totalTasks} tasks completed)

Team Members:
${project.members.map(member => `- ${member.name} (${member.email})`).join('\n')}

Tasks:
${project.tasks.map(task => 
  `- ${task.title} | Status: ${task.status} | Due: ${new Date(task.dueDate).toLocaleDateString()} | Assigned: ${task.assignedTo ? task.assignedTo.name : 'Unassigned'}`
).join('\n')}
`;

    // Write the report to a text file
    const reportPath = path.join(__dirname, `report-${project._id}.txt`);
    fs.writeFileSync(reportPath, reportContent);
    
    console.log(`Project report generated at ${reportPath}`);
    return reportPath;
  } catch (error) {
    console.error('Error generating project report:', error);
    return null;
  }
};

// Main function
const testPdfGeneration = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Find a project to generate a report for
    const project = await Project.findOne({}).exec();
    
    if (!project) {
      console.error('No projects found in the database');
      return;
    }
    
    console.log(`Generating report for project: ${project.name}`);
    
    // Generate the project report
    const reportPath = await generateProjectReport(project._id);
    
    if (reportPath) {
      console.log('Report generation test completed successfully');
      console.log(`In a real application, this would be converted to a PDF using jspdf or a similar library`);
    } else {
      console.error('Report generation failed');
    }
  } catch (error) {
    console.error('Error running PDF generation test:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

testPdfGeneration();
