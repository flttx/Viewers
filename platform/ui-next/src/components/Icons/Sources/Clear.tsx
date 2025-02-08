import React from 'react';
import type { IconProps } from '../types';

export const Clear = (props: IconProps) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 19 19"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <g
      fill="none"
      fillRule="evenodd"
    >
      <circle
        stroke="#909399"
        cx="9.5"
        cy="9.5"
        r="9.5"
      />
      <g
        stroke="#909399"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      >
        <path d="m5.188 5.187 8.625 8.625M13.813 5.187l-8.625 8.625" />
      </g>
    </g>
  </svg>
);

export default Clear;
