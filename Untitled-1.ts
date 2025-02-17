import { useState } from "react";
import axios from "axios";
import { Link, useHistory } from "react-router-dom";
import styles from "../styles";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const history = useHistory();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await axios.post("http://localhost:3000/login", formData);
      alert("Login successful");
      history.push("/home");
    } catch (error) {
      setError(error.response?.data || "Invalid credentials");
    }
  };

  return (
    <div style={styles.formContainer}>
      <h2>Login</h2>
      {error && <p style={styles.error}>{error}</p>}
      <form onSubmit={handleSubmit} style={styles.form}>
        <input type="email" name="email" placeholder="Email" onChange={handleChange} style={styles.input} />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} style={styles.input} />
        <button type="submit" style={styles.button}>Login</button>
      </form>
      <Link to="/register" style={styles.link}>Don't have an account? Register</Link>
    </div>
  );
};

export default Login;
