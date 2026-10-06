"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAccessToken } from "./api";

export function useRequireAuth() {
  const router = useRouter();

  useEffect(() => {
    if (!getAccessToken()) {
      router.push("/login");
    }
  }, []);
}
