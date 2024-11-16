import { Suspense } from "react";
import Editor from "./components/editor";

export default async function CreatureEditor() {
	return (
		<Suspense>
			<Editor />
		</Suspense>
	);
}
