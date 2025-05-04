import React, { useState, useEffect } from 'react';

// Replace with actual API call
const searchUsers = async (query) => {
  const mockUsers = [
    { id: 1, name: 'Alice', avatar: 'https://i.pravatar.cc/40?u=alice' },
    { id: 2, name: 'Bob', avatar: 'https://i.pravatar.cc/40?u=bob' },
    { id: 3, name: 'Charlie', avatar: 'https://i.pravatar.cc/40?u=charlie' },
  ];
  return mockUsers.filter(user => user.name.toLowerCase().includes(query.toLowerCase()));
};

const CreateProject = () => {
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);

  useEffect(() => {
    if (search.trim()) {
      searchUsers(search).then(setSearchResults);
    } else {
      setSearchResults([]);
    }
  }, [search]);

  const toggleMember = (user) => {
    if (selectedMembers.find(m => m.id === user.id)) {
      setSelectedMembers(prev => prev.filter(m => m.id !== user.id));
    } else {
      setSelectedMembers(prev => [...prev, user]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const projectData = {
      name: projectName,
      description,
      members: selectedMembers.map(m => m.id),
    };
    console.log('Creating project:', projectData);
    // Submit to backend here
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className="max-w-md mx-auto p-6 bg-white shadow-md rounded-lg flex flex-col gap-4"
    >
      <h2 className="text-2xl font-bold mb-2">Create Project</h2>

      <input
        type="text"
        placeholder="Project Name"
        value={projectName}
        onChange={(e) => setProjectName(e.target.value)}
        required
        className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <textarea
        placeholder="Project Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
        className="border border-gray-300 rounded px-3 py-2 h-24 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <input
        type="text"
        placeholder="Search Members"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <div className="flex flex-wrap gap-3">
        {searchResults.map(user => {
          const isSelected = selectedMembers.find(m => m.id === user.id);
          return (
            <img
              key={user.id}
              src={user.avatar}
              alt={user.name}
              title={user.name}
              onClick={() => toggleMember(user)}
              className={`w-10 h-10 rounded-full cursor-pointer border-2 transition-all duration-200 ${
                isSelected ? 'border-blue-500 scale-110' : 'border-transparent hover:scale-105'
              }`}
            />
          );
        })}
      </div>

      <button
        type="submit"
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
      >
        Create Project
      </button>
    </form>
  );
};

export default CreateProject;
