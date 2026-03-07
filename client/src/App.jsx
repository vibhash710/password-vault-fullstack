import './App.css'
import Navbar from './components/Navbar'
import Manager from './components/Manager'
import Footer from './components/Footer'
import PrivacyPolicy from './components/PrivacyPolicy'
import TermsOfService from './components/TermsOfService'
import Contact from './components/Contact'
import Login from './components/Login'
import Signup from './components/Signup'
import AuthCallback from './components/AuthCallback'
import ProtectedRoute from './components/ProtectedRoute'
import PublicRoute from './components/PublicRoute'
import SetupMasterPassword from './components/SetupMasterPassword';
import VerifyEmail from './components/VerifyEmail';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import ResetVault from './components/ResetVault'
import { AuthProvider } from './context/AuthContext'
import PasswordHealthDashboard from './components/PasswordHealthDashboard';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ScrollToTop from "./components/ScrollToTop";


// 1. Define the Layout (The permanent frame of your app)
const Layout = () => {
  return (
    <div className="dark:bg-slate-950 bg-white min-h-screen flex flex-col transition-colors duration-200">
      <ScrollToTop />
      <Navbar />
      <div className="flex-grow">
        {/* Outlet is where the specific page content (Manager, Login, etc.) will render */}
        <Outlet />
      </div>
      <Footer />
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar
        newestOnTop
        closeOnClick
        pauseOnFocusLoss={false}
        draggable={false}
        pauseOnHover={false}
        theme="dark"
        style={{ zIndex: 9999 }}
      />
    </div>
  )
}

function App() {

  // 2. Configure your routes
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />, // Use the layout here
      children: [
        {
          path: "/",
          element: (
            <ProtectedRoute>
              <Manager />
            </ProtectedRoute>
          )
        },
        {
          path: "/setup-master-password",
          element: <SetupMasterPassword />
        },
        {
          path: "/privacy",
          element: <PrivacyPolicy />
        },
        {
          path: "/terms",
          element: <TermsOfService />
        },
        {
          path: "/contact",
          element: <Contact />
        },
        {
          path: "/signin",
          element: (
            <PublicRoute>
              <Login />
            </PublicRoute>
          )
        },
        {
          path: "/signup",
          element: (
            <PublicRoute>
              <Signup />
            </PublicRoute>
          )
        },
        {
          path: "/auth/callback",
          element: <AuthCallback />
        },
        {
          path: "/verify-email",
          element: <VerifyEmail />
        },
        {
          path: "/forgot-password",
          element: <ForgotPassword />
        },
        {
          path: "/health-dashboard",
          element: (
            <ProtectedRoute>
              <PasswordHealthDashboard />
            </ProtectedRoute>
          )
        },
        {
          path: "/reset-password",
          element: <ResetPassword />
        },
        {
          path: "/reset-vault",
          element: <ResetVault />
        }
      ]
    }
  ])

  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  )
}

export default App