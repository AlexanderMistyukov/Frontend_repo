import { MouseEvent } from 'react';

export type InfoType = 'error' | 'success' | 'hint';

export type LabelWeight = 'normal' | 'strong';

export interface IconProps {
  size?: number;
  color?: string;
  className?: string;
  onClick?: (event: MouseEvent<SVGSVGElement>) => void;
}

export type DialogMode = 'create' | 'edit';
