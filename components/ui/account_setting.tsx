"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { OldPassword } from "@/components/ui/OldPassword";
import { NewPassword } from "@/components/ui/NewPassword";
import { NewPasswordConfirm } from "@/components/ui/NewPasswordConfirm";
import { jwtDecode } from "jwt-decode";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB limit

const formSchema = z.object({
  username: z
    .string()
    .min(1, { message: "Username is required." })
    .regex(/^[a-zA-Z0-9]+$/, {
      message: "Username must contain only letters and numbers.",
    })
    .min(3, { message: "Username is required." })
    .max(50, { message: "Username must not exceed 50 characters." }),
});

type FormValues = z.infer<typeof formSchema>;

const passwordFormSchema = z
  .object({
    oldPassword: z.string().min(1, { message: "Old password is required." }),
    password: z
      .string()
      .min(9, { message: "Password must be at least 9 characters." })
      .regex(/[A-Z]/, {
        message: "Password must contain at least one uppercase letter.",
      })
      .regex(/[0-9]/, { message: "Password must contain at least one number." })
      .regex(/[!@#$%^&*]/, {
        message:
          "Password must contain at least one special character (!@#$%^&*).",
      }),
    confirmPassword: z
      .string()
      .min(1, { message: "Please confirm your password." }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type PasswordFormValues = z.infer<typeof passwordFormSchema>;

interface JwtPayload {
  id: string;
  username: string;
  googleAuth: boolean;
}

const AccountSettings = () => {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [initialAvatar, setInitialAvatar] = useState<string | null>(null);
  const [initialUsername, setInitialUsername] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [isPasswordPopupOpen, setIsPasswordPopupOpen] = useState(false);
  const [isGoogleAuth, setIsGoogleAuth] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { accessToken, setAuthData } = useGlobalStorage();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
    },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      oldPassword: "",
      password: "",
      confirmPassword: "",
    },
  });

  const validateToken = async () => {
    if (
      !accessToken ||
      typeof accessToken !== "string" ||
      accessToken.trim() === ""
    ) {
      console.error("Invalid or missing access token", { accessToken });
      return false;
    }
    try {
      await axios.get("http://localhost:8080/users/profile", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return true;
    } catch (error) {
      console.error("Token validation failed:", error);
      return false;
    }
  };

  const refreshToken = async (identifier: string) => {
    try {
      const loginResponse = await axios.post(
        "http://localhost:8080/users/login",
        {
          identifier,
          token: accessToken || undefined,
        }
      );
      console.log(
        "Token refresh raw response:",
        loginResponse,
        "isGoogleAuth:",
        isGoogleAuth
      );
      if (!loginResponse.data || !loginResponse.data.token) {
        throw new Error("Invalid login response structure");
      }
      return loginResponse.data;
    } catch (error) {
      if (
        axios.isAxiosError(error) &&
        error.response?.data?.message?.includes(
          "This account uses Google login"
        )
      ) {
        console.warn(
          "Google auth login attempt blocked, falling back to existing token"
        );
        return { token: accessToken, data: null }; // Fallback to existing token
      }
      console.error("Token refresh failed:", error);
      throw error;
    }
  };

  const fetchProfile = useCallback(async () => {
    if (
      !accessToken ||
      typeof accessToken !== "string" ||
      accessToken.trim() === ""
    ) {
      console.error("No access token found", { accessToken });
      toast.error("Authentication required. Please sign in.");
      router.push("/sign_in");
      setInitialLoading(false);
      return;
    }

    setInitialLoading(true);
    try {
      console.log("Fetching profile with token:", accessToken);
      const decoded = jwtDecode<JwtPayload>(accessToken);
      setIsGoogleAuth(decoded.googleAuth);
      setUserId(decoded.id);

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
      setInitialUsername(data.user.username || "");
      setEmail(data.user.email || "");
      setInitialAvatar(null);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error("Fetch profile error:", {
          status: error.response?.status,
          data: error.response?.data,
          token: accessToken,
        });
        if (error.response?.status === 401) {
          console.warn("Session expired, redirecting to sign-in");
          toast.error("Session expired. Please sign in again.");
          router.push("/sign_in");
        } else {
          toast.error(
            error.response?.data?.message || "Failed to fetch profile data"
          );
        }
      } else {
        console.error("Unexpected error fetching profile:", error);
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

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/svg+xml",
    ];
    if (!validTypes.includes(file.type)) {
      toast.error(
        "Invalid file type. Please upload a JPEG, PNG, WEBP, or SVG image."
      );
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("File size exceeds 5MB limit.");
      return;
    }

    setImagePreview(URL.createObjectURL(file));

    if (
      !accessToken ||
      !userId ||
      !email ||
      typeof accessToken !== "string" ||
      accessToken.trim() === ""
    ) {
      console.error("Invalid or missing access token, user ID, or email", {
        accessToken,
        userId,
        email,
      });
      toast.error("Authentication required. Please sign in.");
      router.push("/sign_in");
      setImagePreview(null);
      setInitialAvatar(null);
      return;
    }

    setLoading(true);
    try {
      console.log(
        "Validating token before avatar upload:",
        accessToken,
        "isGoogleAuth:",
        isGoogleAuth
      );
      const isTokenValid = await validateToken();
      if (!isTokenValid && !isGoogleAuth) {
        console.warn(
          "Invalid token, attempting refresh for non-Google account"
        );
        const loginData = await refreshToken(email);
        useGlobalStorage.setState({
          userId,
          userName: loginData.data?.username || initialUsername,
          email,
          accessToken: loginData.token,
          refreshToken: null,
          avatar: loginData.data?.avatarUrl || null,
        });
      }

      console.log(
        "Uploading avatar with token:",
        accessToken,
        "userId:",
        userId
      );
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(
        `http://localhost:8080/users/${userId}/avatar`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Avatar upload response:", response.data);
      setImagePreview(null);

      // Refresh token via login
      const loginData = await refreshToken(email);
      console.log(
        "Token refresh response:",
        loginData,
        "GlobalStorage state:",
        useGlobalStorage.getState()
      );

      // Update GlobalStorage
      useGlobalStorage.setState({
        userId,
        userName: loginData.data?.username || initialUsername,
        email,
        accessToken: loginData.token,
        refreshToken: null,
        avatar: response.data.avatarUrl || null,
      });
      setImagePreview(response.data.avatarUrl || null);
      toast.success("Avatar uploaded successfully");

      // Reload page for Google accounts
      if (isGoogleAuth) {
        console.log(
          "Triggering full page reload for Google account avatar update"
        );
        window.location.reload();
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error("Avatar upload or token refresh error:", {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
          headers: error.response?.headers,
          token: accessToken,
        });
        if (error.response?.status === 401) {
          toast.error("Session expired. Please sign in again.");
          router.push("/sign_in");
        } else if (error.response?.status === 500) {
          const s3Error = error.response?.data?.message?.includes("S3")
            ? error.response.data.message
            : "Failed to upload avatar due to server issue.";
          toast.error(s3Error);
        } else {
          toast.error(
            error.response?.data?.message ||
              "Failed to upload avatar or refresh session"
          );
        }
      } else {
        console.error("Unexpected error uploading avatar:", error);
        toast.error("An unexpected error occurred while uploading avatar");
      }
      setImagePreview(null);
      setInitialAvatar(null);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: FormValues) => {
    if (!accessToken || !email || !userId) {
      console.error("No access token, email, or user ID for username update", {
        accessToken,
        email,
        userId,
      });
      toast.error("Authentication required. Please sign in.");
      router.push("/sign_in");
      return;
    }

    setLoading(true);
    try {
      console.log(
        "Validating token before username update:",
        accessToken,
        "isGoogleAuth:",
        isGoogleAuth
      );
      const isTokenValid = await validateToken();
      if (!isTokenValid && !isGoogleAuth) {
        console.warn(
          "Invalid token, attempting refresh for non-Google account"
        );
        const loginData = await refreshToken(email);
        useGlobalStorage.setState({
          userId,
          userName: loginData.data?.username || initialUsername,
          email,
          accessToken: loginData.token,
          refreshToken: null,
          avatar: loginData.data?.avatarUrl || null,
        });
      }

      console.log("Updating username with token:", accessToken);
      const updateResponse = await axios.put(
        `http://localhost:8080/users/${userId}`,
        { username: data.username },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Username update response:", updateResponse.data);

      // Refresh token via login
      const loginData = await refreshToken(email);
      console.log(
        "Token refresh response:",
        loginData,
        "GlobalStorage state:",
        useGlobalStorage.getState()
      );

      // Update GlobalStorage
      useGlobalStorage.setState({
        userId,
        userName: loginData.data?.username || data.username,
        email: loginData.data?.email || email,
        accessToken: loginData.token,
        refreshToken: null,
        avatar: loginData.data?.avatarUrl || null,
      });

      form.reset({ username: loginData.data?.username || data.username });
      setInitialUsername(loginData.data?.username || data.username);
      setEmail(loginData.data?.email || email);
      setIsEditing(false);
      toast.success("Profile updated successfully");

      // Reload page for Google accounts
      if (isGoogleAuth) {
        console.log(
          "Triggering full page reload for Google account username update"
        );
        window.location.reload();
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Username update or token refresh error:", {
          status: error.response?.status,
          data: error.response?.data,
          token: accessToken,
        });
        if (
          error.response?.data?.message?.includes("Username already exists")
        ) {
          toast.error(
            "This username already exists, please choose another username."
          );
        } else if (error.response?.status === 401) {
          toast.error("Session expired. Please sign in again.");
          router.push("/sign_in");
        } else {
          toast.error(
            error.response?.data?.message ||
              "Failed to update profile or refresh session"
          );
        }
      } else {
        console.error("Unexpected error updating profile:", error);
        toast.error("An unexpected error occurred while updating profile");
      }
    } finally {
      setLoading(false);
    }
  };

  const isMinLength = password.length >= 9;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*]/.test(password);

  const onPasswordSubmit = async (data: PasswordFormValues) => {
    setLoading(true);
    try {
      if (!accessToken) {
        console.error("No access token for password update", { accessToken });
        toast.error("Please sign in to update your password.");
        router.push("/sign_in");
        return;
      }

      if (isGoogleAuth) {
        toast.error(
          "This account uses Google login. Password changes are managed through your Google account at myaccount.google.com/security."
        );
        return;
      }

      console.log("Updating password with token:", accessToken);
      const response = await axios.put(
        "http://localhost:8080/users/update-password",
        {
          oldPassword: data.oldPassword,
          newPassword: data.password,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("Password updated successfully");
      passwordForm.reset();
      setPassword("");
      setIsPasswordPopupOpen(false);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Password update error:", {
          status: error.response?.status,
          data: error.response?.data,
          token: accessToken,
        });
        toast.error(
          error.response?.data?.message ||
            "Failed to update password. Please try again."
        );
      } else {
        console.error("Unexpected error updating password:", error);
        toast.error("An unexpected error occurred while updating password");
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

    const userNameInput = document.querySelector(
      "#username"
    ) as HTMLInputElement;
    if (userNameInput) {
      userNameInput.disabled = false;
      userNameInput.classList.remove(
        "disabled:opacity-100",
        "disabled:cursor-not-allowed"
      );
      userNameInput.classList.add("text-black");
      userNameInput.focus();
    }
  };

  const handleCancelClick = () => {
    form.reset({ username: initialUsername });
    setIsEditing(false);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    const usernameInput = document.querySelector(
      "#username"
    ) as HTMLInputElement;
    if (usernameInput) {
      usernameInput.disabled = true;
      usernameInput.classList.add(
        "disabled:opacity-100",
        "disabled:cursor-not-allowed"
      );
      usernameInput.classList.remove("text-black");
    }
  };

  const handleChangePassword = () => {
    setIsPasswordPopupOpen(true);
  };

  const handleClosePasswordPopup = () => {
    setIsPasswordPopupOpen(false);
    passwordForm.reset();
    setPassword("");
  };

  useEffect(() => {
    const interceptor = axios.interceptors.request.use((config) => {
      if (accessToken) {
        console.log("Axios interceptor using token:", accessToken);
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    });
    return () => {
      axios.interceptors.request.eject(interceptor);
    };
  }, [accessToken]);

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white font-poppins font-bold">
        <p className="text-[3vh]">Loading Profile...</p>
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
                  width={128}
                  height={128}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    imageRendering: "crisp-edges",
                  }}
                  className="rounded-md"
                  placeholder="empty"
                  unoptimized={true}
                />
              ) : imagePreview ? (
                <Image
                  src={imagePreview}
                  alt="Current avatar"
                  width={128}
                  height={128}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    imageRendering: "crisp-edges",
                  }}
                  className="rounded-md"
                  placeholder="empty"
                  unoptimized={true}
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
                    onClick={handleCancelClick}
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
        className="max-w-[15vw] cursor-pointer border border-[#DCB968] rounded-[1vh] py-[1vh] px-[1vw] hover:bg-[#DCB968] transition-colors"
        aria-label="Change password"
      >
        <div className="text-[2rem] md:text-[1.25vw] text-center">
          Change password
        </div>
      </button>

      <Popup
        isOpen={isPasswordPopupOpen}
        onClose={handleClosePasswordPopup}
        title="Change Password"
      >
        <div className="text-[#71717A] text-[2vw] md:text-[1.3vw]">
          Make changes to your password here. Click save when you’re done.
        </div>

        <Form {...passwordForm}>
          <form
            onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
            className="flex flex-col gap-4"
          >
            <FormField
              control={passwordForm.control}
              name="oldPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#FFFFFF] text-[2vw] md:text-[1.1vw] mt-[2vh]">
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
              control={passwordForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#FFFFFF] text-[2vw] md:text-[1.1vw]">
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
                      className={
                        isMinLength ? "text-green-500" : "text-gray-500"
                      }
                    >
                      ✔ 9 characters minimum
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
                      ✔ At least 1 special character (!@#$%^&*)
                    </li>
                  </ul>
                  <FormMessage className="text-[2.5vh] text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              control={passwordForm.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#FFFFFF] text-[2vw] md:text-[1.1vw]">
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
            />

            <div className="flex justify-end gap-4 mt-4">
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
                onClick={handleClosePasswordPopup}
                className="cursor-pointer rounded-[1vh] py-[1vh] px-[1vw] font-semibold text-[#000000] bg-[#CCCCCC] hover:bg-[#AAAAAA] transition-colors text-[2.25vw] md:text-[1.25vw]"
              >
                Cancel
              </button>
            </div>
          </form>
        </Form>
      </Popup>
    </div>
  );
};

export default AccountSettings;