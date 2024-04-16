import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";

import { AwsRum } from "aws-rum-web";

let awsRum = null;

try {
  const config = {
    sessionSampleRate: 1,
    guestRoleArn:
      "arn:aws:iam::074447690092:role/RUM-Monitor-us-east-1-074447690092-0565049623171-Unauth",
    identityPoolId: "us-east-1:e146cfd8-6e15-4350-b092-aea93f604e8b",
    endpoint: "https://dataplane.rum.us-east-1.amazonaws.com",
    telemetries: ["performance", "errors", "http"],
    allowCookies: true,
    enableXRay: false,
  };

  const APPLICATION_ID = "7b65e0c3-4292-4e8f-8901-341d0feb7c87";
  const APPLICATION_VERSION = "1.0.0";
  const APPLICATION_REGION = "us-east-1";

  awsRum = new AwsRum(
    APPLICATION_ID,
    APPLICATION_VERSION,
    APPLICATION_REGION,
    config
  );
} catch (error) {
  // Ignore errors thrown during CloudWatch RUM web client initialization
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    console.log("recordingError: " + error);
    // Log error out to AWS RUM
    awsRum.recordError("Error level goes here" + error);
  }
  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div>
          <h1>Something went wrong.</h1>
          <button
            onClick={() => {
              window.location.href = "/";
            }}
          >
            Clear Error
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <Router>
      <div>
        <p>
          <Link to="/">Home</Link>
        </p>
        <p>
          <Link to="/about">About</Link>
        </p>
        <p>
          <Link to="/users">Users</Link>
        </p>
        <p>
          <Link to="/welcome">Welcome</Link>
        </p>
        <ErrorBoundary>
          <Routes>
            <Route path="/about" element={<About />} />
            <Route path="/users" element={<Users />} />
            <Route path="/user/*" element={<User />} />
            <Route path="/welcome" element={<Welcome />} />
            <Route exact path="/" element={<Home />} />
          </Routes>
        </ErrorBoundary>
      </div>
    </Router>
  );
}

function Home() {
  return <h2>Home</h2>;
}

function About() {
  return <h2>About</h2>;
}

function Users() {
  return (
    <div>
      <h2>Users</h2>
      <p>
        <Link to="/user/1">User 1</Link>
      </p>
      <p>
        <Link to="/user/2">User 2</Link>
      </p>
      <p>
        <Link to="/user/3">User 3</Link>
      </p>
    </div>
  );
}

function User() {
  const location = useLocation();
  const user = location.pathname.split("/").pop();
  return <h2>User: {user}</h2>;
}

function Welcome() {
  // deliberate error
  return <h2>Welcome {this.subject.toUpperCase()}</h2>;
}
