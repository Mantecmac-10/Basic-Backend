import mongoose from 'mongoose';

async function connectdb(url) {
  return await mongoose.connect(url);
}
export { connectdb };
