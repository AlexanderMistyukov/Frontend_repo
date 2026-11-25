import { FC } from 'react';
import classNames from 'classnames';
import { DropDownProps } from './DropDownProps';
import './dropDownStyles.scss';

export const DropDown: FC<DropDownProps> = ({
  label,
  value,
  items,
  onChange,
  placeholder,
  disabled = false,
  lblWeight = 'normal',
  className,
}) => {
  return (
    <div className={classNames('drop-down', className)}>
      {label && (
        <label className={classNames('drop-down__label', { 'drop-down__label_strong': lblWeight === 'strong' })}>
          {label}
        </label>
      )}
      <select
        className="drop-down__select"
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      >
        {placeholder !== undefined && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {items.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
    </div>
  );
};
