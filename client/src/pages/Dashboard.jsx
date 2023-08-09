import { Button, Loading } from "../components";
import { AiOutlineSearch } from "react-icons/ai";
import { Link } from "react-router-dom";
import { useGetAllContractsQuery } from "../redux/contractSlice";

const Dashboard = () => {
  const {
    data: contracts,
    isLoading: contractsLoading,
    error,
  } = useGetAllContractsQuery();

  return (
    <>
      {contractsLoading ? (
        <Loading />
      ) : error ? (
        <h1>Some Error</h1>
      ) : (
        <>
          <div className="px-2 py-5">
            <div className="md:flex items-center justify-between">
              <p className=" text-center  lg:text-2xl font-bold leading-normal text-gray-800">
                All Contracts
              </p>
              <div className="flex items-center">
                <div className="flex items-center pl-1 bg-white border md:w-52 lg:w-80 rounded border-gray-200 mr-3">
                  <AiOutlineSearch />
                  <input
                    type="text"
                    className="py-1 md:py-1.5 pl-1 w-full focus:outline-none text-sm rounded text-gray-600 placeholder-gray-500"
                    placeholder="Search"
                    // value={tempSearch}
                    // onChange={optimizedDebounce}
                  />
                </div>
                <Button label="Search" color="bg-black" height='h-8' />
              </div>
              <div className="flex items-end justify-around mt-4 md:mt-0 md:ml-3 lg:ml-0">
                <Link to="/contract/new">
                  <button className="inline-flex mx-1.5 items-start justify-start px-4 py-3 bg-cyan-500 hover:bg-cyan-600 rounded">
                    <p className="text-sm font-medium leading-none text-white">
                      Add New Contract
                    </p>
                  </button>
                </Link>
              </div>
            </div>
          </div>
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
                <th className="font-bold text-center  dark:border-neutral-800 border-2 w-40 px-3">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="w-full">
              {contracts.map((contract) => (
                <tr
                  key={contract._id}
                  className="h-12 text-sm leading-none text-gray-700 border-b dark:border-neutral-500 bg-white hover:bg-gray-100"
                >
                  <td className="px-3 border-r font-normal dark:border-neutral-500">
                    {contract.contractNo} - {contract.type}
                  </td>
                  <td className="px-3 border-r font-normal text-center dark:border-neutral-500">
                    {new Date(contract.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-3 border-r font-normal dark:border-neutral-500">
                    {contract.billToAddress.name}
                  </td>
                  <td className="px-3 border-r font-normal dark:border-neutral-500">
                    {contract.shipToAddress.name}
                  </td>
                  <td className="px-3 border-r font-normal text-center dark:border-neutral-500">
                    {new Date(contract.tenure.startDate).toLocaleDateString(
                      "en-IN",
                      {
                        day: "numeric",
                        month: "numeric",
                        year: "numeric",
                      }
                    )}
                  </td>
                  <td className="px-3 border-r font-normal text-center dark:border-neutral-500">
                    {new Date(contract.tenure.endDate).toLocaleDateString(
                      "en-IN",
                      {
                        day: "numeric",
                        month: "numeric",
                        year: "numeric",
                      }
                    )}
                  </td>
                  <td className="px-3 border-r font-normal text-center dark:border-neutral-500">
                    <Link to={`/contract-details/${contract._id}`}>
                      <Button label="Details" height="py-2" width="w-20" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </>
  );
};
export default Dashboard;
