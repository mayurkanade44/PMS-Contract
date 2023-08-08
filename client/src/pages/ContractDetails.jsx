import { Link, useNavigate, useParams } from "react-router-dom";
import {
  useDeactiveContractMutation,
  useDeleteContractMutation,
  useGetSingleContractQuery,
} from "../redux/contractSlice";
import { ContactTable, DeleteModal, Loading } from "../components";
import { useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { setContractDetails } from "../redux/allSlice";
import { toast } from "react-toastify";
import Modal from "../components/Modals/Modal";
import { AiOutlineDelete } from "react-icons/ai";

const ContractDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [openDelete, setOpenDelete] = useState(false);
  const [openDeactive, setOpenDeactive] = useState(false);
  const [deleteContract, { isLoading: deleteLoading }] =
    useDeleteContractMutation();
  const [deactiveContract, { isLoading: deactiveLoading }] =
    useDeactiveContractMutation();

  const {
    data: contract,
    isLoading: contractLoading,
    refetch,
    error,
  } = useGetSingleContractQuery(id);

  useEffect(() => {
    if (contract) {
      dispatch(setContractDetails(contract));
    }
  }, [contract]);

  const handleDelete = async (id) => {
    try {
      const res = await deleteContract(id).unwrap();
      toast.success(res.msg);
      navigate("/dashboard");
    } catch (error) {
      console.log(error);
      toast.error(error?.data?.msg || error.error);
    }
  };

  const handleDeactive = async (id) => {
    try {
      const res = await deactiveContract(id).unwrap();
      toast.success(res.msg);
      refetch();
    } catch (error) {
      console.log(error);
      toast.error(error?.data?.msg || error.error);
    }
  };

  return (
    <div>
      {contractLoading || deleteLoading || deactiveLoading ? (
        <Loading />
      ) : error ? (
        <h1>Some Error</h1>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
          <div>
            <Modal />
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
            <div className="hidden md:flex justify-around">
              <button
                type="button"
                className="px-1 py-[4px] w-28 mt-0.5 bg-blue-600 hover:bg-blue-500 text-white transition ease-in duration-200 text-center text-md font-semibold rounded-lg"
              >
                Add Cards
              </button>
              <Link
                to={`/contract/${contract._id}`}
                className="px-1 py-[4px] w-20 mt-0.5 bg-gray-600 hover:bg-gray-500 text-white transition ease-in duration-200 text-center text-md font-semibold rounded-lg"
              >
                Edit
              </Link>
              <button
                type="button"
                onClick={() => setOpenDeactive(true)}
                className="px-1 py-[4px] w-24 mt-0.5 bg-pink-600 hover:bg-pink-500 text-white transition ease-in duration-200 text-center text-md font-semibold rounded-lg"
              >
                {contract.active ? "Deactive" : "Active"}
              </button>
              <DeleteModal
                open={openDeactive}
                close={() => setOpenDeactive(false)}
                title="Confirm Deactive"
                description="Are you sure you want deactive this contract? It will disabled all the upcoming service notifications."
                handleClick={() => handleDeactive(contract._id)}
                label='Deactive'
              />
              <button
                type="button"
                onClick={() => setOpenDelete(true)}
                className="px-1 py-[4px] w-24 mt-0.5 bg-red-600 hover:bg-red-500 text-white transition ease-in duration-200 text-center text-md font-semibold rounded-lg"
              >
                Delete
              </button>
            </div>
            <DeleteModal
              open={openDelete}
              close={() => setOpenDelete(false)}
              title="Confirm Delete"
              description="Are you sure you want delete this contract?"
              handleClick={() => handleDelete(contract._id)}
            />
            {/* <Modal open={open}>
              <div className="text-center w-60">
                <AiOutlineDelete className="text-red-500 mx-auto w-10 h-10" />
                <div className="mx-auto my-4 w-48">
                  <h3 className="text-lg font-black text-gray-800">
                    Confirm Delete
                  </h3>
                  <p className="text-sm text-gray-500">
                    Are you sure you want delete this contract?
                  </p>
                </div>
                <div className="flex gap-4">
                  <div
                    onClick={() => handleDelete(blog._id)}
                    className="btn bg-red-700 w-full rounded-md text-white py-1 cursor-pointer"
                  >
                    Delete
                  </div>
                  <div
                    onClick={() => setOpen(false)}
                    className="btn  bg-gray-200 w-full rounded-md text-dark py-1 font-semibold cursor-pointer"
                  >
                    Cancel
                  </div>
                </div>
              </div>
            </Modal> */}
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
