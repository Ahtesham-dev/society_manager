
const express = require('express');        
const mongoose = require('mongoose');      
const cors = require('cors');             
const dotenv = require('dotenv');         
const path = require('path');


dotenv.config();

const app = express();  

app.use(express.json());

app.use(cors({
    origin: ['http://localhost:3000'], 
    credentials: true
}));


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/society-manager';

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log(' MongoDB Connected Successfully!');
        
        
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log(` http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error('Database Connection Error:', err.message);
        process.exit(1); 
    });



app.get('/api/test', (req, res) => {
    res.json({
        success: true,
        message: 'Society Manager API is working! ',
        timestamp: new Date().toISOString()
    });
});


app.use('/api/auth', require('./routes/auth'));
app.use('/api/societies', require('./routes/society'));

