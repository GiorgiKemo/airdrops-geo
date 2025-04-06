const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Connection options
    const options = {
      serverSelectionTimeoutMS: 30000, // Timeout after 30 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4, // Use IPv4, skip trying IPv6
      retryWrites: true,
      w: 'majority'
    };

    console.log('Connecting to MongoDB Atlas...');
    const conn = await mongoose.connect(process.env.MONGODB_URI, options);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.error('Full error:', error);
    // Don't exit the process, just log the error
    // process.exit(1);
    return null;
  }
};

module.exports = connectDB;
