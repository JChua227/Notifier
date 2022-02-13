import "../styles/Home.css";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="home">
      <h2>Notifier</h2>
      <div className="homeButtons">
        <div className='register-button'>
          <Link to="/Register" type="button" className="btn btn-primary">
            Register
          </Link>
        </div>
        <div className='login-button'>
          <Link to="Login" type="button" className="btn btn-primary">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
