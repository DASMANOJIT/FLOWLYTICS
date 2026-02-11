"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const transactionId = searchParams.get("txnid");

  const [status, setStatus] = useState("Checking payment status...");

  useEffect(() => {
    if (!transactionId) {
      setStatus("Invalid payment reference.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    let retries = 0;
    const maxRetries = 8;

    const checkStatus = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/api/payments/phonepe/status/${transactionId}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();
        if (!res.ok) {
          setStatus(data.message || "Unable to verify payment.");
          return;
        }

        if (data.status === "paid") {
          setStatus("Payment successful. Redirecting to dashboard...");
          setTimeout(() => router.push("/student"), 1200);
          return;
        }

        if (data.status === "failed") {
          setStatus("Payment failed. Please try again.");
          return;
        }

        retries += 1;
        if (retries >= maxRetries) {
          setStatus("Payment is processing. Please check dashboard in a few minutes.");
          return;
        }

        setTimeout(checkStatus, 2000);
      } catch (err) {
        console.error("Status check failed", err);
        setStatus("Unable to verify payment status right now.");
      }
    };

    checkStatus();
  }, [router, transactionId]);

  return (
    <div style={{ maxWidth: 700, margin: "80px auto", textAlign: "center", padding: 20 }}>
      <h1>Payment Status</h1>
      <p>{status}</p>
      <button onClick={() => router.push("/student")}>Go to Dashboard</button>
    </div>
  );
}
