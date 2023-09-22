import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { RxDashboard } from "react-icons/rx";
import {
  AiOutlineHome,
  AiOutlineLogout,
  AiOutlineMenuFold,
  AiOutlineMenuUnfold,
} from "react-icons/ai";
import { RiAdminLine } from "react-icons/ri";
import logo from "../assets/logo.jpg";
import { useLogoutMutation } from "../redux/userSlice";
import { toast } from "react-toastify";
import { removeCredentials } from "../redux/allSlice";

const navData = [
  {
    name: "Home",
    link: "/home",
    icon: <AiOutlineHome className="mr-2 w-5 h-5" />,
  },
  {
    name: "Dashboard",
    link: "/dashboard",
    icon: <RxDashboard className="mr-2 w-4 h-4" />,
  },
];

const Navbar = () => {
  const [show, setShow] = useState(false);
  const [profile, setProfile] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector((store) => store.all);
  const [logout, { isLoading }] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      toast.success("Logout successfully");
      setShow(!show);
      dispatch(removeCredentials());
      navigate("/");
    } catch (error) {
      console.log(error);
      toast.error(error?.data?.msg || error.error);
    }
  };

  return (
    <div className="bg-gray-200 h-full w-full mb-16 lg:mb-2">
      <nav className="bg-white shadow lg:block hidden">
        <div className="mx-auto container lg:pl-10 xl:px-0  py-2 lg:py-0">
          <div
            className={`flex items-center ${
              user ? "justify-between" : "justify-center"
            } `}
          >
            <div className="flex w-full sm:w-auto items-center sm:items-stretch justify-end sm:justify-center">
              <div className="flex items-center py-3">
                <img src={logo} className="w-24" alt="logo" />
                <h2 className="hidden sm:block text-xl text-gray-700 font-bold leading-normal pl-3">
                  Pest Management & Services
                </h2>
              </div>
            </div>
            {user && (
              <div className="flex mr-8">
                <div className="hidden lg:flex lg:mr-5 xl:mr-10">
                  {navData.map((nav) => (
                    <Link
                      key={nav.name}
                      to={nav.link}
                      className="flex px-5 items-center py-6 text-md leading-5 text-black hover:bg-gray-100 focus:bg-gray-100 transition duration-150 ease-in-out"
                    >
                      {nav.icon}
                      {nav.name}
                    </Link>
                  ))}
                  {user.role === "Admin" && (
                    <Link
                      to="/admin"
                      className="flex px-5 items-center py-6 text-md leading-5 text-black hover:bg-gray-100 focus:bg-gray-100 transition duration-150 ease-in-out"
                    >
                      <RiAdminLine className="mr-2 w-4 h-4" />
                      Admin
                    </Link>
                  )}
                </div>
                <div className="hidden lg:flex items-center">
                  <div className="relative">
                    <div
                      className="flex items-center relative"
                      onClick={() => setProfile(!profile)}
                    >
                      {profile && (
                        <ul className="p-2 w-24 border-r bg-white absolute rounded right-0 shadow top-0 mt-8 border-2 border-black ">
                          <li className="cursor-pointer  text-gray-600 text-sm leading-3 tracking-normal hover:font-semibold">
                            <button
                              onClick={handleLogout}
                              type="button"
                              className="flex items-center justify-center text-red-500"
                            >
                              <AiOutlineLogout className="h-4 w-4 mr-1" />
                              Log Out
                            </button>
                          </li>
                        </ul>
                      )}
                      <div className="cursor-pointer mr-5 text-blue-500 font-semibold flex text-lg border-2 border-transparent rounded-full transition duration-150 ease-in-out">
                        {user.name.split(" ")[0]}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
      <nav>
        {user ? (
          <div className="py-2 px-6 w-full border flex lg:hidden justify-between items-center bg-white fixed top-0 z-40">
            <img src={logo} className="w-24" alt="logo" />
            <div className="flex items-center">
              <div className="relative mr-4 text-blue-500 font-semibold">
                {user.name.split(" ")[0]}
              </div>
              <div
                id="menu"
                className="text-gray-800"
                onClick={() => setShow(!show)}
              >
                {!show && <AiOutlineMenuUnfold className="w-6 h-6" />}
              </div>
            </div>
          </div>
        ) : (
          <span className="py-2 font-medium text-lg px-6 w-full border flex lg:hidden justify-center items-center bg-white fixed top-0 z-40">
            Pest Management & Services
          </span>
        )}
        {/*Mobile responsive sidebar*/}
        <div
          className={
            show
              ? "w-full xl:hidden h-full absolute z-40  transform  translate-x-0 "
              : "   w-full xl:hidden h-full absolute z-40  transform -translate-x-full"
          }
        >
          <div
            className="bg-gray-800 opacity-50 w-full h-full"
            onClick={() => setShow(!show)}
          />
          <div className="w-64 z-40 fixed overflow-y-auto top-0 bg-white shadow h-full flex-col justify-between xl:hidden pb-4 transition duration-150 ease-in-out">
            <div className="px-6 h-full">
              <div className="flex flex-col justify-between h-full w-full">
                <div>
                  <div className="my-6 flex w-full items-center justify-between">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center">
                        <p className="text-base md:text-2xl text-gray-800 ml-3">
                          PMS
                        </p>
                      </div>
                      <div
                        className="text-gray-800"
                        onClick={() => setShow(!show)}
                      >
                        <AiOutlineMenuFold className="w-6 h-6" />
                      </div>
                    </div>
                  </div>
                  <ul>
                    {navData.map((nav) => (
                      <li key={nav.name} className="text-gray-800 pt-5">
                        <Link
                          to={nav.link}
                          onClick={() => setShow(!show)}
                          className="flex items-center"
                        >
                          {nav.icon}
                          <span className="ml-3">{nav.name}</span>
                        </Link>
                      </li>
                    ))}
                    {user?.role === "Admin" && (
                      <li className="text-gray-800 pt-5">
                        <Link to="/admin" className="flex items-center">
                          <RiAdminLine className="mr-5 w-4 h-4" />
                          Admin
                        </Link>
                      </li>
                    )}
                    <li className="text-gray-800 pt-4">
                      <button
                        onClick={handleLogout}
                        type="button"
                        className="flex items-center text-red-500"
                      >
                        <AiOutlineLogout className="mr-4 h-5 w-5" />
                        Logout
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};
export default Navbar;
