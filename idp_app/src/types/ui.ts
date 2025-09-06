/**
 * UI Component type definitions
 * Provides strict typing for all UI components
 */

import type { ReactNode, CSSProperties, HTMLAttributes, ButtonHTMLAttributes } from 'react';

/**
 * Standard size variants for UI components
 */
export type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Standard color variants for UI components
 */
export type ComponentVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'neutral';

/**
 * Standard placement options for positioned components
 */
export type ComponentPlacement = 'top' | 'right' | 'bottom' | 'left' | 'center';

/**
 * Base props that all components should accept
 */
export interface BaseComponentProps {
  className?: string;
  style?: CSSProperties;
  id?: string;
  'data-testid'?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
}

/**
 * Props for button components
 */
export interface ButtonProps extends BaseComponentProps, Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  variant?: ComponentVariant;
  size?: ComponentSize;
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children: ReactNode;
}

/**
 * Props for input components
 */
export interface InputProps extends BaseComponentProps, Omit<HTMLAttributes<HTMLInputElement>, 'onChange'> {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'date' | 'time' | 'datetime-local';
  value?: string | number;
  defaultValue?: string | number;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  autoFocus?: boolean;
  autoComplete?: string;
  size?: ComponentSize;
  error?: boolean;
  helperText?: string;
  label?: string;
  name?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
}

/**
 * Props for select/dropdown components
 */
export interface SelectOption<T = string> {
  value: T;
  label: string;
  disabled?: boolean;
  group?: string;
}

export interface SelectProps<T = string> extends BaseComponentProps {
  options: SelectOption<T>[];
  value?: T;
  defaultValue?: T;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  multiple?: boolean;
  size?: ComponentSize;
  error?: boolean;
  helperText?: string;
  label?: string;
  name?: string;
  onChange?: (value: T | T[]) => void;
  onBlur?: () => void;
  onFocus?: () => void;
}

/**
 * Props for modal/dialog components
 */
export interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: ComponentSize;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  footer?: ReactNode;
  children: ReactNode;
}

/**
 * Props for toast/notification components
 */
export interface ToastProps extends BaseComponentProps {
  message: string;
  type?: ComponentVariant;
  duration?: number;
  position?: ComponentPlacement;
  dismissible?: boolean;
  onDismiss?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Props for loading/spinner components
 */
export interface LoadingProps extends BaseComponentProps {
  size?: ComponentSize;
  color?: ComponentVariant;
  overlay?: boolean;
  text?: string;
}

/**
 * Props for card components
 */
export interface CardProps extends BaseComponentProps {
  title?: string;
  subtitle?: string;
  header?: ReactNode;
  footer?: ReactNode;
  bordered?: boolean;
  shadow?: boolean | 'sm' | 'md' | 'lg' | 'xl';
  padding?: ComponentSize;
  children: ReactNode;
}

/**
 * Props for alert/banner components
 */
export interface AlertProps extends BaseComponentProps {
  type: ComponentVariant;
  title?: string;
  message: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  icon?: ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Props for badge components
 */
export interface BadgeProps extends BaseComponentProps {
  variant?: ComponentVariant;
  size?: ComponentSize;
  rounded?: boolean;
  dot?: boolean;
  count?: number;
  max?: number;
  children?: ReactNode;
}

/**
 * Props for avatar components
 */
export interface AvatarProps extends BaseComponentProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: ComponentSize;
  shape?: 'circle' | 'square' | 'rounded';
  status?: 'online' | 'offline' | 'away' | 'busy';
  fallbackIcon?: ReactNode;
}

/**
 * Props for tooltip components
 */
export interface TooltipProps extends BaseComponentProps {
  content: ReactNode;
  placement?: ComponentPlacement;
  trigger?: 'hover' | 'click' | 'focus';
  delay?: number;
  arrow?: boolean;
  children: ReactNode;
}

/**
 * Props for tabs components
 */
export interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
  disabled?: boolean;
  icon?: ReactNode;
}

export interface TabsProps extends BaseComponentProps {
  items: TabItem[];
  defaultActiveId?: string;
  activeId?: string;
  onChange?: (id: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  size?: ComponentSize;
  fullWidth?: boolean;
}

/**
 * Props for pagination components
 */
export interface PaginationProps extends BaseComponentProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showFirstLast?: boolean;
  showPrevNext?: boolean;
  maxVisible?: number;
  size?: ComponentSize;
  variant?: ComponentVariant;
}

/**
 * Props for progress components
 */
export interface ProgressProps extends BaseComponentProps {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  variant?: ComponentVariant;
  size?: ComponentSize;
  striped?: boolean;
  animated?: boolean;
}

/**
 * Props for form components
 */
export interface FormFieldProps<T = unknown> {
  name: string;
  value: T;
  error?: string;
  touched?: boolean;
  onChange: (value: T) => void;
  onBlur: () => void;
}

export interface FormProps extends BaseComponentProps {
  onSubmit: (values: Record<string, unknown>) => void | Promise<void>;
  initialValues?: Record<string, unknown>;
  validationSchema?: unknown;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  children: ReactNode | ((props: FormRenderProps) => ReactNode);
}

export interface FormRenderProps {
  values: Record<string, unknown>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
  handleChange: (name: string, value: unknown) => void;
  handleBlur: (name: string) => void;
  handleSubmit: () => void;
  setFieldValue: (name: string, value: unknown) => void;
  setFieldError: (name: string, error: string) => void;
}