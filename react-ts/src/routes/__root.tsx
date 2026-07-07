import { createRootRoute } from "@tanstack/react-router";
import Index from "~/views/index";

export const Route = createRootRoute({
	component: () => <Index />,
});
