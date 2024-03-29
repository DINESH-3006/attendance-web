const { default: mongoose } = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const moment = require("moment-timezone");
const _ = require("lodash");
const cors = require("cors");
const app = express();
app.use(cors());
const {
  Class,
  Subject,
  Teacher,
  Tutor,
  Student,
  Admin,
  Attendance,
  Timetable,
} = require("./schemasNew");

const port = 3001;
app.use(bodyParser.json());
// mongoose
//   .connect(
//     "mongodb+srv://dineshbabud21cs:Saidinesh20@cluster1.azna1kn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1"
//   )
//   .then(() => console.log("Connected to MongoDB"))
//   .catch((err) => console.error("Failed to connect to MongoDB", err));

// mongoose
//   .connect(
//     "mongodb+srv://dineshbabud21cs:Saidinesh20@cluster1.azna1kn.mongodb.net/"
//   )
//   .then(() => console.log("Connected to MongoDB"))
//   .catch((err) => console.error("Failed to connect to MongoDB", err));

// mongoose
//   .connect(
//     "mongodb+srv://dineshbabud21cs:Saidinesh20@cluster1.azna1kn.mongodb.net/"
//   )
//   .then(() => console.log("Connected to MongoDB"))
//   .catch((err) => console.error("Failed to connect to MongoDB", err));

mongoose
  .connect("mongodb://localhost:27017/attendance")
  .then(() => console.log("Connected to Mongo DB"))
  .catch((err) => console.error("Failed tyo connect"));

// CHECK ROUTE
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// ADMIN PAGE
app.get("/admin", (req, res) => {
  // Send a response to the client
  res.send("This is the admin page");
});

//GET SUBJECT INFO
app.post("/subject", (req, res) => {
  Subject.find()
    .exec()
    .then((result) => {
      console.log(result);
      return res.send(result);
    })
    .catch((err) => {
      console.log(err);
    });
});

// GET TIME TABLE INFO
app.get("/teacher/:teacherid", async (req, res) => {
  const { teacherid } = req.params;
  try {
    const teacher = await Teacher.findOne({ _id: teacherid });

    if (!teacher) {
      return res.status(401).send("Invalid credentials");
    }

    // Fetch timetable for the teacher with subjects populated
    const populatedTimetable = await Teacher.findById(teacher._id)
      .populate({
        path: "timetable",
        populate: {
          path: "days.periods",
          model: "Subjects",
          select: "name",
        },
      })
      .populate("class")
      .exec();

    const timetableData = (populatedTimetable.timetable || []).map((day) => ({
      name: day.name,
      periods: day.days.map((period) => ({
        name: period.name,
        subjects: (period.periods || []).map((subject) => ({
          _id: subject._id,
          name: subject.name,
        })),
      })),
    }));

    //Send the teacher information along with timetable data
    return res.status(200).json({
      teacher: {
        _id: teacher._id,
        name: teacher.name,
        email: teacher.email,
      },
      timetable: timetableData,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send("Server error");
  }
});

// TEACHER LOGIN ROUTE

app.post("/teacher/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const teacher = await Teacher.findOne({ email, password });

    if (!teacher) {
      return res.status(401).send("Invalid credentials");
    } else {
      return res.status(200).json({ teacherid: teacher._id });
    }
  } catch (err) {
    console.log(err);
    return res.send("Server Error");
  }
});

// GETTING STUDENTS INFO
app.get("/subject/students/:subjectId/:classId", async (req, res) => {
  const { subjectId, classId } = req.params;
  try {
    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).send("Subject not found");
    }
    if (!classId) {
      return res.status(404).send("class not found");
    }

    const students = await Student.find({
      _id: { $in: subject.students },
      class: classId,
    });

    return res.status(200).send(students);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server error");
  }
});

