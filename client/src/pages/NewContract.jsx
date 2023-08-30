import { Button, InputRow, InputSelect, Loading } from "../components";
import { useForm, Controller } from "react-hook-form";
import { toast } from "react-toastify";
import {
  useCreateContractMutation,
  useGetAllValuesQuery,
  useUpdateContractMutation,
} from "../redux/contractSlice";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { preferredTime, contractEnd, contractTypes } from "../utils/dataHelper";

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
      contractNo: "",
      type: "NC",
      sales: "",
      tenure: {
        startDate: new Date().toISOString().slice(0, 10),
        months: 12,
      },
      preferred: {
        day: "",
        time: "10 am - 12 pm",
      },
      billingFrequency: "",
      billToAddress: {
        name: "",
        address: "",
        nearBy: "",
        city: "",
        pincode: "",
      },
      shipToAddress: {
        name: "",
        address: "",
        nearBy: "",
        city: "",
        pincode: "",
      },
      billToContact: [
        { name: "", number: "", email: "" },
        { name: "", number: "", email: "" },
      ],
      shipToContact: [
        { name: "", number: "", email: "" },
        { name: "", number: "", email: "" },
      ],
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
    setValue("shipToAddress", getValues("billToAddress"));
    setValue("shipToContact", getValues("billToContact"));
  };

  const submit = async (data) => {
    data.contractNo =
      data.contractNo.trim()[0].toUpperCase() + data.contractNo.slice(1);
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
      <form onSubmit={handleSubmit(submit)} className="my-4">
        <div className="grid grid-cols-12 gap-x-5 gap-y-2 mb-2">
          <div className="col-span-6 md:col-span-4 lg:col-span-3">
            <InputRow
              label="Contract Number"
              message="Contract number is required"
              placeholder="A/44"
              id="contractNo"
              errors={errors}
              register={register}
            />
            <p className="text-xs text-red-500 -bottom-4 pl-1">
              {errors.contractNo && "Contract number is required"}
            </p>
          </div>
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
              message="Billing frequency is required"
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

          <div className="col-span-6 md:col-span-4 lg:col-span-2">
            <InputRow
              label="Preferred Day"
              message="Preferred day is required"
              placeholder="Monday"
              id="preferred.day"
              errors={errors}
              register={register}
            />
            <p className="text-xs text-red-500 -bottom-4 pl-1">
              {errors.preferred?.day && "Preferred day is required"}
            </p>
          </div>
          <div className="col-span-8 md:col-span-4 lg:col-span-2">
            <Controller
              name="preferred.time"
              control={control}
              rules={{ required: "Preferred time is required" }}
              render={({ field: { onChange, value, ref } }) => (
                <InputSelect
                  label="Preferred Time"
                  options={preferredTime}
                  onChange={onChange}
                  value={value}
                />
              )}
            />
            <p className="text-xs text-red-500 -bottom-4 pl-1">
              {errors.preferred?.time?.message}
            </p>
          </div>
          <div className="col-span-12">
            <hr className="h-px mt-2 border-0 dark:bg-gray-700" />
          </div>
          <div className="col-span-12 md:col-span-6">
            <h4 className="text-2xl font-semibold text-center text-blue-600">
              Bill To Details
            </h4>
            <div className="mb-2">
              <InputRow
                label="Full Name"
                message="Name is required"
                placeholder="Enter full name of billing"
                id="billToAddress.name"
                errors={errors}
                register={register}
              />
              <p className="text-xs text-red-500 -bottom-4 pl-1">
                {errors.billToAddress?.name && "Billing name is required"}
              </p>
            </div>
            <div className="mb-2">
              <InputRow
                label="Billing Address"
                message="Address is required"
                placeholder="Enter full address of billing"
                id="billToAddress.address"
                errors={errors}
                register={register}
              />
              <p className="text-xs text-red-500 -bottom-4 pl-1">
                {errors.billToAddress?.address && "Billing address is required"}
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-5 gap-y-1">
              <div>
                <InputRow
                  label="Near By Place"
                  message="Landmark is required"
                  placeholder="Enter landmark"
                  id="billToAddress.nearBy"
                  errors={errors}
                  register={register}
                />
                <p className="text-xs text-red-500 -bottom-4 pl-1">
                  {errors.billToAddress?.nearBy && "Landmark is required"}
                </p>
              </div>
              <div>
                <InputRow
                  label="City"
                  message="City name is required"
                  placeholder="Enter city"
                  id="billToAddress.city"
                  errors={errors}
                  register={register}
                />
                <p className="text-xs text-red-500 -bottom-4 pl-1">
                  {errors.billToAddress?.city && "City is required"}
                </p>
              </div>
              <div>
                <InputRow
                  label="Pincode"
                  message="Area pincode is required"
                  placeholder="Enter area pincode"
                  id="billToAddress.pincode"
                  errors={errors}
                  register={register}
                />
                <p className="text-xs text-red-500 -bottom-4 pl-1">
                  {errors.billToAddress?.pincode && "Pincode is required"}
                </p>
              </div>
              <div>
                <InputRow
                  label="Contact Name"
                  placeholder="Contact Name"
                  id="billToContact.0.name"
                  errors={errors}
                  register={register}
                />
                <p className="text-xs text-red-500 -bottom-4 pl-1">
                  {errors.billToContact && "Contact name is required"}
                </p>
              </div>
              <div>
                <InputRow
                  label="Contact Number"
                  placeholder="Contact number"
                  id="billToContact.0.number"
                  errors={errors}
                  register={register}
                />
                <p className="text-xs text-red-500 -bottom-4 pl-1">
                  {errors.billToContact && "Contact number is required"}
                </p>
              </div>
              <div>
                <InputRow
                  label="Contact Email"
                  placeholder="Contact email id"
                  id="billToContact.0.email"
                  errors={errors}
                  register={register}
                  type="email"
                />
                <p className="text-xs text-red-500 -bottom-4 pl-1">
                  {errors.billToContact && "Contact email is required"}
                </p>
              </div>
              <div>
                <InputRow
                  required={false}
                  placeholder="Alternate name"
                  id="billToContact.1.name"
                  errors={errors}
                  register={register}
                />
              </div>
              <div>
                <InputRow
                  required={false}
                  placeholder="Alternate number"
                  id="billToContact.1.number"
                  errors={errors}
                  register={register}
                />
              </div>
              <div>
                <InputRow
                  placeholder="Alternate email"
                  id="billToContact.1.email"
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
                Ship To Details
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
                message="Name is required"
                placeholder="Enter full name of shipping"
                id="shipToAddress.name"
                errors={errors}
                register={register}
              />
              <p className="text-xs text-red-500 -bottom-4 pl-1">
                {errors.shipToAddress?.name && "Shipping name is required"}
              </p>
            </div>
            <div className="mb-2">
              <InputRow
                label="Shipping Address"
                message="Address is required"
                placeholder="Enter full address of shipping"
                id="shipToAddress.address"
                errors={errors}
                register={register}
              />
              <p className="text-xs text-red-500 -bottom-4 pl-1">
                {errors.shipToAddress?.address &&
                  "Shipping address is required"}
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-5 gap-y-1">
              <div>
                <InputRow
                  label="Near By Place"
                  message="Landmark is required"
                  placeholder="Enter landmark"
                  id="shipToAddress.nearBy"
                  errors={errors}
                  register={register}
                />
                <p className="text-xs text-red-500 -bottom-4 pl-1">
                  {errors.shipToAddress?.nearBy && "Landmark is required"}
                </p>
              </div>
              <div>
                <InputRow
                  label="City"
                  message="City name is required"
                  placeholder="Enter city"
                  id="shipToAddress.city"
                  errors={errors}
                  register={register}
                />
                <p className="text-xs text-red-500 -bottom-4 pl-1">
                  {errors.shipToAddress?.city && "City is required"}
                </p>
              </div>
              <div>
                <InputRow
                  label="Pincode"
                  message="Area pincode is required"
                  placeholder="Enter area pincode"
                  id="shipToAddress.pincode"
                  errors={errors}
                  register={register}
                />
                <p className="text-xs text-red-500 -bottom-4 pl-1">
                  {errors.shipToAddress?.pincode && "Pincode is required"}
                </p>
              </div>
              <div>
                <InputRow
                  label="Contact Name"
                  placeholder="Contact Name"
                  id="shipToContact.0.name"
                  errors={errors}
                  register={register}
                />
                <p className="text-xs text-red-500 -bottom-4 pl-1">
                  {errors.shipToContact && "Contact name is required"}
                </p>
              </div>
              <div>
                <InputRow
                  label="Contact Number"
                  placeholder="Contact number"
                  id="shipToContact.0.number"
                  errors={errors}
                  register={register}
                />
                <p className="text-xs text-red-500 -bottom-4 pl-1">
                  {errors.shipToContact && "Contact number is required"}
                </p>
              </div>
              <div>
                <InputRow
                  label="Contact Email"
                  placeholder="Contact email id"
                  id="shipToContact.0.email"
                  errors={errors}
                  register={register}
                  type="email"
                />
                <p className="text-xs text-red-500 -bottom-4 pl-1">
                  {errors.shipToContact && "Contact email is required"}
                </p>
              </div>
              <div>
                <InputRow
                  required={false}
                  placeholder="Alternate name"
                  id="shipToContact.1.name"
                  errors={errors}
                  register={register}
                />
              </div>
              <div>
                <InputRow
                  required={false}
                  placeholder="Alternate number"
                  id="shipToContact.1.number"
                  errors={errors}
                  register={register}
                />
              </div>
              <div>
                <InputRow
                  placeholder="Alternate email"
                  id="shipToContact.1.email"
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