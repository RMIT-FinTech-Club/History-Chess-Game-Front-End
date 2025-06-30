"use client";

import * as React from "react";
import { FaKey, FaEye, FaEyeSlash } from "react-icons/fa6";
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
        className="absolute top-1/2 left-6 md:left-4 transform -translate-y-1/2 text-[#2F2F2F] text-[4vh] cursor-pointer"
        onClick={() => {
          document.getElementById("new-password")?.focus();
        }}
      />

      {/* Password Input Field */}
      <Input
        id="new-password"
        type={showPassword ? "text" : "password"}
        className={cn("pl-10 pr-10 bg-[#c4c4c4] text-[#000000] focus:border-[0.2rem] focus:border-[#DBB968]" , className)}
        ref={ref}
        {...props}
      />

      {/* Right-side Eye Icon for toggling password visibility */}
      {showPassword ? (
        <FaEyeSlash
          className="absolute top-1/2 right-7 transform -translate-y-1/2 
                      text-[#2F2F2F] text-[2.25vh] cursor-pointer"
          onClick={() => setShowPassword(false)}
          title="Hide password"
          aria-label="Hide password"
        />
      ) : (
        <FaEye
          className="absolute top-1/2 right-7 transform -translate-y-1/2 
                      text-[#2F2F2F] text-[2.25vh] cursor-pointer"
          onClick={() => setShowPassword(true)}
          title="Show password"
          aria-label="Show password"
        />
      )}
    </div>
  );
});
NewPassword.displayName = "NewPassword";

export { NewPassword };