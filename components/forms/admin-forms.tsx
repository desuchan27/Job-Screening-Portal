"use client";

import { createAdmin, signIn } from "@/server/admin";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

export function NewAdminForm() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    middleInitial: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!formData.firstName) return setError("First name is required!");
    if (!formData.lastName) return setError("Last name is required!");
    if (!formData.email) return setError("Email is required!");
    if (!formData.password) return setError("Password is required!");
    if (!formData.confirmPassword)
      return setError("Confirm password is required!");
    if (formData.password !== formData.confirmPassword)
      return setError("Passwords do not match!");

    try {
      const result = await createAdmin(
        formData.email,
        formData.password,
        formData.firstName,
        formData.middleInitial,
        formData.lastName
      );

      if (result?.success) {
        setSuccess(true);
        setFormData({
          email: "",
          firstName: "",
          middleInitial: "",
          lastName: "",
          password: "",
          confirmPassword: "",
        });
        router.push("/");
      } else {
        setError(
          (result?.message as string) ||
            "Please Fill out or correct missing credentials"
        );
      }
    } catch (error) {
      return error;
    } finally {
      setLoading(false);
    }
  };

  const pathname = usePathname();

  const adminPage: Record<string, string> = {
    "/getting-started": "",
    "/new-admin": "Add New Admin",
  };

  const formTitle = adminPage[pathname] || "";

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col bg-slate-100 py-[1.5rem] px-[2rem] w-full max-w-2xl mx-auto rounded-[1.5rem] gap-[1.5rem]"
    >
      <h2 className="text-[1.185rem] md:text-[1.5rem] font-semibold text-center pb-[0.5rem]">
        {formTitle}
      </h2>
      <div className="flex flex-col gap-[1rem]">
        <div className="flex flex-col gap-[0.5rem]">
          <label htmlFor="name">Full Name</label>
          <div className="flex flex-row gap-[0.5rem]">
            <input
              id="firstName"
              name="firstName"
              type="text"
              autoComplete="firstName"
              required
              className="px-[1.5rem] py-[0.5rem] border-[0.5px] border-slate-300 rounded-md w-1/2"
              placeholder="First (*)"
              value={formData.firstName}
              onChange={handleInputChange}
            />
            <input
              id="middleInitial"
              name="middleInitial"
              type="text"
              autoComplete="middleInitial"
              required
              className="px-[1.5rem] py-[0.5rem] border-[0.5px] border-slate-300 rounded-md w-1/4"
              placeholder="M. Initial"
              value={formData.middleInitial}
              onChange={handleInputChange}
            />
            <input
              id="lastName"
              name="lastName"
              type="text"
              autoComplete="lastName"
              required
              className="px-[1.5rem] py-[0.5rem] border-[0.5px] border-slate-300 rounded-md w-1/2"
              placeholder="Last Name (*)"
              value={formData.lastName}
              onChange={handleInputChange}
            />
          </div>
        </div>
        <div className="flex flex-col gap-[0.5rem]">
          <label htmlFor="email">Email Address (*)</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="px-[1.5rem] py-[0.5rem] border-[0.5px] border-slate-300 rounded-md"
            placeholder="enter your email address"
            value={formData.email}
            onChange={handleInputChange}
          />
        </div>
        <div className="flex flex-col gap-[0.5rem]">
          <div className="flex flex-row gap-[0.5rem]">
            <div className="flex flex-col gap-[0.5rem] w-1/2">
              <label htmlFor="name">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="password"
                required
                className="px-[1.5rem] py-[0.5rem] border-[0.5px] border-slate-300 rounded-md"
                placeholder="enter your password"
                value={formData.password}
                onChange={handleInputChange}
              />
            </div>
            <div className="flex flex-col gap-[0.5rem] w-1/2">
              <label htmlFor="name">Confirm Password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="confirmPassword"
                required
                className="px-[1.5rem] py-[0.5rem] border-[0.5px] border-slate-300 rounded-md"
                placeholder="enter your password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>
        {error && <p className="text-red-500">{error}</p>}
        {success && (
          <p className="text-green-500">Admin created successfully!</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-[1rem] group relative w-full flex justify-center px-[1.5rem] py-[0.5rem] text-slate-50 font-semibold rounded-full bg-green-600 hover:bg-green-600/75 focus:ring-2 focus:ring-offset-2 focus:ring-slate-950 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all"
        >
          Create Admin
        </button>
      </div>
    </form>
  );
}

export function LoginForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email) {
      setError("Email is required!");
      setLoading(false);
      return;
    }

    if (!formData.password) {
      setError("Password is required!");
      setLoading(false);
      return;
    }

    try {
      const result = await signIn(formData.email, formData.password);

      if (result.success) {
        router.push("/admin");
        router.refresh();
      } else {
        setError((result.error as string) || "Invalid email or password!");
      }
    } catch (error) {
      return error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col bg-slate-100 py-[1.5rem] px-[2rem] w-full max-w-2xl mx-auto rounded-[1.5rem] gap-[1.5rem]"
    >
      <h2 className="text-[1.185rem] md:text-[1.5rem] font-semibold text-center pb-[0.5rem]">
        Login Form
      </h2>

      <div className="flex flex-col gap-[1rem]">
        <div className="flex flex-col gap-[0.5rem]">
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="px-[1.5rem] py-[0.5rem] border-[0.5px] border-slate-300 rounded-md"
            placeholder="enter your email address"
            value={formData.email}
            onChange={handleInputChange}
          />
        </div>
        <div className="flex flex-col gap-[0.5rem]">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="password"
            required
            className="px-[1.5rem] py-[0.5rem] border-[0.5px] border-slate-300 rounded-md"
            placeholder="enter your password"
            value={formData.password}
            onChange={handleInputChange}
          />
        </div>

        {error && <h3 className="text-sm text-red-800">{error}</h3>}
        <button
          type="submit"
          disabled={loading}
          className="mt-[1rem] group relative w-full flex justify-center px-[1.5rem] py-[0.5rem] text-slate-50 font-semibold rounded-full bg-green-600 hover:bg-green-600/75 focus:ring-2 focus:ring-offset-2 focus:ring-slate-950 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all"
        >
          Login
        </button>
        <Link
          href="reset-password"
          className="font-medium text-slate-500 hover:underline"
        >
          Forgot your password?
        </Link>
      </div>
    </form>
  );
}
