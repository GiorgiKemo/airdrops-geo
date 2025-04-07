const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

async function dropViewsIndex() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get the View collection
    const db = mongoose.connection.db;
    const collection = db.collection('views');

    // List all indexes
    console.log('Current indexes on views collection:');
    const indexes = await collection.indexes();
    console.log(indexes);

    // Drop the unique index on airdropId if it exists
    try {
      await collection.dropIndex('airdropId_1');
      console.log('Successfully dropped the unique index on airdropId');
    } catch (indexError) {
      console.log('No index named airdropId_1 found or error dropping index:', indexError.message);
    }

    // Create a new non-unique index
    await collection.createIndex({ airdropId: 1 }, { unique: false });
    console.log('Created new non-unique index on airdropId');

    // List indexes again to confirm changes
    console.log('Updated indexes on views collection:');
    const updatedIndexes = await collection.indexes();
    console.log(updatedIndexes);

    console.log('Index operation completed successfully');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the function if this script is executed directly
if (require.main === module) {
  dropViewsIndex()
    .then(() => {
      console.log('Script completed');
      process.exit(0);
    })
    .catch(err => {
      console.error('Script failed:', err);
      process.exit(1);
    });
}

module.exports = { dropViewsIndex };
