import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useSelector } from 'react-redux';

const FileCard = ({ file, onDelete }) => (
  <div className="bg-[#2c323f] rounded-lg p-4 flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-lg bg-[#3a404e]">
        {file.type.startsWith('image/') ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        ) : file.type.includes('pdf') ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-white truncate max-w-[200px]">{file.name}</p>
        <p className="text-xs text-gray-400">
          {(file.size / 1024 / 1024).toFixed(2)} MB
        </p>
      </div>
    </div>
    <div className="flex items-center gap-2">
      <button
        onClick={() => window.open(file.url, '_blank')}
        className="p-2 text-gray-400 hover:text-white transition-colors"
        title="Download"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      </button>
      {onDelete && (
        <button
          onClick={() => onDelete(file._id)}
          className="p-2 text-gray-400 hover:text-red-400 transition-colors"
          title="Delete"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      )}
    </div>
  </div>
);

const DocsFiles = ({ projectId }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const user = useSelector((state) => state.auth.user);
  const project = useSelector((state) => state.projects.byId[projectId]);
  const isOwner = project?.owner === user?._id;

  const onDrop = useCallback(async (acceptedFiles) => {
    if (!isOwner) return;
    
    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      acceptedFiles.forEach(file => {
        formData.append('files', file);
      });
      formData.append('projectId', projectId);

      // TODO: Implement file upload API call
      // const response = await api.post('/files/upload', formData);
      // setFiles(prev => [...prev, ...response.data]);

      // Temporary mock implementation
      const mockFiles = acceptedFiles.map(file => ({
        _id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file),
        uploadedAt: new Date().toISOString(),
        uploadedBy: user._id
      }));
      setFiles(prev => [...prev, ...mockFiles]);
    } catch (err) {
      setError(err.message || 'Failed to upload files');
    } finally {
      setUploading(false);
    }
  }, [projectId, isOwner, user]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: !isOwner || uploading
  });

  const handleDelete = async (fileId) => {
    if (!isOwner) return;

    try {
      // TODO: Implement file delete API call
      // await api.delete(`/files/${fileId}`);
      setFiles(prev => prev.filter(file => file._id !== fileId));
    } catch (err) {
      setError(err.message || 'Failed to delete file');
    }
  };

  return (
    <div className="space-y-6">
      {isOwner && (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive 
              ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10' 
              : 'border-gray-600 hover:border-[var(--color-primary)]'
            }
            ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input {...getInputProps()} />
          <div className="space-y-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-lg font-medium text-white">
              {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
            </p>
            <p className="text-sm text-gray-400">
              or click to select files
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400">
          {error}
        </div>
      )}

      {uploading && (
        <div className="flex items-center justify-center gap-2 text-gray-400">
          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-[var(--color-primary)]"></div>
          <span>Uploading files...</span>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Files</h3>
          <span className="text-sm text-gray-400">{files.length} files</span>
        </div>

        {files.length === 0 ? (
          <p className="text-center text-gray-400 py-8">
            No files uploaded yet
          </p>
        ) : (
          <div className="grid gap-4">
            {files.map(file => (
              <FileCard
                key={file._id}
                file={file}
                onDelete={isOwner ? handleDelete : null}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DocsFiles;
