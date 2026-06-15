import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Routes, Route, Navigate } from "react-router-dom";
import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";

import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";


import { checkAuth } from "./redux_toolkit/slices/authSlice";
import { fetchUsers, setOnlineUsers } from "./redux_toolkit/slices/userSlice";
import { addMessage } from "./redux_toolkit/slices/messageSlice";
import { socket } from "./lib/socket";

const App = () => {
  const dispatch = useDispatch();
  const { user, isCheckingAuth } = useSelector((state) => state.auth);
  const users = useSelector((state) => state.users.users);
  

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  useEffect(() => {
    if (user?._id) {
      socket.emit("add-user", user._id);
    }

    socket.on("online-users", (onlineUserIds) => {
      dispatch(setOnlineUsers(onlineUserIds));

      const knownUserIds = new Set(users.map((sidebarUser) => sidebarUser._id));
      const hasUnknownOnlineUser = onlineUserIds.some(
        (userId) => userId !== user?._id && !knownUserIds.has(userId)
      );

      if (hasUnknownOnlineUser) {
        dispatch(fetchUsers());
      }
    });

    return () => {
      socket.off("online-users");
    };
  }, [user, users, dispatch]);

  useEffect(() => {
    socket.on("newMessage", (message) => {
      dispatch(addMessage(message));
    });

    return () => {
      socket.off("newMessage");
    };
  }, [dispatch]);

  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      
      <Navbar />

      <Routes>
        <Route
          path="/"
          element={user ? <HomePage /> : <Navigate to="/login" />}
        />
        <Route
          path="/signup"
          element={!user ? <SignupPage /> : <Navigate to="/" />}
        />
        <Route
          path="/login"
          element={!user ? <LoginPage /> : <Navigate to="/" />}
        />
        <Route
          path="/profile"
          element={user ? <ProfilePage /> : <Navigate to="/login" />}
        />

      </Routes>

      <Toaster />
    </div>
  );
};

export default App;
