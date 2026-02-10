import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">AlmaFlow</h1>
          <p className="text-muted-foreground mt-2">
            Alumni Weekend Management System
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-border p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
