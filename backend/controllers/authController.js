const axios = require('axios');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = 'http://localhost:4000/api/auth/google/callback';

// Step 1: Redirect user to Google login
exports.googleLogin = (req, res) => {
  const scope = [
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email'
  ].join(' ');

  const url = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=${scope}&access_type=offline`;

  res.redirect(url);
};

// Step 2: Handle Google callback
exports.googleCallback = async (req, res) => {
  const code = req.query.code;
  if (!code) {
    console.log("No code received from Google");
    return res.status(400).json({ message: 'No code received from Google' });
  }

  try {
    // Exchange code for tokens
    const { data } = await axios.post(`https://oauth2.googleapis.com/token`, {
      code,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code',
    });

    console.log('Token data:', data);

    const accessToken = data.access_token;

    // Get user info
    const userInfo = await axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${accessToken}`);
    const user = userInfo.data;

    console.log('Google user info:', user);

    // Find or create user
    let existingUser = await User.findOne({ email: user.email });

    if (!existingUser) {
      existingUser = await User.create({
        name: user.name,
        email: user.email,
        picture: user.picture,
        googleId: user.id,
      });
      console.log('New user created:', existingUser.email);
    } else {
      console.log('User already exists:', existingUser.email);
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: existingUser._id, email: existingUser.email, name: existingUser.name, role: existingUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Redirect to frontend with token in URL
    res.redirect(`http://localhost:3000?token=${token}&userId=${existingUser._id}&email=${existingUser.email}&name=${existingUser.name}&role=${existingUser.role}`);
  } catch (err) {
    console.error('Google Auth Error:', err.response?.data || err.message || err);
    res.status(500).json({ message: 'Authentication failed' });
  }
};

