import { useNavigate, useParams } from "react-router-dom";
import { useSingleCardQuery } from "../redux/serviceSlice";
import { useForm, Controller } from "react-hook-form";
import {
  InputSelect,
  InputRow,
  Button,
  Loading,
  AlertMessage,
} from "../components";
import { toast } from "react-toastify";
import { serviceStatus, serviceType } from "../utils/dataHelper";
import { useState } from "react";
import { useAddReportDataMutation } from "../redux/reportSlice";
import { useGetAllValuesQuery } from "../redux/contractSlice";
import { useLogoutMutation } from "../redux/userSlice";
import { useDispatch } from "react-redux";
import { removeCredentials } from "../redux/allSlice";

const ServiceCard = () => {
  const [images, setImages] = useState([]);
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { data: adminValues, isLoading: adminLoading } = useGetAllValuesQuery();
  const { data, isLoading: cardLoading, error } = useSingleCardQuery(id);
  const [addReportData, { isLoading: addLoading }] = useAddReportDataMutation();
  const [logout] = useLogoutMutation();

  useEffect(() => {
    if (error && error.status === 401) {
      async () => {
        await logout();
        dispatch(removeCredentials());
      };
      navigate("/");
      toast.error("Unauthorized! Logging Out");
    }
  }, [error]);

  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
    control,
  } = useForm({
    defaultValues: {
      serviceType: "Regular",
      serviceDate: new Date().toISOString().slice(0, 10),
      serviceStatus: "Completed",
      serviceComment: "All job done",
    },
  });

  const submit = async (values) => {
    if (images.length < 1) return toast.error("Please upload images");
    else if (images.length > 3) return toast.error("Only 3 images are allowed");

    const form = new FormData();

    form.set("contractNo", data.contractNo);
    form.set("serviceName", data.name.join(", "));
    form.set("serviceType", values.serviceType);
    form.set("serviceComment", values.serviceComment);
    form.set("serviceStatus", values.serviceStatus);
    form.set("serviceDate", values.serviceDate);
    form.set("service", id);
    form.set("contract", data.contractId);
    images.forEach((file) => {
      form.append("images", file);
    });

    try {
      const res = await addReportData(form).unwrap();
      toast.success(res.msg);
      reset();
      setImages([]);
    } catch (error) {
      console.log(error);
      toast.error(error?.data?.msg || error.error);
    }
  };

  return (
    <div>
      {cardLoading || addLoading || adminLoading ? (
        <Loading />
      ) : (
        error && <AlertMessage>{error?.data?.msg || error.error}</AlertMessage>
      )}
      {data && (
        <div className="mt-16 lg:mt-5">
          <h1 className="text-center text-2xl font-semibold">
            Contract Number: {data.contractNo}
          </h1>
          <h1 className="text-center text-2xl font-semibold">
            Service: {data.name.join(", ")}
          </h1>
          <hr className="h-px mt-4 mb-3 border-0 dark:bg-gray-700" />
          <form onSubmit={handleSubmit(submit)}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-2 my-2">
              <div className="">
                <label
                  htmlFor="images"
                  className="text-md font-medium leading-6 mr-2 text-gray-900"
                >
                  Job Images*{" "}
                  <span className="text-sm font-normal">
                    (max 3 images allowed)
                  </span>
                </label>
                <input
                  type="file"
                  onChange={(e) => setImages(Array.from(e.target.files))}
                  multiple
                  className="mt-0.5"
                  accept="image/*"
                />
              </div>
              <div>
                <InputRow
                  label="Job Date"
                  id="serviceDate"
                  errors={errors}
                  register={register}
                  type="date"
                />
                <p className="text-xs text-red-500 -bottom-4 pl-1">
                  {errors.serviceDate && "Service date is required"}
                </p>
              </div>
              <div>
                <Controller
                  name="serviceType"
                  control={control}
                  rules={{ required: "Type is required" }}
                  render={({ field: { onChange, value, ref } }) => (
                    <InputSelect
                      label="Job Type"
                      options={serviceType}
                      onChange={onChange}
                      value={value}
                      placeholder="Select service type"
                    />
                  )}
                />
                <p className="text-xs text-red-500 -bottom-4 pl-1">
                  {errors.serviceType?.message}
                </p>
              </div>
              <div>
                <Controller
                  name="serviceStatus"
                  control={control}
                  rules={{ required: "Status is required" }}
                  render={({ field: { onChange, value, ref } }) => (
                    <InputSelect
                      label="Job Status"
                      options={serviceStatus}
                      onChange={onChange}
                      value={value}
                      placeholder="Select service status"
                    />
                  )}
                />
                <p className="text-xs text-red-500 -bottom-4 pl-1">
                  {errors.serviceStatus?.message}
                </p>
              </div>
              <div>
                <Controller
                  name="serviceComment"
                  control={control}
                  rules={{ required: "Comment is required" }}
                  render={({ field: { onChange, value, ref } }) => (
                    <InputSelect
                      label="Operator Comment"
                      options={adminValues?.comments}
                      onChange={onChange}
                      value={value}
                      placeholder="Select comment"
                    />
                  )}
                />
                <p className="text-xs text-red-500 -bottom-4 pl-1">
                  {errors.serviceComment?.message}
                </p>
              </div>
              <Button label="Submit" type="submit" />
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
export default ServiceCard;
