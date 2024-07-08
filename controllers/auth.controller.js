const User = require("../models/user.model")
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { JWT_SECRET } = process.env;

const SALT_ROUNDS = 10; // Number of rounds to generate salt. 10 is recommended value

async function register(req, res) {
  console.log("register");
  try {
    const { username, password , firstName , lastName, email} = req.body;

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS); // Hash password
    const user = new User({ username, password: hashedPassword, firstName , lastName, email }); // Create new user object
    await user.save(); // Save user to database

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.log("register", error.name);
    if (error.code === 11000) {
      console.log("username already exists");
      return res.status(400).json({ error: "User already exists" });
    }
    res.status(500).json({ error: "Registration failed" });
  }
}

async function login(req, res) {
  try {

    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: "Authentication failed" });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ error: "Authentication failed" });
    }

    // Generate JWT token containing user id
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "1h",
    });

    // Send token in response to the client, not the user object!
    console.log(token);
    res.status(200).json({ token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Login failed" });
  }
}

async function getUserById(req, res) {
    const {id} = req.params

    try {
      const user = await User.findById(id)
      const {password, ...userWithoutPassword} = user._doc
      res.status(200).json({"user" : userWithoutPassword});
      
    } catch (error) {
      console.log(error);
    }
}

module.exports = { register, login,getUserById };