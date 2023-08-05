import { useForm } from "react-hook-form";
import { Input } from "../components";
import { useLoginMutation } from "../redux/userSlice";
import { toast } from "react-toastify";
import { setCredentials } from "../redux/authSlice";
import { useDispatch } from "react-redux";

const Login = () => {
  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useDispatch();

  const {
    register,
    formState: { errors },
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
      console.log(res);
      dispatch(setCredentials(res));
      toast.success(`Welcome ${res.name}`);
      reset();
    } catch (error) {
      console.log(error);
      toast.error(error?.data?.msg || error.error);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center login">
      <form onSubmit={handleSubmit(submit)} className="row g-1">
        <div className="col-md-8">
          <Input
            label="Email"
            message="Email id is required"
            id="email"
            errors={errors}
            register={register}
            placeholder="abc@xyz.com"
          />
        </div>
        <div className="col-md-8">
          <Input
            label="Password"
            message="Password is required"
            id="password"
            errors={errors}
            register={register}
          />
        </div>
        <div className="col-md-8 d-flex mt-2 ">
          <button className="btn btn-primary" disabled={isLoading}>Submit</button>
        </div>
      </form>
    </div>
  );
};
export default Login;
