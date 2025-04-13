"use client"

import type React from "react"

import { useState } from "react"
import { Eye, EyeOff, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { toast } from 'sonner'
import Link from "next/link"
import { doc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { auth } from "@/lib/firebase"

interface RegisterFormState {
  firstName?: string
  lastName?: string
  hospitalName?: string
  email: string
  accountType: string
  password: string
  confirmPassword: string
}

export default function AuthPage() {
  const { login, register, userRole } = useAuth();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<"login" | "register">("login")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Login form state
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [loginErrors, setLoginErrors] = useState({ email: "", password: "" })

  // Register form state
  const [registerForm, setRegisterForm] = useState<RegisterFormState>({
    firstName: "",
    lastName: "",
    hospitalName: "",
    email: "",
    accountType: "",
    password: "",
    confirmPassword: "",
  })
  const [registerErrors, setRegisterErrors] = useState({
    firstName: "",
    lastName: "",
    hospitalName: "",
    email: "",
    accountType: "",
    password: "",
    confirmPassword: "",
  })

  const [isLoading, setIsLoading] = useState(false);

  // Function to get user-friendly error messages
  const getErrorMessage = (error: any) => {
    console.log('Firebase Error:', error);
    const errorCode = error?.code || error?.message?.split('(')[0]?.trim();
    console.log('Error Code:', errorCode);
    
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'This email is already registered. Please try logging in.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/operation-not-allowed':
        return 'Email/password accounts are not enabled. Please contact support.';
      case 'auth/weak-password':
        return 'Please choose a stronger password (at least 6 characters).';
      case 'auth/user-disabled':
        return 'This account has been disabled. Please contact support.';
      case 'auth/user-not-found':
        return 'No account found with this email. Please register first.';
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Incorrect password. Please try again.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection and try again.';
      default:
        return 'An error occurred. Please try again.';
    }
  };

  // Handle login form submission
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log("Attempting login...");
      const { role, isSubmitted } = await login(loginEmail, loginPassword);
      console.log("Login successful. Role:", role, "isSubmitted:", isSubmitted);
      
      if (role === "donor") {
        if (isSubmitted) {
          console.log("Redirecting to donor dashboard with submitted=true");
          router.push("/donor-dashboard?submitted=true");
        } else {
          console.log("Redirecting to donor dashboard without submitted parameter");
          router.push("/donor-dashboard");
        }
      } else if (role === "hospital") {
        console.log("Redirecting to hospital dashboard");
        router.push("/hospital-dashboard");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      const errorMessage = getErrorMessage(error);
      toast.error('Login Failed', {
        description: errorMessage
      });
      setLoginErrors({
        email: "",
        password: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle register form submission
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate passwords match
      if (registerForm.password !== registerForm.confirmPassword) {
        throw new Error("Passwords do not match");
      }

      // Validate required fields
      if (registerForm.accountType === "hospital" && !registerForm.hospitalName) {
        throw new Error("Hospital name is required");
      }

      if (registerForm.accountType === "donor" && (!registerForm.firstName || !registerForm.lastName)) {
        throw new Error("First name and last name are required");
      }

      const userData = registerForm.accountType === "hospital" 
        ? {
            hospitalName: registerForm.hospitalName,
          }
        : {
            firstName: registerForm.firstName,
            lastName: registerForm.lastName,
            isSubmitted: false,
          };

      // Register the user
      await register(
        registerForm.email,
        registerForm.password,
        registerForm.accountType as "donor" | "hospital",
        userData
      );
      
      toast.success('Registration Successful');
      if (registerForm.accountType === "donor") {
        router.push("/donor-dashboard");
      } else if (registerForm.accountType === "hospital") {
        router.push("/hospital-dashboard");
      }
    } catch (error: any) {
      const errorMessage = getErrorMessage(error);
      toast.error('Registration Failed', {
        description: errorMessage
      });
      setRegisterErrors({
        ...registerErrors,
        email: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle register form input changes
  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setRegisterForm((prev) => ({ ...prev, [name]: value }))
  }

  // Handle account type selection
  const handleAccountTypeChange = (value: string) => {
    setRegisterForm((prev) => ({ ...prev, accountType: value }))
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#96D7C6]/10 to-white p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Updated HealSync Link to root */}
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <Heart className="h-6 w-6 text-primary" />
          <Link 
            href="/" 
            className="text-xl font-bold text-[#6C8CBF] hover:text-[#5AA7A7] transition-colors select-none"
          >
            HealSync
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            className={`flex-1 py-4 text-center font-medium transition-colors cursor-pointer ${
              activeTab === "login"
                ? "text-[#6C8CBF] border-b-2 border-[#5AA7A7]"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => setActiveTab("login")}
          >
            Login
          </button>
          <button
            className={`flex-1 py-4 text-center font-medium transition-colors cursor-pointer ${
              activeTab === "register"
                ? "text-[#6C8CBF] border-b-2 border-[#5AA7A7]"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => setActiveTab("register")}
          >
            Register
          </button>
        </div>

        <div className="p-6">
          <h1 className="text-2xl font-bold text-[#6C8CBF] mb-6 select-none">
            {activeTab === "login" ? "Welcome Back" : "Create Account"}
          </h1>

          {/* Login Form */}
          {activeTab === "login" && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email" className="text-gray-600">
                  Email
                </Label>
                <div className="relative">
                  <Input
                    id="login-email"
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className={`rounded-lg border ${
                      loginErrors.email ? "border-red-500" : "border-gray-300"
                    } focus:border-[#5AA7A7] focus:ring focus:ring-[#96D7C6]/20 transition-all`}
                    placeholder="your@email.com"
                  />
                </div>
                {loginErrors.email && <p className="text-red-500 text-sm mt-1">{loginErrors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password" className="text-gray-600">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className={`rounded-lg border ${
                      loginErrors.password ? "border-red-500" : "border-gray-300"
                    } focus:border-[#5AA7A7] focus:ring focus:ring-[#96D7C6]/20 transition-all pr-10`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {loginErrors.password && <p className="text-red-500 text-sm mt-1">{loginErrors.password}</p>}
              </div>

              <div className="text-right">
                <a href="#" className="text-sm text-[#5AA7A7] hover:text-[#4A9696] transition-colors">
                  Forgot password?
                </a>
              </div>

              <Button
                type="submit"
                className="w-full bg-[#5AA7A7] hover:bg-[#4A9696] text-white font-medium py-2 px-4 rounded-lg transition-colors cursor-pointer"
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </form>
          )}

          {/* Register Form */}
          {activeTab === "register" && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              {/* Account Type Selection - Moved to top */}
              <div className="space-y-2">
                <Label htmlFor="accountType" className="text-gray-600">
                  Account Type
                </Label>
                <Select 
                  onValueChange={(value) => {
                    handleAccountTypeChange(value);
                    // Reset form fields when switching account types
                    setRegisterForm(prev => ({
                      ...prev,
                      firstName: "",
                      lastName: "",
                      hospitalName: "",
                      accountType: value
                    }));
                  }} 
                  value={registerForm.accountType}
                >
                  <SelectTrigger
                    id="accountType"
                    className={`rounded-lg border cursor-pointer ${
                      registerErrors.accountType ? "border-red-500" : "border-gray-300"
                    } focus:border-[#5AA7A7] focus:ring focus:ring-[#96D7C6]/20 transition-all`}
                  >
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="donor" className="cursor-pointer">Donor</SelectItem>
                    <SelectItem value="hospital" className="cursor-pointer">Hospital</SelectItem>
                  </SelectContent>
                </Select>
                {registerErrors.accountType && <p className="text-red-500 text-sm">{registerErrors.accountType}</p>}
              </div>

              {/* Name Fields - Moved below account type */}
              {registerForm.accountType !== "hospital" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-gray-600">
                      First Name
                    </Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={registerForm.firstName}
                      onChange={handleRegisterChange}
                      className={`rounded-lg border cursor-text ${
                        registerErrors.firstName ? "border-red-500" : "border-gray-300"
                      } focus:border-[#5AA7A7] focus:ring focus:ring-[#96D7C6]/20 transition-all`}
                      placeholder="John"
                    />
                    {registerErrors.firstName && <p className="text-red-500 text-sm">{registerErrors.firstName}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-gray-600">
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={registerForm.lastName}
                      onChange={handleRegisterChange}
                      className={`rounded-lg border cursor-text ${
                        registerErrors.lastName ? "border-red-500" : "border-gray-300"
                      } focus:border-[#5AA7A7] focus:ring focus:ring-[#96D7C6]/20 transition-all`}
                      placeholder="Doe"
                    />
                    {registerErrors.lastName && <p className="text-red-500 text-sm">{registerErrors.lastName}</p>}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="hospitalName" className="text-gray-600">
                    Hospital Name
                  </Label>
                  <Input
                    id="hospitalName"
                    name="hospitalName"
                    value={registerForm.hospitalName}
                    onChange={handleRegisterChange}
                    className={`rounded-lg border cursor-text ${
                      registerErrors.hospitalName ? "border-red-500" : "border-gray-300"
                    } focus:border-[#5AA7A7] focus:ring focus:ring-[#96D7C6]/20 transition-all`}
                    placeholder="City General Hospital"
                  />
                  {registerErrors.hospitalName && <p className="text-red-500 text-sm">{registerErrors.hospitalName}</p>}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-600">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={registerForm.email}
                  onChange={handleRegisterChange}
                  className={`rounded-lg border ${
                    registerErrors.email ? "border-red-500" : "border-gray-300"
                  } focus:border-[#5AA7A7] focus:ring focus:ring-[#96D7C6]/20 transition-all`}
                  placeholder="your@email.com"
                />
                {registerErrors.email && <p className="text-red-500 text-sm">{registerErrors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-600">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={registerForm.password}
                    onChange={handleRegisterChange}
                    className={`rounded-lg border ${
                      registerErrors.password ? "border-red-500" : "border-gray-300"
                    } focus:border-[#5AA7A7] focus:ring focus:ring-[#96D7C6]/20 transition-all pr-10`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {registerErrors.password && <p className="text-red-500 text-sm">{registerErrors.password}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-600">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={registerForm.confirmPassword}
                    onChange={handleRegisterChange}
                    className={`rounded-lg border ${
                      registerErrors.confirmPassword ? "border-red-500" : "border-gray-300"
                    } focus:border-[#5AA7A7] focus:ring focus:ring-[#96D7C6]/20 transition-all pr-10`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {registerErrors.confirmPassword && (
                  <p className="text-red-500 text-sm">{registerErrors.confirmPassword}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-[#5AA7A7] hover:bg-[#4A9696] text-white font-medium py-2 px-4 rounded-lg transition-colors cursor-pointer"
                disabled={isLoading}
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-center text-gray-500 text-sm select-none">
              {activeTab === "login" ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                className="text-[#5AA7A7] hover:text-[#4A9696] font-medium transition-colors cursor-pointer"
                onClick={() => setActiveTab(activeTab === "login" ? "register" : "login")}
              >
                {activeTab === "login" ? "Register" : "Login"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}