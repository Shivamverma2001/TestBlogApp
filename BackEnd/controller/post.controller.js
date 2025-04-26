import Post from "../models/post.model.js";
import User from "../models/user.model.js";

export const createPost = async (req, res) => {
  try {
    const { title, content } = req.body;
    const post = await Post.create({ title, content, author: req.user._id });
    
    // Update user's posts array
    await User.findByIdAndUpdate(
      req.user._id,
      { $push: { posts: post._id } },
      { new: true }
    );

    // Populate author details in response
    const populatedPost = await Post.findById(post._id).populate("author", "name");
    res.status(201).json(populatedPost);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: 'Error creating post' });
  }
};

export const getPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "name")
      .lean();

    // Add isLiked field to each post
    const postsWithLikeInfo = posts.map(post => {
      const likesCount = post.likes ? post.likes.length : 0;
      const isLiked = req.user ? post.likes?.some(likeId => likeId.toString() === req.user._id.toString()) : false;
      
      return {
        ...post,
        isLiked,
        likes: likesCount
      };
    });

    const totalPosts = await Post.countDocuments();

    res.status(200).json({
      posts: postsWithLikeInfo,
      currentPage: page,
      totalPages: Math.ceil(totalPosts / limit),
      hasMore: skip + posts.length < totalPosts
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Error fetching posts' });
  }
};

export const getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id).populate("author", "name");
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.status(200).json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ message: 'Error fetching post' });
  }
};

export const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    const post = await Post.findByIdAndUpdate(
      id, 
      { title, content }, 
      { new: true }
    ).populate("author", "name");
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.status(200).json(post);
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ message: 'Error updating post' });
  }
};

export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Remove post from user's posts array
    await User.findByIdAndUpdate(
      post.author,
      { $pull: { posts: post._id } }
    );

    // Delete the post
    await Post.findByIdAndDelete(id);
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: 'Error deleting post' });
  }
};

export const getPostsByUser = async (req, res) => {
  try {
    const userId = req.user._id; // Get the current user's ID
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ author: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "name")
      .lean();

    const totalPosts = await Post.countDocuments({ author: userId });

    res.status(200).json({
      posts,
      currentPage: page,
      totalPages: Math.ceil(totalPosts / limit),
      hasMore: skip + posts.length < totalPosts
    });
  } catch (error) {
    console.error('Error fetching user posts:', error);
    res.status(500).json({ message: 'Error fetching user posts' });
  }
};

// Add likePost function to handle post likes
export const likePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id; // Assuming you have user info in req.user from auth middleware

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const isLiked = post.likes.includes(userId);
    
    if (isLiked) {
      // Unlike the post
      post.likes = post.likes.filter(id => !id.equals(userId));
    } else {
      // Like the post
      post.likes.push(userId);
    }

    await post.save();

    res.json({
      likes: post.likes.length,
      isLiked: !isLiked
    });
  } catch (error) {
    console.error('Error in likePost:', error);
    res.status(500).json({ message: 'Error processing like' });
  }
};

// Modify getAllPosts to include like information
export const getAllPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'name')
      .lean();

    // Add isLiked field to each post
    const postsWithLikeInfo = posts.map(post => {
      const likesCount = post.likes ? post.likes.length : 0;
      const isLiked = req.user ? post.likes?.some(likeId => likeId.toString() === req.user._id.toString()) : false;
      
      return {
        ...post,
        isLiked,
        likes: likesCount
      };
    });

    res.json({
      posts: postsWithLikeInfo,
      currentPage: page,
      totalPages: Math.ceil(await Post.countDocuments() / limit),
      hasMore: skip + posts.length < await Post.countDocuments()
    });
  } catch (error) {
    console.error('Error in getAllPosts:', error);
    res.status(500).json({ message: 'Error fetching posts' });
  }
};

export const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Get user details to store name
    const user = await User.findById(userId).select('name');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const newComment = {
      content,
      author: {
        _id: userId,
        name: user.name
      },
      createdAt: new Date()
    };

    post.comments.push(newComment);
    await post.save();

    // Get the newly added comment
    const addedComment = post.comments[post.comments.length - 1];
    
    res.status(201).json(addedComment);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Error adding comment' });
  }
};

