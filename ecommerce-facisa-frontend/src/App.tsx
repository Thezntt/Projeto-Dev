import { Route, Routes } from "react-router-dom";
import Login from "./login/Login";
import SignUp from "./sign-up/SignUp";
import Home from "./home/Home";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/home" element={<Home />} />
    </Routes>
  );
}

export default App;
