import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Button, InputRow, InputSelect, Loading } from "../components";
import { useAddRequestByClientMutation } from "../redux/scheduleSlice";
import { timeSlot } from "../utils/dataHelper";
import { todaysDate } from "../utils/functionHelper";

const ServiceRequestForm = ({ directRequest }) => {
  const [addRequest, { isLoading }] = useAddRequestByClientMutation();
  const { id } = useParams();
  const [message, setMessage] = useState(null);

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

  useEffect(() => {
    if (directRequest) {
      handleDirectRequest();
    }
  }, []);

  const handleDirectRequest = async () => {
    try {
      let res = await addRequest({
        serviceId: id,
        date: todaysDate(),
        time: "anytime",
      }).unwrap();
      toast.success(res.msg);
      setMessage(res.msg);
      reset();
    } catch (error) {
      console.log(error);
      toast.error(error?.data?.msg || error.error);
      setMessage(error?.data?.msg || error.error);
    }
  };

  const submit = async (data) => {
    console.log(data);
    try {
      let res = await addRequest(data).unwrap();
      toast.success(res.msg);
      setMessage(res.msg);
      reset();
    } catch (error) {
      console.log(error);
      toast.error(error?.data?.msg || error.error);
      setMessage(error?.data?.msg || error.error);
    }
  };

  return (
    <div className="flex justify-center">
      {isLoading && <Loading />}
      {message ? (
        <div className="text-center mt-10">
          <h1 className="text-2xl md:text-[40px] font-bold">{message}</h1>
          <h2 className="mt-10 text-lg font-semibold">
            For any queries kindly contact below modes:
            <p className="text-green-600">
              1800 2699 039 / contact@pestmanagements.in
            </p>
          </h2>
        </div>
      ) : (
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
                  options={timeSlot.slice(0, 3)}
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
      )}
    </div>
  );
};
export default ServiceRequestForm;
