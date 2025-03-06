import Modal from "./Modal";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button, InputRow, InputSelect, Loading } from "..";
import { paymentMode, paymentStatus } from "../../utils/dataHelper";
import { IoMdCloseCircleOutline } from "react-icons/io";
import {
  useGenerateInvoiceMutation,
  useUpdateInvoiceMutation,
} from "../../redux/billingSlice";
import { toast } from "react-toastify";
import { saveAs } from "file-saver";
import { useDispatch, useSelector } from "react-redux";
import { setInvoiceDetails, setBillDetails } from "../../redux/allSlice";

const InvoiceFormModal = ({ open, setOpen }) => {
  const [tax, setTax] = useState(false);

  const dispatch = useDispatch();
  const { invoiceDetails, billDetails: bill } = useSelector(
    (store) => store.all
  );
  console.log(bill);

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
      paymentStatus: "",
      paymentMode: "",
      paymentDate: "",
      paymentRefernce: "",
      remark: "",
      gstNo: "",
    },
  });

  let paymentSts = watch("paymentStatus");
  const submit = async (data) => {
    console.log(bill);

    if (bill) {
      if (tax && (!bill?.gstNo) && !data.gstNo) {
        toast.error("Please provide GST number");
        return;
      }
      data.billNo = bill?.number;
      data.bill = bill._id;
      data.tax = tax;
    }

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
          <div className="h-[440px] md:h-full overflow-x-scroll md:overflow-visible md:w-[300px]">
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
                            options={paymentMode}
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
                        required={false}
                      />
                    </div>
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
                <div className="col-span-2 flex justify-between mt-4">
                  <Button
                    color="bg-blue-700"
                    height="py-2"
                    //   disabled={contractLoading || updateContractLoading}
                    label={
                      invoiceDetails ? "Update Invoice" : "Generate Proforma"
                    }
                    width="w-40"
                    type="submit"
                    handleClick={() => setTax(false)}
                  />
                  {!invoiceDetails && (
                    <Button
                      color="bg-green-700"
                      height="py-2"
                      //   disabled={contractLoading || updateContractLoading}
                      label="Generate Tax"
                      width="w-32"
                      type="submit"
                      handleClick={() => setTax(true)}
                    />
                  )}
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
