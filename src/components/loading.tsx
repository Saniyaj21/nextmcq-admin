'use client';

import React from 'react';

const Loading = () => {
  return (
    <div className="w-12 h-12 grid place-items-center">
      <div className="relative w-10 h-10">
        <div className="w-full h-full border-[3px] border-blue-600 rounded-full border-t-transparent animate-spin"></div>
        <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-600 font-semibold text-sm animate-pulse">
          NM
        </span>
      </div>
    </div>
  );
};

export default Loading;
