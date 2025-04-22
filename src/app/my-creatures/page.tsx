import { Suspense } from "react";
import MyCreatures from "./components/my-creatures";

export default function MyCreaturesPage() {
  return (
    <Suspense>
      <MyCreatures />
    </Suspense>
  );
}
