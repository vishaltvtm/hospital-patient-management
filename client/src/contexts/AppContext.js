"use client";

import React ,{ createContext, useContext, useState, useEffect } from "react";

export const AppContext = createContext();

export function AppProvider({ children }) {
  const [token, setToken] = useState(null);


  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  // Load saved credentials from localStorage on mount
  useEffect(() => {
    const Token = localStorage.getItem("token");

    if (Token ) {
        setToken(Token);
    }
  }, []);

useEffect(() => {

}, []);

 return (
      <AppContext.Provider
        value={{ token, setToken }}
      >
        {children}
      </AppContext.Provider>
    );
  }

  export const useAppContext = () => useContext(AppContext);