"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleRegister(e) {
    e.preventDefault();
    setError("");

    // try {
    //   const res = await fetch(
    //     `${process.env.NEXT_PUBLIC_API_URL}/register`,
    //     {
    //       method: "POST",
    //       headers: { "Content-Type": "application/json" },
    //       body: JSON.stringify(form),
    //     }
    //   );

    //   const data = await res.json();

    //   if (!res.ok) {
    //     setError(data.message || "Registration failed");
    //     return;
    //   }

    //   router.push("/");
    // } catch {
    //   setError("Cannot connect to the server.");
    // }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <form
        onSubmit={handleRegister}
        className="w-full max-w-md space-y-5 rounded-2xl bg-white p-8 shadow"
      >
        <h1 className="text-3xl font-bold text-gray-800">
          Create Account
        </h1>

        <input
          name="name"
          placeholder="Full name"
          value={form.name}
          onChange={handleChange}
          className="w-full rounded-lg border p-3"
          required
        />

        <input
          name="email"
          type="email"
          placeholder="Email address"
          value={form.email}
          onChange={handleChange}
          className="w-full rounded-lg border p-3"
          required
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="w-full rounded-lg border p-3"
          required
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button className="w-full rounded-lg bg-blue-600 p-3 font-semibold text-white hover:bg-blue-700">
          Register
        </button>

        <p className="text-center text-sm text-gray-600">
          Already registered? <a href="/" className="text-blue-600">Login</a>
        </p>
      </form>
    </main>
  );
}