import { useForm } from "react-hook-form";
import { useLoginMutation } from "../redux/userSlice";
import { toast } from "react-toastify";
import { setCredentials } from "../redux/authSlice";
import { useDispatch } from "react-redux";
import { HiMail } from "react-icons/hi";
import { AiFillUnlock } from "react-icons/ai";

const Login = () => {
  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useDispatch();

  const {
    register,
    formState: { errors, isValid },
    handleSubmit,
    reset,
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const submit = async (data) => {
    try {
      const res = await login(data).unwrap();
      dispatch(setCredentials(res));
      toast.success(`Welcome ${res.name}`);
      reset();
    } catch (error) {
      console.log(error);
      toast.error(error?.data?.msg || error.error);
    }
  };

  return (
    <div className="mx-5 flex h-[90vh] justify-center items-center">
      <div className="flex flex-col w-full max-w-md px-4 py-8 bg-white rounded-lg shadow dark:bg-gray-800 sm:px-6 md:px-8 lg:px-10">
        <div className="self-center mb-6 text-xl font-light text-gray-600 sm:text-2xl dark:text-white">
          Login To Your Account
        </div>
        <form onSubmit={handleSubmit(submit)}>
          <div className="flex flex-col mb-2">
            <div className="flex relative">
              <span className="rounded-l-md inline-flex  items-center px-3 border-t bg-white border-l border-b  border-gray-300 text-gray-500 shadow-sm text-sm">
                <HiMail className="w-5 h-5" />
              </span>
              <input
                type="email"
                id="email"
                className=" rounded-r-lg flex-1 appearance-none border border-gray-300 w-full py-2 px-4 bg-white text-gray-700 placeholder-gray-400 shadow-sm text-base focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                placeholder="Your email"
                {...register("email", {
                  validate: {
                    matchPattern: (v) =>
                      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v) ||
                      "Invalid email id",
                  },
                })}
              />
            </div>
            <p className="text-red-500 text-sm mt-0.5">
              {errors.email?.message}
            </p>
          </div>
          <div className="flex flex-col mb-6">
            <div className="flex relative ">
              <span className="rounded-l-md inline-flex  items-center px-3 border-t bg-white border-l border-b  border-gray-300 text-gray-500 shadow-sm text-sm">
                <AiFillUnlock className="w-5 h-5" />
              </span>
              <input
                type="password"
                id="password"
                className=" rounded-r-lg flex-1 appearance-none border border-gray-300 w-full py-2 px-4 bg-white text-gray-700 placeholder-gray-400 shadow-sm text-base focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                placeholder="Your password"
                {...register("password", { required: "Password is required" })}
              />
            </div>
            <p className="text-red-500 text-sm mt-0.5">
              {errors.password?.message}
            </p>
          </div>
          <div className="flex w-full">
            <button
              type="submit"
              disabled={!isValid || isLoading}
              className="py-2 px-4 bg-purple-600 hover:bg-purple-700 focus:ring-purple-500 focus:ring-offset-purple-200 text-white w-full transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg disabled:cursor-not-allowed disabled:bg-purple-500 "
            >
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default Login;
