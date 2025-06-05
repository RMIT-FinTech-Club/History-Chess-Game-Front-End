"use client";
import React, { useState, useRef, useEffect } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { NewPassword } from "@/components/ui/NewPassword";
import { NewPasswordConfirm } from "@/components/ui/NewPasswordConfirm";
import { OldPassword } from "@/components/ui/OldPassword";
import { MdEmail } from "react-icons/md";
import { FaUser } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { Label } from "@radix-ui/react-label";
import { MdOutlineFileUpload } from "react-icons/md";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import styles from "@/css/profile.module.css";
import { useGlobalStorage } from "@/components/GlobalStorage"; // Import useGlobalStorage

const formSchema = z
  .object({
    email: z.string(),
    username: z.string(),
    oldPassword: z.string(),
    password: z
      .string()
      .min(1, { message: "Please enter your password." })
      .min(8, { message: "Password must be at least 8 characters." })
      .refine((value) => /[A-Z]/.test(value), {
        message: "Password must contain at least one uppercase letter.",
      })
      .refine((value) => /[0-9]/.test(value), {
        message: "Password must contain at least one number.",
      })
      .refine((value) => /[^A-Za-z0-9]/.test(value), {
        message: "Password must contain at least one special character.",
      }),
    confirmPassword: z
      .string()
      .min(1, { message: "Please confirm your password." }),
    language: z.string(),
    walletAddress: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof formSchema>;

const AccountSettings = () => {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [initialLoading, setInitialLoading] = useState(true);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { accessToken } = useGlobalStorage(); // Retrieve accessToken

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      username: "",
      oldPassword: "",
      password: "",
      confirmPassword: "",
      language: "English",
      walletAddress: "",
    },
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!accessToken) {
        console.error("No access token found");
        router.push("/sign_in"); // Redirect to sign-in if no token
        return;
      }

      setInitialLoading(true);
      try {
        const response = await fetch("http://localhost:8080/users/profile", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`, // Add Authorization header
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch profile: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.user) {
          form.reset({
            email: data.user.email || "",
            username: data.user.username || "",
            oldPassword: "",
            password: "",
            confirmPassword: "",
            language: "English",
            walletAddress: data.user.walletAddress || "",
          });
        } else {
          throw new Error("Invalid response data: 'user' field missing");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setInitialLoading(false);
      }
    };
    fetchProfile();
  }, [form, accessToken, router]); // Add dependencies to useEffect

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const isMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(password);

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("username", data.username);
      formData.append("email", data.email);
      formData.append("oldPassword", data.oldPassword);
      if (data.password) formData.append("password", data.password);
      if (data.walletAddress)
        formData.append("walletAddress", data.walletAddress);
      if (fileInputRef.current?.files?.[0]) {
        formData.append("avatar", fileInputRef.current.files[0]);
      }

      const response = await fetch("http://localhost:8080/users/profile", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        form.setValue("oldPassword", "");
        form.setValue("password", "");
        form.setValue("confirmPassword", "");
        setPassword("");
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else {
        throw new Error(result.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = () => {
    const userNameInput = document.querySelector("#username") as HTMLInputElement;
    if (userNameInput) {
      userNameInput.disabled = false; // Enable all input fields
      userNameInput.classList.remove("disabled:opacity-100", "disabled:cursor-not-allowed");
      userNameInput.classList.add("text-black");
      userNameInput.focus();
    }
    
    const editText = document.getElementById("edit-text");
    if (editText) {
      editText.textContent = "Save";
      (editText as HTMLElement).style.color = "#000000";
      (editText as HTMLElement).style.fontWeight = "bold";
    }
    const editIcon = document.getElementById("edit-icon");
    if (editIcon) {
      (editIcon as HTMLElement).style.display = "none";
    }
    const editButton = document.getElementById("edit-button");
    if (editButton) {
      editButton.classList.remove("border");
      editButton.classList.add("bg-[#F7D27F]");
    }
  };

  return (
    <div className="h-full">
      <div className="flex items-center">
        <Image
          width={100}
          height={100}
          src="/Settings.svg"
          alt="Settings icon"
          className="w-[2.5vw] md:w-[2vw] mb-[1vh]"
        />
        <h3 className="text-[3vw] md:text-[2vw] leading-[2vw] ml-[1vw] font-bold">
          Basic Information
        </h3>
      </div>

      <hr className="border-t border-[#FFFFFF]" />

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className={`flex flex-col w-full max-h-[80vh] mt-[2vh] ${styles.list_container}`}
        >
          <div className="w-full flex flex-row items-center">
            <div
              className="md:w-[8vw] md:aspect-square w-[14vw] aspect-square border-[0.3vh] border-dashed border-[#8E8E8E] flex items-center justify-center rounded-md relative cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              {imagePreview ? (
                <Image
                  src={imagePreview}
                  alt="Uploaded avatar"
                  width={0}
                  height={0}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                  className="rounded-md"
                />
              ) : (
                <div className="flex items-center justify-center bg-[#DCB968] rounded-full w-[2.5vw] h-[2.5vw] min-w-[3vh] min-h-[3vh] p-[1vh]">
                  <MdOutlineFileUpload className="text-white text-[3vw] min-text-[3vh]" />
                </div>
              )}
              <input
                type="file"
                accept=".jpg,.png,.webp,.svg"
                ref={fileInputRef}
                onChange={handleImageChange}
                className="hidden"
              />
            </div>

            <div className="ml-[2vw]">
              <div>
                <Label className="text-[2.25vw] md:text-[1.25vw]">
                  User Information
                </Label>
              </div>

              <FormItem>
                <div className="relative w-[55vw] md:w-[25vw]">
                  <FaUser
                    className="absolute top-1/2 left-6 md:left-4 transform -translate-y-1/2 
                        text-[#2F2F2F] text-[2.5vh] pointer-events-none"
                  />
                  <Input
                    disabled
                    id="username"
                    className="pl-21 py-[2.5vh] md:pl-12 md:py-[3vh] 
                    rounded-[1.5vh] bg-[#F9F9F9] text-[#8C8C8C] 
                    !text-[2vh] md:!text-[2.5vh] font-normal
                    disabled:opacity-100
                    disabled:cursor-not-allowed"
                    autoComplete="off"
                    {...form.register("username")}
                  />
                </div>
              </FormItem>

              <FormItem>
                <div className="relative w-[55vw] md:w-[25vw] mt-[2vh]">
                  <MdEmail
                    className="absolute top-1/2 left-6 md:left-4 transform -translate-y-1/2 
                        text-[#2F2F2F] text-[3vh] pointer-events-none"
                  />
                  <Input
                    disabled
                    className="pl-21 py-[2.5vh] md:pl-12 md:py-[3vh] 
                    rounded-[1.5vh] bg-[#F9F9F9] text-[#8C8C8C] 
                    !text-[2vh] md:!text-[2.5vh] font-normal
                    disabled:opacity-100
                    disabled:cursor-not-allowed"
                    autoComplete="off"
                    {...form.register("email")}
                  />
                </div>
              </FormItem>
            </div>

            <button
              id="edit-button"
              onClick={handleEditClick}
              className="flex self-start ml-[5vw] gap-2 cursor-pointer border border-[#E9B654] rounded-[1vh] py-[1vh] px-[1vw] hover:bg-[#E9B654] transition-colors"
            >
              <div id="edit-text" className="text-[2.25vw] md:text-[1.25vw]">Edit</div>
              <img
                id="edit-icon"
                src="/edit_icon.svg"
                alt="Edit icon"
                className="w-[1.5rem]"
              />
            </button>
          </div>

          {/* Uncomment and adjust the password fields if needed */}
          {/* <div className="flex justify-between items-center m-[0.5rem] ml-0 mr-0">
            <div className="font-bold text-[1.8rem]">Change Password</div>
            <a href="" className="text-[#E9B654] text-[1.2rem] underline">
              Forgot your password?
            </a>
          </div>

          <FormField
            control={form.control}
            name="oldPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[2.5vw] md:text-[1.5vw]">
                  Old Password
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <OldPassword
                      placeholder="Enter your current password"
                      {...field}
                      className="pl-21 py-[3vh] md:pl-12 md:py-[3.5vh] 
                          rounded-[1.5vh]
                          !text-[2.5vh] md:!text-[3vh] font-normal"
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-[2.5vh] text-red-500" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[2.5vw] md:text-[1.5vw]">
                  New Password
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <NewPassword
                      placeholder="Enter your new password"
                      {...field}
                      className="pl-21 py-[3vh] md:pl-12 md:py-[3.5vh] 
                          rounded-[1.5vh]
                          !text-[2.5vh] md:!text-[3vh] font-normal"
                      onChange={(e) => {
                        field.onChange(e);
                        setPassword(e.target.value);
                      }}
                    />
                  </div>
                </FormControl>
                <ul className="font-normal text-[2.5vh] rounded-md">
                  <li
                    className={isMinLength ? "text-green-500" : "text-gray-500"}
                  >
                    ✔ 8 characters minimum
                  </li>
                  <li
                    className={
                      hasUppercase ? "text-green-500" : "text-gray-500"
                    }
                  >
                    ✔ At least 1 capital letter
                  </li>
                  <li
                    className={hasNumber ? "text-green-500" : "text-gray-500"}
                  >
                    ✔ At least 1 digit
                  </li>
                  <li
                    className={
                      hasSpecialChar ? "text-green-500" : "text-gray-500"
                    }
                  >
                    ✔ At least 1 special character
                  </li>
                </ul>
                <FormMessage className="text-[2.5vh] text-red-500" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[2.5vw] md:text-[1.5vw]">
                  Confirm New Password
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <NewPasswordConfirm
                      placeholder="Confirm your new password"
                      {...field}
                      className="pl-21 py-[3vh] md:pl-12 md:py-[3.5vh] 
                          rounded-[1.5vh]
                          !text-[2.5vh] md:!text-[3vh] font-normal"
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-[2.5vh] text-red-500" />
              </FormItem>
            )}
          /> */}

          {/* <div className="flex items-center justify-end gap-[1vw]">
            <Button
              type="button"
              className="w-[15vw] border border-[#DBB968] hover:shadow-2xl hover:shadow-amber-400 cursor-pointer text-[#EBEBEB] font-normal text-[3.5vh] py-[4vh] md:py-[4vh] mt-[1.75vh] mb-[1.75vh] rounded-[1.5vh]"
              onClick={() => router.push("/")} // Optional: Redirect or reset form
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="w-[15vw] bg-[#DBB968] hover:shadow-2xl hover:shadow-amber-400 cursor-pointer text-[#000000] font-normal text-[3.5vh] py-[4vh] md:py-[4vh] mt-[1.75vh] mb-[1.75vh] rounded-[1.5vh]"
            >
              {loading ? "Saving..." : "Save"}
            </Button>
          </div> */}
        </form>
      </Form>

      <div className="flex items-center mt-[4vh]">
        <Image
          width={100}
          height={100}
          src="/key.svg"
          alt="Settings icon"
          className="w-[2.5vw] md:w-[2vw] mb-[1vh]"
        />
        <h3 className="text-[3vw] md:text-[2vw] leading-[2vw] ml-[1vw] font-bold">
          Password
        </h3>
      </div>

      <hr className="border-t border-[#FFFFFF]" />

      <div className="text-[#979797] text-[1.85vw] md:text-[1.1vw] py-[2.5vh]">
        Please be careful when changing your password. You need both the old and
        the new ones to successfully change your password.
      </div>

      <div className="max-w-[15vw] cursor-pointer border border-[#E9B654] rounded-[1vh] py-[1vh] px-[1vw] hover:bg-[#E9B654] transition-colors">
        <div className="text-[2.25vw] md:text-[1.25vw] text-center">
          Change Password
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
