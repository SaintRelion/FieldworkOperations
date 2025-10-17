import { FormProvider, useForm } from "react-hook-form";
import type { RenderFormProps } from "./render-form-model";

const RenderForm = ({ children, wrapperClass }: RenderFormProps) => {
  const form = useForm({ mode: "onChange", shouldUnregister: true });

  return (
    <FormProvider {...form}>
      <div className={wrapperClass}>{children}</div>
    </FormProvider>
  );
};

export default RenderForm;
