import { Link, useNavigate, useParams } from "react-router-dom";
import { useGetSingleContractQuery } from "../redux/contractSlice";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { Controller, useForm, useFieldArray } from "react-hook-form";
import { Button, InputRow, InputSelect, Loading } from "../components";
import { toast } from "react-toastify";
import { setBillDetails } from "../redux/allSlice";
import {
  billingService,
  billingTypes,
  paymentMode,
  paymentStatus,
  paymentTerms,
  tdsType,
} from "../utils/dataHelper";
import {
  useAddBillingMutation,
  useGetSingleBillQuery,
  useUpdateBillDetailsMutation,
} from "../redux/billingSlice";
import { AiOutlinePlus } from "react-icons/ai";
import Select from "react-select";
import InvoiceFormModal from "../components/Modals/InvoiceFormModal";

const NewBilling = () => {
  const { action, id } = useParams();

  const [selectedOption, setSelectedOption] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [newInvoice, setNewInvoice] = useState(false);

  const dispatch = useDispatch();

  const [addBilling, { isLoading: addBillingLoading }] =
    useAddBillingMutation();
  const [updateBilling, { isLoading: updateBillingLoading }] =
    useUpdateBillDetailsMutation();
  const {
    data: contract,
    isLoading: contractLoading,
    refetch,
    error,
  } = useGetSingleContractQuery(id, { skip: action == "update" });
  const { data: bill, isLoading: billLoading } = useGetSingleBillQuery(id, {
    skip: action == "new",
  });

  const {
    register,
    formState: { errors, isValid },
    handleSubmit,
    reset,
    getValues,
    setValue,
    watch,
    control,
  } = useForm({
    defaultValues: {
      type: "PMS",
      paymentTerms: "",
      gstNo: "",
      tds: "no",
      amount: "",
      billToDetails: {
        name: "",
        address: "",
        nearBy: "",
        area: "",
        city: "",
        pincode: "",
        contact: {
          name: "",
          email: "",
          number: "",
        },
      },
      shipToDetails: {
        name: "",
        address: "",
        nearBy: "",
        area: "",
        city: "",
        pincode: "",
        contact: {
          name: "",
          email: "",
          number: "",
        },
      },
      // serviceDetails: [
      //   {
      //     serviceName: "",
      //     amount: "",
      //   },
      // ],
    },
  });

  let serviceDetails = watch("serviceDetails");

  const { fields, append, remove } = useFieldArray({
    name: "serviceDetails",
    control,
  });

  // useEffect(() => {
  //   if (contract) {
  //     dispatch(setContractDetails(contract));
  //   }
  // }, [contract]);

  // console.log(contractDetails);

  const addServiceDetails = async (index) => {
    if (
      serviceDetails[index].serviceName.length &&
      serviceDetails[index].amount.length
    ) {
      append({ serviceName: "", amount: "" });
    } else toast.error("Please select service & amount");
  };

  const submit = async (data) => {
    let allServices = [];
    if (action == "new") {
      contract.services.map((item) =>
        item.services.map((service) => allServices.push(service))
      );
      let contractDetails = {
        number: contract.contractNo,
        type: contract.type,
        business: contract.business,
        sales: contract.sales,
      };
      data.contractDetails = contractDetails;
      data.tenure = contract.tenure;
      data.contract = id;
    }
    const finalServices = allServices.concat(selectedOption);
    data.serviceDetails = finalServices;

    try {
      let res;
      if (action == "new") {
        res = await addBilling(data).unwrap();
      } else {
        res = await updateBilling({ id: bill._id, data }).unwrap();
      }
      toast.success(res.msg);
      setNewInvoice(true);
      dispatch(setBillDetails(res.bill));
    } catch (error) {
      console.log(error);
      toast.error(error?.data?.msg || error.error);
    }
  };

  useEffect(() => {
    setLoading(true);
    if (action == "new") {
      if (contract) {
        setValue("billToDetails.name", contract?.billToDetails.name);
        setValue("billToDetails.address", contract?.billToDetails.address);
        setValue("billToDetails.nearBy", contract?.billToDetails.nearBy);
        setValue("billToDetails.area", contract?.billToDetails.area);
        setValue("billToDetails.city", contract?.billToDetails.city);
        setValue("billToDetails.pincode", contract?.billToDetails.pincode);
        setValue(
          "billToDetails.contact.name",
          contract?.billToDetails.contact[0]?.name
        );
        setValue(
          "billToDetails.contact.email",
          contract?.billToDetails.contact[0]?.email
        );
        setValue(
          "billToDetails.contact.number",
          contract?.billToDetails.contact[0]?.number
        );
        setValue("shipToDetails.name", contract?.shipToDetails.name);
        setValue("shipToDetails.address", contract?.shipToDetails.address);
        setValue("shipToDetails.nearBy", contract?.shipToDetails.nearBy);
        setValue("shipToDetails.area", contract?.shipToDetails.area);
        setValue("shipToDetails.city", contract?.shipToDetails.city);
        setValue("shipToDetails.pincode", contract?.shipToDetails.pincode);
        setValue(
          "shipToDetails.contact.name",
          contract?.shipToDetails.contact[0]?.name
        );
        setValue(
          "shipToDetails.contact.email",
          contract?.shipToDetails.contact[0]?.email
        );
        setValue(
          "shipToDetails.contact.number",
          contract?.shipToDetails.contact[0]?.number
        );
      }
    } else if (action == "update") {
      if (bill) {
        setSelectedOption([]);
        setValue("type", bill.type);
        setValue("amount", bill.contractAmount.basic);
        setValue("paymentTerms", bill.paymentTerms);
        setValue("gstNo", bill.gstNo);
        setValue("tds", bill.tds);
        setValue("tds", bill.tds);
        setValue("billToDetails.name", bill?.billToDetails.name);
        setValue("billToDetails.address", bill?.billToDetails.address);
        setValue("billToDetails.nearBy", bill?.billToDetails.nearBy);
        setValue("billToDetails.area", bill?.billToDetails.area);
        setValue("billToDetails.city", bill?.billToDetails.city);
        setValue("billToDetails.pincode", bill?.billToDetails.pincode);
        setValue(
          "billToDetails.contact.name",
          bill?.billToDetails.contact?.name
        );
        setValue(
          "billToDetails.contact.email",
          bill?.billToDetails.contact?.email
        );
        setValue(
          "billToDetails.contact.number",
          bill?.billToDetails.contact?.number
        );
        setValue("shipToDetails.name", bill?.shipToDetails.name);
        setValue("shipToDetails.address", bill?.shipToDetails.address);
        setValue("shipToDetails.nearBy", bill?.shipToDetails.nearBy);
        setValue("shipToDetails.area", bill?.shipToDetails.area);
        setValue("shipToDetails.city", bill?.shipToDetails.city);
        setValue("shipToDetails.pincode", bill?.shipToDetails.pincode);
        setValue(
          "shipToDetails.contact.name",
          bill?.shipToDetails.contact?.name
        );
        setValue(
          "shipToDetails.contact.email",
          bill?.shipToDetails.contact?.email
        );
        setValue(
          "shipToDetails.contact.number",
          bill?.shipToDetails.contact?.number
        );
        setSelectedOption(bill?.serviceDetails);
      }
    }
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, [action, contract, bill]);

  console.log(contract);

  return (
    <div>
      {loading || contractLoading ? (
        <Loading />
      ) : newInvoice || contract?.billings?.length ? (
        <div className="flex items-center justify-center h-96">
          <Button
            color="bg-blue-700"
            height="py-2"
            label="Generate Invoice"
            width="w-36"
            handleClick={() => setOpen(true)}
          />
          {open && <InvoiceFormModal open={open} setOpen={setOpen} />}
        </div>
      ) : (
        <form onSubmit={handleSubmit(submit)} className="my-24 lg:my-4">
          <div className="grid grid-cols-12 gap-x-5 gap-y-2 mb-2">
            <div className="col-span-6 md:col-span-4 lg:col-span-2">
              <Controller
                name="type"
                control={control}
                render={({ field: { onChange, value, ref } }) => (
                  <InputSelect
                    options={billingTypes.slice(1)}
                    onChange={onChange}
                    value={value}
                    label="Billing Type"
                  />
                )}
              />
            </div>
            <div className="col-span-6 md:col-span-4 lg:col-span-2">
              <InputRow
                label="Basic Amount"
                placeholder=""
                id="amount"
                errors={errors}
                register={register}
                type="number"
              />
              <p className="text-xs text-red-500 -bottom-4 pl-1">
                {errors.amount && "basic amount is required"}
              </p>
            </div>
            <div className="col-span-6 md:col-span-4 lg:col-span-2">
              <Controller
                name="paymentTerms"
                control={control}
                render={({ field: { onChange, value, ref } }) => (
                  <InputSelect
                    options={paymentTerms}
                    onChange={onChange}
                    value={value}
                    label="Payment Terms"
                  />
                )}
              />
            </div>
            <div className="col-span-6 md:col-span-4 lg:col-span-2">
              <InputRow
                label="Client GST No"
                placeholder=""
                id="gstNo"
                errors={errors}
                register={register}
                required={false}
              />
            </div>
            <div className="col-span-6 md:col-span-4 lg:col-span-2">
              <Controller
                name="tds"
                control={control}
                render={({ field: { onChange, value, ref } }) => (
                  <InputSelect
                    options={tdsType}
                    onChange={onChange}
                    value={value}
                    label="TDS"
                  />
                )}
              />
            </div>

            {/* <div className="col-span-6 md:col-span-4 lg:col-span-2">
              <Controller
                name="paymentStatus"
                control={control}
                render={({ field: { onChange, value, ref } }) => (
                  <InputSelect
                    options={paymentStatus}
                    onChange={onChange}
                    value={value}
                    label="Payment Status"
                  />
                )}
              />
            </div>
            {paymentSts == "Received" && (
              <>
                <div className="col-span-6 md:col-span-4 lg:col-span-2">
                  <Controller
                    name="paymentMode"
                    control={control}
                    render={({ field: { onChange, value, ref } }) => (
                      <InputSelect
                        options={paymentMode}
                        onChange={onChange}
                        value={value}
                        label="Payment Mode"
                        required={paymentSts == "Received"}
                      />
                    )}
                  />
                </div>
                <div className="col-span-8 md:col-span-4 lg:col-span-2">
                  <InputRow
                    label="Payment Date"
                    id="payementDate"
                    errors={errors}
                    register={register}
                    type="date"
                    required={paymentSts == "Received"}
                  />
                  <p className="text-xs text-red-500 -bottom-4 pl-1">
                    {errors.payementDate && "Payment date is required"}
                  </p>
                </div>
                <div className="col-span-8 md:col-span-4 lg:col-span-2">
                  <InputRow
                    label="Payemnt Refernce No"
                    placeholder="Cheque No/UPI Id"
                    id="paymentRefernceNo"
                    errors={errors}
                    register={register}
                    required={false}
                  />
                </div>
              </>
            )} */}
          </div>
          <hr className="h-px mt-4 mb-3 border-0 dark:bg-gray-700" />
          <div className="grid lg:grid-cols-8 gap-x-5 gap-y-2 mb-2">
            <div className="col-span-6 md:col-span-4">
              <label className="block text-md font-medium leading-6 text-gray-900">
                Extra Service
              </label>
              <Select
                closeMenuOnSelect={false}
                defaultValue={selectedOption}
                onChange={setSelectedOption}
                options={billingService}
                isMulti={true}
                placeholder="Select Service"
              />
            </div>
          </div>
          <hr className="h-px my-5 border-1 dark:bg-gray-700" />
          <div className="grid grid-cols-12 gap-x-5 gap-y-2 mb-5">
            <div className="col-span-12 md:col-span-6">
              <h4 className="text-2xl font-semibold text-center text-blue-600">
                Bill To Details
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
                    label="City Location / Area"
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
                    id="billToDetails.contact.name"
                    errors={errors}
                    register={register}
                  />
                  <p className="text-xs text-red-500 -bottom-4 pl-1">
                    {errors.billToDetails?.contact &&
                      "Contact name is required"}
                  </p>
                </div>

                <div>
                  <InputRow
                    label="Contact Number"
                    placeholder="Contact number"
                    id="billToDetails.contact.number"
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
                    id="billToDetails.contact.email"
                    errors={errors}
                    register={register}
                    type="email"
                  />
                  <p className="text-xs text-red-500 -bottom-4 pl-1">
                    {errors.billToDetails?.contact &&
                      "Contact email is required"}
                  </p>
                </div>
              </div>
            </div>
            <div className="col-span-12 md:col-span-6">
              <div className="flex justify-around">
                <h4 className="text-2xl font-semibold text-center text-blue-600">
                  Ship To Details
                </h4>
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
                    label="City Location / Area"
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
                    id="shipToDetails.contact.name"
                    errors={errors}
                    register={register}
                  />
                  <p className="text-xs text-red-500 -bottom-4 pl-1">
                    {errors.shipToDetails?.contact &&
                      "Contact name is required"}
                  </p>
                </div>
                <div>
                  <InputRow
                    label="Contact Number"
                    placeholder="Contact number"
                    id="shipToDetails.contact.number"
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
                    id="shipToDetails.contact.email"
                    errors={errors}
                    register={register}
                    type="email"
                  />
                  <p className="text-xs text-red-500 -bottom-4 pl-1">
                    {errors.shipToDetails?.contact &&
                      "Contact email is required"}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <Button
            color="bg-green-700"
            type="submit"
            height="py-2"
            //   disabled={contractLoading || updateContractLoading}
            label={`${action.toUpperCase()} BILLING`}
            width="w-36"
          />
        </form>
      )}
    </div>
  );
};
export default NewBilling;
