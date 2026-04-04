"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGlobalStorage } from "@/hooks/GlobalStorage";

export default function RedirectIfAuthenticated() {
  const router = useRouter();
  const { isAuthenticated } = useGlobalStorage();

  useEffect(() => {
    if (isAuthenticated()) {
      router.push("/home");
    }
  }, [isAuthenticated, router]);

  return null;
}
