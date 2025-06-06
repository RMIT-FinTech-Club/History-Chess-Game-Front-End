"use client";
import React, { useState, useRef, useEffect } from "react";
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
import axios from "axios";
import { toast } from "sonner";

const formSchema = z.object({
  username: z.string().min(1, { message: "Username is required." }),
});

type FormValues = z.infer<typeof formSchema>;

const AccountSettings = () => {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [email, setEmail] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { accessToken } = useGlobalStorage();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
    },
  });

  useEffect(() => {
    setIsMounted(true);

    const fetchProfile = async () => {
      if (!accessToken) {
        console.error("No access token found");
        router.push("/sign_in");
        setInitialLoading(false);
        return;
      }

      setInitialLoading(true);
      try {
        const response = await axios.get(
          "http://localhost:8080/users/profile",
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        const data = response.data;

        if (data.user) {
          form.reset({ username: data.user.username || "" });
          setEmail(data.user.email || "");
        } else {
          throw new Error("Invalid response data: 'user' field missing");
        }
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          toast.error("Session expired. Please sign in again.");
          router.push("/sign_in");
        } else {
          console.error("Error fetching profile:", error);
          toast.error("Failed to fetch profile data");
        }
      } finally {
        setInitialLoading(false);
      }
    };
    fetchProfile();
    return () => {
      setIsMounted(false);
    };
  }, [form, accessToken, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/svg+xml",
      ];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Only JPG, PNG, WEBP, and SVG files are allowed.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: FormValues) => {
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

      if (result.success) {
        form.reset({ username: result.user.username });
        setIsEditing(false);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    } finally {
      toast.success("Profile updated successfully");
      // Consider if you really want to redirect to sign_in after a successful profile update.
      // Usually, users remain on the profile page or are redirected to a dashboard.
      router.push("/sign_in");
      setLoading(false);
    }
  };


  const handleAvatarClick = () => {
    if (isEditing) {
      fileInputRef.current?.click();
    }
  };

  const handleCancelEdit = () => {
    form.reset(); 
    setIsEditing(false);
    setImagePreview(null); // Clear image preview
    if (fileInputRef.current) fileInputRef.current.value = ""; // Clear file input value

    // Re-disable the username input and reset its styling
    const userNameInput = document.querySelector("#username") as HTMLInputElement;
    if (userNameInput) {
      userNameInput.disabled = true;
      userNameInput.classList.add(
        "disabled:opacity-100",
        "disabled:cursor-not-allowed"
      );
      userNameInput.classList.remove("text-black");
    }
  };

  const handleEditClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // Prevent default form submission
    setIsEditing(true);

    // Enable the username input and adjust its styling
    const userNameInput = document.querySelector("#username") as HTMLInputElement;
    if (userNameInput) {
      userNameInput.disabled = false;
      userNameInput.classList.remove(
        "disabled:opacity-100",
        "disabled:cursor-not-allowed"
      );
      userNameInput.classList.add("text-black");
      userNameInput.focus(); // Focus on the input for immediate editing
    }
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
                disabled={!isEditing}
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
                        disabled={!isEditing}
                        id="username"
                        className="pl-21 py-[2.5vh] md:pl-12 md:py-[3vh] rounded-[1.5vh] bg-[#F9F9F9] text-[#8C8C8C] !text-[2vh] md:!text-[2.5vh] font-normal disabled:opacity-100 disabled:cursor-not-allowed"
                        autoComplete="off"
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
                  className="pl-21 py-[2.5vh] md:pl-12 md:py-[3vh] rounded-[1.5vh] bg-[#F9F9F9] text-[#8C8C8C] !text-[2vh] md:!text-[2.5vh] font-normal disabled:opacity-100 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <div className="flex flex-col self-start gap-[1vw] ml-[5vw]">
              {isEditing ? (
                <>
                  <button
                    type="submit"
                    disabled={loading}
                    className="cursor-pointer rounded-[1vh] py-[1vh] px-[1vw] font-semibold text-[#000000] bg-[#F7D27F] hover:bg-[#E9B654] transition-colors text-[2.25vw] md:text-[1.25vw]"
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

      <div className="max-w-[15vw] cursor-pointer border border-[#E9B654] rounded-[1vh] py-[1vh] px-[1vw] hover:bg-[#E9B654] transition-colors">
        <div className="text-[2.25vw] md:text-[1.25vw] text-center">
          Change Password
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;