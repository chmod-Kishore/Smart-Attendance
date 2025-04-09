import dotenv from "dotenv";
dotenv.config();
import nodemailer from "nodemailer";
import { Student } from "../model/Student.js";
import { Teacher } from "../model/Teacher.js";
import JWT from "../middleware/JWT.js";
import bcrypt from "bcryptjs";

async function Login(req, res) {
  const { email, password } = req.body;
  let type = "student";

  let user = await Student.findOne({ email });
  if (!user) {
    type = "teacher";
    user = await Teacher.findOne({ email });
  }

  if (user) {
    const isMatch = await bcrypt.compare(password.toString(), user.password);

    if (isMatch) {
      const token = JWT.generateToken({ email: user.email });
      user.type = type;
      res
        .cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "None",
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

async function Signup(req, res) {
  const { name, email, rollNo, dob, branch, dept, password, type } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10); // Hash password

    if (type === "student") {
      const existingUser = await Student.findOne({ email }).exec();
      if (existingUser) {
        return res
          .status(409)
          .json({ message: "Student already exists. Try logging in." });
      }

      const newUser = new Student({
        name,
        email,
        rollNo,
        dob,
        branch,
        dept,
        password: hashedPassword, // Store hashed password
      });

      await newUser.save();
      res
        .status(201)
        .json({ message: "Student registered successfully", user: newUser });
    } else if (type === "teacher") {
      const existingUser = await Teacher.findOne({ email }).exec();
      if (existingUser) {
        return res
          .status(409)
          .json({ message: "Teacher already exists. Try logging in." });
      }

      const newUser = new Teacher({
        name,
        email,
        dob,
        dept,
        password: hashedPassword, // Store hashed password
      });

      await newUser.save();
      res
        .status(201)
        .json({ message: "Teacher registered successfully", user: newUser });
    } else {
      res.status(400).json({
        message: "Invalid user type. Must be either student or teacher.",
      });
    }
  } catch (err) {
    res
      .status(500)
      .json({ message: "An error occurred during signup. Please try again." });
  }
}

// async function ForgotPassword(req, res) {
//   const { email, password } = req.body;

//   if (!email || !password) {
//     return res.status(400).json({ message: "Email and password are required" });
//   }

//   try {
//     const hashedPassword = await bcrypt.hash(password, 10);
//     console.log("Hashed password:", hashedPassword);

//     let user = await Student.findOne({ email });

//     if (user) {
//       await Student.updateOne(
//         { email },
//         { $set: { password: hashedPassword } }
//       );
//     } else {
//       user = await Teacher.findOne({ email });
//       if (user) {
//         await Teacher.updateOne(
//           { email },
//           { $set: { password: hashedPassword } }
//         );
//       }
//     }

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     return res.status(200).json({ message: "Password reset successful" });
//   } catch (err) {
//     console.error("Error resetting password:", err);
//     return res.status(500).json({ message: "Server error" });
//   }
// }

async function ForgotPassword(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    let user = await Student.findOne({ email });

    if (user) {
      user.password = hashedPassword;
      await user.save();
      return res
        .status(200)
        .json({ message: "Password reset successful (student)" });
    }

    user = await Teacher.findOne({ email });
    if (user) {
      user.password = hashedPassword;
      await user.save();
      return res
        .status(200)
        .json({ message: "Password reset successful (teacher)" });
    }

    return res.status(404).json({ message: "User not found" });
  } catch (err) {
    console.error("Error resetting password:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

// //edit user details
// async function EditUserDetails(req, res) {
//   const { email, name, dob } = req.body;
//   let user = await Student.findOne
//     .findOneAndUpdate({ email }, { name, dob })
//     .exec();
//   if (!user) {
//     user = await Teacher.findOneAndUpdate
//       .findOneAndUpdate({ email }, { name, dob })
//       .exec();
//   }
//   if (user) {
//     res.status(200).json({ message: "User details updated successfully." });
//   } else {
//     res
//       .status(404)
//       .json({ message: "User not found. Please check the email provided." });
//   }
// }

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
      res
        .status(500)
        .json({ message: "Failed to send OTP. Please try again." });
    } else {
      console.log("Email sent: " + info.response);
      res.status(200).json({
        message: "OTP sent successfully. Please check your email.",
        otp: otp,
      });
    }
  });
}

async function GetUserDetails(req, res) {
  const { email } = req.query; // ✅ Fetch email from query params

  try {
    let type = "student";
    let user = await Student.findOne({ email });

    if (!user) {
      type = "teacher";
      user = await Teacher.findOne({ email });
    }

    if (user) {
      res.status(200).json({ user: { ...user.toObject(), type } });
    } else {
      res.status(404).json({ message: "User not found." });
    }
  } catch (err) {
    console.error("Error fetching user details:", err);
    res.status(500).json({ message: "Error fetching user details." });
  }
}

const UserController = {
  Login,
  Signup,
  ForgotPassword,
  SendMail,
  GetUserDetails, // ✅ Add the new function
};

export default UserController;
