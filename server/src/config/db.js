const mongoose = require("mongoose");
const dns = require('dns');
const { MONGODB_URI } = require("./env");

dns.setServers
  (['1.1.1.1', '8.8.8.8'])


const connectDB = async () => {
  try {
    const conn = await mongoose.connect( MONGODB_URI || process.env.MONGODB_URI);
   console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};


module.exports = connectDB;