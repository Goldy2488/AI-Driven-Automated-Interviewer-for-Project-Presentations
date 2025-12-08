import React from "react";
export default function StatusBar({ status }) {
  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
      <p className="text-sm font-medium">{status}</p>
    </div>
  );
}
