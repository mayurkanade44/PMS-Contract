import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

const AllServiceCards = () => {
  const { contractDetails } = useSelector((store) => store.all);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!contractDetails) navigate(`/contract-details/${id}`);
  }, []);

  return (
    <div>
      <div className="flex justify-between">
        <h2 className="text-2xl font-semibold">
          Contract Number - {contractDetails.contractNo}
        </h2>
        <h2 className="text-2xl font-semibold">
          Start Date -{" "}
          {new Date(contractDetails.tenure.startDate).toLocaleDateString(
            "en-IN",
            {
              day: "numeric",
              month: "numeric",
              year: "numeric",
            }
          )}
        </h2>
        <h2 className="text-2xl font-semibold">
          End Date -{" "}
          {new Date(contractDetails.tenure.endDate).toLocaleDateString(
            "en-IN",
            {
              day: "numeric",
              month: "numeric",
              year: "numeric",
            }
          )}
        </h2>
      </div>
    </div>
  );
};
export default AllServiceCards;
