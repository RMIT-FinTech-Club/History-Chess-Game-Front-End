"use client";

import * as React from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { FaKey } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const PasswordInput = React.forwardRef<
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
        className="absolute left-4 top-2.5 text-black text-[1.5em] cursor-pointer"
        onClick={() => document.getElementById("password-input")?.focus()}
      />

      {/* Password Input Field */}
      <Input
        id="password-input"
        type={showPassword ? "text" : "password"}
        className={cn(
          "pl-10 pr-10 bg-[#C4C4C4] border-gray-600 text-[#000000]",
          className
        )} // Adjust padding for icons
        ref={ref}
        {...props}
      />

      {/* Show/Hide Password Button */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer hover:bg-transparent p-1"
        onClick={() => setShowPassword((prev) => !prev)}
        disabled={disabled}
      >
        {showPassword && !disabled ? (
          <EyeIcon
            className="h-5 w-5 text-[#000000] cursor-pointer"
            aria-hidden="true"
          />
        ) : (
          <EyeOffIcon
            className="h-5 w-5 text-[#000000] cursor-pointer"
            aria-hidden="true"
          />
        )}
        <span className="sr-only">
          {showPassword ? "Hide password" : "Show password"}
        </span>
      </Button>

      {/* Hide browser's default password toggle */}
      <style>{`
          .hide-password-toggle::-ms-reveal,
          .hide-password-toggle::-ms-clear {
            visibility: hidden;
            pointer-events: none;
            display: none;
          }
        `}</style>
    </div>
  );
});
PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
