import React, { useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import { useNavigate, useSearchParams } from "react-router-dom";

const Loading = () => {
  const { fetchUser } = useAppContext();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const next = searchParams.get("next") || "/";

  useEffect(() => {
    const loadData = async () => {
      await fetchUser();  // wait for user + cart refresh
      navigate(next, { replace: true });
    };
    loadData();
  }, [fetchUser, navigate, next]);

  return (
    <div className="loading-screen">
      <p>Processing payment, please wait...</p>
    </div>
  );
};

export default Loading;
