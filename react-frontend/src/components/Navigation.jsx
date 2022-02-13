import "../styles/Navigation.css";
import { Link } from "react-router-dom";

export const Navigation = (props) => {

  return (
    <div>
      <ul className="nav">
        <li className="nav-item">
          <Link to="/register" className="nav-link">
            Register
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/notifier" className="nav-link">
            Notifier
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/login" className="nav-link">
            Login
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Navigation;
