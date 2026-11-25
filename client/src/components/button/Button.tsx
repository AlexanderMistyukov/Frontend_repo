import { FC } from 'react';
import classNames from 'classnames';
import { ButtonProps } from './ButtonProps';
import './buttonStyles.scss';

export const Button: FC<ButtonProps> = ({
  title,
  onClick,
  appearance = 'primary',
  disabled = false,
  submit = false,
  className,
}) => {
  return (
    <button
      type={submit ? 'submit' : 'button'}
      className={classNames('button', `button_${appearance}`, className)}
      onClick={onClick}
      disabled={disabled}
    >
      {title}
    </button>
  );
};
