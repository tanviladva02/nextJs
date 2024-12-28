import mongoose from 'mongoose';

const uri = process.env.MONGODB_URI || "mongodb+srv://tanviladva01:tanvi123@cluster0.t0bdy.mongodb.net/nextJs";

const options = {
  useNewUrlParser: true,         // Use the new URL parser
  useUnifiedTopology: true,      // Use the new server discovery and monitoring engine
  serverSelectionTimeoutMS: 100000, // 50 seconds for server selection timeout
  socketTimeoutMS: 100000,         // 50 seconds socket timeout
  bufferCommands: false,          // Disable command buffering
};

let isConnected = false; // To track if the connection is established

const connectToDatabase = async () => {
  if (isConnected) {
    console.log('Already connected to MongoDB');
    return;
  }

  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(uri, options);
    isConnected = true;
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw new Error('Failed to connect to MongoDB');
  }
};

export default connectToDatabase;
