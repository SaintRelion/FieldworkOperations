import type {
  RenderFormFieldConfigs,
  RenderFormFieldValues,
} from "./render-form-fields-model";

export interface RenderFormGroup {
  label?: string;
  fields: RenderFormFieldConfigs[];
  condition?: (values: Record<string, RenderFormFieldValues>) => boolean;
}
