// scripts/cleanup-invalid-chats.js
// Run with: node scripts/cleanup-invalid-chats.js

const mongoose = require('mongoose');
const Chat = require('../server/models/Chat');

const mongoURI = 'mongodb://localhost:27017/digital-wholesale-catalogue';

async function main() {
  await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB');

  // Remove chats with missing or invalid buyerId
  const result = await Chat.deleteMany({ $or: [
    { buyerId: { $exists: false } },
    { buyerId: null },
    { buyerId: { $type: 'string' } }, // sometimes buyerId is a string instead of ObjectId
  ] });

  console.log(`Deleted ${result.deletedCount} invalid chat conversations.`);
  await mongoose.disconnect();
}

main().catch(err => {
  console.error('Error cleaning up chats:', err);
  process.exit(1);
}); 