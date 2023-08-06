import { InputRow, InputSelect } from "../components";
import { useForm, useController, Controller } from "react-hook-form";
import { toast } from "react-toastify";

const contractTypes = [
  { value: "NC", label: "New Contract" },
  { value: "RC", label: "Renew Contract" },
];

const salesPerson = [
  { value: "Mayur", label: "Mayur" },
  { value: "Pranit", label: "Pranit" },
];

const contractEnd = [
  { value: "30", label: "1 Month (30 Days)" },
  { value: "90", label: "3 Months (90 Days)" },
  { value: "180", label: "6 Months (180 Days)" },
  { value: "360", label: "1 Year (360 Days)" },
  { value: "1080", label: "3 Years" },
  { value: "1800", label: "5 Years" },
  { value: "Onwards", label: "Onwards" },
];

const preferredTime = [
  { value: "10 am - 12 pm", label: "10 am - 12 pm" },
  { value: "12 am - 2 pm", label: "12 am - 2 pm" },
  { value: "2 pm - 4 pm", label: "2 pm - 4 pm" },
  { value: "4 pm - 6 pm", label: "4 pm - 6 pm" },
  { value: "Night", label: "Night" },
  { value: "Anytime", label: "Anytime" },
  { value: "To Confirm", label: "To Confirm" },
];

