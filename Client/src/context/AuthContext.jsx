import React from "react";
import api from "../utils/axios";

export const AuthContext = React.createContext();

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    localStorage.removeItem("user");
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  // Read synchronously so `user` is correct on the very first render
  const [user, setUser] = React.useState(getStoredUser);

  // Works for flat { role, email, token } and nested { user, token } responses
  const saveSession = (data) => {
    const { token, user: nested, ...rest } = data;
    const userData = nested || rest;
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    saveSession(data);
    return data;
  };

  const register = async (name, email, password) => {
    const { data } = await api.post("/auth/register", {
      name,
      email,
      password,
    });
    return data;
  };

  const verifyOtp = async (email, otp) => {
    const { data } = await api.post("/auth/verify-otp", { email, otp });
    saveSession(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading: false, login, register, verifyOtp, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
