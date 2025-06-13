"use client";

import * as React from "react";
import { FaKey, FaEye, FaEyeSlash } from "react-icons/fa6";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const PasswordConfirm = React.forwardRef<
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
        className="
        absolute text-black cursor-pointer
        top-[1.55vh] left-[1.45vw] sm:left-[1.2vw] md:left-[1vw] lg:left-[0.95vw] text-[5vh]
        "
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
        className="
        absolute top-[1.55vh] right-[1.45vw] sm:right-[1.2vw] md:right-[1vw] lg:right-[0.95vw]
        bg-transparent border-none p-0 cursor-pointer
        disabled:cursor-not-allowed disabled:opacity-50
        "
        onClick={() => setShowPassword((prev) => !prev)}
        disabled={props.disabled}
        aria-label={showPassword ? "Hide password" : "Show password"}
      >
        {showPassword ? (
          <FaEyeSlash className="text-black text-[5vh]" aria-hidden="true" />
        ) : (
          <FaEye className="text-black text-[5vh]" aria-hidden="true" />
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
PasswordConfirm.displayName = "PasswordConfirm";

export { PasswordConfirm };