import { FC } from 'react';
import { WidgetLayoutProps } from './WidgetLayoutProps';
import './widgetLayoutStyles.scss';

export const WidgetLayout: FC<WidgetLayoutProps> = ({ children }) => {
  return <div className="widget-layout">{children}</div>;
};
