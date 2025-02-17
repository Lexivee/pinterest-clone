import { BrowserRouter as Router, Route, Switch, Link } from "react-router-dom";
import Register from "./components/Register";
import Login from "./components/Login";
import Home from "./components/Home";
import styles from "./styles";

const App = () => {
  return (
    <Router>
      <div style={styles.container}>
        <nav style={styles.navbar}>
          <Link to="/home" style={styles.navLink}>Home</Link>
          <Link to="/register" style={styles.navLink}>Register</Link>
          <Link to="/login" style={styles.navLink}>Login</Link>
        </nav>

        <Switch>
          <Route path="/register" component={Register} />
          <Route path="/login" component={Login} />
          <Route path="/home" component={Home} />
        </Switch>
      </div>
    </Router>
  );
};

export default App;
