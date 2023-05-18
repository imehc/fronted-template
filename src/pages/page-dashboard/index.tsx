import React, { type FC } from 'react';

export const PageDashboard: FC = () => {
  return (
    <React.Fragment>
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
    </React.Fragment>
  );
};

export default PageDashboard;
