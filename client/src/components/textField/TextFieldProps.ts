import { ChangeEvent } from 'react';
import { InfoType, LabelWeight } from '../../types/commonTypes';

export interface TextFieldProps {
  label: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  name?: string;
  type?: 'text' | 'password' | 'date' | 'number' | 'email';
  placeholder?: string;
  info?: string;
  infoType?: InfoType;
  lblWeight?: LabelWeight;
  multiline?: boolean;
  className?: string;
}
