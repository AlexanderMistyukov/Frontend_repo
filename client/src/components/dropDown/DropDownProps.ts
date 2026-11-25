import { LabelWeight } from '../../types/commonTypes';

export interface DropDownItem {
  value: string | number;
  label: string;
}

export interface DropDownProps {
  label: string;
  value: string | number;
  items: DropDownItem[];
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  lblWeight?: LabelWeight;
  className?: string;
}
