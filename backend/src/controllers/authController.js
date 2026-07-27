const authService = require('../services/authService');
const { createNotification } = require('../models/notificationModel');

const login = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      const error = new Error('Email/Mobile and password are required');
      error.statusCode = 400;
      throw error;
    }

    const data = await authService.login(identifier, password);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      const error = new Error('Email is required');
      error.statusCode = 400;
      throw error;
    }

    const data = await authService.forgotPassword(email);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      const error = new Error('Token and new password are required');
      error.statusCode = 400;
      throw error;
    }

    const data = await authService.resetPassword(token, newPassword);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

const deepLinkRedirect = (req, res) => {
  const { token } = req.query;
  const appLink = `onebind://reset-password?token=${token}`;
  
  // Return a simple HTML page that auto-redirects to the app via JavaScript.
  // This bypasses email clients blocking custom URL schemes.
  res.send(`
    <html>
      <head>
        <title>Redirecting to ONEBind...</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { font-family: sans-serif; text-align: center; padding: 40px; background: #f4f6f9; }
          .container { background: #fff; padding: 30px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 400px; margin: 0 auto; }
          h2 { color: #6366F1; }
          p { color: #6B7280; margin-bottom: 24px; }
          a { display: inline-block; background: #6366F1; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Opening ONEBind</h2>
          <p>If you aren't redirected automatically, click the button below.</p>
          <a href="${appLink}">Open App</a>
        </div>
        <script>
          setTimeout(function() {
            window.location.href = "${appLink}";
          }, 500);
        </script>
      </body>
    </html>
  `);
};

const register = async (req, res, next) => {
  try {
    const { name, email, phone, password, dob, role } = req.body;

    if (!name || !email || !phone || !password || !dob) {
      const error = new Error('All fields are required');
      error.statusCode = 400;
      throw error;
    }

    const data = await authService.register({ name, email, phone, password, dob, role });

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data,
    });

    // Fire-and-forget welcome notification
    if (data?.user?.id) {
      createNotification(
        data.user.id,
        'Welcome to ONEBind!',
        'Your account has been created successfully. Complete your profile to start adding leads.',
        'SYSTEM',
        {}
      ).catch(() => {});
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  register,
  forgotPassword,
  resetPassword,
  deepLinkRedirect,
};
