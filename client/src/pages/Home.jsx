import { AlertMessage, Button, Loading } from "../components";
import { AiOutlineSearch, AiOutlineClose } from "react-icons/ai";
import { Link, useNavigate } from "react-router-dom";
import { useGetAllContractsQuery } from "../redux/contractSlice";
import { useState } from "react";
import { dateFormat } from "../utils/functionHelper";
import { useDispatch, useSelector } from "react-redux";
import { removeContractDetails } from "../redux/allSlice";

const Home = () => {
  const [search, setSearch] = useState("");
  const [tempSearch, setTempSearch] = useState("");
  const [page, setPage] = useState(1);
  const { user } = useSelector((store) => store.all);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    data,
    isLoading: contractsLoading,
    isFetching,
    error,
  } = useGetAllContractsQuery({ search, page });

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(tempSearch);
  };

  const clearSearch = () => {
    setTempSearch("");
    setSearch("");
  };

  const redirectNewContract = () => {
    dispatch(removeContractDetails());
    navigate("/contract/new");
  };

  const pages = Array.from({ length: data?.pages }, (_, index) => index + 1);

  return (
    <>
      {contractsLoading || isFetching ? (
        <Loading />
      ) : (
        error && <AlertMessage>{error?.data?.msg || error.error}</AlertMessage>
      )}
      {data && (
        <>
          <div className="px-2 my-16 lg:my-5">
            <div className="md:flex items-center justify-between">
              <p className=" text-center  lg:text-2xl font-bold leading-normal text-gray-800">
                All Contracts
              </p>
              <form onSubmit={handleSearch} className="flex items-center">
                <div className="flex items-center px-1 bg-white border md:w-52 lg:w-80 rounded border-gray-200 mr-3">
                  <AiOutlineSearch />
                  <input
                    type="text"
                    className="py-1 md:py-1.5 pl-1 w-full focus:outline-none text-sm rounded text-gray-600 placeholder-gray-500"
                    placeholder="Search..."
                    value={tempSearch}
                    onChange={(e) => setTempSearch(e.target.value)}
                  />
                  {tempSearch && (
                    <button type="button" onClick={clearSearch}>
                      <AiOutlineClose color="red" />
                    </button>
                  )}
                </div>
                <Button
                  type="submit"
                  label="Search"
                  color="bg-black"
                  height="h-8"
                />
              </form>
              <div className="flex items-end justify-around mt-4 md:mt-0 md:ml-3 lg:ml-0">
                {user.role !== "Technician" && (
                  <button
                    onClick={redirectNewContract}
                    className="inline-flex mx-1.5 items-start justify-start px-4 py-3 bg-cyan-500 hover:bg-cyan-600 rounded"
                  >
                    <p className="text-sm font-medium leading-none text-white">
                      Add New Contract
                    </p>
                  </button>
                )}
              </div>
            </div>
          </div>
          {data.contracts.length === 0 && (
            <h6 className="text-red-500 text-xl font-semibold text-center mb-2">
              No Contract Found
            </h6>
          )}
          <div className="overflow-y-auto my-4">
            <table className="w-full border whitespace-nowrap  dark:border-neutral-500">
              <thead>
                <tr className="h-12 w-full text-md leading-none text-gray-600">
                  <th className="font-bold text-left  dark:border-neutral-800 border-2 w-20 px-3">
                    Contract No
                  </th>
                  <th className="font-bold text-center  dark:border-neutral-800 border-2 w-28 px-3">
                    Created At
                  </th>
                  <th className="font-bold text-left  dark:border-neutral-800 border-2 px-3">
                    Bill To Name
                  </th>
                  <th className="font-bold text-left  dark:border-neutral-800 border-2 px-3">
                    Ship To Name
                  </th>
                  <th className="font-bold text-center  dark:border-neutral-800 border-2 w-28 px-3">
                    Start Date
                  </th>
                  <th className="font-bold text-center  dark:border-neutral-800 border-2 w-28 px-3">
                    End Date
                  </th>
                  {user.role !== "Technician" && (
                    <th className="font-bold text-center  dark:border-neutral-800 border-2 w-40 px-3">
                      Action
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="w-full">
                {data.contracts.map((contract) => (
                  <tr
                    key={contract._id}
                    className="h-12 text-sm leading-none text-gray-700 border-b dark:border-neutral-500 bg-white hover:bg-gray-100"
                  >
                    <td className="px-3 border-r font-normal dark:border-neutral-500">
                      {contract.contractNo} - {contract.type}
                    </td>
                    <td className="px-3 border-r font-normal text-center dark:border-neutral-500">
                      {dateFormat(contract.createdAt)}
                    </td>
                    <td className="px-3 border-r font-normal dark:border-neutral-500">
                      {contract.billToAddress.name}
                    </td>
                    <td className="px-3 border-r font-normal dark:border-neutral-500">
                      {contract.shipToAddress.name}
                    </td>
                    <td className="px-3 border-r font-normal text-center dark:border-neutral-500">
                      {dateFormat(contract.tenure.startDate)}
                    </td>
                    <td className="px-3 border-r font-normal text-center dark:border-neutral-500">
                      {dateFormat(contract.tenure.endDate)}
                    </td>
                    {user.role !== "Technician" && (
                      <td className="px-3 border-r font-normal text-center dark:border-neutral-500">
                        <Link to={`/contract-details/${contract._id}`}>
                          <Button label="Details" height="py-2" width="w-20" />
                        </Link>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pages.length > 1 && (
            <nav>
              <ul className="list-style-none flex justify-center mt-2">
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
        </>
      )}
    </>
  );
};
export default Home;
