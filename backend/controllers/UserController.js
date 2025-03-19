import dotenv from "dotenv";
dotenv.config();
import nodemailer from "nodemailer";
import { Student } from "../model/Student.js";
import { Teacher } from "../model/Teacher.js";
import JWT from "../middleware/JWT.js";

//login
async function Login(req, res) {
  const { email, password } = req.body;
  let type = "student";
  //check if user is a student
  let user = await Student.findOne({ email });
  if (!user) {
    type = "teacher";
    user = await Teacher.findOne({ email });
  }

  if (user) {
    if (user.password === password) {
      const token = JWT.generateToken({ email: user.email });
      user.type = type;
      res
        .cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
        })
        .status(200)
        .json({ user: user, type: type, token: token });
    } else {
      res.status(400).json({ message: "Invalid email or password" });
    }
  } else {
    res.status(400).json({ message: "No such User" });
  }
}
// Create a new user
async function Signup(req, res) {
  const { name, email, rollNo, dob, branch, dept, password, type } = req.body;

  try {
    if (type === "student") {
      // Check if student already exists
      const existingUser = await Student.findOne({ email }).exec();
      if (existingUser) {
        return res.status(400).json({ message: "Student already exists" });
      }

      // Create new student
      const newUser = new Student({
        name,
        email,
        rollNo, // Roll number is required for students
        dob,
        branch,
        dept,
        password,
      });

      await newUser.save();
      res
        .status(201)
        .json({ message: "Student registered successfully", newUser });
    } else if (type === "teacher") {
      // Check if teacher already exists
      const existingUser = await Teacher.findOne({ email }).exec();
      if (existingUser) {
        return res.status(400).json({ message: "Teacher already exists" });
      }

      // Create new teacher
      const newUser = new Teacher({
        name,
        email,
        dob,
        dept,
        password,
      });

      await newUser.save();
      res
        .status(201)
        .json({ message: "Teacher registered successfully", newUser });
    } else {
      res.status(400).json({ message: "Invalid user type" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

//change password
async function ForgotPassword(req, res) {
  const { email, password } = req.body;
  //check if user is a student
  let user = await Student.findOneAndUpdate({ email }, { password }).exec();
  if (!user) {
    user = await Teacher.findOneAndUpdate({ email }, { password }).exec();
  }
  if (user) {
    res.status(200).json({ message: "Password changed successfully" });
  } else {
    res.status(400).json({ message: "No such User" });
  }
}

//edit user details
async function EditUserDetails(req, res) {
  const { email, name, dob } = req.body;
  //check if user is a student
  let user = await Student.findOne
    .findOneAndUpdate({ email }, { name, dob })
    .exec();
  if (!user) {
    user = await Teacher.findOneAndUpdate
      .findOneAndUpdate({ email }, { name, dob })
      .exec();
  }
  if (user) {
    res.status(200).json({ message: "User updated" });
  }
}

//send mail
function SendMail(req, res) {
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000);
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: "OTP for registration",
    text: `Your OTP is ${otp}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      res.status(400).json({ message: error.message });
    } else {
      console.log("Email sent: " + info.response);
      res.status(200).json({ message: "OTP sent successfully", otp: otp });
    }
  });
}

const UserController = {
  Login,
  Signup,
  ForgotPassword,
  EditUserDetails,
  SendMail,
};

export default UserController;
