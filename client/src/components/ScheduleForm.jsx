import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import Select from "react-select";
import { toast } from "react-toastify";
import { Button, InputRow, InputSelect, Loading } from "../components";
import { useGetAllValuesQuery } from "../redux/contractSlice";
import {
  useGetAllTechniciansQuery,
  useUpdateRequestMutation,
} from "../redux/scheduleSlice";
import {
  scheduleTypes,
  serviceTypeOptions,
  timeSlot
} from "../utils/dataHelper";
import Modal from "./Modals/Modal";

const ScheduleForm = ({ open, setOpen }) => {
  const [selectedOption, setSelectedOption] = useState([]);
  const { scheduleDetails } = useSelector((store) => store.all);
  const { data: adminValues, isLoading: valueLoading } = useGetAllValuesQuery();
  const { data: technicians, isLoading: techniciansLoading } =
    useGetAllTechniciansQuery();
  const [updateRequest, { isLoading }] = useUpdateRequestMutation();
  const [loading, setLoading] = useState(true);

  console.log(scheduleDetails);

  useEffect(() => {
    if (open && scheduleDetails?.contractNo) {
      setLoading(true);
      setSelectedOption([]);
      setValue("contractNo", scheduleDetails?.contractNo);
      setValue("clientName", scheduleDetails?.clientName);
      setValue("clientAddress", scheduleDetails?.clientAddress);
      setValue("clientContact", scheduleDetails?.clientContact);
      setValue("scheduleType", scheduleDetails?.scheduleType);
      setValue("serviceType", scheduleDetails?.serviceType);
      setValue("time", scheduleDetails?.time);
      setValue(
        "date",
        new Date(scheduleDetails?.date).toISOString().slice(0, 10)
      );
      setValue("technician", scheduleDetails?.technician?._id);
      scheduleDetails?.serviceName.map((serviceName) =>
        adminValues?.services.map(
          (service) =>
            service.label === serviceName &&
            setSelectedOption((prev) => [...prev, service])
        )
      );
    }
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, [open]);

  const {
    register,
    formState: { errors, isValid },
    handleSubmit,
    reset,
    getValues,
    setValue,
    control,
  } = useForm({
    defaultValues: {
      contractNo: "",
      clientName: "",
      clientAddress: "",
      clientContact: "",
      serviceType: "",
      scheduleType: "",
      date: "",
      time: "",
      technician: "",
      service: "",
    },
  });

  const submit = async (data) => {
    data.service = scheduleDetails?.id;
    const serviceName = selectedOption.map((service) => service.label);
    data.serviceName = serviceName;
    try {
      let res = await updateRequest({ id: scheduleDetails._id, data }).unwrap();
      toast.success(res.msg);
      reset();
      setOpen(false);
      setSelectedOption([]);
    } catch (error) {
      console.log(error);
      toast.error(error?.data?.msg || error.error);
    }
  };
  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <Modal open={open}>
          <form
            onSubmit={handleSubmit(submit)}
            className="relative my-10 lg:my-2 w-[600px] "
          >
            <div className="grid grid-cols-2 gap-x-5 gap-y-2">
              <div className="col-span-1">
                <InputRow
                  label="Contract Number"
                  placeholder="contract no"
                  id="contractNo"
                  errors={errors}
                  register={register}
                />
                <p className="text-xs text-red-500 -bottom-4 pl-1">
                  {errors.contractNo && "Contract number is required"}
                </p>
              </div>
              <div className="col-span-1">
                <InputRow
                  label="Client Name"
                  placeholder="client name"
                  id="clientName"
                  errors={errors}
                  register={register}
                />
                <p className="text-xs text-red-500 -bottom-4 pl-1">
                  {errors.clientName && "Client name is required"}
                </p>
              </div>
              <div className="col-span-1">
                <InputRow
                  label="Client Contact"
                  placeholder="contact number"
                  id="clientContact"
                  errors={errors}
                  register={register}
                />
                <p className="text-xs text-red-500 -bottom-4 pl-1">
                  {errors.clientContact && "contact number is required"}
                </p>
              </div>
              <div className="col-span-1">
                <Controller
                  name="scheduleType"
                  control={control}
                  render={({ field: { onChange, value, ref } }) => (
                    <InputSelect
                      options={scheduleTypes}
                      onChange={onChange}
                      value={value}
                      label="Schedule Type"
                    />
                  )}
                />
              </div>
              <div className="col-span-2">
                <InputRow
                  label="Client Address"
                  placeholder="service address"
                  id="clientAddress"
                  errors={errors}
                  register={register}
                />
                <p className="text-xs text-red-500 -bottom-4 pl-1">
                  {errors.clientContact && "contact number is required"}
                </p>
              </div>
              <div className="col-span-2">
                <label className="block text-md font-medium leading-6 text-gray-900">
                  Select Service
                  <span className="text-red-500 required-dot ml-0.5">*</span>
                </label>
                <Select
                  closeMenuOnSelect={false}
                  defaultValue={selectedOption}
                  onChange={setSelectedOption}
                  options={adminValues?.services}
                  isMulti={true}
                  placeholder="Select Service"
                  required
                />
              </div>
              <div className="col-span-1">
                <InputRow
                  label="Schedule Date"
                  id="date"
                  errors={errors}
                  register={register}
                  type="date"
                />
                <p className="text-xs text-red-500 -bottom-4 pl-1">
                  {errors.date && "schedule date is required"}
                </p>
              </div>
              <div className="col-span-1">
                <Controller
                  name="time"
                  control={control}
                  render={({ field: { onChange, value, ref } }) => (
                    <InputSelect
                      options={timeSlot}
                      onChange={onChange}
                      value={value}
                      label="Schedule Time"
                    />
                  )}
                />
              </div>

              <div className="col-span-1">
                <Controller
                  name="serviceType"
                  control={control}
                  render={({ field: { onChange, value, ref } }) => (
                    <InputSelect
                      options={serviceTypeOptions.slice(1)}
                      onChange={onChange}
                      value={value}
                      label="Service Type"
                    />
                  )}
                />
              </div>

              <div className="col-span-1">
                <Controller
                  name="technician"
                  rules={{ required: "Technician is required" }}
                  control={control}
                  render={({ field: { onChange, value, ref } }) => (
                    <InputSelect
                      options={technicians}
                      onChange={onChange}
                      value={value}
                      label="Technician"
                    />
                  )}
                />
                <p className="text-xs text-red-500 -bottom-4 pl-1">
                  {errors.technician?.message}
                </p>
              </div>
              <div className="col-span-1 mt-3">
                <Button
                  label="Submit"
                  height="h-10"
                  width="w-full"
                  type="submit"
                />
              </div>
              <div className="col-span-1 mt-3">
                <Button
                  label="Cancel"
                  height="h-10"
                  width="w-full"
                  color="bg-gray-600"
                  handleClick={() => setOpen(false)}
                />
              </div>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
};
export default ScheduleForm;
