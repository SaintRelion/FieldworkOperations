import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { RenderDialogProps } from "./render-dialog-model";
import { Button } from "@/components/ui/button";

export const RenderDialog = ({
  triggerLabel,
  triggerClass,
  headerTitle,
  description,
  contentClass,
  children,
}: RenderDialogProps) => (
  <Dialog>
    {triggerLabel && (
      <DialogTrigger asChild>
        <Button className={triggerClass}>{triggerLabel}</Button>
      </DialogTrigger>
    )}
    <DialogContent className={contentClass}>
      {(headerTitle || description) && (
        <DialogHeader>
          {headerTitle && <DialogTitle>{headerTitle}</DialogTitle>}
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
      )}
      {children}
    </DialogContent>
  </Dialog>
);
