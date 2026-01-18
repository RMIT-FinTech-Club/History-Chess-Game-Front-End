"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Settings, User, Mail, Upload, Edit3, Save, X, Key, Check, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useGlobalStorage } from "@/hooks/GlobalStorage";
import axios from "axios";
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
import { OldPassword } from "@/components/profile/accountSetting/OldPassword";
import { NewPassword } from "@/components/profile/accountSetting/NewPassword";
import { NewPasswordConfirm } from "@/components/profile/accountSetting/NewPasswordConfirm";
import axiosInstance from "@/config/apiConfig";

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

// Password Requirement Item Component
const PasswordRequirement = ({ met, label }: { met: boolean; label: string }) => (
  <div className={`flex items-center gap-2 text-sm ${met ? 'text-green-400' : 'text-gray-500'}`}>
    {met ? <Check className="w-4 h-4" /> : <div className="w-4 h-4 rounded-full border border-gray-600" />}
    <span>{label}</span>
  </div>
);

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
  const { accessToken } = useGlobalStorage();
  const { setAuthData } = useGlobalStorage();

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
    if (!accessToken || typeof accessToken !== "string" || accessToken.trim() === "") {
      return false;
    }
    try {
      await axiosInstance.get("/users/profile", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return true;
    } catch (error) {
      return false;
    }
  };

  const refreshToken = async (identifier: string) => {
    try {
      if (isGoogleAuth) {
        const response = await axiosInstance.get("/users/profile", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });
        if (!response.data || !response.data.token) {
          throw new Error("Invalid profile response structure");
        }
        return response.data;
      } else {
        const loginResponse = await axiosInstance.post("/users/login", { identifier });
        if (!loginResponse.data || !loginResponse.data.token) {
          throw new Error("Invalid login response structure");
        }
        return loginResponse.data;
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data?.message?.includes("This account uses Google login")) {
        const response = await axiosInstance.get("/users/profile", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });
        return response.data;
      }
      throw error;
    }
  };

  const fetchProfile = useCallback(async () => {
    if (!accessToken || typeof accessToken !== "string" || accessToken.trim() === "") {
      toast.error("Authentication required. Please sign in.");
      router.push("/sign_in");
      setInitialLoading(false);
      return;
    }

    setInitialLoading(true);
    try {
      const response = await axiosInstance.get("/users/profile", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.data) {
        throw new Error("Invalid response data");
      }

      const { id, username, email, avatarUrl, googleAuth, refreshToken } = response.data;
      setIsGoogleAuth(googleAuth || false);
      setUserId(id || "");
      setAuthData({
        userId: id,
        userName: username || "",
        email: email || "",
        accessToken,
        refreshToken: refreshToken || "",
        avatar: avatarUrl || null,
      });

      form.reset({ username: username || "" });
      setInitialUsername(username || "");
      setEmail(email || "");
      setInitialAvatar(avatarUrl || null);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          toast.error("Session expired. Please sign in again.");
          router.push("/sign_in");
        } else {
          toast.error(error.response?.data?.message || "Failed to fetch profile data");
        }
      } else {
        toast.error("An unexpected error occurred while fetching profile");
      }
    } finally {
      if (isMounted) setInitialLoading(false);
    }
  }, [accessToken, form, router, isMounted, setAuthData]);

  useEffect(() => {
    setIsMounted(true);
    const controller = new AbortController();
    fetchProfile().catch((error) => console.error("Fetch profile failed:", error));
    return () => {
      setIsMounted(false);
      controller.abort();
    };
  }, [fetchProfile]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
    if (!validTypes.includes(file.type)) {
      toast.error("Invalid file type. Please upload a JPEG, PNG, WEBP, or SVG image.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("File size exceeds 5MB limit.");
      return;
    }

    setImagePreview(URL.createObjectURL(file));

    if (!accessToken || !userId || !email) {
      toast.error("Authentication required. Please sign in.");
      router.push("/sign_in");
      setImagePreview(null);
      return;
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      toast.error("Invalid user ID. Please sign in again.");
      router.push("/sign_in");
      setImagePreview(null);
      return;
    }

    setLoading(true);
    try {
      const isTokenValid = await validateToken();
      if (!isTokenValid && !isGoogleAuth) {
        const loginData = await refreshToken(email);
        setAuthData({
          accessToken: loginData.token,
          userId: "",
          userName: "",
          email: "",
          refreshToken: null,
        });
      }

      const formData = new FormData();
      formData.append("file", file);

      await axiosInstance.post(`/users/${userId}/avatar`, formData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setImagePreview(null);
      const profileData = await refreshToken(email);

      setAuthData({
        userId,
        userName: profileData.username || initialUsername,
        email: profileData.email || email,
        accessToken: profileData.token,
        avatar: profileData.avatarUrl || null,
        refreshToken: null,
      });
      setInitialAvatar(profileData.avatarUrl);
      toast.success("Avatar uploaded successfully");
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          toast.error("Session expired. Please sign in again.");
          router.push("/sign_in");
        } else if (error.response?.status === 500) {
          toast.error("Failed to upload avatar due to server issue.");
        } else {
          toast.error(error.response?.data?.message || "Failed to upload avatar");
        }
      } else {
        toast.error("An unexpected error occurred while uploading avatar");
      }
      setImagePreview(null);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: FormValues) => {
    if (!accessToken || !email || !userId) {
      toast.error("Authentication required. Please sign in.");
      router.push("/sign_in");
      return;
    }

    setLoading(true);
    try {
      const isTokenValid = await validateToken();
      if (!isTokenValid && !isGoogleAuth) {
        const loginData = await refreshToken(email);
        setAuthData({
          accessToken: loginData.token,
          userId: "",
          userName: "",
          email: "",
          refreshToken: null,
        });
      }

      await axiosInstance.put(`/users/${userId}`, { username: data.username }, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      const profileData = await refreshToken(email);

      setAuthData({
        userId,
        userName: profileData.username || data.username,
        email: profileData.email || email,
        accessToken: profileData.token,
        avatar: profileData.avatarUrl || null,
        refreshToken: null,
      });

      form.reset({ username: profileData.username || data.username });
      setInitialUsername(profileData.username || data.username);
      setEmail(profileData.email || email);
      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.data?.message?.includes("Username already exists")) {
          toast.error("This username already exists, please choose another username.");
        } else if (error.response?.status === 401) {
          toast.error("Session expired. Please sign in again.");
          router.push("/sign_in");
        } else {
          toast.error(error.response?.data?.message || "Failed to update profile");
        }
      } else {
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
        toast.error("Please sign in to update your password.");
        router.push("/sign_in");
        return;
      }

      if (isGoogleAuth) {
        toast.error("This account uses Google login. Password changes are managed through your Google account.");
        return;
      }

      await axiosInstance.put("/users/update-password", {
        oldPassword: data.oldPassword,
        newPassword: data.password,
      }, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      toast.success("Password updated successfully");
      passwordForm.reset();
      setPassword("");
      setIsPasswordPopupOpen(false);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Failed to update password. Please try again.");
      } else {
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
  };

  const handleCancelClick = () => {
    form.reset({ username: initialUsername });
    setIsEditing(false);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
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
    const interceptor = axiosInstance.interceptors.request.use((config) => {
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    });
    return () => {
      axiosInstance.interceptors.request.eject(interceptor);
    };
  }, [accessToken]);

  if (initialLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="glass-card rounded-xl p-8 border border-white/5 flex items-center justify-center"
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-gold-royal/30 border-t-gold-royal rounded-full animate-spin" />
          <p className="text-gray-500 font-serif">Loading Profile...</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full space-y-6"
    >
      {/* Basic Information Section */}
      <div className="glass-card rounded-2xl p-6 border border-white/5">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-gold-royal/20 flex items-center justify-center">
            <Settings className="w-5 h-5 text-gold-royal" />
          </div>
          <div>
            <h2 className="font-display text-xl text-gold-light">Basic Information</h2>
            <p className="text-gray-500 text-sm">Manage your account details</p>
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-gold-royal/30 to-transparent mb-6" />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar Upload */}
              <div
                className={`
                  relative w-28 h-28 rounded-xl border-2 border-dashed flex items-center justify-center
                  transition-all duration-300 flex-shrink-0
                  ${isEditing
                    ? 'border-gold-royal/50 cursor-pointer hover:border-gold-royal hover:bg-gold-royal/5'
                    : 'border-gray-700 cursor-not-allowed'
                  }
                `}
                onClick={handleAvatarClick}
              >
                {imagePreview || initialAvatar ? (
                  <Image
                    src={imagePreview || initialAvatar || ''}
                    alt="Avatar"
                    width={112}
                    height={112}
                    className="w-full h-full object-cover rounded-xl"
                    unoptimized
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-gray-500">
                    <Upload className="w-6 h-6" />
                    <span className="text-xs">Upload</span>
                  </div>
                )}
                {isEditing && (
                  <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Upload className="w-6 h-6 text-white" />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/svg+xml"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={!isEditing}
                />
              </div>

              {/* Form Fields */}
              <div className="flex-1 space-y-4">
                {/* Username Field */}
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-400 text-sm flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Username
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            id="username"
                            disabled={!isEditing}
                            className={`
                              w-full px-4 py-3 rounded-xl transition-all duration-300
                              ${isEditing
                                ? 'bg-white/10 border-gold-royal/30 text-white focus:border-gold-royal focus:ring-1 focus:ring-gold-royal/50'
                                : 'bg-white/5 border-white/10 text-gray-400 cursor-not-allowed'
                              }
                            `}
                            autoComplete="off"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-400 text-sm" />
                    </FormItem>
                  )}
                />

                {/* Email Field (Read-only) */}
                <div>
                  <label className="text-gray-400 text-sm flex items-center gap-2 mb-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </label>
                  <Input
                    disabled
                    value={email}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border-white/10 text-gray-400 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 justify-start">
                {isEditing ? (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={loading}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gold-royal hover:bg-gold-shimmer text-bg-dark font-semibold transition-colors disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {loading ? "Saving..." : "Save"}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={handleCancelClick}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </motion.button>
                  </>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={handleEditClick}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gold-royal/20 hover:bg-gold-royal/30 text-gold-light border border-gold-royal/30 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit Profile
                  </motion.button>
                )}
              </div>
            </div>
          </form>
        </Form>
      </div>

      {/* Password Section */}
      <div className="glass-card rounded-2xl p-6 border border-white/5">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-gold-royal/20 flex items-center justify-center">
            <Key className="w-5 h-5 text-gold-royal" />
          </div>
          <div>
            <h2 className="font-display text-xl text-gold-light">Password</h2>
            <p className="text-gray-500 text-sm">Update your password securely</p>
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-gold-royal/30 to-transparent mb-4" />

        <div className="flex items-center gap-3 p-4 rounded-xl bg-gold-royal/5 border border-gold-royal/10 mb-4">
          <AlertCircle className="w-5 h-5 text-gold-muted flex-shrink-0" />
          <p className="text-gray-400 text-sm">
            Please be careful when changing your password. You need both the old and the new ones to successfully change your password.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleChangePassword}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gold-royal/20 hover:bg-gold-royal/30 text-gold-light border border-gold-royal/30 transition-colors"
        >
          <Key className="w-4 h-4" />
          Change Password
        </motion.button>
      </div>

      {/* Password Change Popup */}
      <Popup
        isOpen={isPasswordPopupOpen}
        onClose={handleClosePasswordPopup}
        title="Change Password"
      >
        <p className="text-gray-400 text-sm mb-6">
          Make changes to your password here. Click save when you're done.
        </p>

        <Form {...passwordForm}>
          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-5">
            <FormField
              control={passwordForm.control}
              name="oldPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white text-sm">Old Password</FormLabel>
                  <FormControl>
                    <OldPassword
                      placeholder="Enter your current password"
                      {...field}
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border-white/20 text-white"
                    />
                  </FormControl>
                  <FormMessage className="text-red-400 text-sm" />
                </FormItem>
              )}
            />

            <FormField
              control={passwordForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white text-sm">New Password</FormLabel>
                  <FormControl>
                    <NewPassword
                      placeholder="Enter your new password"
                      {...field}
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border-white/20 text-white"
                      onChange={(e) => {
                        field.onChange(e);
                        setPassword(e.target.value);
                      }}
                    />
                  </FormControl>
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <PasswordRequirement met={isMinLength} label="9+ characters" />
                    <PasswordRequirement met={hasUppercase} label="1 uppercase" />
                    <PasswordRequirement met={hasNumber} label="1 number" />
                    <PasswordRequirement met={hasSpecialChar} label="1 special (!@#$%^&*)" />
                  </div>
                  <FormMessage className="text-red-400 text-sm" />
                </FormItem>
              )}
            />

            <FormField
              control={passwordForm.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white text-sm">Confirm New Password</FormLabel>
                  <FormControl>
                    <NewPasswordConfirm
                      placeholder="Confirm your new password"
                      {...field}
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border-white/20 text-white"
                    />
                  </FormControl>
                  <FormMessage className="text-red-400 text-sm" />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gold-royal hover:bg-gold-shimmer text-bg-dark font-semibold transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {loading ? "Saving..." : "Save"}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={handleClosePasswordPopup}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 transition-colors"
              >
                <X className="w-4 h-4" />
                Cancel
              </motion.button>
            </div>
          </form>
        </Form>
      </Popup>
    </motion.div>
  );
};

export default AccountSettings;