import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Outlet,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { Navbar } from "./components";
import {
  AllServiceCards,
  Contract,
  ContractDetails,
  Dashboard,
  Login,
  Register,
  ServiceCard,
} from "./pages";

function App() {
  const Layout = () => {
    return (
      <>
        <ToastContainer position="top-center" autoClose={2000} />
        <Navbar />
        <div className="mx-5 md:mx-10 my-16 lg:my-5">
          <Outlet />
        </div>
      </>
    );
  };
  const Router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<Layout />}>
        <Route index={true} path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Dashboard />} />
        <Route path="/contract/:id" element={<Contract />} />
        <Route path="/contract-details/:id" element={<ContractDetails />} />
        <Route
          path="/contract/:id/service-cards"
          element={<AllServiceCards />}
        />
        <Route path="/service-card/:id" element={<ServiceCard />} />
      </Route>
    )
  );
  return <RouterProvider router={Router} />;
}

export default App;
