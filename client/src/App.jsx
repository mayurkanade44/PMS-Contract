import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Outlet,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { Navbar, ProtectedRoute } from "./components";
import {
  Admin,
  NewServiceCard,
  ClientReport,
  ContractDetails,
  Dashboard,
  Home,
  Login,
  NewContract,
  ServiceCard,
} from "./pages";

function App() {
  const Layout = () => {
    return (
      <>
        <ToastContainer position="top-center" autoClose={2000} />
        <Navbar />
        <div className="mx-5 md:mx-10">
          <Outlet />
        </div>
      </>
    );
  };
  const Router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<Layout />}>
        <Route index={true} path="/" element={<Login />} />
        <Route path="/report/:id" element={<ClientReport />} />

        <Route path="" element={<ProtectedRoute />}>
          <Route path="/home" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/contract/:id" element={<NewContract />} />
          <Route path="/contract-details/:id" element={<ContractDetails />} />
          <Route
            path="/contract/:id/service-cards"
            element={<NewServiceCard />}
          />
          <Route path="/service-card/:id" element={<ServiceCard />} />
        </Route>

        <Route path="" element={<ProtectedRoute admin={true} />}>
          <Route path="/admin" element={<Admin />} />
        </Route>
      </Route>
    )
  );
  return <RouterProvider router={Router} />;
}

export default App;
