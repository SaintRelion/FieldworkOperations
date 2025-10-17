import { useFormContext, useWatch } from "react-hook-form";
import type { RenderFormGroup } from "./render-form-group-models";
import { RenderFormFields } from "./render-form-fields";

export const RenderFormGroups = ({
  groups,
  wrapperClass = "mb-6 space-y-4",
}: {
  groups: RenderFormGroup[];
  wrapperClass?: string;
}) => {
  const { control } = useFormContext();
  const values = useWatch({ control }); // watch entire form for dynamic conditions

  return (
    <>
      {groups.map((group, idx) => {
        // Evaluate group condition
        const shouldRender = !group.condition || group.condition(values || {});

        if (!shouldRender) return null;

        return (
          <div key={idx} className={wrapperClass}>
            {group.label && (
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                {group.label}
              </h3>
            )}

            <RenderFormFields fields={group.fields} />
          </div>
        );
      })}
    </>
  );
};
