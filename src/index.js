require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer'); // added multer
const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler'); // kept errorHandler

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
// app.use(express.urlencoded({ extended: true })); // removed this line

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api', routes);

// Error handling
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        message: 'File is too large. Maximum size is 2MB'
      });
    }
  }
  console.error(err);
  res.status(500).json({
    message: 'Internal server error',
    error: err.message
  });
});

// Error Handler
app.use(errorHandler); // kept errorHandler

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
