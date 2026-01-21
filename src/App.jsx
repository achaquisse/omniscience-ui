import {BrowserRouter, Route, Routes} from "react-router-dom";
import {AuthProvider} from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import Login from "@/pages/Login.jsx";
import Home from "@/pages/Home.jsx";
import StudentClasses from "@/pages/StudentClasses.jsx";
import Registrations from "@/pages/Registrations.jsx";
import ClassAttendanceReport from "@/pages/ClassAttendanceReport.jsx";
import StudentAttendanceReport from "@/pages/StudentAttendanceReport.jsx";

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
                <Layout>
                  <Home/>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student-classes"
            element={
              <ProtectedRoute>
                <Layout>
                  <StudentClasses/>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student-classes/:classId/registrations"
            element={
              <ProtectedRoute>
                <Layout>
                  <Registrations/>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student-classes/:classId/attendance-report"
            element={
              <ProtectedRoute>
                <Layout>
                  <ClassAttendanceReport/>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student-classes/:classId/students/:studentId/attendance-report"
            element={
              <ProtectedRoute>
                <Layout>
                  <StudentAttendanceReport/>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
