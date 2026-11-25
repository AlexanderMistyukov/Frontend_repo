import { FC } from 'react';
import classNames from 'classnames';
import { TextFieldProps } from './TextFieldProps';
import './textFieldStyles.scss';

export const TextField: FC<TextFieldProps> = ({
  label,
  value,
  onChange,
  name,
  type = 'text',
  placeholder,
  info,
  infoType = 'hint',
  lblWeight = 'normal',
  multiline = false,
  className,
}) => {
  return (
    <div className={classNames('text-field', className)}>
      {label && (
        <label
          htmlFor={name}
          className={classNames('text-field__label', { 'text-field__label_strong': lblWeight === 'strong' })}
        >
          {label}
        </label>
      )}
      {multiline ? (
        <textarea
          id={name}
          name={name}
          className="text-field__input text-field__input_multiline"
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          rows={3}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          className="text-field__input"
          value={value}
          placeholder={placeholder}
          onChange={onChange}
        />
      )}
      {info && <span className={classNames('text-field__info', `text-field__info_${infoType}`)}>{info}</span>}
    </div>
  );
};
