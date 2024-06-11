import { useParams } from "react-router-dom";

const ServiceCardMessage = () => {
  const { status } = useParams();

  return (
    <div className="mx-5 flex h-[80vh] justify-center items-center">
      {status == "true" ? (
        <h1 className="text-4xl font-semibold text-green-600">
          Report Successfully Submitted!!
        </h1>
      ) : (
        <h1 className="text-4xl font-semibold text-red-600">
          Report Failed. Contact Back Office Team!!
        </h1>
      )}
    </div>
  );
};
export default ServiceCardMessage;
