import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const uri = `${process.env.MONGO_URL}/greencart?retryWrites=true&w=majority`;
    await mongoose.connect(uri); // No options needed
    console.log('✅ MongoDB is connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
  }
};

export default connectDB;
