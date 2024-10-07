const mongoose = require('mongoose');

const marksSchema = new mongoose.Schema({
    studentId: String,
    yearOfStudy: String,
    examType: String,
    subjects: [
        {
            subjectName: String,
            marks: Number
        }
    ]
});

module.exports = mongoose.model('Marks', marksSchema);
