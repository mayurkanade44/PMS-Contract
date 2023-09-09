import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useParams } from "react-router-dom";
import { allFrequency } from "../utils/dataHelper";
import {
  AlertMessage,
  Button,
  InputRow,
  InputSelect,
  Loading,
} from "../components";
import Select from "react-select";
import {
  useAddCardMutation,
  useDeleteCardMutation,
  useDigitalContractMutation,
  useSendContractMutation,
  useUpdateCardMutation,
} from "../redux/serviceSlice";
import { toast } from "react-toastify";
import {
  useGetAllValuesQuery,
  useGetSingleContractQuery,
} from "../redux/contractSlice";
import DeleteModal from "../components/Modals/DeleteModal";
import { dateFormat } from "../utils/functionHelper";
import { useSelector } from "react-redux";

const AllServiceCards = () => {
  const [selectedOption, setSelectedOption] = useState([]);
  const [edit, setEdit] = useState({
    status: false,
    loading: false,
  });
  const [openDelete, setOpenDelete] = useState({ state: false, id: "" });
  const { id } = useParams();
  const { user } = useSelector((store) => store.all);

  const {
    data: contractDetails,
    isLoading,
    isFetching,
    refetch,
    error,
  } = useGetSingleContractQuery(id);

  const [addCard, { isLoading: addCardLoading }] = useAddCardMutation();
  const [updateCard] = useUpdateCardMutation();
  const [deleteCard, { isLoading: deleteCardLoading }] =
    useDeleteCardMutation();
  const [digitalContract, { isLoading: digitalContractLoading }] =
    useDigitalContractMutation();
  const [sendContract, { isLoading: createCardLoading }] =
    useSendContractMutation();
  const { data: adminValues, isLoading: valueLoading } = useGetAllValuesQuery();

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
      id: id,
      area: "",
      frequency: "Single",
      serviceStartDate: {
        first: new Date().toISOString().slice(0, 10),
        second: "",
      },
      treatmentLocation: "",
      serviceCardId: "",
      dates: "",
    },
  });

  const watchFrequency = watch("frequency");

  const submit = async (data) => {
    data.services = selectedOption;
    data.serviceDates = data.dates.split(", ");

    let res;
    try {
      if (edit.status) {
        res = await updateCard(data).unwrap();
      } else {
        res = await addCard(data).unwrap();
      }
      toast.success(res.msg);
      refetch();
      reset();
      setSelectedOption([]);
      setEdit({ loading: false, status: false });
    } catch (error) {
      console.log(error);
      toast.error(error?.data?.msg || error.error);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await deleteCard(openDelete.id).unwrap();
      toast.success(res.msg);
      refetch();
      setOpenDelete({ state: false, id: "" });
    } catch (error) {
      console.log(error);
      toast.error(error?.data?.msg || error.error);
    }
  };

  const handleSendContract = async () => {
    try {
      let res;
      if (!contractDetails?.softCopy) {
        res = await digitalContract(id).unwrap();
      } else {
        res = await sendContract(id).unwrap();
      }
      refetch();
      toast.success(res.msg);
    } catch (error) {
      console.log(error);
      toast.error(error?.data?.msg || error.error);
    }
  };

  const handleEdit = (data) => {
    setEdit({ status: true, loading: true });
    setValue("frequency", data.frequency);
    setValue("area", data.area);
    setValue("treatmentLocation", data.treatmentLocation);
    setValue("serviceCardId", data._id);
    setValue("dates", data.serviceDates.join(", "));
    setValue(
      "serviceStartDate.first",
      new Date(data.serviceStartDate.first).toISOString().slice(0, 10)
    );
    if (data.serviceStartDate.second) {
      setValue(
        "serviceStartDate.second",
        new Date(data.serviceStartDate.second).toISOString().slice(0, 10)
      );
    }

    setSelectedOption(data.services);

    setTimeout(() => {
      setEdit((prev) => ({ ...prev, loading: false }));
    }, 500);
  };

  const handleCancelEdit = () => {
    setEdit({ status: false, loading: false });
    reset();
    setSelectedOption([]);
  };

  return (
    <>
      {isLoading ||
      addCardLoading ||
      deleteCardLoading ||
      edit.loading ||
      createCardLoading ||
      digitalContractLoading ||
      isFetching ? (
        <Loading />
      ) : error ? (
        <AlertMessage>{error?.data?.msg || error.error}</AlertMessage>
      ) : (
        <div className="my-5">
          <div className="md:flex justify-around">
            <h2 className="text-2xl font-semibold">
              Contract Number - {contractDetails.contractNo}
            </h2>
            <h2 className="text-2xl font-semibold">
              Start Date - {dateFormat(contractDetails.tenure.startDate)}
            </h2>
            <h2 className="text-2xl font-semibold">
              End Date - {dateFormat(contractDetails.tenure.endDate)}
            </h2>
          </div>
          <hr className="h-px mt-4 mb-3 border-0 dark:bg-gray-700" />
          <form
            onSubmit={handleSubmit(submit)}
            className="grid grid-cols-12 gap-x-5 gap-y-3 my-4"
          >
            <div className="col-span-6 md:col-span-4">
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
            <div className="col-span-6 md:col-span-4 lg:col-span-3">
              <Controller
                name="frequency"
                control={control}
                rules={{ required: "Service frequency is required" }}
                render={({ field: { onChange, value, ref } }) => (
                  <InputSelect
                    label="Service Frequency"
                    options={allFrequency}
                    onChange={onChange}
                    value={value}
                    placeholder="Select frequency"
                  />
                )}
              />
              <p className="text-xs text-red-500 -bottom-4 pl-1">
                {errors.frequency?.message}
              </p>
            </div>
            <div className="col-span-8 md:col-span-4 lg:col-span-2">
              <InputRow
                label="Service Start Date"
                message="Service start date is required"
                id="serviceStartDate.first"
                errors={errors}
                register={register}
                type="date"
              />
            </div>
            <div className="col-span-8 md:col-span-4 lg:col-span-2">
              {watchFrequency === "2 Times In A Week" && (
                <InputRow
                  label="Second Service Date"
                  message="Service start date is required"
                  id="serviceStartDate.second"
                  errors={errors}
                  register={register}
                  type="date"
                />
              )}
            </div>
            <div className="col-span-8 md:col-span-4 lg:col-span-2">
              <InputRow
                label="Area"
                id="area"
                errors={errors}
                register={register}
              />
              <p className="text-xs text-red-500 -bottom-4 pl-1">
                {errors.area && "Area is required"}
              </p>
            </div>
            <div className="col-span-8 md:col-span-4 lg:col-span-3">
              <label
                htmlFor="treatmentLocation"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Treatment Location *
              </label>
              <div className="mt-0.5">
                <textarea
                  {...register("treatmentLocation", {
                    required: "Treatment location required",
                  })}
                  id="treatmentLocation"
                  name="treatmentLocation"
                  rows={2}
                  className="block w-full rounded-md border-0 px-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 sm:text-sm sm:leading-6"
                />
                <p className="text-xs text-red-500 -bottom-4 pl-1">
                  {errors.treatmentLocation?.message}
                </p>
              </div>
            </div>
            {edit.status && (
              <div className="col-span-8 md:col-span-10 lg:col-span-10">
                <label
                  htmlFor="treatmentLocation"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Service Dates *
                </label>
                <div className="mt-0.5">
                  <textarea
                    {...register("dates", {
                      required: "Treatment location required",
                    })}
                    id="dates"
                    name="dates"
                    rows={8}
                    className="block w-full rounded-md border-0 px-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 sm:text-sm sm:leading-6"
                  />
                  <p className="text-xs text-red-500 -bottom-4 pl-1">
                    {errors.treatmentLocation?.message}
                  </p>
                </div>
              </div>
            )}
            <div className="col-span-1 flex items-center">
              <Button label="Save Card" height="h-10" type="submit" />
            </div>
            {edit.status && (
              <div className="col-span-1 flex items-center">
                <Button
                  label="Cancel"
                  height="h-10"
                  color="bg-black"
                  handleClick={handleCancelEdit}
                />
              </div>
            )}
          </form>
          <hr className="h-px mt-4 mb-3 border-0 dark:bg-gray-700" />
          <div className="overflow-y-auto">
            <table className="min-w-full border text-sm font-light dark:border-neutral-500 my-2 mb-4">
              <thead className="border-b font-medium dark:border-neutral-800 border-2">
                <tr>
                  {["Service", "Frequency", "Service Due Dates", "Action"].map(
                    (item) => (
                      <th
                        className="border-r px-2 py-1 dark:border-neutral-800 border-2"
                        key={item}
                      >
                        {item}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {contractDetails.services?.map((service) => (
                  <tr
                    className="border-b dark:border-neutral-500"
                    key={service._id}
                  >
                    <td className="border-r w-44 px-2 py-1 font-normal dark:border-neutral-500">
                      {service.services.map((item) => item.label + ", ")}
                    </td>
                    <td className="border-r text-center w-36 px-2 py-1 font-normal dark:border-neutral-500">
                      {service.frequency}
                    </td>
                    <td className="text-left border-r px-2 py-1 font-normal dark:border-neutral-500">
                      {service.serviceDates.join(", ")}
                    </td>
                    <td className="border-r w-48 px-2 gap-1 py-1 font-normal dark:border-neutral-500">
                      <div className="flex justify-around">
                        <Button
                          handleClick={() => handleEdit(service)}
                          label="Edit"
                          width="w-20"
                        />
                        {user.role === "Admin" && (
                          <Button
                            handleClick={() =>
                              setOpenDelete({ state: true, id: service._id })
                            }
                            label="Delete"
                            width="w-20"
                            color="bg-red-600"
                          />
                        )}
                        <DeleteModal
                          open={openDelete.state}
                          close={() => setOpenDelete({ state: false, id: "" })}
                          title="Confirm Delete"
                          description="Are you sure you want delete this service card? It will delete all the service data & disable QR Code"
                          handleClick={handleDelete}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Button
              label={
                !contractDetails.softCopy
                  ? "Create Digital Contract"
                  : !contractDetails.sendMail
                  ? "Send Contract"
                  : "Contract Already Sent"
              }
              width="w-48"
              height="py-2"
              color={
                !contractDetails.softCopy
                  ? "bg-green-600"
                  : !contractDetails.sendMail
                  ? "bg-blue-600"
                  : "bg-gray-600"
              }
              handleClick={() => handleSendContract()}
              disabled={
                !contractDetails.services?.length || contractDetails.sendMail
              }
            />
          </div>
        </div>
      )}
    </>
  );
};
export default AllServiceCards;
