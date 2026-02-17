import { Suspense } from "react";
import PaymentSuccessContent from "./PaymentSuccessContent.jsx";

export const dynamic = "force-dynamic";

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div>Loading payment status...</div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
