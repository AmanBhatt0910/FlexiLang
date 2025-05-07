"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import AuthComponent from "@/components/AuthComponent";

export default function AuthPage() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");

  return (
    <div className="pt-16 min-h-screen">
      <AuthComponent defaultTab={tab === "register" ? "register" : "login"} />
    </div>
  );
}