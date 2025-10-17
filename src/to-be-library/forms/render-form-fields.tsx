"use client";

import { CalendarFold } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";

import type {
  RenderFormFieldConfigs,
  RenderFormFieldValues,
} from "./render-form-fields-model";
import { getValidationRules } from "./lib/render-form-utils";
import { formatDate } from "./lib/date-utils";

type RenderFormFieldsProps = {
  fields: RenderFormFieldConfigs[];
  wrapperClass?: string;
  defaultValues?: Record<string, RenderFormFieldValues>;
};

export const RenderFormFields = ({
  fields,
  wrapperClass = "grid grid-cols-2 space-x-2 space-y-2",
  defaultValues,
}: RenderFormFieldsProps) => {
  const [dateOpen, setDateOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date(Date.now()));
  const [month, setMonth] = useState<Date | undefined>(date);

  const {
    register,
    setValue,
    formState: { errors },
  } = useFormContext();

  useEffect(() => {
    if (!defaultValues) return;

    fields.forEach((field) => {
      const key = field.name;
      const val = defaultValues?.[key];

      if (val !== undefined && val !== null) {
        if (field.type == "date")
          setValue(key, formatDate(new Date(val.toString())));
        else setValue(key, val);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className={wrapperClass}>
        {fields.map((field) => {
          const fieldName = field.name;

          const rules = getValidationRules(field);
          return (
            <div key={fieldName}>
              <label
                className="mb-1 block text-sm font-medium"
                htmlFor={fieldName}
              >
                {field.label}
              </label>

              {["text", "email", "number", "password"].includes(field.type) && (
                <Input
                  type={field.type}
                  {...register(fieldName, rules)}
                  placeholder={field.placeholder || field.label}
                />
              )}

              {field.type === "textarea" && (
                <Textarea
                  {...register(fieldName, rules)}
                  placeholder={field.placeholder || field.label}
                />
              )}

              {field.type === "select" && (
                <Select
                  {...register(fieldName, rules)}
                  defaultValue={defaultValues?.[fieldName].toString() ?? ""}
                  onValueChange={(val) =>
                    setValue(fieldName, val, { shouldValidate: true })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={field.placeholder || "Select"} />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(field.options).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {field.type === "checkbox" && (
                <div className="mt-1 flex items-center space-x-2">
                  <Checkbox
                    id={fieldName}
                    {...register(fieldName, rules)}
                    defaultChecked={
                      (defaultValues?.[fieldName] as boolean) ?? false
                    }
                    onCheckedChange={(val) =>
                      setValue(fieldName, val, { shouldValidate: true })
                    }
                  />
                  <label htmlFor={fieldName} className="text-sm">
                    {field.label}
                  </label>
                </div>
              )}

              {field.type === "date" && (
                <div className="relative">
                  <Input
                    id="date"
                    placeholder="Select a Date"
                    readOnly={true}
                    {...register(fieldName, rules)}
                  />
                  <Popover open={dateOpen} onOpenChange={setDateOpen}>
                    <PopoverTrigger asChild>
                      <CalendarFold
                        id="date-picker"
                        className="absolute top-1/2 right-4 size-4 -translate-y-1/2 cursor-pointer"
                      />
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto overflow-hidden p-0"
                      align="end"
                      alignOffset={-8}
                      sideOffset={10}
                    >
                      <div className="flex flex-col gap-2 bg-[#DDD] pb-2">
                        <Calendar
                          mode="single"
                          selected={date}
                          captionLayout="dropdown"
                          month={month}
                          onMonthChange={setMonth}
                          onSelect={(date) => {
                            setDate(date);
                            setValue(fieldName, formatDate(date), {
                              shouldValidate: true,
                            });
                            setDateOpen(false);
                          }}
                        />
                        <div className="mr-2 ml-auto">
                          <button
                            className="cursor-pointer bg-black/10 px-2 py-1 text-xs hover:bg-black/20"
                            onClick={() => {
                              const today = new Date(Date.now());

                              setDate(today);
                              setValue(fieldName, formatDate(today), {
                                shouldValidate: true,
                              });
                              setDateOpen(false);
                            }}
                          >
                            Today
                          </button>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              )}

              {field.type === "file" && (
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx,.xlsx,.csv,.zip,.txt"
                  {...register(fieldName, rules)}
                />
              )}

              {field.type === "image" && (
                <Input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  {...register(fieldName, rules)}
                />
              )}

              {errors[fieldName] && (
                <p className="mt-1 text-sm text-red-500">
                  {errors[fieldName]?.message?.toString()}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
};
