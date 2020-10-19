import React from 'react';

import ScaleLoader from 'react-spinners/ScaleLoader';

function Loading() {
  return (
    <div className="w-full text-center h-screen fixed flex items-center justify-center">
      <div>
        <ScaleLoader height={32} width={4} radius={0} margin={2} />
      </div>
    </div>
  );
}

export default Loading;
