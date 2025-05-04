import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

function ProjectPage() {
  const { projectId } = useParams(); 
  const projects = useSelector((state) => state.projects.projects || []);
  const [project, setProject] = useState(null); 

  useEffect(() => {
    console.log(projects);
    const matchedProject = projects.find((proj) => proj._id === projectId);
    setProject(matchedProject);
  }, [projectId, projects]);

  if (!projects.length) {
    return <p>No projects available. Please try again later.</p>; 
  }

  if (!project) {
    return <p>Loading or project not found...</p>; 
  }

  return (
    <div>
      <h1>Project: {project.title}</h1>
      <p>Description: {project.description}</p>
      <p>Members: {project.members.map((member) => member.user.name).join(", ")}</p>
      {/* You can add more fields depending on what you want to display */}
    </div>
  );
}

export default ProjectPage;
