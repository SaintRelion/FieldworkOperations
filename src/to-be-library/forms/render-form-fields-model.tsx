export type RenderFormFieldValues = string | number | boolean | object;

export type RenderFormFieldConfigs =
  | TextFieldConfig
  | PasswordFieldConfig
  | NumberFieldConfig
  | EmailFieldConfig
  | DateFieldConfig
  | SelectFieldConfig
  | CheckboxFieldConfig
  | FileFieldConfig;

interface BaseFieldConfig {
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
}

export interface TextFieldConfig extends BaseFieldConfig {
  type: "text" | "textarea";
  minLength?: number;
  maxLength?: number;
  pattern?: {
    value: RegExp;
    message: string;
  };
}

export interface PasswordFieldConfig extends BaseFieldConfig {
  type: "password";
  minLength?: number;
  maxLength?: number;
  pattern?: {
    value: RegExp;
    message: string;
  };
}

export interface NumberFieldConfig extends BaseFieldConfig {
  type: "number";
  min?: number;
  max?: number;
}

export interface EmailFieldConfig extends BaseFieldConfig {
  type: "email";
  pattern?: {
    value: RegExp;
    message: string;
  };
}

export interface DateFieldConfig extends BaseFieldConfig {
  type: "date";
}

export interface SelectFieldConfig extends BaseFieldConfig {
  type: "select";
  options: Record<string, string>;
}

export interface CheckboxFieldConfig extends BaseFieldConfig {
  type: "checkbox";
}

export interface FileFieldConfig extends BaseFieldConfig {
  type: "file" | "image";
}
