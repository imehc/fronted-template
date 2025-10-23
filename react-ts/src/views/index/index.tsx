import { Link, Outlet } from "@tanstack/react-router";
import { type FC, Suspense, lazy } from "react";

const TanStackRouterDevtools =
	process.env.NODE_ENV === "production"
		? () => null
		: lazy(() =>
			import("@tanstack/router-devtools").then((res) => ({
				default: res.TanStackRouterDevtools,
			})),
		);

const Index: FC = () => {
	return (
		<>
			<div className="p-2 flex gap-2">
				<Link to="/" className="[&.active]:font-bold">
					Home
				</Link>
				<Link to="/about" className="[&.active]:font-bold">
					About
				</Link>
			</div>
			<hr />
			<Outlet />
			<Suspense>
				<TanStackRouterDevtools />
			</Suspense>
		</>
	);
};

export default Index;
