export interface ButtonProps {
  title: string;
  onClick?: () => void;
  appearance?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  submit?: boolean;
  className?: string;
}
