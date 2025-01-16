import React from "react";
import Navbar from "./components/Navbar";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="w-[100vw] h-[100vh] grid grid-rows-[auto_1fr] overflow-hidden">
      <Navbar />
      <div className="w-[100vw] md:w-[65vw] mx-auto p-4 py-0 pb-10 md:p-0 overflow-y-auto">
        <div className="w-full">{children}</div>
      </div>
    </div>
  );
};

export default Layout;