const Contract = () => {
  const {
    register,
    formState: { errors, isValid },
    handleSubmit,
    reset,
    control,
  } = useForm({
    defaultValues: {
      contractNo: "",
      type: "NC",
      sales: "",
      startDate: new Date().toISOString().slice(0, 10),
      endDate: "360",
      serviceStartDate: new Date().toISOString().slice(0, 10),
      preferred: {
        day: "",
        time: "10 am - 12 pm",
      },
      billingFrequency: "",
      instruction: "",
      billToDetails: {
        name: "",
        address: "",
        nearBy: "",
        city: "",
        pincode: "",
      },
      shipToDetails: {
        name: "",
        address: "",
        nearBy: "",
        city: "",
        pincode: "",
      },
      billToContact: [
        { name: "", contact: "", email: "" },
        { name: "", contact: "", email: "" },
        { name: "", contact: "", email: "" },
      ],
      shipToContact: [],
    },
  });

  const submit = (data) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(submit)}>
      <div className="grid grid-cols-12 gap-x-5 gap-y-2 mb-2">
        <div className="col-span-6 md:col-span-4 lg:col-span-3">
          <InputRow
            label="Contract Number"
            message="Contract number is required"
            placeholder="A-45"
            id="contractNo"
            errors={errors}
            register={register}
          />
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
            rules={{ required: true }}
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
                options={salesPerson}
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
        </div>
      </div>
      <hr className="h-px mt-4 mb-3 border-0 dark:bg-gray-700" />
      <div className="grid grid-cols-12 gap-x-5 gap-y-2 mb-2">
        <div className="col-span-8 md:col-span-4 lg:col-span-2">
          <InputRow
            label="Contract Start Date"
            message="Start date is required"
            id="startDate"
            errors={errors}
            register={register}
            type="date"
          />
        </div>
        <div className="col-span-8 md:col-span-4 lg:col-span-2">
          <Controller
            name="endDate"
            control={control}
            rules={{ required: "Contract end date is required" }}
            render={({ field: { onChange, value, ref } }) => (
              <InputSelect
                label="Contract End Date"
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
        <div className="col-span-8 md:col-span-4 lg:col-span-2">
          <InputRow
            label="Service Start Date"
            message="Service start date is required"
            id="serviceStartDate"
            errors={errors}
            register={register}
            type="date"
          />
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
            {errors.preferred?.day?.message}
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
              id="billToDetails.name"
              errors={errors}
              register={register}
            />
            <p className="text-xs text-red-500 -bottom-4 pl-1">
              {errors.billToDetails?.name?.message}
            </p>
          </div>
          <div className="mb-2">
            <InputRow
              label="Billing Address"
              message="Address is required"
              placeholder="Enter full address of billing"
              id="billToDetails.address"
              errors={errors}
              register={register}
            />
            <p className="text-xs text-red-500 -bottom-4 pl-1">
              {errors.billToDetails?.address?.message}
            </p>
          </div>
          <div className="flex justify-between">
            <div>
              <InputRow
                label="Near By Place"
                message="Landmark is required"
                placeholder="Enter landmark"
                id="billToDetails.nearBy"
                errors={errors}
                register={register}
              />
              <p className="text-xs text-red-500 -bottom-4 pl-1">
                {errors.billToDetails?.nearBy?.message}
              </p>
            </div>
            <div>
              <InputRow
                label="City"
                message="City name is required"
                placeholder="Enter city"
                id="billToDetails.city"
                errors={errors}
                register={register}
              />
              <p className="text-xs text-red-500 -bottom-4 pl-1">
                {errors.billToDetails?.city?.message}
              </p>
            </div>
            <div>
              <InputRow
                label="Pincode"
                message="Area pincode is required"
                placeholder="Enter area pincode"
                id="billToDetails.pincode"
                errors={errors}
                register={register}
              />
              <p className="text-xs text-red-500 -bottom-4 pl-1">
                {errors.billToDetails?.pincode?.message}
              </p>
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6">
          <h4 className="text-2xl font-semibold text-center text-blue-600">
            Ship To Details
          </h4>
          <div className="mb-2">
            <InputRow
              label="Full Name"
              message="Name is required"
              placeholder="Enter full name of shipping"
              id="shipToDetails.name"
              errors={errors}
              register={register}
            />
            <p className="text-xs text-red-500 -bottom-4 pl-1">
              {errors.shipToDetails?.name?.message}
            </p>
          </div>
          <div className="mb-2">
            <InputRow
              label="Shipping Address"
              message="Address is required"
              placeholder="Enter full address of shipping"
              id="shipToDetails.address"
              errors={errors}
              register={register}
            />
            <p className="text-xs text-red-500 -bottom-4 pl-1">
              {errors.shipToDetails?.address?.message}
            </p>
          </div>
          <div className="flex justify-between">
            <div>
              <InputRow
                label="Near By Place"
                message="Landmark is required"
                placeholder="Enter landmark"
                id="shipToDetails.nearBy"
                errors={errors}
                register={register}
              />
              <p className="text-xs text-red-500 -bottom-4 pl-1">
                {errors.shipToDetails?.nearBy?.message}
              </p>
            </div>
            <div>
              <InputRow
                label="City"
                message="City name is required"
                placeholder="Enter city"
                id="shipToDetails.city"
                errors={errors}
                register={register}
              />
              <p className="text-xs text-red-500 -bottom-4 pl-1">
                {errors.shipToDetails?.city?.message}
              </p>
            </div>
            <div>
              <InputRow
                label="Pincode"
                message="Area pincode is required"
                placeholder="Enter area pincode"
                id="shipToDetails.pincode"
                errors={errors}
                register={register}
              />
              <p className="text-xs text-red-500 -bottom-4 pl-1">
                {errors.shipToDetails?.pincode?.message}
              </p>
            </div>
          </div>
        </div>
        <div className="col-span-6 mt-2">
          <div className="grid grid-cols-12 gap-x-5 gap-y-2">
            <div className="col-span-4">
              <h2 className="text-center">Name</h2>
              <InputRow
                placeholder="Contact Name"
                id="billToContact.0.name"
                errors={errors}
                register={register}
                required={false}
              />
              <p className="text-xs text-red-500 -bottom-4 pl-1">
                {errors.billToContact[0]?.name && "Contact name is required"}
              </p>
            </div>
          </div>
        </div>
      </div>
      <button
        type="submit"
        className="py-2 px-4 mt-3 bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 focus:ring-offset-indigo-200 text-white w-full transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2  rounded-lg "
      >
        Submit
      </button>
    </form>
  );
};
export default Contract;
