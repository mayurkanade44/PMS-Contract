import { dateFormat } from "../utils/functionHelper";
import { FaEdit } from "react-icons/fa";

const ScheduleTable = ({ schedules, isLoading }) => {
const progress = (status) => {
  let text = "text-blue-700 bg-blue-100";
  if (status === "Completed") text = "text-green-700 bg-green-100";
  else if (status === "Partially Completed") text = "text-pink-700 bg-ping-100";
  else if (status === "Cancelled" || status === "Not Completed")
    text = "text-red-700 bg-red-100";

  return (
    <p
      className={`inline-flex items-center rounded-md px-2 py-1 font-medium ${text} ring-1 ring-gray-300`}
    >
      {status}
    </p>
  );
};



  return (
    <div className="w-full overflow-x-scroll xl:overflow-x-hidden">
      <table className="min-w-full bg-white rounded">
        <thead>
          <tr className="w-full h-12 border-gray-300 border-b py-10 bg-indigo-100">
            <th className=" text-gray-600 w-32  font-normal text-center text-sm tracking-normal">
              Contract No
            </th>
            <th className=" text-gray-600 w-44 font-normal text-left pr-4 text-sm tracking-normal">
              Client Name
            </th>
            <th className="text-gray-600 font-normal pr-6 text-left text-sm tracking-normal">
              Address
            </th>
            <th className="text-gray-600 w-28 font-normal pr-4 text-left text-sm tracking-normal">
              Phone No
            </th>
            <th className="text-gray-600 w-24 font-normal text-left text-sm tracking-normal">
              Date
            </th>
            <th className="text-gray-600 w-20 font-normal text-left text-sm tracking-normal">
              Time
            </th>
            <th className="text-gray-600 w-40 font-normal text-left text-sm tracking-normal">
              Service
            </th>
            <th className="text-gray-600 font-normal text-left text-sm tracking-normal">
              Service Type
            </th>
            <th className="text-gray-600 font-normal w-20 text-left text-sm tracking-normal">
              Status
            </th>
            <th className="text-gray-600 w-28 font-normal pr-6 text-left text-sm tracking-normal">
              Technician
            </th>
            <th className="text-gray-600 font-normal text-sm tracking-normal">
            </th>
          </tr>
        </thead>
        <tbody>
          {schedules?.map((schedule) => (
            <tr
              key={schedule._id}
              className="h-20 border-gray-300 border-t border-b hover:border-indigo-300 hover:shadow-md transition duration-150 ease-in-out"
            >
              <td className="text-sm text-center whitespace-no-wrap text-gray-800  tracking-normal">
                {schedule.contractNo}
              </td>
              <td className="text-sm w-44 p-2 text-left whitespace-no-wrap text-gray-800  tracking-normal">
                {schedule.clientName}
              </td>
              <td className="text-[12px] pr-4 whitespace-no-wrap text-gray-800  tracking-normal">
                {schedule.clientAddress}
              </td>
              <td className="text-sm pr-4 whitespace-no-wrap text-gray-800  tracking-normal">
                {schedule.clientContact}
              </td>
              <td className="text-left whitespace-no-wrap text-sm text-gray-800  tracking-normal">
                {dateFormat(schedule.date)}
              </td>
              <td className="text-sm pr-4 whitespace-no-wrap text-gray-800  tracking-normal">
                {schedule.time}
              </td>
              <td className="text-[12px] pr-4 whitespace-no-wrap text-gray-800  tracking-normal">
                {schedule.serviceName.join(", ")}
              </td>
              <td className="pr-6">
                <div className="w-full flex justify-start items-center h-full">
                  <div className="bg-indigo-200 text-indigo-700 rounded-full text-sm leading-3 py-2 px-5">
                    {schedule.serviceType}
                  </div>
                </div>
              </td>
              <td className="text-sm  whitespace-no-wrap text-gray-800  tracking-normal">
                {schedule.jobStatus === "open" ? (
                  <div className="w-full flex justify-start items-center h-full">
                    <div className="bg-red-300 text-indigo-700 rounded-full text-sm leading-3 py-2 px-3">
                      Open
                    </div>
                  </div>
                ) : (
                  "Closed"
                )}
              </td>
              <td className="text-sm pr-2 whitespace-no-wrap text-gray-800  tracking-normal">
                {schedule.user?.name}
              </td>
              <td className="p-3 text-right">
                <FaEdit/>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default ScheduleTable;
