import React, { useState } from "react";
import axios from "axios";
import bcrypt from "bcryptjs";
import "./App.css";
import emailjs from "emailjs-com";

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState(""); // To store the user's name
  const [birthday, setBirthday] = useState(""); // To store the user's birthday
  const [address, setAddress] = useState(""); // To store the user's address
  const [code, setCode] = useState(""); // To store the verification code entered by the user
  const [generatedCode, setGeneratedCode] = useState(""); // To store the generated code sent to the user
  const [isLoggedIn, setIsLoggedIn] = useState(false); // To track login state
  const [isVerified, setIsVerified] = useState(false); // To track whether the code is verified
  const [isRegistering, setIsRegistering] = useState(false); // Track whether the user is in register mode

  // Store user data after successful login
  const [userData, setUserData] = useState(null); // Store the logged-in user's data

  // Generate a random 6-digit code
  const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();

  const sendEmail = () => {
    const code = generateCode();
    setGeneratedCode(code);

    // Template parameters for email
    const templateParams = {
      to_email: email,
      subject: "Your Verification Code",
      message: `Your verification code is: ${code}`,
    };

    emailjs.send("service_n0kujdi", "template_xthtmxb", templateParams, "evZGxzB7FsynqvBni")
      .then((response) => {
        console.log("Email sent successfully!", response.status, response.text);
        alert("Email sent successfully with the code!");
      })
      .catch((error) => {
        console.error("Failed to send email:", error);
        alert("An error occurred while sending the email.");
      });
  };

  const handleRegister = async () => {
    try {
      if (email && password && name && birthday && address) {
        // Send registration data to backend
        const response = await axios.post("http://localhost:5000/register", {
          email,
          password,
          name,
          birthday,
          address,
        });

        console.log(response.data.message);
        alert("Registration successful!");
      } else {
        alert("Please fill in all fields.");
      }
    } catch (err) {
      console.error("Error during registration", err);
      alert("An error occurred during registration.");
    }
  };

  const handleLogin = async () => {
    try {
      if (email && password) {
        // Send login data to backend
        const response = await axios.post("http://localhost:5000/login", { email, password });

        console.log(response.data.message);
        sendEmail(); // Send verification code if login is successful
        setIsLoggedIn(true); // Update login state

        // Assuming the backend returns user data (name, birthday, address, etc.)
        setUserData(response.data.user); // Store the user data
      } else {
        alert("Please enter both email and password.");
      }
    } catch (err) {
      console.error("Error during login", err);
      alert("Incorrect Credentials");
    }
  };

  const handleVerifyCode = () => {
    if (code === generatedCode) {
      setIsVerified(true); // Mark as verified if the code matches
      alert("Code verified successfully! You are logged in.");
    } else {
      alert("Incorrect verification code.");
    }
  };

  const handleLogout = () => {
    // Reset all states to allow the user to log in or register again
    setEmail("");
    setPassword("");
    setName("");
    setBirthday("");
    setAddress("");
    setCode("");
    setGeneratedCode("");
    setIsLoggedIn(false);
    setIsVerified(false);
    setUserData(null); // Clear user data
    setIsRegistering(false); // Reset to login mode
  };

  return (
    <div className="App">
      <h2>{isRegistering ? "Register" : "Login"}</h2>

      {/* Toggle between Login and Register forms */}
      <div className="toggle-buttons">
        <button onClick={() => setIsRegistering(false)}>Login</button>
        <button onClick={() => setIsRegistering(true)}>Register</button>
      </div>

      {!isLoggedIn && !isVerified ? (
        <div className="form-container">
          {isRegistering ? (
            <div className="register-form">
              <label>Email:</label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <label>Password:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <label>Name:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <label>Birthday:</label>
              <input
                type="date"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
              />
              <label>Address:</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
              <button onClick={handleRegister}>Register</button>
            </div>
          ) : (
            <div className="login-form">
              <label>Email:</label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <label>Password:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button onClick={handleLogin}>Login</button>
            </div>
          )}
        </div>
      ) : isLoggedIn && !isVerified ? (
        <div className="verification-form">
          <label>Enter the 6-digit code sent to your email:</label>
          <br />
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <br />
          <button onClick={handleVerifyCode}>Verify Code</button>
        </div>
      ) : (
        <div className="welcome-message">
          <h3>Welcome, {userData?.name}!</h3>
          <p>Your birthday: {userData?.birthday}</p>
          <p>Your address: {userData?.address}</p>
          <p>You are successfully logged in and verified!</p>
          <button onClick={handleLogout}>Logout</button>
        </div>
      )}
    </div>
  );
}

export default App;
