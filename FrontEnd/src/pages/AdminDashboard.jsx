import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaTrash, FaEdit, FaEye, FaSpinner, FaTimes, FaCalendar } from 'react-icons/fa';
import CreatePost from '../components/CreatePost';
import { postService, authService } from '../services/api';

const AdminDashboard = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [previewPost, setPreviewPost] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication
    if (!authService.isAuthenticated()) {
      navigate('/login');
      return;
    }
    fetchPosts();
  }, [navigate]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const data = await postService.getUserPosts();
      setPosts(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError('Failed to fetch posts. Please try again later.');
      setPosts([]);
      setLoading(false);
    }
  };

  const handleCreatePost = async (formData) => {
    setIsSubmitting(true);
    setError('');
    
    try {
      const newPost = await postService.createPost(formData);
      setPosts(prev => [newPost, ...prev]);
      setSuccessMessage('Post created successfully!');
      setShowCreatePost(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create post. Please try again.');
      if (err.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdatePost = async (formData) => {
    setIsSubmitting(true);
    setError('');
    
    try {
      const updatedPost = await postService.updatePost(editingPost._id, formData);
      setPosts(prev => prev.map(post => 
        post._id === updatedPost._id ? updatedPost : post
      ));
      setSuccessMessage('Post updated successfully!');
      setShowCreatePost(false);
      setEditingPost(null);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!postId) {
      setError('Invalid post ID');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      await postService.deletePost(postId);
      setPosts(prev => prev.filter(post => post._id !== postId));
      setSuccessMessage('Post deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete post. Please try again.');
      if (err.response?.status === 401) {
        navigate('/login');
      }
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleEditPost = (post) => {
    setEditingPost(post);
    setShowCreatePost(true);
  };

  const handlePreviewPost = (post) => {
    setPreviewPost(post);
  };

  const handleClosePreview = () => {
    setPreviewPost(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <FaSpinner className="animate-spin h-12 w-12 text-indigo-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 scrollbar-hide">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="mt-1 text-gray-600">Manage your blog posts and content</p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:border-indigo-300 transition-all duration-200 shadow-sm hover:shadow"
            >
              <FaEye className="mr-2 text-indigo-600" />
              View Blog
            </button>
            <button
              onClick={() => {
                setEditingPost(null);
                setShowCreatePost(true);
              }}
              className="flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <FaPlus className="mr-2" />
              New Post
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-md animate-fade-in">
            <p className="text-red-700">{error}</p>
          </div>
        )}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-md animate-fade-in">
            <p className="text-green-700">{successMessage}</p>
          </div>
        )}

        {showCreatePost ? (
          <CreatePost 
            onSubmit={editingPost ? handleUpdatePost : handleCreatePost}
            isSubmitting={isSubmitting}
            onCancel={() => {
              setShowCreatePost(false);
              setEditingPost(null);
            }}
            initialData={editingPost}
          />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <div
                  key={post._id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 hover:border-indigo-100 transform hover:-translate-y-1"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-1 hover:line-clamp-none transition-all duration-200">
                        {post.title}
                      </h3>
                    </div>
                    <p className="mt-2 text-sm text-gray-600 line-clamp-3 hover:line-clamp-none transition-all duration-200">
                      {post.content}
                    </p>
                    <div className="mt-4 flex items-center text-sm text-gray-500">
                      <FaCalendar className="mr-2 text-indigo-500" />
                      {new Date(post.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="mt-4 flex justify-end space-x-3">
                      <button
                        onClick={() => handlePreviewPost(post)}
                        className="text-blue-600 hover:text-blue-800 transition-colors p-2 hover:bg-blue-50 rounded-full"
                        title="Preview"
                      >
                        <FaEye className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleEditPost(post)}
                        className="text-indigo-600 hover:text-indigo-800 transition-colors p-2 hover:bg-indigo-50 rounded-full"
                        title="Edit"
                      >
                        <FaEdit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeletePost(post._id)}
                        className="text-red-600 hover:text-red-800 transition-colors p-2 hover:bg-red-50 rounded-full"
                        title="Delete"
                      >
                        <FaTrash className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {posts.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
                <FaPlus className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-4 text-gray-500 text-lg">
                  No posts found. Create your first post by clicking the "New Post" button.
                </p>
                <button
                  onClick={() => {
                    setEditingPost(null);
                    setShowCreatePost(true);
                  }}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-all duration-200"
                >
                  <FaPlus className="mr-2" />
                  Create New Post
                </button>
              </div>
            )}
          </>
        )}

        {/* Post Preview Modal */}
        {previewPost && (
          <>
            {/* Backdrop with blur effect */}
            <div 
              className="fixed inset-0 backdrop-blur-sm bg-black/30 transition-opacity"
              onClick={handleClosePreview}
            />
            
            {/* Modal Content */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-20 scrollbar-hide">
              <div 
                className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto scrollbar-hide transform transition-all duration-200"
                onClick={e => e.stopPropagation()}
              >
                <div className="absolute top-4 right-4">
                  <button
                    onClick={handleClosePreview}
                    className="text-gray-400 hover:text-gray-500 transition-colors p-2 hover:bg-gray-100 rounded-full"
                  >
                    <FaTimes className="h-6 w-6" />
                  </button>
                </div>

                <div className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">{previewPost.title}</h2>
                  <div className="prose max-w-none">
                    <p className="text-gray-700 whitespace-pre-line">{previewPost.content}</p>
                  </div>
                  <div className="mt-6 flex items-center text-sm text-gray-500">
                    <FaCalendar className="mr-2 text-indigo-500" />
                    {new Date(previewPost.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard; 