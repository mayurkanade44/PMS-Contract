import {
  AlertMessage,
  Button,
  InputRow,
  InputSelect,
  Loading,
} from "../components";
import { toast } from "react-toastify";
import { useForm, Controller } from "react-hook-form";
import { useParams } from "react-router-dom";
import { useAddRequestByClientMutation } from "../redux/serviceRequestSlice";
import { timeSlot } from "../utils/dataHelper";

const ServiceRequestForm = () => {
  const [addRequest, { isLoading }] = useAddRequestByClientMutation();
  const { id } = useParams();

  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
    control,
  } = useForm({
    defaultValues: {
      serviceId: id,
      date: "",
      time: "anytime",
    },
  });

  const submit = async (data) => {
    console.log(data);
    try {
      let res = await addRequest(data).unwrap();
      toast.success(res.msg);
      reset();
    } catch (error) {
      console.log(error);
      toast.error(error?.data?.msg || error.error);
    }
  };

  return (
    <div className="flex justify-center">
      {isLoading && <Loading />}
      <form
        onSubmit={handleSubmit(submit)}
        className="grid grid-cols-12 gap-x-6 gap-y-5 mt-10"
      >
        <div className="col-span-12">
          <InputRow
            label="Service Date"
            message="Service date is required"
            id="date"
            errors={errors}
            register={register}
            type="date"
          />
        </div>
        <div className="col-span-12">
          <Controller
            name="time"
            control={control}
            rules={{ required: "Time is required" }}
            render={({ field: { onChange, value } }) => (
              <InputSelect
                label="Time Slot"
                options={timeSlot}
                onChange={onChange}
                value={value}
                placeholder="Select time slot"
              />
            )}
          />
          <p className="text-xs text-red-500 -bottom-4 pl-1">
            {errors.time?.message}
          </p>
        </div>
        <div className="col-span-12">
          <div className="flex justify-center">
            <Button label="Submit" height="h-10" type="submit" />
          </div>
        </div>
      </form>
    </div>
  );
};
export default ServiceRequestForm;
