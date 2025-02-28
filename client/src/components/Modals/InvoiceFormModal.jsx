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

const InvoiceFormModal = ({ open, setOpen, bill, invoice }) => {
  const [tax, setTax] = useState(false);

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
    defaultValues: invoice || {
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
    if (bill) {
      if (tax && !bill?.gstNo && !data.gstNo) {
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
        res = await updateInvoice({ id: invoice.id, data }).unwrap();
      }

      reset();
      setOpen(false);
      toast.success(res.msg);
    } catch (error) {
      console.log(error);
      toast.error(error?.data?.msg || error.error);
    }
  };
  return (
    <div>
      {generateInvoiceLoading ? (
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
                onClick={() => setOpen(false)}
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
                {!bill?.gstNo && !invoice?.gstNo && (
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
                    label={bill ? "Generate Invoice" : "Update Invoice"}
                    width="w-40"
                    type="submit"
                    handleClick={() => setTax(false)}
                  />
                  {bill && (
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
