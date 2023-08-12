import { useParams } from "react-router-dom";
import { useSingleCardQuery } from "../redux/serviceSlice";
import { useForm, Controller } from "react-hook-form";
import { InputSelect, InputRow, Button } from "../components";
import {
  serviceComment,
  serviceStatus,
  serviceType,
} from "../utils/dataHelper";

const ServiceCard = () => {
  const { id } = useParams();

  const {
    register,
    formState: { errors, isValid },
    handleSubmit,
    reset,
    setValue,
    control,
  } = useForm({
    defaultValues: {
      service: id,
      image: "",
      serviceType: "Regular",
      serviceDate: new Date().toISOString().slice(0, 10),
      serviceStatus: "Completed",
      serviceComment: "All job done",
    },
  });

  const { data, isLoading: cardLoading, error } = useSingleCardQuery(id);

  const submit = (data) => {
    console.log(data);
  };

  return (
    <div>
      <h1 className="text-center text-2xl font-semibold">
        Contract Number: {data?.contractNo}
      </h1>
      <h1 className="text-center text-2xl font-semibold">
        Service: {data?.name.join(", ")}
      </h1>
      <hr className="h-px mt-4 mb-3 border-0 dark:bg-gray-700" />
      <form onSubmit={handleSubmit(submit)}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-x-5 gap-y-2 my-2">
          <div>Image Updload</div>
          <div>
            <InputRow
              label="Service Date"
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
                  label="Service Type"
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
                  label="Service Status"
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
                  label="Service Comment"
                  options={serviceComment}
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
  );
};
export default ServiceCard;
