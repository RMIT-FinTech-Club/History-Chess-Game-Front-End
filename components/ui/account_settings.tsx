"use client";
import React, {useState, useRef, useEffect} from "react";
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

const formSchema = z
  .object({
    email: z.string(),
    username: z.string(),
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

  const mockUsers = [
    { username: "test", email: "test@example.com" },
    { username: "user", email: "user@example.com" },
  ];

  // Type definition for form values ???
  type FormValues = z.infer<typeof formSchema>;

const AccountSettings = () => {
  const router = useRouter();
  // const { toast } = useToast(); // toast notification for feedback

  // State for password field
  const [password, setPassword] = useState("");
  const [initialLoading, setInitialLoading] = useState(true);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: mockUsers[0].email,
      username: mockUsers[0].username,
      password: "",
      confirmPassword: "",
      language: "English",
    },
  });

  /**
   * Fetch user profile data from the backend API, runs when the component mounts
   */
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/users/profile", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          }
        });

        if(!response.ok){
          throw new Error("Failed to fetch profile");
        }

        const data = await response.json();

        if(data.success && data.data){
          // Reset form with fetched data
          form.reset({
            email: data.data.email || "",
            username: data.data.username || "",
            password: "",
            confirmPassword: "",
            language: "English",
            walletAddress: data.data.walletAddress || "",
          });
        }
      } catch(error){
        console.error("Error fetching profile:", error);
      }
    }
    fetchProfile();
  }, [form])

  const [imagePreview, setImagePreview] = useState<string | null>(null); // Moved inside the component
  const [imagePath, setImagePath] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null); // Moved inside the component

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setImagePath(file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  const [loading, setLoading] = useState(false);

  // Password validation tracking
  const isMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(password);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      // Prepare data for API - only include fields that have values:
      const updateData: any = {
        username: data.username,
        email: data.email
      };

      // Only include optional fields if they have values
      if(data.password) updateData.password = data.password;
      if(data.walletAddress) updateData.walletAddress = data.walletAddress;

      console.log("Sending update to API:", updateData);

      // Send update request to API
      const response = await fetch("http://localhost:8000/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();

      if(result.success){
        // Clear password fields after successful update
        form.setValue("password", "");
        form.setValue("confirmPassword", "");
        setPassword("");
      }else{
        throw new Error("Failed to update profile");
      }

      // Include the imagePath in the form data
      const formData = {
        ...data,
        avatar: imagePath, // Add the image path to the form data
      };

      // console.log("Saving data:", formData);
      //
      // await new Promise((resolve) => setTimeout(resolve, 1000));
      // alert(
      //   `Profile updated successfully!\n\nEmail: ${data.email}\nUsername: ${data.username}\nNew Password: ${data.password}\nLanguage: ${data.language}\nAvatar: ${formData.avatar}`
      // );
      // router.push("/sign_in");
    } catch (error) {
      alert(`Error: ${error} Failed to update profile. Please try again.`);
    } finally {
      setLoading(false);
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
          className="w-[3.5vw] md:w-[2.5vw] mb-[1vh]"
        />
        <h3 className="text-[3.5vw] md:text-[2.5vw] leading-[3vw] ml-[1vw]">
          Settings
        </h3>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-3 mt-[0] md:mt-[1vh]"
        >
          {/* User Information and Avatar Field */}
          <div className="w-full flex flex-row items-center justify-between">
            {/* Image Upload */}
            <div
              className="md:w-[10vw] md:aspect-square w-[16vw] aspect-square border-[0.3vh] border-dashed border-[#8E8E8E] flex items-center justify-center rounded-md relative cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              {imagePreview ? (

                <Image
                  src="/Settings.svg"
                  alt="Settings icon"
                  width={0}
                  height={0}
                  style={{ width: "3.5vw", height: "auto", marginBottom: "1vh" }}
                  className="md:w-[2.5vw]"
                />
              ) : (
                <div className="flex items-center justify-center bg-[#DCB968] rounded-full w-[3vw] h-[3vw] min-w-[4vh] min-h-[4vh] p-[1vh]">
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

            {/* User Information Field */}
            <div>
              <Label className="text-[2.5vw] md:text-[1.5vw]">
                User Information
              </Label>
              <FormItem>
                <div className="relative w-[70vw] md:w-[35vw]">
                  <FaUser
                    className="absolute top-1/2 left-6 md:left-4 transform -translate-y-1/2 
                        text-[#2F2F2F] text-[3vh] pointer-events-none"
                  />
                  <Input
                    disabled
                    className="pl-21 py-[3vh] md:pl-12 md:py-[3.5vh] 
                          rounded-[1.5vh] bg-[#F9F9F9] border-[#B7B7B7] text-[#8C8C8C] 
                          !text-[2.5vh] md:!text-[3vh] font-normal
                          disabled:opacity-100
                          disabled:cursor-not-allowed"
                    autoComplete="off"
                    defaultValue={mockUsers[0].username}
                  />
                </div>
              </FormItem>

              <FormItem>
                <div className="relative w-[70vw] md:w-[35vw] mt-[2vh]">
                  <MdEmail
                    className="absolute top-1/2 left-6 md:left-4 transform -translate-y-1/2 
                        text-[#2F2F2F] text-[3vh] pointer-events-none"
                  />
                  <Input
                    disabled
                    className="pl-21 py-[3vh] md:pl-12 md:py-[3.5vh] 
                    rounded-[1.5vh] bg-[#F9F9F9] border-[#B7B7B7] text-[#8C8C8C] 
                    !text-[2.5vh] md:!text-[3vh] font-normal
                    disabled:opacity-100
                    disabled:cursor-not-allowed"
                    autoComplete="off"
                    defaultValue={mockUsers[0].email}
                  />
                </div>
              </FormItem>
            </div>
          </div>

          {/* Password Field */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[2.5vw] md:text-[1.5vw]">
                  New Password<span className="text-[#BB2649]">*</span>
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

                {/* Dynamic Password Checklist */}
                <ul className="font-normal text-[2.5vh] rounded-md">
                  {!isMinLength && <li>✔ 8 characters minimum</li>}
                  {!hasUppercase && <li>✔ At least 1 capital letter</li>}
                  {!hasNumber && <li>✔ At least 1 digit</li>}
                  {!hasSpecialChar && <li>✔ At least 1 special character</li>}
                </ul>
                <FormMessage className="text-[2.5vh] text-red-500" />
              </FormItem>
            )}
          />

          {/* Confirm Password Field */}
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[2.5vw] md:text-[1.5vw]">
                  Confirm New Password<span className="text-[#BB2649]">*</span>
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

          <FormField
            control={form.control}
            name="language"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[2.5vw] md:text-[1.5vw]">
                  Language<span className="text-[#BB2649]">*</span>
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="py-[3vh] md:py-[3.5vh] rounded-[1.5vh] w-full font-normal border-gray-600 text-[#000000] bg-[#C4C4C4] text-[2.5vh] md:text-[3vh] cursor-pointer">
                      <SelectValue defaultValue="English" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="font-normal border-gray-600 text-[#000000] bg-[#C4C4C4]">
                    <SelectItem
                      value="English"
                      className="hover:bg-[#FFD700] hover:text-[#00008B] data-[state=checked]:bg-[#00008B] data-[state=checked]:text-[#FFD700] text-[2.5vh] md:text-[3vh] cursor-pointer"
                    >
                      English
                    </SelectItem>
                    <SelectItem
                      value="Vietnamese"
                      className="hover:bg-[#FFD700] hover:text-[#00008B] data-[state=checked]:bg-[#00008B] data-[state=checked]:text-[#FFD700] text-[2.5vh] md:text-[3vh] cursor-pointer"
                    >
                      Tiếng Việt
                    </SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-[1vw]">
            <Button
              type="button"
              className="w-[15vw] border border-[#DBB968] hover:shadow-2xl hover:shadow-amber-400 cursor-pointer text-[#EBEBEB] font-normal text-[3.5vh] py-[4vh] md:py-[4vh]  mt-[1.75vh] mb-[1.75vh] rounded-[1.5vh]"
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
          </div>
        </form>
      </Form>
    </div>
  );
};

export default AccountSettings;