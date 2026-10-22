"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/contexts/AppContext";

export default function LoginPage() {
  const router = useRouter();
  const {setToken} = useAppContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed");
        return;
      }

      // Adjust this field to match your backend response.
      const token = data.token;

      if (!token) {
        setError("Login API did not return a token.");
        return;
      }

      localStorage.setItem("token", token);
      setToken(token);
      router.push("/dashboard");
    } catch {
      setError("Cannot connect to the server.");
    }
  }

  return (
    <main className=" h-screen  bg-gray-100">
      <header className="flex items-center justify-center bg-white px-6 py-8 shadow-sm">
        <h1 className="text-xl font-bold text-blue-700">
          Patient Management
        </h1>

        
      </header>
      <div className="flex items-center justify-center bg-gray-100 p-4" >
        <form
          onSubmit={handleLogin}
          className="w-full max-w-md space-y-5 rounded-2xl bg-white p-8 shadow"
        >
          <h1 className="text-3xl font-bold text-gray-800">
            Patient Portal
          </h1>
          <p className="text-gray-500">Login to your account</p>

          <input
            className="w-full rounded-lg border p-3"
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            className="w-full rounded-lg border p-3"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button className="w-full rounded-lg bg-blue-600 p-3 font-semibold text-white hover:bg-blue-700">
            Login
          </button>

          {/* <p className="text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <a href="/register" className="text-blue-600">
            Register
          </a>
        </p> */}
        </form>
      </div>

    </main>
  );
}