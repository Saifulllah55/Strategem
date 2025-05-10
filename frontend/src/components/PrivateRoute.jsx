import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { checkAuth } from "../Store/features/userSlice";

const PrivateRoute = ({ children }) => {
  const { user, loading } = useSelector((state) => state.user);
  const location = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!user) {
      dispatch(checkAuth());
    }
  }, [dispatch, user]);

  if (loading) {
    return <div>Loading ... </div>;
  }

  return user ? (
    children
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  );
};

export default PrivateRoute;
