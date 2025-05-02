"use client";

import * as React from "react";
import { FaKey, FaEye, FaEyeSlash } from "react-icons/fa6";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const NewPasswordConfirm = React.forwardRef<
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
        onClick={() => document.getElementById("password-confirm")?.focus()}
      />

      {/* Password Input Field */}
      <Input
        id="password-confirm"
        type={showPassword ? "text" : "password"}
        className={cn(
          "pl-10 pr-10 bg-[#C4C4C4] border-gray-600 text-[#000000]",
          className
        )}
        ref={ref}
        {...props}
      />

      {/* Toggle Password Visibility */}
      <button
        type="button"
        className={cn(
          "absolute top-1/2 right-6 md:right-4 transform -translate-y-1/2",
          "bg-transparent border-none p-0",
          "text-[#2F2F2F] text-[3vh] cursor-pointer",
          props.disabled && "opacity-50 cursor-not-allowed"
        )}
        onClick={() => setShowPassword(!showPassword)}
        disabled={props.disabled}
        aria-label={showPassword ? "Hide password" : "Show password"}
      >
        {showPassword ? (
          <FaEyeSlash aria-hidden="true" />
        ) : (
          <FaEye aria-hidden="true" />
        )}
      </button>

      {/* Hide browser's default password toggle */}
      <style>{`
        #password-confirm::-ms-reveal,
        #password-confirm::-ms-clear {
          visibility: hidden;
          pointer-events: none;
          display: none;
        }
      `}</style>
    </div>
  );
});
NewPasswordConfirm.displayName = "NewPasswordConfirm";

export { NewPasswordConfirm };