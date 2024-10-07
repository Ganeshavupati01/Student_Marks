const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const User = require('./models/User');  // Assuming User model exists
const Marks = require('./models/Marks');  // New model for student marks

const app = express();

// Middleware for parsing JSON and URL-encoded form data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Connection
mongoose.connect('mongodb+srv://23pa5a0501:ganesh12321@studentpro.rdnkw.mongodb.net/ProjectS?retryWrites=true&w=majority&appName=StudentPro', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((error) => {
    console.log('Failed to connect to MongoDB', error);
});

// Serve the login HTML page when visiting the root ("/")
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));  // Now serving login.html by default
});

// Route to serve the registration page (index.html)
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));  // Serves index.html
});

// POST route to handle user registration
app.post('/submit', (req, res) => {
    const { email, password, role } = req.body;

    const newUser = new User({
        email,
        password,
        role
    });

    newUser.save()
        .then(() => {
            res.send('User saved successfully');
        })
        .catch((error) => {
            res.send('Error saving user: ' + error);
        });
});

// POST route to handle user login and role-based navigation
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    User.findOne({ email, password })
        .then(user => {
            if (user) {
                if (user.role === 'faculty') {
                    // Redirect faculty to faculty page
                    res.redirect('/faculty');
                } else if (user.role === 'student') {
                    // Redirect student to the student marks page
                    res.redirect('/student');  // Redirect to the view marks page
                } else {
                    res.send('Invalid role.');
                }
            } else {
                res.send('Login failed: Invalid email or password.');
            }
        })
        .catch(error => {
            console.log(error);
            res.status(500).send('Server error');
        });
});

// Faculty Page Route (to serve faculty.html)
app.get('/faculty', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'faculty.html'));  // Load the faculty HTML page
});

// Student Page Route (to serve student.html)
app.get('/student', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'student.html'));  // Load the student HTML page for viewing marks
});

// Route to handle marks submission by faculty
app.post('/submitMarks', (req, res) => {
    const { studentId, yearOfStudy, examType, subjects } = req.body;

    const newMarks = new Marks({
        studentId,
        yearOfStudy,
        examType,
        subjects  // array of {subjectName, marks}
    });

    newMarks.save()
        .then(() => res.json({ message: 'Marks submitted successfully!' }))
        .catch(err => res.status(400).json({ error: err.message }));
});

// Add routes to serve enter_marks.html and view_marks.html
app.get('/enter_marks.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'enter_marks.html'));
});

app.get('/view_marks.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'view_marks.html'));
});

// Route to handle viewing marks based on studentId, yearOfStudy, and examType
app.get('/getMarks', (req, res) => {
    const { studentId, yearOfStudy, examType } = req.query;

    // Find marks in the database matching the criteria
    Marks.findOne({ studentId, yearOfStudy, examType })
        .then(marks => {
            if (marks) {
                res.json(marks);  // Return the marks in JSON format
            } else {
                res.status(404).json({ message: 'No marks found for the given student and exam.' });
            }
        })
        .catch(error => {
            console.log('Error fetching marks:', error);
            res.status(500).json({ message: 'Server error occurred while fetching marks.' });
        });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
