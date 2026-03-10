import {BrowserRouter, Route, useLocation} from "react-router-dom";
import {useEffect} from "react";
import {AuthProvider} from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import Login from "@/pages/Login.jsx";
import Home from "@/pages/Home.jsx";
import AttendanceClasses from "@/pages/AttendanceClasses.jsx";
import AttendanceRegistration from "@/pages/AttendanceRegistration.jsx";
import AttendanceReportGlobal from "@/pages/AttendanceReportGlobal.jsx";
import AttendanceReportIndividual from "@/pages/AttendanceReportIndividual.jsx";
import GradeClasses from "@/pages/GradeClasses.jsx";
import GradeStudents from "@/pages/GradeStudents.jsx";
import CertificateClasses from "@/pages/CertificateClasses.jsx";
import CertificateStudents from "@/pages/CertificateStudents.jsx";
import {FaroRoutes} from '@grafana/faro-react';
import NotFound from "@/pages/NotFound.jsx";
import ErrorBoundary from "@/components/ErrorBoundary.jsx";

const ROUTE_TITLES = [
  {pattern: /^\/attendance/, title: "Attendance"},
  {pattern: /^\/grades/, title: "Grades"},
  {pattern: /^\/certificates/, title: "Certificates"},
  {pattern: /^\/login/, title: "Login"},
  {pattern: /^\/$/, title: "Home"},
];

function DocumentTitle() {
  const {pathname} = useLocation();

  useEffect(() => {
    const match = ROUTE_TITLES.find(({pattern}) => pattern.test(pathname));
    document.title = match ? `${match.title} - Omniscience` : "Omniscience";
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <DocumentTitle/>
      <AuthProvider>
        <ErrorBoundary>
          <FaroRoutes>
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
              path="/attendance"
              element={
                <ProtectedRoute>
                  <Layout>
                    <AttendanceClasses/>
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/attendance/:classId/registrations"
              element={
                <ProtectedRoute>
                  <Layout>
                    <AttendanceRegistration/>
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/attendance/:classId/report"
              element={
                <ProtectedRoute>
                  <Layout>
                    <AttendanceReportGlobal/>
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/attendance/:classId/students/:studentId/report"
              element={
                <ProtectedRoute>
                  <Layout>
                    <AttendanceReportIndividual/>
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/grades"
              element={
                <ProtectedRoute>
                  <Layout>
                    <GradeClasses/>
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/grades/:classId"
              element={
                <ProtectedRoute>
                  <Layout>
                    <GradeStudents/>
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/certificates"
              element={
                <ProtectedRoute>
                  <Layout>
                    <CertificateClasses/>
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/certificates/:classId"
              element={
                <ProtectedRoute>
                  <Layout>
                    <CertificateStudents/>
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound/>}/>
          </FaroRoutes>
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  );
}
