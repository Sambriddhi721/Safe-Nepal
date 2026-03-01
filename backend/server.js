const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors()); 
app.use(express.json());
app.use('/uploads', express.static('uploads')); 

// Temporary in-memory storage for reports
let reports = [];

// Configure storage for photos (keeping it ready for when you want images back)
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// 1. POST ROUTE: Receive new reports
app.post('/report', upload.single('photo'), (req, res) => {
  const { description, category, location, severity } = req.body;

  const newReport = {
    id: reports.length + 1,
    description,
    category,
    location,
    severity,
    photo: req.file ? req.file.path : null,
    timestamp: new Date().toISOString()
  };

  reports.push(newReport); // Save to our list

  console.log("--- New Report Received ---");
  console.log(`Type: ${category} | Severity: ${severity}`);
  console.log(`Location: ${location}`);
  console.log(`Details: ${description}`);
  console.log("---------------------------");

  res.status(200).json({ 
    success: true, 
    message: "Report received in Chandragiri server!" 
  });
});

// 2. GET ROUTE: Send all reports to the "Past Reports" screen
app.get('/reports', (req, res) => {
  res.status(200).json(reports);
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`✅ Backend Server running at http://192.168.111.64:${PORT}`);
});