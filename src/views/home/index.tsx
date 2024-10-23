import { css } from "#/css";
import type { FC } from "react";

const Home: FC = () => {
	return (
		<div className="p-2">
			<div className="w-full flex items-center justify-center gap-x-4 text-4xl p-2 mt-4">
				<div
					className="animate-bounce-alt animate-duration-1s animate-count-infinite i-twemoji-frog "
					m="10"
					text="36px"
					display="inline-block"
				/>
				<div className="i-vscode-icons:file-type-light-pnpm" />
				<div className="i-vscode-icons:file-type-light-pnpm?mask text-red-300" />
			</div>
			<div className={css({ fontSize: "2xl", fontWeight: "bold" })}>
				Hello 🐼!
			</div>
		</div>
	);
};

export default Home;
