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
import HomeGate from './Pages/HomeGate/HomeGate';
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
import AppealsHome from './Pages/Appeals/Pages/AppealsHome/AppealsHome';

// IMPORT LAYOUT COMPONENT
import AppealsLayout from './Pages/Appeals/Layout/AppealsLayout';
import Services from './Pages/Appeals/Pages/Services/Services';
import Service1 from './Pages/Appeals/Pages/Services/Service1/Service1';
import Service2 from './Pages/Appeals/Pages/Services/Service2/Service2';
import Service3 from './Pages/Appeals/Pages/Services/Service3/Service3';
import Service4 from './Pages/Appeals/Pages/Services/Service4/Service4';
import Service5 from './Pages/Appeals/Pages/Services/Service5/Service5';
import Service6 from './Pages/Appeals/Pages/Services/Service6/Service6';
import EmployeeGeneralTask from './Pages/Employee/GenralTasks/EmployeeGeneralTask';

// IMPORT COOKIE CONSENT COMPONENT
import CookieConsent from './Pages/Cookies/CookieConsent'; // adjust path to match your actual folder
import { initMetaPixel } from './Components/services/metaPixel';
import { initGoogleAds } from './Components/services/googleAds';
import PageTracker from './Components/services/PageTracker';

function App() {
  // 👇 MAINTENANCE MODE FLAG - SET TO true TO SHOW MAINTENANCE, false FOR NORMAL SITE
  const isMaintenanceMode = false;  // CHANGE THIS TO false WHEN SITE IS READY

  // 👇 COOKIE CONSENT STATUS - tracks accepted/rejected/null(not decided yet)
  const [consentStatus, setConsentStatus] = useState(null);

  const handleConsentChange = (status) => {
    setConsentStatus(status);
    if (status === "accepted") {
      initMetaPixel();
      initGoogleAds();
    }
  };

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
      {/* Cookie consent banner - shows on every route, sits outside Routes */}
      <CookieConsent onConsentChange={handleConsentChange} />

      <BrowserRouter>
        {/* PageTracker sits inside BrowserRouter so it can access useLocation().
            Fires PageView (Meta + Google) on every route change, site-wide. */}
        <PageTracker />

        <Routes>

          <Route path="/" element={<Home />} />
          {/* <Route path="/" element={<HomeGate />} /> */}

          <Route path="/terms" element={<TermsAndCondition />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/drive" element={<GoogleDrivePicker />} />
          <Route path="*" element={<NotFound />} />

          {/* APPEALS ROUTES - WITH FIXED NAVBAR LAYOUT */}
          <Route path="/appeals" element={
            <AppealsLayout>
              <AppealsHome />
            </AppealsLayout>
          } />

          {/* APPEALS ROUTES - WITH FIXED NAVBAR LAYOUT */}
          <Route path="/appeals/services/service1" element={
            <AppealsLayout>
              <Service1 />
            </AppealsLayout>
          } />

          <Route path="/appeals/services/service2" element={
            <AppealsLayout>
              <Service2 />
            </AppealsLayout>
          } />
          <Route path="/appeals/services/service3" element={
            <AppealsLayout>
              <Service3 />
            </AppealsLayout>
          } />
          <Route path="/appeals/services/service4" element={
            <AppealsLayout>
              <Service4 />
            </AppealsLayout>
          } />
          <Route path="/appeals/services/service5" element={
            <AppealsLayout>
              <Service5 />
            </AppealsLayout>
          } />
          <Route path="/appeals/services/service6" element={
            <AppealsLayout>
              <Service6 />   
            </AppealsLayout>
          } />

          <Route path="/cases" element={
            // <AppealsLayout>
              <Blogs />
            // </AppealsLayout>
          } />

          <Route path="/cases/:id" element={
            // <AppealsLayout>
              <BlogSingle />
            // </AppealsLayout>
          } />
          {/* <Route path="/appeals/cases" element={
            <AppealsLayout>
              <Blogs />
            </AppealsLayout>
          } />

          <Route path="/appeals/cases/:id" element={
            <AppealsLayout>
              <BlogSingle />
            </AppealsLayout>
          } /> */}

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

          <Route path="/admin/techorses" element={<AdminMonthLock />} />

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
          <Route path="/employee/genraltasks" element={<EmployeeGeneralTask />} />

          <Route path="/login" element={<ClientEmpLogin />} />



        </Routes>
      </BrowserRouter>
    </ModalProvider>
  );
}

export default App;