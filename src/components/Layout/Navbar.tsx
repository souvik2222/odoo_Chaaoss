
import React, {
  useState,
  useEffect,
  useRef,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  MessageSquare,
  Bell,
  User,
  LogOut,
  Settings,
  Search,
  Plus,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useNotifications } from "../../contexts/NotificationContext";
import NotificationDropdown from "../Notifications/NotificationDropdown";

const Navbar: React.FC = () => {
  /* ------------------------------------------------------------------ */
  /* Hooks & context                                                    */
  /* ------------------------------------------------------------------ */
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  /* ------------------------------------------------------------------ */
  /* Local UI state                                                     */
  /* ------------------------------------------------------------------ */
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  /* ------------------------------------------------------------------ */
  /* Refs for outside‑click detection                                   */
  /* ------------------------------------------------------------------ */
  const notifBtnRef = useRef<HTMLButtonElement | null>(null);
  const notifBoxRef = useRef<HTMLDivElement | null>(null);
  const userBtnRef = useRef<HTMLButtonElement | null>(null);
  const userBoxRef = useRef<HTMLDivElement | null>(null);

  /* ------------------------------------------------------------------ */
  /* Logout                                                              */
  /* ------------------------------------------------------------------ */
  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    setShowNotifications(false);
    navigate("/");
  };

  /* ------------------------------------------------------------------ */
  /* Close menus on any outside click or Esc key                        */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    const handleDocClick = (e: MouseEvent) => {
      const target = e.target as Node;

      // USER MENU
      if (
        showUserMenu &&
        userBoxRef.current &&
        !userBoxRef.current.contains(target) &&
        userBtnRef.current &&
        !userBtnRef.current.contains(target)
      ) {
        setShowUserMenu(false);
      }

      // NOTIFICATION DROPDOWN
      if (
        showNotifications &&
        notifBoxRef.current &&
        !notifBoxRef.current.contains(target) &&
        notifBtnRef.current &&
        !notifBtnRef.current.contains(target)
      ) {
        setShowNotifications(false);
      }
    };

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowUserMenu(false);
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleDocClick);
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("mousedown", handleDocClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [showUserMenu, showNotifications]);

  /* ------------------------------------------------------------------ */
  /* Auto‑close any open dropdown on route change or auth change        */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    setShowUserMenu(false);
    setShowNotifications(false);
  }, [location.pathname, user]);

  /* ------------------------------------------------------------------ */
  /* JSX                                                                */
  /* ------------------------------------------------------------------ */
  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo ----------------------------------------------------- */}
          <Link to="/" className="flex items-center space-x-2">
            <MessageSquare className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">StackIt</span>
          </Link>

  

          {/* Right side ---------------------------------------------- */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                

                {/* Notifications */}
                <div className="relative" ref={notifBoxRef}>
                  <button
                    ref={notifBtnRef}
                    onClick={() => setShowNotifications((v) => !v)}
                    className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <Bell className="h-6 w-6" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </button>
                  {showNotifications && (
                    <NotificationDropdown
                      onClose={() => setShowNotifications(false)}
                    />
                  )}
                </div>

                {/* User menu */}
                <div className="relative" ref={userBoxRef}>
                  <button
                    ref={userBtnRef}
                    onClick={() => setShowUserMenu((v) => !v)}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-medium text-gray-700">
                      {user.username}
                    </span>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                      <Link
                        to={`/profile/${user._id}`}
                        className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <User className="h-4 w-4" />
                        <span>Profile</span>
                      </Link>

                      <Link
                        to="/settings"
                        className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Settings className="h-4 w-4" />
                        <span>Settings</span>
                      </Link>

                      <hr className="my-1" />

                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 w-full text-left transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
