import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ admin }) => {
  const { user } = useSelector((store) => store.all);

  if (user) {
    if (admin && user.role !== "Admin") return <Navigate to="/home" />;
    return <Outlet />;
  } else return <Navigate to="/" />;
};
export default ProtectedRoute;
