"use client";

import CreatureForm from "./creature-form";
import CreatureStatblock from "./creature-statblock";

export default function Editor() {
	return (
		<div className="grid grid-cols-2 gap-6">
			<CreatureForm />
			<CreatureStatblock />
		</div>
	);
}