// GETTING CLASS ID
app.get("/intersection/:teacherId/:subjectId", async (req, res) => {
  const { teacherId, subjectId } = req.params;

  try {
    const teacher = await Teacher.findById(teacherId);

    if (!teacher) {
      console.log("Teacher not found");
      return null;
    }

    const teacherClassIds = teacher.class;

    for (const classId of teacherClassIds) {
      const classDetails = await Class.findOne({
        _id: classId,
        subjects: { $in: [subjectId] },
        teacher: { $in: [teacherId] },
      });

      if (classDetails) {
        return res.json({ classId: classId });
      }
    }
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
});

//UPDATING ATTENDANCE

// app.post("/updateAttendance", async (req, res) => {
//   try {
//     console.log("REACHING....");
//     const {
//       dateState,
//       teacherid,
//       studentId,
//       classId,
//       subjectId,
//       attendanceStatus,
//     } = req.body;

//     // Parse the incoming date in a specific time zone (e.g., Asia/Kolkata)
//     const dateInTimeZone = moment.tz(dateState, "Asia/Kolkata").startOf("day");

//     // Find the attendance document based on classId, date, studentId, and subjectId
//     let attendanceDoc = await Attendance.findOne({
//       classId,
//       date: dateInTimeZone.toDate(), // Convert to JavaScript Date object
//       "attendance.student": studentId,
//       "attendance.subject": subjectId,
//     });

//     if (attendanceDoc) {
//       // If the attendance record exists, update the status array
//       attendanceDoc.attendance.forEach((attendance) => {
//         if (
//           attendance.student.toString() === studentId &&
//           attendance.subject.toString() === subjectId
//         ) {
//           attendance.status.push(attendanceStatus);
//         }
//       });

//       attendanceDoc = await attendanceDoc.save();
//     } else {
//       // If the attendance record doesn't exist, create a new one
//       attendanceDoc = new Attendance({
//         classId,
//         date: dateInTimeZone.toDate(), // Convert to JavaScript Date object
//         attendance: [
//           {
//             teacher: teacherid,
//             student: studentId,
//             subject: subjectId,
//             status: [attendanceStatus],
//           },
//         ],
//       });

//       attendanceDoc = await attendanceDoc.save();
//     }

//     res
//       .status(200)
//       .json({ success: true, message: "Attendance updated successfully" });
//   } catch (error) {
//     console.error("Error updating attendance:", error);
//     res.status(500).json({ success: false, error: "Internal Server Error" });
//   }
// });

// app.post("/updateAttendance", async (req, res) => {
//   try {
//     console.log("REACHING....");
//     const {
//       dateState,
//       teacherid,
//       studentId,
//       classId,
//       subjectId,
//       attendanceStatus,
//     } = req.body;

//     console.log("DATE @ BACK END", dateState);
//     // Parse the incoming date in a specific time zone (e.g., Asia/Kolkata)
//     const dateInTimeZone = moment.tz(dateState, "Asia/Kolkata");

//     // Find the attendance document based on classId, date, studentId, and subjectId
//     let attendanceDoc = await Attendance.findOne({
//       classId: classId,
//       date: {
//         $gte: dateInTimeZone.clone().startOf("day").toDate(),
//         $lt: dateInTimeZone.clone().endOf("day").toDate(),
//       },
//       // "attendance.student": studentId,
//       // "attendance.subject": subjectId,
//     });

//     if (attendanceDoc) {
//       // If the attendance record exists, update the status array
//       attendanceDoc.attendance.forEach((attendance) => {
//         if (
//           attendance.student.toString() === studentId &&
//           attendance.subject.toString() === subjectId
//         ) {
//           attendance.status.push(attendanceStatus);
//         }
//       });

//       attendanceDoc = await attendanceDoc.save();
//     } else {
//       // If the attendance record doesn't exist, create a new one
//       attendanceDoc = new Attendance({
//         classId,
//         date: dateInTimeZone.clone().toDate(), // Convert to JavaScript Date object
//         attendance: [
//           {
//             teacher: teacherid,
//             student: studentId,
//             subject: subjectId,
//             status: [attendanceStatus],
//           },
//         ],
//       });

//       attendanceDoc = await attendanceDoc.save();
//     }

//     res
//       .status(200)
//       .json({ success: true, message: "Attendance updated successfully" });
//   } catch (error) {
//     console.error("Error updating attendance:", error);
//     res.status(500).json({ success: false, error: "Internal Server Error" });
//   }
// });

app.post("/updateAttendance", async (req, res) => {
  try {
    console.log("REACHING....");
    const {
      dateState,
      teacherid,
      studentId,
      classId,
      subjectId,
      attendanceStatus,
    } = req.body;

    console.log("DATE @ BACK END", dateState);
    // Parse the incoming date in a specific time zone (e.g., Asia/Kolkata)
    const dateInTimeZone = moment.tz(dateState, "Asia/Kolkata");

    // Find the attendance document based on classId and date
    let attendanceDoc = await Attendance.findOne({
      classId: classId,
      date: {
        $gte: dateInTimeZone.clone().startOf("day").toDate(),
        $lt: dateInTimeZone.clone().endOf("day").toDate(),
      },
    });

    if (attendanceDoc) {
      // Check if there is an attendance entry for the studentId and subjectId
      const existingEntry = attendanceDoc.attendance.find(
        (entry) =>
          entry.student.toString() === studentId &&
          entry.subject.toString() === subjectId
      );

      if (existingEntry) {
        // If the entry exists, update the status array
        existingEntry.status.push(attendanceStatus);
      } else {
        // If the entry does not exist, create a new entry
        attendanceDoc.attendance.push({
          teacher: teacherid,
          student: studentId,
          subject: subjectId,
          status: [attendanceStatus],
        });
      }

      attendanceDoc = await attendanceDoc.save();
    } else {
      // If the attendance record doesn't exist, create a new one
      attendanceDoc = new Attendance({
        classId,
        date: dateInTimeZone.clone().toDate(), // Convert to JavaScript Date object
        attendance: [
          {
            teacher: teacherid,
            student: studentId,
            subject: subjectId,
            status: [attendanceStatus],
          },
        ],
      });

      attendanceDoc = await attendanceDoc.save();
    }

    res
      .status(200)
      .json({ success: true, message: "Attendance updated successfully" });
  } catch (error) {
    console.error("Error updating attendance:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

// GETTING CLASS ID FROM YEAR & CLASS NAME

app.get("/teacher/class/:year/:clazz", async (req, res) => {
  let { year, clazz } = req.params;

  // Convert year to a number
  year = parseInt(year, 10);

  try {
    const classId = await Class.findOne({
      name: clazz,
      year: year,
    })
      .select("_id")
      .exec();

    return res.json({ classId });
  } catch (error) {
    console.error("Error finding class:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

//GET SUBJECT INFO
app.get("/teacher/subject/:subjectname", async (req, res) => {
  const { subjectname } = req.params;
  try {
    const subject = await Subject.findOne({ name: subjectname })
      .select("_id")
      .exec();

    if (!subject) {
      return res.status(404).json({ error: "Subject not found" });
    }

    return res.status(200).json({ subject });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

//STUDENT IDS
app.get("/students/id/:subjectId/:classId", async (req, res) => {
  const { subjectId, classId } = req.params;

  try {
    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).send("Subject not found");
    }

    const students = await Student.find(
      {
        _id: { $in: subject.students },
        class: classId,
      },
      "_id" // Projection: Include only the _id field
    );

    const studentIds = students.map((student) => student._id.toString());

    return res.status(200).send(studentIds);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server error");
  }
});

//OPTIMAL
app.post("/attendancePercentage", async (req, res) => {
  try {
    const { classId, subjectId, studentIds } = req.body;

    // Get all attendance records for the given classId
    const attendanceRecords = await Attendance.find({ classId });

    // Initialize an object to store grouped results
    const groupedAttendance = {};

    // Iterate through each attendance record
    for (const record of attendanceRecords) {
      const { date, attendance } = record;

      // Iterate through each student
      for (const studentId of studentIds) {
        // Filter attendance for the given subjectId and studentId
        const subjectAttendance = attendance.filter(
          (entry) =>
            entry.subject.toString() === subjectId &&
            entry.student.toString() === studentId
        );

        // Calculate count of true and false for each day
        const trueCount = subjectAttendance.reduce(
          (count, entry) => count + entry.status.filter(Boolean).length,
          0
        );
        const falseCount = subjectAttendance.reduce(
          (count, entry) => count + entry.status.filter((s) => !s).length,
          0
        );

        // Create a key for the student ID in the groupedAttendance object
        if (!groupedAttendance[studentId]) {
          groupedAttendance[studentId] = [];
        }

        // Push the result to the array under the student ID
        groupedAttendance[studentId].push({
          date,
          trueCount,
          falseCount,
        });
      }
    }

    // Process grouped results and calculate percentages
    const attendanceResults = [];

    for (const studentId of studentIds) {
      const studentAttendance = groupedAttendance[studentId] || [];
      let totalTrue = 0;
      let totalFalse = 0;

      // Iterate through each day's attendance
      for (const dayAttendance of studentAttendance) {
        totalTrue += dayAttendance.trueCount;
        totalFalse += dayAttendance.falseCount;
      }

      const percentage = (totalTrue / (totalTrue + totalFalse)) * 100 || 0;
      const classesAttended = totalTrue;
      const totalClasses = totalTrue + totalFalse;

      attendanceResults.push({
        studentId,
        percentage,
        classesAttended,
        totalClasses,
      });
    }

    res.status(200).json(attendanceResults);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

//GETTING THE SUBJECT NAME FOR DYNAMIC DROP DOWN

app.get("/subject/name/:teacherid", async (req, res) => {
  const { teacherid } = req.params;
  try {
    const teacher = await Teacher.findOne({ _id: teacherid }).populate(
      "subjects",
      "name"
    );

    if (teacher) {
      const subjectNames = teacher.subjects.map((subject) => subject.name);
      res.status(200).json({ subjectNames });
    } else {
      console.log("Teacher not found");
      res.status(404).json({ error: "Teacher not found" });
    }
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//GETTING THE CLASS NAME & YEAR FOR DYNAMIC DROP DOWN

app.get("/class/name/:teacherid", async (req, res) => {
  const { teacherid } = req.params;
  try {
    const teacher = await Teacher.findOne({ _id: teacherid }).populate({
      path: "class",
      model: "Class", // The name of the Class model
      select: "name year", // Select the name and year fields from the Class collection
    });

    if (teacher) {
      const classNamesAndYears = teacher.class.map((classInfo) => ({
        name: classInfo.name,
        year: classInfo.year,
      }));
      res.status(200).json({ classNamesAndYears });
    } else {
      console.log("Teacher not found");
      res.status(404).json({ error: "Teacher not found" });
    }
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// DATES FOR PENDING ATTENDANCE RANGE

// app.post("/attendance/pending", async (req, res) => {
//   try {
//     const { teacherId, fromDate, toDate, classId, subjectId } = req.body;

//     // Step 1: Generate an array of all dates within the range
//     //const startDate = moment.utc(fromDate).startOf("day");
//     const startDate = new Date(fromDate);
//     // let copyStartDate = startDate.clone();
//     // const endDate = moment.utc(toDate).endOf("day");
//     let copyStartDate = new Date(startDate);
//     const endDate = new Date(toDate);
//     const allDates = [];
//     // while (copyStartDate.isSameOrBefore(endDate, "day")) {
//     //   allDates.push(copyStartDate.toDate());
//     //   copyStartDate.add(1, "days");
//     // }
//     while (copyStartDate <= endDate) {
//       allDates.push(new Date(copyStartDate)); // Clone the date before pushing
//       copyStartDate.setDate(copyStartDate.getDate() + 1);
//     }

//     console.log("All Dates:", allDates);

//     // Step 2: Use direct query to find existing dates within the range
//     const existingDates = await Attendance.find({
//       classId: classId,
//       date: { $gte: startDate.toDate(), $lte: endDate.toDate() },
//       attendance: {
//         $elemMatch: {
//           subject: subjectId,
//           teacher: teacherId,
//         },
//       },
//     });

//     const existingDateStrings = existingDates.map((record) =>
//       moment.utc(record.date).startOf("day").toISOString()
//     );

//     // Step 3: Find missing dates
//     const missingDates = allDates.filter(
//       (date) =>
//         !existingDateStrings.includes(
//           moment.utc(date).startOf("day").toISOString()
//         )
//     );

//     console.log("Missing Dates:", missingDates);
//     res.status(200).json(missingDates);
//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

// app.post("/attendance/pending", async (req, res) => {
//   try {
//     const { teacherId, fromDate, toDate, classId, subjectId } = req.body;

//     // // Step 1: Generate an array of all dates within the range
//     // const startDate = moment(fromDate).tz("Asia/Kolkata").format();
//     // let copyStartDate = moment(startDate).tz("Asia/Kolkata").format();
//     // // copyStartDate.setDate(copyStartDate.getDate() + 1);
//     // const endDate = moment(toDate).tz("Asia/Kolkata").format();
//     // // endDate.setDate(endDate.getDate() + 1);
//     // const allDates = [];

//     const startDate = moment.tz(fromDate, "Asia/Kolkata");
//     let copyStartDate = moment(startDate); // Copy the moment object
//     const endDate = moment.tz(toDate, "Asia/Kolkata");
//     const allDates = [];

//     // while (copyStartDate <= endDate) {
//     //   allDates.push(new Date(copyStartDate)); // Clone the date before pushing
//     //   copyStartDate.add(1, "days");
//     // }

//     while (copyStartDate.isSameOrBefore(endDate)) {
//       allDates.push(moment(copyStartDate)); // Clone the moment object before pushing
//       copyStartDate.add(1, "days");
//     }

//     console.log("All Dates:", allDates);

//     // Step 2: Use direct query to find existing dates within the range
//     const existingDates = await Attendance.find({
//       classId: classId,
//       date: { $gte: startDate, $lte: endDate },
//       attendance: {
//         $elemMatch: {
//           subject: subjectId,
//           teacher: teacherId,
//         },
//       },
//     });

//     const existingDateStrings = existingDates.map((record) =>
//       new Date(record.date).setUTCHours(0, 0, 0, 0)
//     );

//     // Step 3: Find missing dates
//     // const missingDates = allDates.filter(
//     //   (date) => !existingDateStrings.includes(date.setUTCHours(0, 0, 0, 0))
//     // );
//     const missingDates = allDates.filter((date) => {
//       const startOfDay = date.format("YYYY-MM-DD"); // Format to match the existingDateStrings
//       return !existingDateStrings.includes(startOfDay);
//     });

//     console.log("Missing Dates:", missingDates);
//     res.status(200).json(missingDates);
//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

// app.post("/attendance/pending", async (req, res) => {
//   try {
//     const { teacherId, fromDate, toDate, classId, subjectId } = req.body;

//     // Step 1: Generate an array of all dates within the range
//     const startDate = moment.tz(fromDate, "Asia/Kolkata");
//     let copyStartDate = moment(startDate); // Copy the moment object
//     const endDate = moment.tz(toDate, "Asia/Kolkata");
//     const allDates = [];

//     console.log("FROM DATE", startDate);
//     console.log("TO DATE", endDate);
//     while (copyStartDate.isSameOrBefore(endDate)) {
//       allDates.push(moment(copyStartDate)); // Clone the moment object before pushing
//       copyStartDate.add(1, "days");
//     }

//     console.log("All Dates:", allDates);

//     // Step 2: Use direct query to find existing dates within the range
//     const existingDates = await Attendance.find({
//       classId: classId,
//       date: { $gte: startDate.toDate(), $lte: endDate.toDate() }, // Convert moments to JavaScript Date objects
//       attendance: {
//         $elemMatch: {
//           subject: subjectId,
//           teacher: teacherId,
//         },
//       },
//     });
//     console.log("EXISTING DATES:", existingDates);

//     const existingDateStrings = existingDates.map((record) =>
//       moment(record.date).tz("Asia/Kolkata").format("YYYY-MM-DD")
//     );

//     // Step 3: Find missing dates
//     const missingDates = allDates.filter((date) => {
//       const startOfDay = date.format("YYYY-MM-DD"); // Format to match existingDateStrings
//       return !existingDateStrings.includes(startOfDay);
//     });

//     console.log("Missing Dates:", missingDates);
//     res.status(200).json(missingDates);
//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

app.post("/attendance/pending", async (req, res) => {
  try {
    const { teacherId, fromDate, toDate, classId, subjectId } = req.body;

    // Step 1: Generate an array of all dates within the range
    const startDate = moment.tz(fromDate, "Asia/Kolkata");
    let copyStartDate = moment(startDate);
    const endDate = moment.tz(toDate, "Asia/Kolkata");
    const allDates = [];

    console.log("FROM DATE", startDate);
    console.log("TO DATE", endDate);
    while (copyStartDate.isSameOrBefore(endDate)) {
      allDates.push(copyStartDate.format("YYYY-MM-DD")); // Format the date
      copyStartDate.add(1, "days");
    }

    console.log("All Dates:", allDates);

    // Step 2: Use direct query to find existing dates within the range
    const existingDates = await Attendance.find({
      classId: classId,
      date: {
        $gte: startDate.toDate(),
        $lt: endDate.endOf("day").toDate(), // Adjusted to the end of the day
      },
      attendance: {
        $elemMatch: {
          subject: subjectId,
          teacher: teacherId,
        },
      },
    });

    console.log("EXISTING DATES:", existingDates);

    const existingDateStrings = existingDates.map((record) =>
      moment(record.date).tz("Asia/Kolkata").format("YYYY-MM-DD")
    );

    // Step 3: Find missing dates
    const missingDates = allDates.filter(
      (date) => !existingDateStrings.includes(date)
    );

    console.log("Missing Dates:", missingDates);
    res.status(200).json(missingDates);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// STUDENT RECORD FOR A PARTICULAR DATE

// app.post("/attendance-details", async (req, res) => {
//   try {
//     const { date, studentId, classId } = req.body;
//     console.log("On Seacrching @ BACK END", date);
//     let studentAttendance = [];

//     // Find attendance record for the given date and classId
//     const attendanceRecord = await Attendance.findOne({
//       date: new Date(date),
//       classId: classId,
//     });

//     if (!attendanceRecord) {
//       // No attendance record found for the given date and classId
//       return res.json([]);
//     }

//     // Find attendance details for the given studentId
//     studentAttendance = attendanceRecord.attendance.filter(
//       (entry) => entry.student.toString() === studentId
//     );

//     if (!studentAttendance || studentAttendance.length === 0) {
//       // No attendance details found for the given studentId
//       return res.json([]);
//     }

//     // Ensure that studentAttendance[0].subject is an array
//     const subjectIdsArray = studentAttendance.map((entry) =>
//       Array.isArray(entry.subject)
//         ? entry.subject.map((subjectId) => subjectId)
//         : [entry.subject]
//     );

//     // Fetch subjects using the subjectIds
//     const subjectsArray = await Promise.all(
//       subjectIdsArray.map((subjectIds) =>
//         Subject.find({
//           _id: { $in: subjectIds },
//         })
//       )
//     );

//     // Extract subject-wise attendance details for all records in studentAttendance
//     const attendanceDetails = studentAttendance.map((attendance, index) => ({
//       subjectName:
//         subjectsArray[index].length > 0
//           ? subjectsArray[index][0].name
//           : "unknown",
//       status: attendance.status,
//     }));

//     res.json(attendanceDetails);
//   } catch (error) {
//     console.error("Error fetching attendance details:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

app.post("/attendance-details", async (req, res) => {
  try {
    const { date, studentId, classId } = req.body;
    console.log("On Searching @ BACK END", date);
    let studentAttendance = [];

    // Adjust date to include the entire day
    const startDate = moment(date).startOf("day");
    const endDate = moment(date).endOf("day");

    // Find attendance record for the given date and classId
    const attendanceRecord = await Attendance.findOne({
      date: { $gte: startDate.toDate(), $lte: endDate.toDate() },
      classId: classId,
    });

    if (!attendanceRecord) {
      // No attendance record found for the given date and classId
      return res.json([]);
    }

    // Find attendance details for the given studentId
    studentAttendance = attendanceRecord.attendance.filter(
      (entry) => entry.student.toString() === studentId
    );

    if (!studentAttendance || studentAttendance.length === 0) {
      // No attendance details found for the given studentId
      return res.json([]);
    }

    // Ensure that studentAttendance[0].subject is an array
    const subjectIdsArray = studentAttendance.map((entry) =>
      Array.isArray(entry.subject)
        ? entry.subject.map((subjectId) => subjectId)
        : [entry.subject]
    );

    // Fetch subjects using the subjectIds
    const subjectsArray = await Promise.all(
      subjectIdsArray.map((subjectIds) =>
        Subject.find({
          _id: { $in: subjectIds },
        })
      )
    );

    // Extract subject-wise attendance details for all records in studentAttendance
    const attendanceDetails = studentAttendance.map((attendance, index) => ({
      subjectName:
        subjectsArray[index].length > 0
          ? subjectsArray[index][0].name
          : "unknown",
      status: attendance.status,
    }));

    res.json(attendanceDetails);
  } catch (error) {
    console.error("Error fetching attendance details:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GETTING STUDENT INFO BASED ON THE REG NO

app.post("/get-student-info", async (req, res) => {
  try {
    const { regno } = req.body;

    // Find the student based on the registration number
    const student = await Student.findOne({ regno }).populate("class");

    if (!student) {
      return res.json({ error: "Student not found" });
    }

    // Extract the required information
    const studentInfo = {
      _id: student._id,
      name: student.name,
      email: student.email,
      rollno: student.rollno,
      class: {
        year: student.class.year,
        name: student.class.name,
      },
    };

    res.json(studentInfo);
  } catch (error) {
    console.error("Error fetching student information:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
