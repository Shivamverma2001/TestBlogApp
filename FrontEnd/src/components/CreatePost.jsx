import React, { useState, useEffect } from 'react';
import { FaTimes, FaSpinner } from 'react-icons/fa';

const CreatePost = ({ onSubmit, isSubmitting, onCancel, initialData }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        content: initialData.content || ''
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    try {
      await onSubmit(formData);
      setFormData({ title: '', content: '' });
      setErrors({});
    } catch (err) {
      setErrors(prev => ({
        ...prev,
        submit: err.message || 'Failed to create post'
      }));
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="flex justify-between items-center p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">
          {initialData ? 'Edit Post' : 'Create New Post'}
        </h2>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-500"
        >
          <FaTimes className="h-5 w-5" />
        </button>
      </div>

      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded-lg border ${
                errors.title ? 'border-red-500' : 'border-gray-200'
              } focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-colors`}
              placeholder="Enter post title"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content
            </label>
            <textarea
              id="content"
              name="content"
              required
              rows={12}
              value={formData.content}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded-lg border ${
                errors.content ? 'border-red-500' : 'border-gray-200'
              } focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-colors`}
              placeholder="Write your post content here..."
            />
            {errors.content && (
              <p className="mt-1 text-sm text-red-600">{errors.content}</p>
            )}
          </div>

          {errors.submit && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-md">
              <p className="text-red-700">{errors.submit}</p>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <FaSpinner className="animate-spin mr-2" />
                  {initialData ? 'Updating...' : 'Creating...'}
                </span>
              ) : (
                initialData ? 'Update Post' : 'Create Post'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;