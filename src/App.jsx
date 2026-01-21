import {BrowserRouter, Route, Routes} from "react-router-dom";
import {AuthProvider} from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Login from "@/pages/Login.jsx";
import Home from "@/pages/Home.jsx";
import StudentClasses from "@/pages/StudentClasses.jsx";
import Registrations from "@/pages/Registrations.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login/>}/>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home/>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student-classes"
            element={
              <ProtectedRoute>
                <StudentClasses/>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student-classes/:classId/registrations"
            element={
              <ProtectedRoute>
                <Registrations/>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
