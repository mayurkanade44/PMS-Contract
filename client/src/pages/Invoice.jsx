import { useEffect, useMemo, useState } from "react";
import { AiOutlineSearch } from "react-icons/ai";
import Select from "react-select";
import {
  AlertMessage,
  Button,
  InvoiceStatsCard,
  InvoiceTable,
  Loading,
  SearchBillModal,
} from "../components";
import InvoiceFormModal from "../components/Modals/InvoiceFormModal";
import { useGetAllInvoicesQuery } from "../redux/billingSlice";
import { useGetAllValuesQuery } from "../redux/contractSlice";
import {
  billingTypes,
  cancelStatus,
  paymentModes,
  paymentStatus,
} from "../utils/dataHelper";

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
  const [sales, setSales] = useState({
    value: "all",
    label: "All",
  });

  const { data: admin, isLoading } = useGetAllValuesQuery();

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
    sales: sales.value,
  });



  useEffect(() => {
    setPage(1);
  }, [payment, billType, paymentMode, month, sales, isCancelled]);

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
        <InvoiceStatsCard />
        <div className="flex justify-between items-center my-5">
          <div className="w-80 relative mb-2">
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
          <div className="">
            <Button
              label="Add Invoice"
              height="h-8 md:h-10"
              width="w-32 md:w-40"
              color="bg-indigo-700"
              handleClick={() => setOpenSearch(true)}
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-6 gap-3 mb-5">
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
              Invoice Type
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
            <label className="text-sm font-medium text-gray-900 pb-1 pl-1">
              Sales Person
            </label>
            <Select
              defaultValue={sales}
              onChange={setSales}
              options={
                admin?.sales && [
                  { value: "all", label: "All" },
                  ...admin?.sales,
                ]
              }
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
        </div>
        <InvoiceTable
          invoices={data?.invoices}
          isLoading={invoicesLoading}
          setOpen={setOpen}
        />
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
