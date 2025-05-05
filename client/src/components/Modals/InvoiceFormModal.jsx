import { saveAs } from "file-saver";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { IoMdCloseCircleOutline } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Button, InputRow, InputSelect, Loading } from "..";
import { setBillDetails, setInvoiceDetails } from "../../redux/allSlice";
import {
  useGenerateInvoiceMutation,
  useUpdateInvoiceMutation,
} from "../../redux/billingSlice";
import {
  billingTypes,
  paymentModes,
  paymentStatus,
} from "../../utils/dataHelper";
import Modal from "./Modal";
import moment from "moment";
const InvoiceFormModal = ({ open, setOpen }) => {
  const dispatch = useDispatch();
  const { invoiceDetails, billDetails: bill } = useSelector(
    (store) => store.all
  );

  const [generateInvoice, { isLoading: generateInvoiceLoading }] =
    useGenerateInvoiceMutation();
  const [updateInvoice, { isLoading: updateInvoiceLoading }] =
    useUpdateInvoiceMutation();

  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
    setValue,
    watch,
    control,
  } = useForm({
    defaultValues: invoiceDetails || {
      type: "PMS",
      paymentStatus: "Pending",
      month: "",
      paymentMode: "",
      paymentDate: "",
      paymentRefernce: "",
      remark: "",
      chequeBank: "",
      chequeDrawer: "",
      gstNo: "",
    },
  });

  let paymentSts = watch("paymentStatus");
  let paymentMode = watch("paymentMode");
  const submit = async (data) => {
    console.log(data);

    data.tax = false;
    if (bill) {
      if (data.type == "PMS Tax" && !bill?.gstNo && !data.gstNo) {
        toast.error("Please provide GST number");
        return;
      }
      data.billNo = bill?.number;
      data.bill = bill._id;
      data.tax = data.type == "PMS Tax" ? true : false;
    } else {
      toast.error("Bill is requried to generate invoice");
      return;
    }

    data.month = moment(data.month).format("MMM YY");

    try {
      let res;
      if (bill) {
        res = await generateInvoice({ id: bill._id, data }).unwrap();
        if (res.url) saveAs(res.url, `${res.name}.docx`);
      } else {
        console.log(data);
        res = await updateInvoice({ id: invoiceDetails.id, data }).unwrap();
      }

      reset();
      setOpen(false);
      dispatch(setInvoiceDetails(null));
      dispatch(setBillDetails(null));
      toast.success(res.msg);
    } catch (error) {
      console.log(error);
      toast.error(error?.data?.msg || error.error);
    }
  };

  const handleClose = () => {
    setOpen(false);
    dispatch(setInvoiceDetails(null));
    reset();
  };
  return (
    <div>
      {generateInvoiceLoading || updateInvoiceLoading ? (
        <Loading />
      ) : (
        <Modal open={open}>
          <div
            className={`h-[440px] ${
              paymentMode == "Cheque" ? "h-[500px]" : "h-full"
            } overflow-auto md:w-[320px]`}
          >
            <div className="flex justify-around mb-4">
              <h4 className="text-center text-xl font-semibold">
                Add Invoice Details
              </h4>
              <IoMdCloseCircleOutline
                className="w-6 h-6 text-red-500 mt-1 hover:cursor-pointer"
                type="button"
                onClick={handleClose}
              />
            </div>
            <form onSubmit={handleSubmit(submit)} className="relative my-2">
              <div className="grid gap-x-5 gap-y-2 ">
                <div className="col-span-6 md:col-span-4 lg:col-span-2">
                  <Controller
                    name="type"
                    control={control}
                    render={({ field: { onChange, value, ref } }) => (
                      <InputSelect
                        options={billingTypes.slice(1)}
                        onChange={onChange}
                        value={value}
                        label="Invoice Type"
                      />
                    )}
                  />
                </div>
                <div className="col-span-6 md:col-span-4 lg:col-span-2">
                  <Controller
                    name="paymentStatus"
                    control={control}
                    render={({ field: { onChange, value, ref } }) => (
                      <InputSelect
                        options={paymentStatus.slice(1)}
                        onChange={onChange}
                        value={value}
                        label="Payment Status"
                      />
                    )}
                  />
                </div>
                <div className="col-span-6 md:col-span-4 lg:col-span-2">
                  <InputRow
                    label="Billing Month"
                    id="month"
                    errors={errors}
                    register={register}
                    type="month"
                  />
                  <p className="text-xs text-red-500 -bottom-4 pl-1">
                    {errors.month && "Billing month is required"}
                  </p>
                </div>
                {paymentSts == "Received" && (
                  <>
                    <div className="col-span-8 md:col-span-4 lg:col-span-2">
                      <InputRow
                        label="Payment Date"
                        id="paymentDate"
                        errors={errors}
                        register={register}
                        type="date"
                        required={paymentSts == "Received"}
                      />
                      <p className="text-xs text-red-500 -bottom-4 pl-1">
                        {errors.paymentDate && "Payment date is required"}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <Controller
                        name="paymentMode"
                        control={control}
                        render={({ field: { onChange, value, ref } }) => (
                          <InputSelect
                            options={paymentModes.slice(1)}
                            onChange={onChange}
                            value={value}
                            label="Payment Mode"
                            required={paymentSts == "Received"}
                          />
                        )}
                      />
                    </div>
                    <div className="col-span-2">
                      <InputRow
                        label="Payemnt Refernce No"
                        placeholder="Cheque No/UPI Id"
                        id="paymentRefernce"
                        errors={errors}
                        register={register}
                        required={paymentMode == "Cheque"}
                      />
                      <p className="text-xs text-red-500 -bottom-4 pl-1">
                        {errors.paymentRefernce && "Cheque no is required"}
                      </p>
                    </div>
                    {paymentMode == "Cheque" && (
                      <>
                        <div className="col-span-2">
                          <InputRow
                            label="Cheque Bank"
                            placeholder=""
                            id="chequeBank"
                            errors={errors}
                            register={register}
                            required={paymentMode == "Cheque"}
                          />
                          <p className="text-xs text-red-500 -bottom-4 pl-1">
                            {errors.chequeBank && "Cheque bank is required"}
                          </p>
                        </div>
                        <div className="col-span-2">
                          <InputRow
                            label="Cheque Drawer"
                            placeholder=""
                            id="chequeDrawer"
                            errors={errors}
                            register={register}
                            required={paymentMode == "Cheque"}
                          />
                          <p className="text-xs text-red-500 -bottom-4 pl-1">
                            {errors.chequeDrawer && "Cheque drawer is required"}
                          </p>
                        </div>
                      </>
                    )}
                    <div className="col-span-2">
                      <InputRow
                        label="Remark"
                        placeholder=""
                        id="remark"
                        errors={errors}
                        register={register}
                        required={false}
                      />
                    </div>
                  </>
                )}
                {!bill?.gstNo && !invoiceDetails?.gstNo && (
                  <div className="col-span-2">
                    <InputRow
                      label="GST Number"
                      placeholder=""
                      id="gstNo"
                      errors={errors}
                      register={register}
                      required={false}
                    />
                  </div>
                )}
                <div className="col-span-2 flex justify-center mt-4">
                  <Button
                    color="bg-blue-700"
                    height="py-2"
                    disabled={generateInvoiceLoading || updateInvoiceLoading}
                    label={
                      invoiceDetails ? "Update Invoice" : "Generate Invoice"
                    }
                    width="w-40"
                    type="submit"
                  />
                </div>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </div>
  );
};
export default InvoiceFormModal;
