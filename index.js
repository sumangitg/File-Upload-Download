const express = require('express');
const multer = require('multer');
const mysql = require('mysql2');
const path=require('path');
const ejs=require('ejs');
const bodyParser=require('body-parser');

const app = express();
const port = 3000;


// MySQL Database Configuration
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'hal987@@@',
  database: 'notesupload'
});

db.connect(err => {
  if (err) {
      console.error('MySQL connection error:', err);
  } else {
      console.log('Connected to MySQL database');
  }
});


// Set up EJS view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


// Multer Configuration for File Upload
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Express Routes
app.use(express.static('public'));


// Middleware for parsing POST data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


// Express Routes
app.use(express.static('public'));



// root api
app.get('/',(req, res)=>{
  res.render('index');
})


app.post('/upload', upload.single('pdfFile'), (req, res) => {
  const pdfName = req.body.pdfName;
  const pdfData = req.file.buffer;

// add new
//  console.log(pdfData);
  const sql = 'INSERT INTO pdf_files (pdf_name, pdf_data) VALUES (?, ?)';

  db.query(sql, [pdfName, pdfData], (err, result) => {
      if (err) {
          console.error('MySQL insertion error:', err);
          res.status(500).json({ message: 'Error storing PDF in the database.' });
      } else {
          console.log('PDF stored in the database.');
          res.json({ message: 'PDF successfully uploaded.' });
      }
  });
  res.redirect('/pdf-list'); // Redirect to the page showing the list of PDFs after upload
});



// Route to display the list of PDFs
app.get('/pdf-list', (req, res) => {
  const sql = 'SELECT pdf_id, pdf_name FROM pdf_files';

  db.query(sql, (err, result) => {
      if (err) {
          console.error('MySQL query error:', err);
          res.status(500).json({ message: 'Error fetching PDFs from the database.' });
      } else {
          res.render('pdfList', { pdfs: result });
      }
  });
});




// Route to download an individual PDF
app.get('/download/:pdfId', (req, res) => {
  const pdfId = req.params.pdfId;
  const sql = 'SELECT pdf_name, pdf_data FROM pdf_files WHERE pdf_id = ?';

  db.query(sql, [pdfId], (err, result) => {
      if (err) {
          console.error('MySQL query error:', err);
          res.status(500).json({ message: 'Error fetching PDF from the database.' });
      } else if (result.length === 0) {
          res.status(404).json({ message: 'PDF not found.' });
      } else {
          const pdfName = result[0].pdf_name;
          const pdfData = result[0].pdf_data;

          res.attachment(pdfName);
          res.send(pdfData);
      }
  });    
});





// Start the Express Server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});





