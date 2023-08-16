import { AiOutlineWarning } from "react-icons/ai";
import { Link } from "react-router-dom";

const AlertMessage = ({ children }) => {
  return (
    <div className="rounded-md bg-red-100 p-4">
      <div className="flex justify-center">
        <div className="flex-shrink-0">
          <AiOutlineWarning
            className="h-5 w-5 mt-0.5 text-red-600"
            aria-hidden="true"
          />
        </div>
        <div className="ml-2">
          <p className="text-md font-normal text-red-700">
            {children || "Server Error, Try Again Later"}
          </p>
          <div className="mt-2">
            <Link
              to="/home"
              className="rounded-md bg-green-50 px-2 py-1.5 text-sm font-medium text-green-800 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 focus:ring-offset-green-50"
            >
              Back To Home Page
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AlertMessage;
