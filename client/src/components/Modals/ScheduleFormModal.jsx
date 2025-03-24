import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import Select from "react-select";
import { toast } from "react-toastify";
import { Button, InputRow, InputSelect, Loading } from "..";
import { useGetAllValuesQuery } from "../../redux/contractSlice";
import {
  useAddRequestByPmsMutation,
  useGetAllTechniciansQuery,
  useUpdateRequestMutation,
} from "../../redux/scheduleSlice";
import {
  scheduleTypes,
  serviceTypeOptions,
  timeSlot,
} from "../../utils/dataHelper";
import Modal from "./Modal";

const ScheduleFormModal = ({ open, setOpen }) => {
  const [selectedOption, setSelectedOption] = useState([]);
  const { scheduleDetails } = useSelector((store) => store.all);
  const [services, setServices] = useState([]);
  const [jobStatus, setJobStatus] = useState("open");
  const [technicianDateTime, setTechnicianDateTime] = useState({
    date: "",
    time: "",
  });
  const { data: adminValues, isLoading: valueLoading } = useGetAllValuesQuery();
  const {
    data: technicians,
    isLoading: techniciansLoading,
    isFetching: techniciansFetchLoading,
  } = useGetAllTechniciansQuery({
    date: technicianDateTime.date,
    time: technicianDateTime.time,
  });
  const [updateRequest, { isLoading: updateLoading }] =
    useUpdateRequestMutation();
  const [addRequest, { isLoading: addLoading }] = useAddRequestByPmsMutation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setServices(adminValues?.services);
    if (open && scheduleDetails?.contractNo) {
      setLoading(true);
      setJobStatus(scheduleDetails?.jobStatus);
      setSelectedOption([]);
      setValue("contractNo", scheduleDetails?.contractNo);
      setValue("clientName", scheduleDetails?.clientName);
      setValue("clientAddress", scheduleDetails?.clientAddress);
      setValue("clientContact", scheduleDetails?.clientContact);
      setValue("scheduleType", scheduleDetails?.scheduleType);
      setValue("serviceType", scheduleDetails?.serviceType);
      setValue("time", scheduleDetails?.time?.value);
      setValue("assistantTechnician", scheduleDetails?.assistantTechnician);
      setValue("raiseBy", scheduleDetails?.raiseBy);
      setValue("instruction", scheduleDetails?.instruction);
      setValue("jobDuration", scheduleDetails?.jobDuration);
      setValue(
        "date",
        scheduleDetails?.date
          ? new Date(scheduleDetails?.date).toISOString().slice(0, 10)
          : new Date()
      );
      setValue("technician", scheduleDetails?.technician?._id);
      scheduleDetails?.serviceName
        ? scheduleDetails?.serviceName?.map((serviceName) =>
            adminValues?.services.map(
              (service) =>
                service.label === serviceName &&
                setSelectedOption((prev) => [...prev, service])
            )
          )
        : setServices(scheduleDetails.services);
    }
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, [open, adminValues]);

  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
    setValue,
    watch,
    control,
  } = useForm({
    defaultValues: {
      contractNo: "",
      clientName: "",
      clientAddress: "",
      clientContact: "",
      emailList: "",
      serviceType: "regular",
      scheduleType: "confirmed",
      date: "",
      time: 8,
      raiseBy: "",
      technician: "",
      assistantTechnician: "",
      jobDuration: "",
      instruction: "",
    },
  });

  let scheduleDate = watch("date");
  let scheduleTime = watch("time");

  useEffect(() => {
    if (
      scheduleDate &&
      jobStatus === "open" &&
      scheduleTime !== 8 &&
      scheduleTime !== 9 &&
      scheduleTime !== 13.5 &&
      scheduleTime !== 18
    ) {
      setTechnicianDateTime({ date: scheduleDate, time: scheduleTime });
    }
  }, [scheduleDate, scheduleTime, jobStatus]);

  const submit = async (data) => {
    data.serviceName = selectedOption.map((service) => service.label);
    data.time = timeSlot.find((obj) => obj.value === data.time);
    try {
      let res;
      if (scheduleDetails._id) {
        res = await updateRequest({ id: scheduleDetails._id, data }).unwrap();
      } else {
        data.clientEmail = scheduleDetails.emailList;
        data.service = selectedOption[0].value;
        res = await addRequest(data).unwrap();
      }
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
      {loading ||
      valueLoading ||
      techniciansLoading ||
      techniciansFetchLoading ||
      addLoading ||
      updateLoading ? (
        <Loading />
      ) : (
        <Modal open={open}>
          <div className="h-[440px] md:h-full overflow-x-scroll md:overflow-visible md:w-[600px]">
            <h4 className="text-center text-xl font-semibold mb-5">
              {scheduleDetails?.contractNo} Schedule
            </h4>
            <form onSubmit={handleSubmit(submit)} className="relative my-2">
              <div className="grid grid-cols-2 gap-x-5 gap-y-2 ">
                {/* <div className="col-span-2 md:col-span-1">
                  <InputRow
                    label="Contract Number"
                    placeholder="contract no"
                    id="contractNo"
                    errors={errors}
                    register={register}
                    disabled={true}
                  />
                  <p className="text-xs text-red-500 -bottom-4 pl-1">
                    {errors.contractNo && "Contract number is required"}
                  </p>
                </div> */}
                <div className="col-span-2 md:col-span-1">
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
                <div className="col-span-2 md:col-span-1">
                  <InputRow
                    label="Client Contact"
                    placeholder="contact number"
                    id="clientContact"
                    errors={errors}
                    register={register}
                    required
                  />
                  <p className="text-xs text-red-500 -bottom-4 pl-1">
                    {errors.clientContact && "Contact number is required"}
                  </p>
                </div>
                <div className="col-span-2 md:col-span-1">
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
                <div className="col-span-2 md:col-span-1">
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
                <div className="col-span-2">
                  <InputRow
                    label="Client Address"
                    placeholder="service address"
                    id="clientAddress"
                    errors={errors}
                    register={register}
                    required
                  />
                  <p className="text-xs text-red-500 -bottom-4 pl-1">
                    {errors.clientAddress && "Address is required"}
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
                    options={services}
                    isMulti={true}
                    placeholder="Select Service"
                    required
                  />
                </div>
                <div className="col-span-2 md:flex">
                  <div className="w-3/5 mr-4">
                    <InputRow
                      label="Schedule Date"
                      id="date"
                      errors={errors}
                      register={register}
                      type="date"
                      required
                    />
                    <p className="text-xs text-red-500 -bottom-4 pl-1">
                      {errors.date && "schedule date is required"}
                    </p>
                  </div>
                  <div className="w-3/5 mr-5">
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
                  <div>
                    <InputRow
                      label="Job Duration"
                      placeholder=""
                      id="jobDuration"
                      errors={errors}
                      register={register}
                      required={false}
                    />
                  </div>
                </div>

                <div className="col-span-2 md:col-span-1">
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
                <div className="col-span-2 md:col-span-1">
                  <InputRow
                    label="Assistant Technician"
                    placeholder="Assistant technician name"
                    id="assistantTechnician"
                    errors={errors}
                    register={register}
                    required={false}
                  />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <InputRow
                    label="Compliant Raise By"
                    placeholder="name"
                    id="raiseBy"
                    errors={errors}
                    register={register}
                  />
                  <p className="text-xs text-red-500 -bottom-4 pl-1">
                    {errors.raiseBy && "Complaint raise by is required"}
                  </p>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <InputRow
                    label="Instruction"
                    placeholder="Instructions to technician"
                    id="instruction"
                    errors={errors}
                    register={register}
                    required={false}
                  />
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
          </div>
        </Modal>
      )}
    </>
  );
};
export default ScheduleFormModal;
