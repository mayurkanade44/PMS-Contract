import { useParams } from "react-router-dom";
import { useGetSingleContractQuery } from "../redux/contractSlice";
import { ContactTable, Loading } from "../components";

const ContractDetails = () => {
  const { id } = useParams();

  const {
    data: contract,
    isLoading,
    refetch,
    error,
  } = useGetSingleContractQuery(id);

  return (
    <div>
      {isLoading ? (
        <Loading />
      ) : error ? (
        <h1>Some Error</h1>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          <div>
            <h1 className="text-3xl font-bold text-center">
              Contract Number: {contract.contractNo}
            </h1>
            <h2 className="text-2xl font-semibold text-center mt-5 mb-2">
              Bill To Details
            </h2>
            <h3 className="text-xl my-1">
              Name - {contract.billToAddress.name}
            </h3>
            <h3 className="text-xl my-1">
              Address - {contract.billToAddress.address},{" "}
              {contract.billToAddress.city}-{contract.billToAddress.pincode}
            </h3>
            <h3 className="text-xl my-1">
              Preferred - {contract.preferred.day} & {contract.preferred.time}
            </h3>
            <ContactTable contacts={contract.billToContact} />
          </div>
          <div>
            <div>
              <button
                type="button"
                className="px-2 py-[5px] w-32 mt-0.5 bg-blue-600 hover:bg-blue-500 text-white transition ease-in duration-200 text-center text-md font-semibold rounded-lg"
              >
                Add Cards
              </button>
            </div>
            <h2 className="text-2xl font-semibold text-center mt-5 mb-2">
              Ship To Details
            </h2>
            <h3 className="text-xl my-1">
              Name - {contract.shipToAddress.name}
            </h3>
            <h3 className="text-xl my-1">
              Address - {contract.shipToAddress.address},{" "}
              {contract.shipToAddress.city}-{contract.shipToAddress.pincode}
            </h3>
            <h3 className="text-xl my-1">
              Preferred - {contract.preferred.day} & {contract.preferred.time}
            </h3>
            <ContactTable contacts={contract.shipToContact} />
          </div>
        </div>
      )}
    </div>
  );
};
export default ContractDetails;
