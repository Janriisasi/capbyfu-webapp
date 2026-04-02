import React from "react";
import AdminSidebar from "./adminSidebar";

const AdminLayout = ({ children, title, headerRight }) => {
  return (
    <div className="flex h-screen overflow-hidden bg-[#0A1614] font-display">
      <AdminSidebar />
      <main className="flex-1 flex flex-col overflow-y-auto">
        {/* Page header — pushed down on mobile to clear the fixed top navbar */}
        <header className="h-14 md:h-16 border-b border-[#C5C5C5]/15 bg-[#0A1614] flex items-center justify-between px-4 md:px-8 sticky top-14 md:top-0 z-10 flex-shrink-0">
          <h2 className="text-base md:text-lg font-bold text-[#F1F1F1]">
            {title}
          </h2>
          {headerRight && (
            <div className="flex items-center gap-2 md:gap-4">
              {headerRight}
            </div>
          )}
        </header>
        <div className="flex-1 p-4 md:p-8 mt-14 md:mt-0">{children}</div>
      </main>
    </div>
  );
};

export default AdminLayout;
