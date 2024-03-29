const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  role: {
    type: String,
    enum: ["admin", "teacher", "tutor", "student"],
    required: true,
  },
  // Additional user details like email, contact, etc.
});

const User = mongoose.model("User", userSchema);

const timetableSchema = new mongoose.Schema({
  teacherId: { type: String, ref: "User", required: true },
  // Assuming a 6x7 matrix for days and hours
  timetable: [
    [{ type: String, ref: "Class" }], // Represents classes for each day and hour
    // ... (repeat for 5 more days)
  ],
});

const Timetable = mongoose.model("Timetable", timetableSchema);

const classSchema = new mongoose.Schema({
  className: { type: String, required: true },
  classCode: { type: String, required: true, unique: true },
  teacherId: { type: String, ref: "User" }, // Reference to the teacher in charge of the class
  tutorId: { type: String, ref: "User" }, // Reference to the tutor in charge of the class
  // Other class details like room number, etc.
});

const Class = mongoose.model("Class", classSchema);

// const attendanceSchema = new mongoose.Schema({
//   classId: { type: String, ref: "Class", required: true },
//   date: { type: Date, default: Date.now },
//   // For simplicity, assuming a boolean to mark attendance (true for present, false for absent)
//   attendance: [
//     {
//       studentId: { type: String, ref: "User" },
//       status: { type: Boolean, default: false },
//     },
//   ],
// });

// const Attendance = mongoose.model("Attendance", attendanceSchema);

const studentListSchema = new mongoose.Schema({
  classId: { type: String, ref: "Class", required: true },
  students: [{ type: String, ref: "User" }], // References to students in the class
});

const StudentList = mongoose.model("StudentList", studentListSchema);

//Newwwww

const attendanceSchema = new mongoose.Schema({
  classId: { type: String, ref: "Class", required: true },
  date: { type: Date, default: Date.now },
  attendance: [
    {
      studentId: { type: String, ref: "User" },
      status: { type: Boolean, default: false },
      subject: { type: String, ref: "Subject" }, // Add subject field
      // You can add other fields as needed
    },
  ],
});
