import React from "react";
import { ShoppingCart, UserPlus, LogIn, LogOut, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { useUserStore } from "../stores/useUserStore";

const Navbar = () => {
  const { user, logout } = useUserStore();
  const isAdmin = user?.role === "admin";
  return (
    <header className="fixed top-0 left-0 w-full bg-gray-900 bg-opacity-90 backdrop-blur-md shadow-lg z-40 transition-all duration-300 border-b border-blue-800">
      <div className="container min-w-auto px-4 py-3">
        <div className="flex flex-wrap items-center justify-between">
        <Link
          to="/"
          className="text-2xl font-bold text-blue-400 items-center space-x-2 flex"
        >
          Glamazon
        </Link>
        <nav className="flex flex-wrap items-center gap-4 ">
          <Link
            to={"/"}
            className="text-gray-300 hover:text-blue-300 transform duration-300 ease-in-out"
          >
            Home
          </Link>
          {user && (
            <Link to={"/cart"} className="relative group text-gray-300 group-hover:text-blue-300 duration-300 ease-in-out">
              <ShoppingCart className="inline-block mr-1 group-hover:text-blue-300" size={20} />
              <span className="hidden sm:inline">Cart</span>
              <span className="absolute -top-2 -left-2 bg-violet-700 text-white rounded-full px-1.5 py-0.5 text-xs group-hover:bg-violet-600 transition duration-300 ease-in-out">3</span>
            </Link>
          )}
          {isAdmin && (
            <Link
              to={"/secret-dashboard"} className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded-md font-medium transition duration-300 ease-in-out flex items-center">
              <Lock className="inline-block mr-1" size={18}/>
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
          )}
          {user ? (
            <button className="bg-gray-600 hover:bg-gray-500 text-white py-2 px-4 rounded-md flex items-center transition duration-300 ease-in-out"
            onClick={logout}>
              <LogOut className="inline-block mr-1" size={18} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          ) : (
            <>
              <Link
                to={"/signup"}
                className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded-md font-medium transition duration-300 ease-in-out flex items-center"
              >
                <UserPlus className="mr-2" size={18} />
                <span className="hidden sm:inline">Sign Up</span>
              </Link>
              <Link
                to={"/login"}
                className="bg-gray-600 hover:bg-gray-500 text-white px-3 py-1 rounded-md font-medium transition duration-300 ease-in-out flex items-center"
              >
                <LogIn className="inline-block mr-1" size={18} />
                <span className="hidden sm:inline">Login</span>
              </Link>

            </>
          )}
        </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
