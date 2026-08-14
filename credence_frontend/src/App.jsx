import { useState } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ModalProvider from './Pages/Home/Model/ModalProvider';
import AdminLogin from './Pages/Admin/Login/AdminLogin';
import AdminRegister from './Pages/Admin/Register/AdminRegister';
import AdminDashboard from './Pages/Admin/Dashboard/AdminDashboard';
import ClientSidebar from './Pages/Client/Layout/ClientSidebar';
import ClientLogin from './Pages/Client/Login/ClientLogin';
import ClientEnroll from './Pages/Client/Enroll/ClientEnroll';
import ClientDashboard from './Pages/Client/Dashboard/ClientDashboard';
import AdminClientEnrollments from './Pages/Admin/AdminClientEnroll/AdminClientEnrollments';
import AdminEmployees from './Pages/Admin/EmployeeManage/AdminEmployees';
import EmployeeLogin from './Pages/Employee/Login/EmployeeLogin';
import EmployeeDashboard from './Pages/Employee/Dashboard/EmployeeDashboard';
import EmployeeAssignedClients from './Pages/Employee/AssignedClients/EmployeeAssignedClients';
import EmployeeTaskLogs from './Pages/Employee/TaskLogs/EmployeeTaskLogs';
import AdminEmployeeTasks from './Pages/Admin/EmployeeTaskView/AdminEmployeeTasks';
import AdminClients from './Pages/Admin/ClientsInfo/AdminClients';
import ClientFilesUpload from './Pages/Client/Upload/ClientFilesUpload';
import ClientEmpLogin from './Pages/Authentication/Client&EmployeeLogin/ClientEmpLogin';
import AdminAuth from './Pages/Admin/Authentication/AdminAuth';
import Home from './Pages/Home/Home';
import TermsAndCondition from './Pages/TermsAndCondition/TermsConditions';
import ClientProfile from './Pages/Client/Profile/ClientProfile';
import ActivityLogs from './Pages/Admin/ActivityLogs/ActivityLogs';
// import CustomDesign from './Pages/Employee/Testing/CustomDesign';
// import CustomDesignStable from './Pages/Employee/Testing/CustomDesignStable';
import AdminNotesPanel from './Pages/Admin/Dashboard/Notes/AdminNotesPanel';
import EmployeeNotesPanel from './Pages/Employee/Dashboard/EmpNotes/EmployeeNotesPanel';
import PrivacyPolicy from './Pages/PrivacyPolicy/PrivacyPolicy';
import NotFound from './Pages/NotFound/NotFound';
import GoogleDrivePicker from './Pages/Testing/GoogleDrivePicker';
import ClientPaymentInfo from './Pages/Employee/ClientPayment/ClientPaymentInfo';
import AgreementPdf from './Pages/Admin/AgreementPdf/AgreementPdf';

// IMPORT YOUR MAINTENANCE COMPONENT
import MaintenanceComponent from './Pages/MaintenanceComponent/MaintenanceComponent';
import BlogSingle from './Pages/Blogs/Blogsingle/Blogsingle';
// import BlogList from './Pages/Blogs/Blogslist/BlogList';
import Blogs from './Pages/Blogs/Blogs';
import BlogManagement from './Pages/Admin/BlogManagement/BlogManagement';
import AdminMonthLock from './Pages/Admin/AdminManage/AdminMonthLock';
import EmployeeFinanceRequests from './Pages/Employee/FinanceReq/EmployeeFinanceRequests';

function App() {
  // 👇 MAINTENANCE MODE FLAG - SET TO true TO SHOW MAINTENANCE, false FOR NORMAL SITE
  const isMaintenanceMode = false;  // CHANGE THIS TO false WHEN SITE IS READY

  // If maintenance mode is ON, show only the maintenance component
  if (isMaintenanceMode) {
    return (
      <ModalProvider>
        <BrowserRouter>
          <Routes>
            {/* Only maintenance route available */}
            <Route path="*" element={<MaintenanceComponent />} />
          </Routes>
        </BrowserRouter>
      </ModalProvider>
    );
  }

  // Normal site rendering (when maintenance is OFF)
  return (
    <ModalProvider>
      <BrowserRouter>
        <Routes>

          <Route path="/" element={<Home />} />
          <Route path="/terms" element={<TermsAndCondition />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/drive" element={<GoogleDrivePicker />} />
          <Route path="*" element={<NotFound />} />


          <Route path="/cases" element={<Blogs />} />
          <Route path="/cases/:id" element={<BlogSingle />} />

          {/* ADMIN ROUTES  */}

          <Route path="/admin/login" element={<AdminAuth />} />
          <Route path="/admin/register" element={<AdminRegister />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/employees" element={<AdminEmployees />} />
          <Route path="/admin/employees-tasks" element={<AdminEmployeeTasks />} />
          <Route path="/admin/enrollments" element={<AdminClientEnrollments />} />
          <Route path="/admin/clients" element={<AdminClients />} />
          <Route path="/admin/logs" element={<ActivityLogs />} />
          <Route path="/admin/notes" element={<AdminNotesPanel />} />
          <Route path="/admin/pdf" element={<AgreementPdf />} />
          <Route path="/admin/blogs" element={<BlogManagement />} />

          <Route path="/admin/th" element={<AdminMonthLock />} />

          {/* CLIENT ROUTES  */}
          {/* <Route path="/client/login" element={<ClientLogin />} /> */}
          <Route path="/client/enroll" element={<ClientEnroll />} />
          <Route path="/client/dashboard" element={<ClientDashboard />} />
          <Route path="/client/upload" element={<ClientFilesUpload />} />
          <Route path="/client/profile" element={<ClientProfile />} />


          {/* EMPLOYEE ROUTES  */}
          {/* <Route path="/employee/login" element={<EmployeeLogin />} /> */}
          <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
          <Route path="/employee/assigned" element={<EmployeeAssignedClients />} />
          <Route path="/employee/clientpayment" element={<ClientPaymentInfo />} />
          <Route path="/employee/tasks" element={<EmployeeTaskLogs />} />
          <Route path="/employee/notes" element={<EmployeeNotesPanel />} />
          <Route path="/employee/finance" element={<EmployeeFinanceRequests />} />

          <Route path="/login" element={<ClientEmpLogin />} />



        </Routes>
      </BrowserRouter>
    </ModalProvider>
  );
}

export default App;