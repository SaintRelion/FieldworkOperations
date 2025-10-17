import { isValidElement, useEffect, useState } from "react";
import type { RenderContentOptions as RenderContentOptions } from "./render-content-model";

export function RenderContent<T>({
  data,
  onItemClick,
  renderItem,

  ui = {},
}: RenderContentOptions<T>) {
  const {
    wrapperClass = "mt-5",
    layoutClass = "flex flex-col",
    itemHoverClass = "",
    itemsBordered = false,
    itemsShadowed = false,
  } = ui;

  const [layoutError, setLayoutError] = useState("");

  useEffect(() => {
    if (!Array.isArray(data)) {
      console.warn("[RenderBlocks] Expected 'data' to be an array.");
      return;
    }

    const allowedPrefixes = [
      "grid",
      "flex",
      "block",
      "inline",
      "contents",
      "table",
      "flow-",
      "items-",
      "justify-",
      "content-",
      "place-",
      "gap-",
      "cols-",
      "rows-",
    ];

    const responsivePrefixes = ["sm:", "md:", "lg:", "xl:", "2xl:"];
    const layoutClasses = layoutClass.trim().split(/\s+/);
    const invalidClasses: string[] = [];

    for (const cls of layoutClasses) {
      const normalized = responsivePrefixes.some((bp) => cls.startsWith(bp))
        ? cls.replace(/^(sm:|md:|lg:|xl:|2xl:)/, "")
        : cls;

      const isValid = allowedPrefixes.some((prefix) =>
        normalized.startsWith(prefix),
      );

      if (!isValid) invalidClasses.push(cls);
    }

    if (invalidClasses.length > 0) {
      setLayoutError(
        `[RenderBlocks] Invalid layout classes: ${invalidClasses.join(", ")}. Ensure only layout-related Tailwind utilities are used.`,
      );
    } else {
      setLayoutError("");
    }
  }, [data, layoutClass]);

  const baseItemClass = [
    itemsBordered ? "border rounded-xl" : "",
    itemsShadowed ? "shadow-sm" : "",
    itemHoverClass ? `hover:${itemHoverClass}` : "",
    "transition-all",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={`${wrapperClass} ${layoutClass}`}>
      {data.map((item, i) => {
        return (
          <div
            key={i}
            className={baseItemClass}
            onClick={() => onItemClick?.(item, i)}
          >
            {renderItem ? (
              renderItem(item, i)
            ) : (
              <div className="text-muted-foreground p-4 text-sm">
                <pre>
                  {" "}
                  {JSON.stringify(
                    item,
                    (_, value) =>
                      typeof value === "object" && isValidElement(value)
                        ? "[ReactElement]"
                        : typeof value === "function"
                          ? "[Function]"
                          : value,
                    2,
                  )}
                </pre>
              </div>
            )}
          </div>
        );
      })}

      {layoutError != "" && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-600">
          ⚠️ {layoutError}
        </div>
      )}
    </section>
  );
}
