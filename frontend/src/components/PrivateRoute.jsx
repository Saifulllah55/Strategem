import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { checkAuth } from "../Store/features/userSlice";

const PrivateRoute = ({ children }) => {
  const { user, loading } = useSelector((state) => state.auth);
  const location = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!user) {
      dispatch(checkAuth());
    }
  }, [dispatch, user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#121620]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return user ? (
    children
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  );
};

export default PrivateRoute;
