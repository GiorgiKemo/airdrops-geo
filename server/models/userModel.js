const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    // Profile fields
    displayName: {
      type: String,
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    avatar: {
      type: String, // URL to avatar image
    },
    // Social accounts
    socialAccounts: {
      twitter: { type: String, trim: true },
      discord: { type: String, trim: true },
      telegram: { type: String, trim: true },
      github: { type: String, trim: true },
    },
    // User preferences
    preferences: {
      emailNotifications: { type: Boolean, default: true },
      darkMode: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
  }
);

// Method to compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Middleware to hash password before saving
userSchema.pre('save', async function (next) {
  // Only hash the password if it's modified (or new)
  if (!this.isModified('password')) {
    return next();
  }

  // Generate salt
  const salt = await bcrypt.genSalt(10);
  // Hash password
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Add indexes for frequently queried fields
// Username and email already have implicit indexes due to 'unique: true'
// Add index for role to optimize queries that filter by role
userSchema.index({ role: 1 });

// Add compound index for username and role (for admin user searches)
userSchema.index({ username: 1, role: 1 });

const User = mongoose.model('User', userSchema);

module.exports = User;
