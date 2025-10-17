import type { RenderFormFieldConfigs } from "../render-form-fields-model";

export function buildFieldsFromModel(
  fieldsConfig: Record<string, Partial<RenderFormFieldConfigs>>,
): RenderFormFieldConfigs[] {
  return Object.entries(fieldsConfig).map(([key, config]) => {
    const typedConfig = config as RenderFormFieldConfigs;
    return {
      required: true,
      ...typedConfig,
      name: key,
    } satisfies RenderFormFieldConfigs;
  });
}
