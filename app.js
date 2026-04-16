require('dotenv').config();

const express = require('express');
const connectDB = require('./Configs/database');

const app = express();

app.use(express.json());

// DB
connectDB();

// Routes
const bvnRoutes = require('./routes/BVN');
app.use('/api/bvn', bvnRoutes);

app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});