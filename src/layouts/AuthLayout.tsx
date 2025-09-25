import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useTokenVerifyMutation } from "../lib/service/authApi";
import LoadingComponent from "../components/LoadingComponent";

const AuthLayout = () => {
  const [verifyToken, { isLoading }] = useTokenVerifyMutation();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("access");

        if (!token) {
          setHasAccess(false);
          return;
        }

        await verifyToken({ token }).unwrap();

        setHasAccess(true);
      } catch (error) {
        setHasAccess(false);
      }
    })();
  }, [verifyToken]);

  if (isLoading || hasAccess === null) return <LoadingComponent />;

  return hasAccess ? <Outlet /> : <Navigate to="/login" />;
};

export default AuthLayout;
