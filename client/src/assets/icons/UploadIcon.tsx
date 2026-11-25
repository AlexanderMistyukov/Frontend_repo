import { FC } from 'react';
import { IconProps } from '../../types/commonTypes';

export const UploadIcon: FC<IconProps> = ({ size = 24, color = 'currentColor', className, onClick }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill={color}
    className={className}
    onClick={onClick}
  >
    <path d="M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z" />
  </svg>
);
