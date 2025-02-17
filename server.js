require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const multer = require('multer');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  resetToken: { type: String, default: null },
  avatar: { type: String },
});

// Hash Password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.model('User', userSchema);

// Nodemailer Transporter for Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

// User Registration with Email Verification
app.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (await User.findOne({ email })) return res.status(400).json({ error: 'Email already in use' });

    const user = new User({ username, email, password });
    await user.save();

    // Send Verification Email
    const verificationToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    const verificationLink = `http://localhost:3000/verify/${verificationToken}`;

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'Verify Your Email',
      text: `Click the link to verify your email: ${verificationLink}`,
    });

    res.status(201).json({ message: 'User registered successfully. Check your email to verify your account.' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Email Verification Endpoint
app.get('/verify/:token', async (req, res) => {
  try {
    const decoded = jwt.verify(req.params.token, process.env.JWT_SECRET);
    await User.findByIdAndUpdate(decoded.userId, { isVerified: true });
    res.status(200).json({ message: 'Email verified successfully!' });
  } catch (error) {
    res.status(400).json({ error: 'Invalid or expired token' });
  }
});

// User Login
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid email or password' });

    if (!user.isVerified) return res.status(400).json({ error: 'Please verify your email first' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid email or password' });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Password Reset Request
app.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'User not found' });

    // Generate Reset Token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetToken = resetToken;
    await user.save();

    const resetLink = `http://localhost:3000/reset-password/${resetToken}`;
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'Password Reset Request',
      text: `Click the link to reset your password: ${resetLink}`,
    });

    res.status(200).json({ message: 'Password reset email sent' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Password Reset
app.post('/reset-password/:token', async (req, res) => {
  try {
    const { password } = req.body;
    const user = await User.findOne({ resetToken: req.params.token });
    if (!user) return res.status(400).json({ error: 'Invalid or expired token' });

    user.password = password;
    user.resetToken = null;
    await user.save();

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Send Email Notification for New Followers
app.post('/notify-follow', async (req, res) => {
  try {
    const { followerEmail, followedEmail } = req.body;
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: followedEmail,
      subject: 'New Follower Alert',
      text: `${followerEmail} just followed you!`,
    });

    res.status(200).json({ message: 'Notification sent' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
// Post Schema
const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  image: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
});

const Post = mongoose.model('Post', postSchema);

// Multer Storage for Image Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});

const upload = multer({ storage });

// Create a New Post
app.post('/posts', upload.single('image'), async (req, res) => {
  try {
    const { title, userId } = req.body;
    if (!req.file) return res.status(400).json({ error: 'Image is required' });

    const post = new Post({
      title,
      image: req.file.path, // Save image path
      user: userId,
    });

    await post.save();
    res.status(201).json({ message: 'Post created successfully', post });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get All Posts
app.get('/posts', async (req, res) => {
  try {
    const posts = await Post.find().populate('user', 'username');
    res.status(200).json(posts);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Like a Post
app.post('/posts/:postId/like', async (req, res) => {
  try {
    const { userId } = req.body;
    const post = await Post.findById(req.params.postId);

    if (!post) return res.status(404).json({ error: 'Post not found' });

    if (post.likes.includes(userId)) {
      post.likes = post.likes.filter((id) => id.toString() !== userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();
    res.status(200).json({ message: 'Post like updated', post });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Save a Post (Feature like "Pinterest Saves")
app.post('/posts/:postId/save', async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ error: 'User not found' });

    if (!user.savedPosts) user.savedPosts = [];
    
    if (user.savedPosts.includes(req.params.postId)) {
      user.savedPosts = user.savedPosts.filter((id) => id.toString() !== req.params.postId);
    } else {
      user.savedPosts.push(req.params.postId);
    }

    await user.save();
    res.status(200).json({ message: 'Post saved successfully', savedPosts: user.savedPosts });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
