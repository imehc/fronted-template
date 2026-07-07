import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import "virtual:uno.css";
import "@unocss/reset/normalize.css";
import "./index.css";

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

const rootElement = document.getElementById("root") as HTMLDivElement;
if (!rootElement.innerHTML) {
	const root = ReactDOM.createRoot(rootElement);
	root.render(
		<StrictMode>
			<RouterProvider router={router} />
		</StrictMode>,
	);
}
