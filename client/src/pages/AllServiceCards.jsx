import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { allFrequency, allService } from "../utils/helper";
import {
  AlertMessage,
  Button,
  InputRow,
  InputSelect,
  Loading,
} from "../components";
import Select from "react-select";
import { useAddCardMutation } from "../redux/serviceSlice";
import { toast } from "react-toastify";
import { useGetSingleContractQuery } from "../redux/contractSlice";

const AllServiceCards = () => {
  const [selectedOption, setSelectedOption] = useState([]);
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    data: contractDetails,
    isLoading,
    isFetching,
    refetch,
    error,
  } = useGetSingleContractQuery(id);

  const [addCard, { isLoading: addCardLoading }] = useAddCardMutation();

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
      id: id,
      services: [],
      area: "",
      frequency: "",
      treatmentLocation: "",
    },
  });

  const submit = async (data) => {
    data.services = selectedOption;

    try {
      const res = await addCard(data).unwrap();
      toast.success(res.msg);
      refetch();
      reset();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      {isLoading || addCardLoading ? (
        <Loading />
      ) : error ? (
        <AlertMessage>{error?.data?.msg || error.error}</AlertMessage>
      ) : (
        <div>
          <div className="flex justify-between">
            <h2 className="text-2xl font-semibold">
              Contract Number - {contractDetails.contractNo}
            </h2>
            <h2 className="text-2xl font-semibold">
              Start Date -{" "}
              {new Date(contractDetails.tenure.startDate).toLocaleDateString(
                "en-IN",
                {
                  day: "numeric",
                  month: "numeric",
                  year: "numeric",
                }
              )}
            </h2>
            <h2 className="text-2xl font-semibold">
              End Date -{" "}
              {new Date(contractDetails.tenure.endDate).toLocaleDateString(
                "en-IN",
                {
                  day: "numeric",
                  month: "numeric",
                  year: "numeric",
                }
              )}
            </h2>
            <h2 className="text-2xl font-semibold">
              Service Start -{" "}
              {new Date(contractDetails.serviceStartDate).toLocaleDateString(
                "en-IN",
                {
                  day: "numeric",
                  month: "numeric",
                  year: "numeric",
                }
              )}
            </h2>
          </div>
          <hr className="h-px mt-4 mb-3 border-0 dark:bg-gray-700" />
          <form
            onSubmit={handleSubmit(submit)}
            className="grid grid-cols-12 gap-x-5 gap-y-3 my-4"
          >
            <div className="col-span-6 md:col-span-4 lg:col-span-3">
              <label className="block text-md font-medium leading-6 text-gray-900">
                Select Service
                <span className="text-red-500 required-dot ml-0.5">*</span>
              </label>
              <Select
                closeMenuOnSelect={false}
                onChange={setSelectedOption}
                options={allService}
                isMulti
                placeholder="Select Service"
                required
              />
            </div>
            <div className="col-span-6 md:col-span-4 lg:col-span-2">
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
                  rows={3}
                  className="block w-full rounded-md border-0 px-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 sm:text-sm sm:leading-6"
                />
                <p className="text-xs text-red-500 -bottom-4 pl-1">
                  {errors.treatmentLocation?.message}
                </p>
              </div>
            </div>
            <div className="col-span-2 flex items-center justify-center">
              <Button label="Add Card" height="h-10" type="submit" />
            </div>
          </form>
          <hr className="h-px mt-4 mb-3 border-0 dark:bg-gray-700" />
          <div className="overflow-y-auto">
            <table className="min-w-full border text-center text-sm font-light dark:border-neutral-500">
              <thead className="border-b font-medium dark:border-neutral-800 border-2">
                <tr>
                  <th className="border-r px-6 py-1 dark:border-neutral-800 border-2">
                    Service
                  </th>
                  <th className="border-r px-6 py-1 dark:border-neutral-800 border-2">
                    Frequency
                  </th>
                  <th className="border-r px-6 py-1 text-left dark:border-neutral-800 border-2">
                    Service Due Dates
                  </th>
                  <th className="border-r px-6 py-1 dark:border-neutral-800 border-2">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {contractDetails.services?.map((service, index) => (
                  <tr className="border-b dark:border-neutral-500" key={index}>
                    <td className="border-r px-2 py-1 font-normal dark:border-neutral-500">
                      Test
                    </td>
                    <td className="border-r px-2 py-1 font-normal dark:border-neutral-500">
                      {service.frequency.name}
                    </td>
                    <td className="text-left border-r px-2 py-1 font-normal dark:border-neutral-500">
                      {service.serviceDates.join(", ")}
                    </td>
                    <td className="border-r flex px-1 gap-1 py-1 font-normal dark:border-neutral-500">
                      <Button label="Edit" width="w-20" />
                      <Button label="Delete" width="w-20" color="bg-red-600" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
};
export default AllServiceCards;
