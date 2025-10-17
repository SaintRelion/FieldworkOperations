import type {
  RenderFormFieldConfigs,
  RenderFormFieldValues,
} from "../render-form-fields-model";

const defaultEmailPattern = {
  value: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/,
  message: "Invalid email address",
};
export const getValidationRules = (field: RenderFormFieldConfigs) => {
  const rules: Partial<{
    required: string | boolean;
    pattern: { value: RegExp; message: string };
    minLength: { value: number; message: string };
    maxLength: { value: number; message: string };
    min: { value: number; message: string };
    max: { value: number; message: string };
  }> = {};

  if (field.required) {
    rules.required = "This field is required";
  }

  if (field.type === "email") {
    rules.pattern = field.pattern ?? defaultEmailPattern;
  }

  if (
    (field.type === "text" || field.type === "textarea") &&
    "pattern" in field &&
    field.pattern
  ) {
    rules.pattern = field.pattern;
  }

  if (
    (field.type === "text" ||
      field.type === "textarea" ||
      field.type === "password") &&
    "minLength" in field &&
    field.minLength
  ) {
    rules.minLength = {
      value: field.minLength,
      message: `Minimum ${field.minLength} characters`,
    };
  }

  if (
    (field.type === "text" ||
      field.type === "textarea" ||
      field.type === "password") &&
    "maxLength" in field &&
    field.maxLength
  ) {
    rules.maxLength = {
      value: field.maxLength,
      message: `Maximum ${field.maxLength} characters`,
    };
  }

  if (field.type === "number") {
    if ("min" in field && field.min !== undefined) {
      rules.min = {
        value: field.min,
        message: `Minimum value is ${field.min}`,
      };
    }
    if ("max" in field && field.max !== undefined) {
      rules.max = {
        value: field.max,
        message: `Maximum value is ${field.max}`,
      };
    }
  }

  return rules;
};

export function processFormData(
  data: Record<string, RenderFormFieldValues>,
  tableNames: string[],
): {
  formFields: Record<string, RenderFormFieldValues>;
  tables: Record<string, RenderFormFieldValues[]>;
} {
  const formFields: Record<string, RenderFormFieldValues> = {};
  const tables: Record<string, Record<string, RenderFormFieldValues>[]> = {};

  for (const key in data) {
    const matchedTable = tableNames.find((name) => key.startsWith(`${name}_`));

    if (!matchedTable) {
      formFields[key] = data[key];
      continue;
    }

    const [, columnName, rowIndexStr] =
      key.match(new RegExp(`^${matchedTable}_(.+)_(\\d+)$`)) || [];

    if (!columnName || rowIndexStr === undefined) continue;

    const rowIndex = parseInt(rowIndexStr);
    if (!tables[matchedTable]) tables[matchedTable] = [];

    if (!tables[matchedTable][rowIndex]) tables[matchedTable][rowIndex] = {};

    tables[matchedTable][rowIndex][columnName] = data[key];
  }

  return { formFields, tables };
}
