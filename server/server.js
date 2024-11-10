const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const bodyParser = require("body-parser");

const app = express();
const port = 5000;

// Enable CORS for all origins
app.use(cors());
app.use(bodyParser.json());

// Register endpoint
app.post("/register", async (req, res) => {
    const { email, password, name, birthday, address } = req.body;
  
    if (!email || !password || !name || !birthday || !address) {
      return res.status(400).json({ message: "All fields are required" });
    }
  
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Create the user object including the personal information
      const user = { email, password: hashedPassword, name, birthday, address };
  
      fs.readFile('./users.json', 'utf8', (err, data) => {
        let users = [];
        if (err && err.code !== 'ENOENT') {
          return res.status(500).json({ message: "Error reading users file" });
        }
  
        if (data) {
          users = JSON.parse(data);
        }
  
        // Add the new user to the list
        users.push(user);
  
        // Save the updated list back to the file
        fs.writeFile('./users.json', JSON.stringify(users), (err) => {
          if (err) {
            return res.status(500).json({ message: "Error saving user data" });
          }
          res.status(200).json({ message: "User registered successfully" });
        });
      });
    } catch (err) {
      console.error("Error during registration", err);
      res.status(500).json({ message: "An error occurred during registration" });
    }
  });
  

// Login endpoint
app.post("/login", async (req, res) => {
    const { email, password } = req.body;
  
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
  
    try {
      fs.readFile('./users.json', 'utf8', (err, data) => {
        if (err) {
          return res.status(500).json({ message: "Error reading users file" });
        }
  
        const users = JSON.parse(data);
        const user = users.find(u => u.email === email);
  
        if (!user) {
          return res.status(400).json({ message: "User not found" });
        }
  
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) {
            return res.status(500).json({ message: "Error during password comparison" });
          }
  
          if (isMatch) {
            return res.status(200).json({
              message: "Login successful",
              user: { name: user.name, birthday: user.birthday, address: user.address },
            });
          } else {
            return res.status(400).json({ message: "Incorrect password" });
          }
        });
      });
    } catch (err) {
      console.error("Error during login", err);
      res.status(500).json({ message: "An error occurred during login" });
    }
  });
  

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
