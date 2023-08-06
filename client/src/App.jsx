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
import { Contract, Login, Register } from "./pages";

function App() {
  const Layout = () => {
    return (
      <>
        <ToastContainer position="top-center" autoClose={2000} />
        <Navbar />
        <div className="mx-5 md:mx-10 my-5">
          <Outlet />
        </div>
      </>
    );
  };
  const Router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<Layout />}>
        <Route index={true} path="/" element={<Login />} />
        <Route index={true} path="/register" element={<Register />} />
        <Route index={true} path="/contract/:id" element={<Contract />} />
      </Route>
    )
  );
  return <RouterProvider router={Router} />;
}

export default App;
