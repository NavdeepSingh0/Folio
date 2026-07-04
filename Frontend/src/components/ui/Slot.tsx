import * as React from "react";
import { cn } from "@/lib/utils";

export interface SlotProps extends React.HTMLAttributes<HTMLElement> {
    children?: React.ReactNode;
}

export const Slot = React.forwardRef<HTMLElement, SlotProps>(
    ({ children, ...slotProps }, forwardedRef) => {
        if (!React.isValidElement(children)) {
            return null;
        }

        return React.cloneElement(children, {
            ...mergeProps(slotProps, children.props),
            ref: mergeRefs(forwardedRef, (children as any).ref),
        });
    }
);
Slot.displayName = "Slot";

function mergeProps(slotProps: any, childProps: any) {
    const merged = { ...childProps, ...slotProps };
    const mergedClassName = cn(slotProps.className, childProps.className);
    if (mergedClassName) merged.className = mergedClassName;
    return merged;
}

function mergeRefs(...refs: any[]) {
    return (node: any) => {
        refs.forEach((ref) => {
            if (typeof ref === "function") ref(node);
            else if (ref != null) ref.current = node;
        });
    };
}
