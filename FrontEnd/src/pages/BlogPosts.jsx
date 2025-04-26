import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FaHeart, FaComment, FaShare, FaBookmark, FaNewspaper } from 'react-icons/fa';
import { postService } from '../services/api';
import Header from '../components/Header';

const EmptyState = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
    <div className="bg-gray-100 rounded-full p-6 mb-6">
      <FaNewspaper className="w-8 h-8 text-gray-400" />
    </div>
    <h2 className="text-2xl font-bold text-gray-800 mb-3">No Blog Posts Available</h2>
    <p className="text-gray-600 mb-8 max-w-md">
      Stay tuned! Our admin team will be adding interesting blog posts soon.
      Check back later for updates and new content.
    </p>
  </div>
);

const BlogPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef();

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await postService.getAllPosts(page);
      const newPosts = Array.isArray(response) ? response : [];
      const morePosts = response.hasMore || false;
      
      // Only add new posts that don't already exist
      setPosts(prevPosts => {
        const existingIds = new Set(prevPosts.map(post => post._id));
        const uniqueNewPosts = newPosts.filter(post => !existingIds.has(post._id));
        return [...prevPosts, ...uniqueNewPosts];
      });
      setHasMore(morePosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setPosts([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [page]);

  useEffect(() => {
    // Cleanup observer on component unmount
    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, []);

  const lastPostRef = useCallback(node => {
    if (loading) return;
    
    // Disconnect previous observer
    if (observer.current) {
      observer.current.disconnect();
    }

    // Create new observer
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });

    // Observe the new node
    if (node) {
      observer.current.observe(node);
    }
  }, [loading, hasMore]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  if (loading && posts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading posts...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-2xl mx-auto px-4 py-8">
        {!loading && posts.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="space-y-6">
              {posts.map((post, index) => (
                <div
                  key={post._id}
                  ref={index === posts.length - 1 ? lastPostRef : null}
                  className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200"
                >
                  {/* Post Header */}
                  <div className="p-4 flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {post.author?.name?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{post.author?.name || 'Anonymous'}</h3>
                      <p className="text-sm text-gray-500">{formatDate(post.createdAt)}</p>
                    </div>
                  </div>

                  {/* Post Image */}
                  {post.image && (
                    <div className="w-full aspect-square bg-gray-100">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Post Content */}
                  <div className="p-4">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">{post.title}</h2>
                    <p className="text-gray-700 whitespace-pre-line">{post.content}</p>
                  </div>

                  {/* Post Actions */}
                  <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex space-x-4">
                        <button className="flex items-center space-x-1 text-gray-600 hover:text-red-500 transition-colors">
                          <FaHeart className="w-5 h-5" />
                          <span>{post.likes || 0}</span>
                        </button>
                        <button className="flex items-center space-x-1 text-gray-600 hover:text-blue-500 transition-colors">
                          <FaComment className="w-5 h-5" />
                          <span>{post.comments?.length || 0}</span>
                        </button>
                        <button className="flex items-center space-x-1 text-gray-600 hover:text-green-500 transition-colors">
                          <FaShare className="w-5 h-5" />
                        </button>
                      </div>
                      <button className="text-gray-600 hover:text-yellow-500 transition-colors">
                        <FaBookmark className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Comments Section */}
                  {post.comments && post.comments.length > 0 && (
                    <div className="px-4 py-2 border-t border-gray-100">
                      <div className="space-y-2">
                        {post.comments.slice(0, 2).map((comment, index) => (
                          <div key={index} className="flex items-start space-x-2">
                            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-xs text-gray-600">
                                {comment.author?.name?.charAt(0) || 'U'}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm">
                                <span className="font-semibold">{comment.author?.name || 'Anonymous'}</span>
                                <span className="text-gray-700 ml-2">{comment.content}</span>
                              </p>
                            </div>
                          </div>
                        ))}
                        {post.comments.length > 2 && (
                          <button className="text-sm text-gray-500 hover:text-blue-500">
                            View all {post.comments.length} comments
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Loading Spinner */}
            {loading && posts.length > 0 && (
              <div className="flex justify-center py-6">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            )}

            {/* No More Posts */}
            {!hasMore && posts.length > 0 && (
              <div className="text-center py-6 text-gray-500">
                You've reached the end! No more posts to load.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BlogPosts; 