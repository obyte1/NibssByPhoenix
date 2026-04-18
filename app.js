require('dotenv').config();
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express')

const express = require('express');
const connectDB = require('./Configs/database');
const ninRoutes = require('./Routes/NIN.routes');
const bvnRoutes = require('./Routes/bvnRoute.js');
const fintechRoute = require('./Routes/fintechRoute');

const app = express();

app.use(express.json());

// DB
connectDB();

// Swagger
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'NibbsByPhoenix API',
            version: '1.0.0'
        },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                }
            }
        }
    },
    apis: ['./Routes/*.js', './app.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

// Routes
app.use('/api/docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));
app.use('/api', bvnRoutes);
app.use('/api', ninRoutes);
app.use("/api", fintechRoute);



app.listen(process.env.PORT || 8080, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});
