import { Link, useNavigate, useParams } from "react-router-dom";
import {
  useDeactiveContractMutation,
  useDeleteContractMutation,
  useGetSingleContractQuery,
} from "../redux/contractSlice";
import {
  AlertMessage,
  Button,
  ContactTable,
  Loading,
  ServiceTable,
} from "../components";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { setContractDetails } from "../redux/allSlice";
import { toast } from "react-toastify";
import DeleteModal from "../components/Modals/DeleteModal";
import DeactiveModal from "../components/Modals/DeleteModal";
import { saveAs } from "file-saver";

import { useGenerateReportMutation } from "../redux/reportSlice";

const ContractDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [openDelete, setOpenDelete] = useState(false);
  const [openDeactive, setOpenDeactive] = useState(false);
  const { user } = useSelector((store) => store.all);

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

  const [generateReport, { isLoading: reportLoading }] =
    useGenerateReportMutation();

  useEffect(() => {
    if (contract) {
      dispatch(setContractDetails(contract));
    }
  }, [contract]);

  const handleDelete = async (id) => {
    try {
      const res = await deleteContract(id).unwrap();
      toast.success(res.msg);
      setOpenDelete(false);
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
      setOpenDeactive(false);
    } catch (error) {
      console.log(error);
      toast.error(error?.data?.msg || error.error);
    }
  };

  const handleReport = async (id) => {
    const data = { id: id };
    try {
      const res = await generateReport(data).unwrap();
      toast.success(res.msg);
      if (res.link) saveAs(res.link, `${contract.contractNo}_Report`);
    } catch (error) {
      console.log(error);
      toast.error(error?.data?.msg || error.error);
    }
  };

  return (
    <div>
      {contractLoading || deleteLoading || deactiveLoading || reportLoading ? (
        <Loading />
      ) : error ? (
        <AlertMessage>{error?.data?.msg || error.error}</AlertMessage>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
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
                {contract.billToAddress.city} - {contract.billToAddress.pincode}
              </h3>
              <h3 className="text-xl my-1">
                Preferred - {contract.preferred.day} & {contract.preferred.time}
              </h3>
              <ContactTable contacts={contract.billToContact} />
            </div>
            <div>
              <div className="hidden md:flex justify-around">
                <Link to={`/contract/${contract._id}/service-cards`}>
                  <Button label="Add Cards" width="w-28" />
                </Link>
                <Link to={`/contract/${contract._id}`}>
                  <Button label="Edit" color="bg-gray-600" />
                </Link>
                <Button
                  color="bg-pink-600"
                  handleClick={() => setOpenDeactive(true)}
                  label={contract.active ? "Deactive" : "Active"}
                />
                {user.role === "Admin" && (
                  <Button
                    color="bg-red-600"
                    label="Delete"
                    handleClick={() => setOpenDelete(true)}
                  />
                )}

                <DeactiveModal
                  open={openDeactive}
                  close={() => setOpenDeactive(false)}
                  title={contract.active ? "Confirm Dective" : "Confirm Active"}
                  description={
                    contract.active
                      ? "Are you sure, you want deactive this contract? It will disabled all the upcoming service notifications."
                      : "Are you sure, you want active this contract?"
                  }
                  handleClick={() => handleDeactive(contract._id)}
                  label={contract.active ? "Deactive" : "Active"}
                />
                <DeleteModal
                  open={openDelete}
                  close={() => setOpenDelete(false)}
                  title="Confirm Delete"
                  description="Are you sure you want delete this contract?"
                  handleClick={() => handleDelete(contract._id)}
                />
              </div>
              <h2 className="text-2xl font-semibold text-center mt-5 mb-2">
                Ship To Details
              </h2>
              <h3 className="text-xl my-1">
                Name - {contract.shipToAddress.name}
              </h3>
              <h3 className="text-xl my-1">
                Address - {contract.shipToAddress.address},{" "}
                {contract.shipToAddress.city} - {contract.shipToAddress.pincode}
              </h3>
              <h3 className="text-xl my-1">
                Preferred - {contract.preferred.day} & {contract.preferred.time}
              </h3>
              <ContactTable contacts={contract.shipToContact} />
            </div>
          </div>
          <hr className="h-px mt-4 border-0 dark:bg-gray-800" />
          <h2 className="text-3xl font-semibold text-center mt-1 mb-2">
            Service Cards
          </h2>
          <ServiceTable
            th={[
              "Service",
              "Area",
              "Frequency",
              "Service Due Months",
              "Download",
              "Update",
            ]}
            handleButton3={handleReport}
            data={contract}
            contractDetails={true}
          />
        </>
      )}
    </div>
  );
};
export default ContractDetails;
