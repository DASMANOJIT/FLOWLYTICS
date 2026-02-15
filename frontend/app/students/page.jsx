import { Suspense } from "react";
import StudentsContent from "./StudentsContent";

export default function StudentsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <StudentsContent />
    </Suspense>
  );
}
