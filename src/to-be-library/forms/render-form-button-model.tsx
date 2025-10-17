export interface RenderFormButtonProps {
  buttonLabel: string;
  wrapperClass?: string;
  onSubmit: (data: Record<string, string>) => void;
}
