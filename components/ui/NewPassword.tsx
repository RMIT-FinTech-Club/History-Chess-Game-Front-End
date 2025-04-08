"use client";

import * as React from "react";
import { FaKey } from "react-icons/fa6";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const NewPassword = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input">
>(({ className, ...props }, ref) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const disabled =
    props.value === "" || props.value === undefined || props.disabled;

  return (
    <div className="relative">
      {/* Left-side Key Icon */}
      <FaKey
        className="absolute top-1/2 left-6 md:left-4 transform -translate-y-1/2 
                        text-[#2F2F2F] text-[3vh] cursor-pointer"
        onClick={() => document.getElementById("new-password")?.focus()}
      />

      {/* Password Input Field */}
      <Input
        id="new-password"
        type={showPassword ? "text" : "password"}
        className={cn(
          "pl-10 pr-10 bg-[#C4C4C4] border-gray-600 text-[#000000]",
          className
        )} // Adjust padding for icons
        ref={ref}
        {...props}
      />
    </div>
  );
});
NewPassword.displayName = "NewPassword";

export { NewPassword };
