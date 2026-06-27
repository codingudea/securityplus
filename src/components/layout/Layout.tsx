import { Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "./Sidebar";
import ChatWidget from "@/components/chat/ChatWidget";

const Layout = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {isAuthenticated && <Sidebar />}
      <main
        className={`transition-all duration-300 ${
          isAuthenticated ? "ml-64" : ""
        }`}
      >
        <div className="animate-fade-in">
          <Outlet />
        </div>
      </main>
      <ChatWidget />
    </div>
  );
};

export default Layout;
