import { FC } from 'react';
import { IconProps } from '../../types/commonTypes';

export const DownloadIcon: FC<IconProps> = ({ size = 24, color = 'currentColor', className, onClick }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill={color}
    className={className}
    onClick={onClick}
  >
    <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
  </svg>
);
