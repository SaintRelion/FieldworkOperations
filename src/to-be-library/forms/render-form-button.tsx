import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import type { RenderFormButtonProps } from "./render-form-button-model";

export const RenderFormButton = ({
  buttonLabel,
  wrapperClass,
  onSubmit,
}: RenderFormButtonProps) => {
  const { handleSubmit } = useFormContext();

  return (
    <div className={wrapperClass}>
      <Button
        variant={"outline"}
        onClick={handleSubmit(onSubmit)}
        className="cursor-pointer"
      >
        {buttonLabel}
      </Button>
    </div>
  );
};
