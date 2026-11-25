import { ReactNode } from 'react';

export interface DialogProps {
  title: string;
  isOpen: boolean;
  onOk: () => void;
  onCancel: () => void;
  okText?: string;
  cancelText?: string;
  error?: string;
  busy?: boolean;
  className?: string;
  children?: ReactNode;
}
