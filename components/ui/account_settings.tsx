"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { MdEmail } from "react-icons/md";
import { FaUser } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { Label } from "@radix-ui/react-label";
import { MdOutlineFileUpload } from "react-icons/md";
import Image from "next/image";
import styles from "@/css/profile.module.css";
import { useGlobalStorage } from "@/components/GlobalStorage";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import Popup from "@/components/ui/Popup";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB limit

const formSchema = z.object({
  username: z.string().min(1, { message: "Username is required." }),
});

type FormValues = z.infer<typeof formSchema>;

const AccountSettings = () => {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [email, setEmail] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [initialAvatar, setInitialAvatar] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { accessToken, setAuthData } = useGlobalStorage();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
    },
  });

  const fetchProfile = useCallback(async () => {
    if (!accessToken) {
      console.error("No access token found");
      toast.error("Authentication required. Please sign in.");
      router.push("/sign_in");
      setInitialLoading(false);
      return;
    }

    setInitialLoading(true);
    try {
      const response = await axios.get("http://localhost:8080/users/profile", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = response.data;
      if (!data?.user) {
        throw new Error("Invalid response data: 'user' field missing");
      }

      form.reset({ username: data.user.username || "" });
      setEmail(data.user.email || "");
      setInitialAvatar(data.user.avatar || null);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          toast.error("Session expired. Please sign in again.");
          router.push("/sign_in");
        } else {
          toast.error(
            error.response?.data?.message || "Failed to fetch profile data"
          );
        }
      } else {
        console.error("Error fetching profile:", error);
        toast.error("An unexpected error occurred while fetching profile");
      }
    } finally {
      if (isMounted) setInitialLoading(false);
    }
  }, [accessToken, form, router, isMounted]);

  useEffect(() => {
    setIsMounted(true);
    const controller = new AbortController();

    fetchProfile().catch((error) =>
      console.error("Fetch profile failed:", error)
    );

    return () => {
      setIsMounted(false);
      controller.abort();
    };
  }, [fetchProfile]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG, PNG, WEBP, and SVG files are allowed.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("File size exceeds 5MB limit.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (isMounted) setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (data: FormValues) => {
    if (!accessToken) {
      toast.error("Authentication required. Please sign in.");
      router.push("/sign_in");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("username", data.username);
      if (fileInputRef.current?.files?.[0]) {
        formData.append("avatar", fileInputRef.current.files[0]);
      }

      const response = await axios.put(
        "http://localhost:8080/users/profile",
        formData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const result = response.data;
      if (result.user) {
        const updatedUser = result.user;
        form.reset({ username: updatedUser.username });
        setEmail(updatedUser.email);
        setInitialAvatar(updatedUser.avatar || null);

        // Update global storage with new user data and token if provided
        setAuthData({
          userId: updatedUser.id,
          userName: updatedUser.username,
          email: updatedUser.email,
          accessToken: result.newToken || accessToken, // Use new token if provided, else keep existing
          refreshToken: null, // Assuming no refresh token for now
          avatar: updatedUser.avatar || null,
        });

        setIsEditing(false);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        toast.success("Profile updated successfully");
      } else {
        toast.error("Failed to update profile");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const err = error as AxiosError<{ message?: string }>;
        toast.error(
          err.response?.data?.message ||
            "Failed to update profile. Please try again."
        );
      } else {
        console.error("Error updating profile:", error);
        toast.error("An unexpected error occurred while updating profile");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarClick = () => {
    if (isEditing) {
      fileInputRef.current?.click();
    }
  };

  const handleEditClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsEditing(true);

    const userNameInput = document.querySelector("#username") as HTMLInputElement;
    if (userNameInput) {
      userNameInput.disabled = false;
      userNameInput.classList.remove("disabled:opacity-100", "disabled:cursor-not-allowed");
      userNameInput.classList.add("text-black");
      userNameInput.focus();
    }
  };

  const handleCancelEdit = () => {
    form.reset({ username: form.getValues("username") });
    setIsEditing(false);
    setImagePreview(null); // Reset preview to avoid confusion
    if (fileInputRef.current) fileInputRef.current.value = "";

    const userNameInput = document.querySelector("#username") as HTMLInputElement;
    if (userNameInput) {
      userNameInput.disabled = true;
      userNameInput.classList.add("disabled:opacity-100", "disabled:cursor-not-allowed");
      userNameInput.classList.remove("text-black");
    }
  };

  const handleChangePassword = () => {
    toast.info("Password change functionality coming soon!");
  };

  if (initialLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-white text-xl">Loading profile...</p>
      </div>
    );
  }

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
              className={`md:w-[8vw] md:aspect-square w-[14vw] aspect-square border-[0.3vh] border-dashed border-[#8E8E8E] flex items-center justify-center rounded-md relative ${
                isEditing ? "cursor-pointer" : "cursor-not-allowed"
              }`}
              onClick={handleAvatarClick}
              role="button"
              aria-label={isEditing ? "Upload new avatar" : "Avatar display"}
            >
              {isEditing && imagePreview ? (
                <Image
                  src={imagePreview}
                  alt="Uploaded avatar"
                  width={0}
                  height={0}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  className="rounded-md"
                />
              ) : initialAvatar ? (
                <Image
                  src={initialAvatar}
                  alt="Current avatar"
                  width={0}
                  height={0}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  className="rounded-md"
                />
              ) : (
                <div className="flex items-center justify-center bg-[#DCB968] rounded-full w-[2.5vw] h-[2.5vw] min-w-[3vh] min-h-[3vh] p-[1vh]">
                  <MdOutlineFileUpload className="text-white text-[3vw] min-text-[3vh]" />
                </div>
              )}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/svg+xml"
                ref={fileInputRef}
                onChange={handleImageChange}
                className="hidden"
                disabled={!isEditing}
                aria-hidden={!isEditing}
              />
            </div>

            <div className="ml-[2vw]">
              <div>
                <Label className="text-[2.25vw] md:text-[1.25vw]">
                  User Information
                </Label>
              </div>

              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <div className="relative w-[55vw] md:w-[25vw]">
                      <FaUser className="absolute top-1/2 left-6 md:left-4 transform -translate-y-1/2 text-[#2F2F2F] text-[2.5vh] pointer-events-none" />
                      <Input
                        id="username"
                        disabled={!isEditing}
                        className="pl-21 py-[2.5vh] md:pl-12 md:py-[3vh] rounded-[1.5vh] bg-[#F9F9F9] text-[#8C8C8C] !text-[2vh] md:!text-[2.5vh] font-normal disabled:opacity-100 disabled:cursor-not-allowed"
                        autoComplete="off"
                        aria-disabled={!isEditing}
                        {...field}
                      />
                    </div>
                    <FormMessage className="text-[2.5vh] text-red-500" />
                  </FormItem>
                )}
              />

              <div className="relative w-[55vw] md:w-[25vw] mt-[2vh]">
                <MdEmail className="absolute top-1/2 left-6 md:left-4 transform -translate-y-1/2 text-[#2F2F2F] text-[3vh] pointer-events-none" />
                <Input
                  disabled
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-21 py-[2.5vh] md:pl-12 md:py-[3vh] rounded-[1.5vh] bg-[#F9F9F9] text-[#8C8C8C] !text-[2vh] md:!text-[2.5vh] font-normal disabled:opacity-100 disabled:cursor-not-allowed"
                  aria-disabled="true"
                />
              </div>
            </div>

            <div className="flex flex-col self-start gap-[1vw] ml-[5vw]">
              {isEditing ? (
                <>
                  <button
                    type="submit"
                    disabled={loading}
                    className="cursor-pointer rounded-[1vh] py-[1vh] px-[1vw] font-semibold text-[#000000] bg-[#F7D27F] hover:bg-[#E9B654] transition-colors text-[2.25vw] md:text-[1.25vw] disabled:opacity-50"
                    aria-busy={loading}
                  >
                    {loading ? "Saving..." : "Save"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="cursor-pointer rounded-[1vh] py-[1vh] px-[1vw] font-semibold text-[#000000] bg-[#CCCCCC] hover:bg-[#AAAAAA] transition-colors text-[2.25vw] md:text-[1.25vw]"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleEditClick}
                  className="flex items-center gap-2 cursor-pointer border border-[#E9B654] rounded-[1vh] py-[1vh] px-[1vw] hover:bg-[#E9B654] transition-colors"
                >
                  <span className="text-[2.25vw] md:text-[1.25vw]">Edit</span>
                  <img
                    src="/edit_icon.svg"
                    alt="Edit icon"
                    className="w-[1.5rem]"
                  />
                </button>
              )}
            </div>
          </div>
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

      <button
        id="change-password-button"
        onClick={handleChangePassword}
        className="max-w-[15vw] cursor-pointer border border-[#E9B654] rounded-[1vh] py-[1vh] px-[1vw] hover:bg-[#E9B654] transition-colors"
        aria-label="Change password"
      >
        <div className="text-[2.25vw] md:text-[1.25vw] text-center">
          Change Password
        </div>
      </button>
    </div>
  );
};

export default AccountSettings;