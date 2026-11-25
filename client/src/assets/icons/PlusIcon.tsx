import { FC } from 'react';
import { IconProps } from '../../types/commonTypes';

export const PlusIcon: FC<IconProps> = ({ size = 24, color = 'currentColor', className, onClick }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill={color}
    className={className}
    onClick={onClick}
  >
    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
  </svg>
);
