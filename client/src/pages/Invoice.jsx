import { useState, useEffect, useMemo } from "react";
import { useGetAllInvoicesQuery } from "../redux/billingSlice";
import {
  AlertMessage,
  Button,
  Loading,
  InvoiceTable,
  SearchBillModal,
} from "../components";
import { AiOutlineSearch } from "react-icons/ai";
import Select from "react-select";
import {
  billingTypes,
  paymentTerms,
  paymentStatus,
  paymentModes,
  cancelStatus,
} from "../utils/dataHelper";
import InvoiceFormModal from "../components/Modals/InvoiceFormModal";

const Invoice = () => {
  const [tempSearch, setTempSearch] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [openSearch, setOpenSearch] = useState(false);
  const [payment, setPayment] = useState({
    value: "all",
    label: "All",
  });
  const [billType, setBillType] = useState({
    value: "all",
    label: "All",
  });
  const [paymentMode, setPaymentMode] = useState({
    value: "all",
    label: "All",
  });
  const [month, setMonth] = useState("");
  const [isCancelled, setIsCancelled] = useState({
    value: "all",
    label: "All",
  });

  const {
    data,
    isLoading: invoicesLoading,
    isFetching,
    error,
  } = useGetAllInvoicesQuery({
    paymentStatus: payment.value,
    billType: billType.value,
    search: search,
    paymentMode: paymentMode.value,
    month: month,
    isCancelled: isCancelled.value,
    page: page,
  });

  useEffect(() => {
    setPage(1);
  }, [payment, billType, paymentMode, month]);

  const pages = Array.from({ length: data?.pages }, (_, index) => index + 1);

  const debounce = () => {
    let timeoutId;
    return (e) => {
      setTempSearch(e.target.value);
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setSearch(e.target.value);
      }, 1000);
    };
  };

  const handleSearch = useMemo(() => debounce(), []);

  const closeSearchModal = () => {
    setOpenSearch(false);
  };

  return (
    <>
      {invoicesLoading || isFetching ? (
        <Loading />
      ) : (
        error && <AlertMessage>{error?.data?.msg || error.error}</AlertMessage>
      )}
      {openSearch && (
        <SearchBillModal
          open={openSearch}
          close={closeSearchModal}
          setOpen={setOpen}
        />
      )}
      {open && <InvoiceFormModal open={open} setOpen={setOpen} />}
      <div className="pt-1 pb-5">
        <div className="grid lg:grid-cols-7 gap-3 mb-5">
          <div className="col-span-1">
            <div className="w-full relative mb-2 lg:mb-0 lg:mt-6">
              <div className="absolute text-gray-600 dark:text-gray-400 flex items-center pl-2 h-full">
                <AiOutlineSearch />
              </div>
              <input
                id="search"
                className=" text-gray-600 focus:outline-none focus:border focus:border-indigo-700 font-normal w-full h-10 flex items-center pl-7 text-sm border-gray-300 rounded border"
                placeholder="Refernce / Invoice Number or Clinet Name"
                value={tempSearch}
                onChange={handleSearch}
              />
            </div>
          </div>
          <div className="">
            <label className="text-sm font-medium text-gray-900 pl-1">
              Payment Type
            </label>
            <Select
              defaultValue={payment}
              onChange={setPayment}
              options={paymentStatus}
            />
          </div>
          <div className="">
            <label className="text-sm font-medium text-gray-900 pl-1">
              Bill Type
            </label>
            <Select
              defaultValue={billType}
              onChange={setBillType}
              options={billingTypes}
            />
          </div>
          <div className="">
            <label className="text-sm font-medium text-gray-900 pl-1">
              Payment Mode
            </label>
            <Select
              defaultValue={paymentMode}
              onChange={setPaymentMode}
              options={paymentModes}
            />
          </div>
          <div className="">
            <label className="text-sm font-medium text-gray-900 pl-1">
              Active / Cancelled
            </label>
            <Select
              defaultValue={isCancelled}
              onChange={setIsCancelled}
              options={cancelStatus}
            />
          </div>
          <div className="">
            <label className="text-sm font-medium text-gray-900 pl-1">
              Month
            </label>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full h-10 rounded-md border-gray-300 border px-2"
            />
          </div>
          <div className="flex flex-col lg:flex-row px-8 pt-4 justify-center items-start lg:items-stretch w-full">
            <Button
              label="Add Invoice"
              height="h-8 md:h-10"
              width="w-32 md:w-40"
              color="bg-indigo-700"
              handleClick={() => setOpenSearch(true)}
            />
          </div>
        </div>
        <div className="mx-auto container bg-white shadow rounded ">
          <div className="flex flex-col lg:flex-row px-8 pt-4 justify-between items-start lg:items-stretch w-full"></div>
          <div className="grid grid-cols-4 gap-4 mb-5"></div>
          <InvoiceTable
            invoices={data?.invoices}
            isLoading={invoicesLoading}
            setOpen={setOpen}
          />
        </div>
        <div className="mx-auto container pt-6 flex justify-center items-center">
          {pages.length > 1 && (
            <nav className="">
              <ul className="list-style-none flex justify-center">
                {pages.map((item) => (
                  <li className="pr-1" key={item}>
                    <button
                      className={`relative block rounded px-3 py-1.5 text-sm transition-all duration-30  ${
                        page === item ? "bg-blue-400" : "bg-neutral-700"
                      } text-white hover:bg-blue-400`}
                      onClick={() => setPage(item)}
                    >
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>
      </div>
    </>
  );
};
export default Invoice;
