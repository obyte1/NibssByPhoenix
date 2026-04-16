require('dotenv').config();

const express = require('express');
const connectDB = require('./Configs/database');
const ninRoutes = require('./Routes/NIN.routes');
const bvnRoutes = require('./Routes/BVN');
const fintechRoute = require('./Routes/fintechRoute');

const app = express();

app.use(express.json());

// DB
connectDB();

// Routes
app.use('/api', bvnRoutes);
app.use('/api', ninRoutes);
app.use("/api", fintechRoute);



app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});