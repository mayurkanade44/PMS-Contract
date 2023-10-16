import { Button, InputRow, InputSelect, Loading } from "../components";
import { useForm, Controller } from "react-hook-form";
import { toast } from "react-toastify";
import {
  useCreateContractMutation,
  useGetAllValuesQuery,
  useUpdateContractMutation,
} from "../redux/contractSlice";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { contractEnd, contractTypes } from "../utils/dataHelper";

const NewContract = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { contractDetails } = useSelector((store) => store.all);
  const [createContract, { isLoading: newContractLoading }] =
    useCreateContractMutation();
  const [updateContract, { isLoading: updateContractLoading }] =
    useUpdateContractMutation();

  const { data, isLoading } = useGetAllValuesQuery();

  const {
    register,
    formState: { errors, isValid },
    handleSubmit,
    reset,
    getValues,
    setValue,
    control,
  } = useForm({
    defaultValues: contractDetails || {
      type: "NC",
      sales: "",
      tenure: {
        startDate: new Date().toISOString().slice(0, 10),
        months: 12,
      },
      billingFrequency: "",
      billToDetails: {
        name: "",
        address: "",
        nearBy: "",
        area: "",
        city: "",
        pincode: "",
        contact: [
          { name: "", number: "", email: "" },
          { name: "", number: "", email: "" },
        ],
      },
      shipToDetails: {
        name: "",
        address: "",
        nearBy: "",
        area: "",
        city: "",
        pincode: "",
        contact: [
          { name: "", number: "", email: "" },
          { name: "", number: "", email: "" },
        ],
      },
    },
  });

  useEffect(() => {
    if (contractDetails) {
      setValue(
        "tenure.startDate",
        new Date(contractDetails.tenure.startDate).toISOString().slice(0, 10)
      );
    }
  }, []);

  const handleCopyDetails = () => {
    setValue("shipToDetails", getValues("billToDetails"));
    // setValue("shipToContact", getValues("billToContact"));
  };

  const submit = async (data) => {
    const date = new Date(data.tenure.startDate);
    data.tenure.endDate = new Date(
      date.getFullYear(),
      date.getMonth() + data.tenure.months,
      date.getDate() - 1
    ).setHours(5, 30, 0);

    try {
      let res;
      if (contractDetails) {
        res = await updateContract({ id: contractDetails._id, data }).unwrap();
        navigate(`/contract-details/${id}`);
      } else {
        res = await createContract(data).unwrap();
        navigate(`/contract/${res.id}/service-cards`);
        reset();
      }
      toast.success(res.msg);
    } catch (error) {
      console.log(error);
      toast.error(error?.data?.msg || error.error);
    }
  };

  return (
    <>
      {(newContractLoading || updateContractLoading || isLoading) && (
        <Loading />
      )}
      <form onSubmit={handleSubmit(submit)} className="my-24 lg:my-4">
        <div className="grid grid-cols-12 gap-x-5 gap-y-2 mb-2">
          <div className="col-span-6 md:col-span-4 lg:col-span-2">
            <Controller
              name="type"
              control={control}
              render={({ field: { onChange, value, ref } }) => (
                <InputSelect
                  options={contractTypes}
                  onChange={onChange}
                  value={value}
                  label="Contract Type"
                />
              )}
            />
          </div>
          <div className="col-span-8 md:col-span-4 lg:col-span-2">
            <InputRow
              label="Contract Start Date"
              id="tenure.startDate"
              errors={errors}
              register={register}
              type="date"
            />
            <p className="text-xs text-red-500 -bottom-4 pl-1">
              {errors.tenure?.startDate && "Contract Start date is required"}
            </p>
          </div>
          <div className="col-span-8 md:col-span-4 lg:col-span-2">
            <Controller
              name="tenure.months"
              control={control}
              rules={{ required: "Contract end date is required" }}
              render={({ field: { onChange, value, ref } }) => (
                <InputSelect
                  label="Contract End"
                  options={contractEnd}
                  onChange={onChange}
                  value={value}
                />
              )}
            />
            <p className="text-xs text-red-500 -bottom-4 pl-1">
              {errors.endDate?.message}
            </p>
          </div>
          <div className="col-span-8 md:col-span-4 lg:col-span-3">
            <Controller
              name="sales"
              control={control}
              rules={{ required: "Sales person name is required" }}
              render={({ field: { onChange, value, ref } }) => (
                <InputSelect
                  label="Sales Person"
                  options={data?.sales}
                  onChange={onChange}
                  value={value}
                  placeholder="Select sales person"
                />
              )}
            />
            <p className="text-xs text-red-500 -bottom-4 pl-1">
              {errors.sales?.message}
            </p>
          </div>
          <div className="col-span-6 md:col-span-4 lg:col-span-3">
            <InputRow
              label="Billing Frequency"
              placeholder="Full payment"
              id="billingFrequency"
              errors={errors}
              register={register}
            />
            <p className="text-xs text-red-500 -bottom-4 pl-1">
              {errors.billingFrequency && "Billing frequency is required"}
            </p>
          </div>
        </div>
        <hr className="h-px mt-4 mb-3 border-0 dark:bg-gray-700" />
        <div className="grid grid-cols-12 gap-x-5 gap-y-2 mb-3">
          <div className="col-span-12 md:col-span-6">
            <h4 className="text-2xl font-semibold text-center text-blue-600">
              Billing Details
            </h4>
            <div className="mb-2">
              <InputRow
                label="Full Name"
                placeholder="Enter full name of billing"
                id="billToDetails.name"
                errors={errors}
                register={register}
              />
              <p className="text-xs text-red-500 -bottom-4 pl-1">
                {errors.billToDetails?.name && "Billing name is required"}
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-5 gap-y-1 mb-1">
              <div className="col-span-2">
                <label
                  htmlFor="billingAddress"
                  className="block text-md font-medium leading-6 text-gray-900 mb-0.5"
                >
                  Billing Address
                  <span className="text-red-500 required-dot ml-0.5">*</span>
                </label>
                <textarea
                  {...register("billToDetails.address", {
                    required: "Billing address is required",
                  })}
                  id="billToDetails.address"
                  name="billToDetails.address"
                  rows={2}
                  className="block w-full px-2 border-2 rounded-md outline-none transition border-neutral-300 focus:border-black"
                />
                <p className="text-xs text-red-500 pl-1">
                  {errors.billToDetails?.address?.message}
                </p>
              </div>
              <div>
                <InputRow
                  label="Near By Place"
                  placeholder="Enter landmark"
                  id="billToDetails.nearBy"
                  errors={errors}
                  register={register}
                />
                <p className="text-xs text-red-500 -bottom-4 pl-1">
                  {errors.billToDetails?.nearBy && "Landmark is required"}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-5 gap-y-1">
              <div>
                <InputRow
                  label="Area"
                  placeholder="Enter area"
                  id="billToDetails.area"
                  errors={errors}
                  register={register}
                />
                <p className="text-xs text-red-500 -bottom-4 pl-1">
                  {errors.billToDetails?.area && "Area is required"}
                </p>
              </div>
              <div>
                <InputRow
                  label="City"
                  placeholder="Enter city"
                  id="billToDetails.city"
                  errors={errors}
                  register={register}
                />
                <p className="text-xs text-red-500 -bottom-4 pl-1">
                  {errors.billToDetails?.city && "City is required"}
                </p>
              </div>
              <div>
                <InputRow
                  label="Pincode"
                  placeholder="Enter pincode"
                  id="billToDetails.pincode"
                  errors={errors}
                  register={register}
                />
                <p className="text-xs text-red-500 -bottom-4 pl-1">
                  {errors.billToDetails?.pincode && "Pincode is required"}
                </p>
              </div>
              <div>
                <InputRow
                  label="Contact Name"
                  placeholder="Contact Name"
                  id="billToDetails.contact.0.name"
                  errors={errors}
                  register={register}
                />
                <p className="text-xs text-red-500 -bottom-4 pl-1">
                  {errors.billToDetails?.contact && "Contact name is required"}
                </p>
              </div>
              
              <div>
                <InputRow
                  label="Contact Number"
                  placeholder="Contact number"
                  id="billToDetails.contact.0.number"
                  errors={errors}
                  register={register}
                />
                <p className="text-xs text-red-500 -bottom-4 pl-1">
                  {errors.billToDetails?.contact &&
                    "Contact number is required"}
                </p>
              </div>
              <div>
                <InputRow
                  label="Contact Email"
                  placeholder="Contact email id"
                  id="billToDetails.contact.0.email"
                  errors={errors}
                  register={register}
                  type="email"
                />
                <p className="text-xs text-red-500 -bottom-4 pl-1">
                  {errors.billToDetails?.contact && "Contact email is required"}
                </p>
              </div>
              <div>
                <InputRow
                  required={false}
                  placeholder="Alternate name"
                  id="billToDetails.contact.1.name"
                  errors={errors}
                  register={register}
                />
              </div>
              <div>
                <InputRow
                  required={false}
                  placeholder="Alternate number"
                  id="billToDetails.contact.1.number"
                  errors={errors}
                  register={register}
                />
              </div>
              <div>
                <InputRow
                  placeholder="Alternate email"
                  id="billToDetails.contact.1.email"
                  errors={errors}
                  register={register}
                  type="email"
                  required={false}
                />
              </div>
            </div>
          </div>
          <div className="col-span-12 md:col-span-6">
            <div className="flex justify-around">
              <h4 className="text-2xl font-semibold text-center text-blue-600">
                Service Details
              </h4>
              <Button
                color="bg-gray-600"
                height="py-[1px]"
                label="Same As Billing"
                width="w-32"
                handleClick={handleCopyDetails}
              />
            </div>
            <div className="mb-2">
              <InputRow
                label="Full Name"
                placeholder="Enter full name of shipping"
                id="shipToDetails.name"
                errors={errors}
                register={register}
              />
              <p className="text-xs text-red-500 -bottom-4 pl-1">
                {errors.shipToDetails?.name && "Shipping name is required"}
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-5 gap-y-1 mb-1">
              <div className="col-span-2">
                <label
                  htmlFor="billingAddress"
                  className="block text-md font-medium leading-6 text-gray-900 mb-0.5"
                >
                  Service Address
                  <span className="text-red-500 required-dot ml-0.5">*</span>
                </label>
                <textarea
                  {...register("shipToDetails.address", {
                    required: "Service address is required",
                  })}
                  id="shipToDetails.address"
                  name="shipToDetails.address"
                  rows={2}
                  className="block w-full px-2 border-2 rounded-md outline-none transition border-neutral-300 focus:border-black"
                />
                <p className="text-xs text-red-500 pl-1">
                  {errors.shipToDetails?.address?.message}
                </p>
              </div>
              <div>
                <InputRow
                  label="Near By Place"
                  placeholder="Enter landmark"
                  id="shipToDetails.nearBy"
                  errors={errors}
                  register={register}
                />
                <p className="text-xs text-red-500 -bottom-4 pl-1">
                  {errors.shipToDetails?.nearBy && "Landmark is required"}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-5 gap-y-1">
              <div>
                <InputRow
                  label="Area"
                  placeholder="Enter area"
                  id="shipToDetails.area"
                  errors={errors}
                  register={register}
                />
                <p className="text-xs text-red-500 -bottom-4 pl-1">
                  {errors.shipToDetails?.area && "Area is required"}
                </p>
              </div>
              <div>
                <InputRow
                  label="City"
                  placeholder="Enter city"
                  id="shipToDetails.city"
                  errors={errors}
                  register={register}
                />
                <p className="text-xs text-red-500 -bottom-4 pl-1">
                  {errors.shipToDetails?.city && "City is required"}
                </p>
              </div>
              <div>
                <InputRow
                  label="Pincode"
                  placeholder="Enter pincode"
                  id="shipToDetails.pincode"
                  errors={errors}
                  register={register}
                />
                <p className="text-xs text-red-500 -bottom-4 pl-1">
                  {errors.shipToDetails?.pincode && "Pincode is required"}
                </p>
              </div>
              <div>
                <InputRow
                  label="Contact Name"
                  placeholder="Contact Name"
                  id="shipToDetails.contact.0.name"
                  errors={errors}
                  register={register}
                />
                <p className="text-xs text-red-500 -bottom-4 pl-1">
                  {errors.shipToDetails?.contact && "Contact name is required"}
                </p>
              </div>
              <div>
                <InputRow
                  label="Contact Number"
                  placeholder="Contact number"
                  id="shipToDetails.contact.0.number"
                  errors={errors}
                  register={register}
                />
                <p className="text-xs text-red-500 -bottom-4 pl-1">
                  {errors.shipToDetails?.contact &&
                    "Contact number is required"}
                </p>
              </div>
              <div>
                <InputRow
                  label="Contact Email"
                  placeholder="Contact email id"
                  id="shipToDetails.contact.0.email"
                  errors={errors}
                  register={register}
                  type="email"
                />
                <p className="text-xs text-red-500 -bottom-4 pl-1">
                  {errors.shipToDetails?.contact && "Contact email is required"}
                </p>
              </div>
              <div>
                <InputRow
                  required={false}
                  placeholder="Alternate name"
                  id="shipToDetails.contact.1.name"
                  errors={errors}
                  register={register}
                />
              </div>
              <div>
                <InputRow
                  required={false}
                  placeholder="Alternate number"
                  id="shipToDetails.contact.1.number"
                  errors={errors}
                  register={register}
                />
              </div>
              <div>
                <InputRow
                  placeholder="Alternate email"
                  id="shipToDetails.contact.1.email"
                  errors={errors}
                  register={register}
                  type="email"
                  required={false}
                />
              </div>
            </div>
          </div>
        </div>
        <Button
          color="bg-green-700"
          type="submit"
          height="py-2"
          disabled={newContractLoading || updateContractLoading}
          label={contractDetails ? "Update Contract" : "Create Contract"}
          width="w-36"
        />
      </form>
    </>
  );
};
export default NewContract;
