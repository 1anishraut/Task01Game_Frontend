"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth, googleProvider, facebookProvider } from "../Firebase/auth";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FcGoogle } from "react-icons/fc";
import { FaFacebookF } from "react-icons/fa";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const router = useRouter();

  // 🔹 Google Login
  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success("✅ Google login successful!");
      router.push("/RockPaperSeasor");
    } catch (err) {
      console.error(err);
      toast.error("❌ Google login failed");
    }
  };

  // 🔹 Facebook Login
  const handleFacebookLogin = async () => {
    try {
      await signInWithPopup(auth, facebookProvider);
      toast.success("✅ Facebook login successful!");
      router.push("/RockPaperSeasor");
    } catch (err) {
      console.error(err);
      toast.error("❌ Facebook login failed");
    }
  };

  // 🔹 Form validation
  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) newErrors.email = "Email is required";
    else if (!emailRegex.test(email)) newErrors.email = "Invalid email";

    if (!password) newErrors.password = "Password is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 🔹 Email/Password Signup
  const handleSignup = async () => {
    if (!validateForm()) return;
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      toast.success("✅ Signup successful!");
      setTimeout(() => {
        router.push("/RockPaperSeasor");
      }, 1500);
    } catch (err) {
      console.error(err);
      toast.error("❌ Signup failed: " + err.message);
    }
  };

  // 🔹 Email/Password Login
  const handleLogin = async () => {
    if (!validateForm()) return;
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("✅ Login successful!");
      setTimeout(() => {
        router.push("/RockPaperSeasor");
      }, 1500);
    } catch (err) {
      console.error(err);
      toast.error("❌ Login failed: " + err.message);
    }
  };

  // 🔹 Forgot Password
  const handleForgotPassword = async () => {
    if (!email) {
      toast.error("❌ Please enter your email first");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("✅ Password reset email sent! Check your inbox.");
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to send reset email: " + err.message);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-white bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://plus.unsplash.com/premium_photo-1677870728119-52aef052d7ef?ixlib=rb-4.1.0&auto=format&fit=crop&q=60&w=500')",
      }}
    >
      <div className="flex flex-col items-center gap-4 border border-white/30 max-w-[90%] p-10 rounded-2xl backdrop-blur-md bg-white/10 shadow-lg">
        {/* Email Input */}
        <div className="w-60">
          <input
            className={`border p-2 w-full bg-transparent rounded focus:outline-none ${
              errors.email ? "border-red-500" : "border-gray-400"
            }`}
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        {/* Password Input */}
        <div className="w-60 relative">
          <input
            className={`border p-2 w-full bg-transparent rounded focus:outline-none ${
              errors.password ? "border-red-500" : "border-gray-400"
            }`}
            placeholder="Password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <span
            className="absolute right-2 top-2 cursor-pointer text-gray-200"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <AiOutlineEyeInvisible size={20} />
            ) : (
              <AiOutlineEye size={20} />
            )}
          </span>
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password}</p>
          )}
        </div>

        {/* Sign Up / Login Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleSignup}
            className="p-2 bg-blue-500 hover:bg-blue-600 transition text-white rounded w-28 cursor-pointer hover:scale-105 shadow-lg hover:shadow-black"
          >
            Sign Up
          </button>
          <button
            onClick={handleLogin}
            className="p-2 bg-green-500 hover:bg-green-600 transition text-white rounded w-28 cursor-pointer hover:scale-105 shadow-lg hover:shadow-black"
          >
            Login
          </button>
        </div>

        {/* Forgot Password */}
        <button
          onClick={handleForgotPassword}
          className="text-yellow-300 text-sm underline mt-2 hover:text-yellow-400"
        >
          Forgot Password?
        </button>

        {/* OR Separator */}
        <div className="flex items-center my-4 w-full">
          <hr className="flex-grow border-t border-white/70 shadow-sm" />
          <span className="mx-2 text-white ">OR</span>
          <hr className="flex-grow border-t border-white/70 shadow-sm" />
        </div>

        <p>Connect with</p>

        {/* Google & Facebook Buttons */}
        <div className="flex gap-4">
          <button
            onClick={handleGoogleLogin}
            className="flex items-center gap-2 p-1 border hover:scale-105 cursor-pointer shadow-lg hover:shadow-black transition rounded-full w-36 justify-start"
          >
            <div className="border rounded-full p-2 bg-white">
              <FcGoogle size={24} />
            </div>
            <span className="pr-1 ">Google</span>
          </button>

          <button
            onClick={handleFacebookLogin}
            className="flex items-center gap-2 p-1 border hover:scale-105 cursor-pointer shadow-lg hover:shadow-black transition rounded-full w-36 justify-start"
          >
            <div className="border rounded-full p-2 bg-blue-600">
              <FaFacebookF size={24} color="white" />
            </div>
            <span className="pr-1 ">Facebook</span>
          </button>
        </div>
      </div>

      <ToastContainer position="top-center" autoClose={2000} />
    </div>
  );
}
