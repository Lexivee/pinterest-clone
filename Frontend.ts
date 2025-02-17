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
  
  In the above code, we have created a simple React application with three components: Register, Login, and Home. We have used the  BrowserRouter  component from the  react-router-dom  library to create a single-page application. We have also used the  Route  and  Link  components to navigate between different components. 
  Step 4: Create the Register Component 
  In this step, we will create the Register component. This component will contain a form with input fields for the user to enter their name, email, and password. The user can submit the form to register.