import { useDispatch } from "react-redux";
import { setScheduleDetails } from "../redux/allSlice";
import { dateFormat } from "../utils/functionHelper";

const ScheduleTable = ({ schedules, isLoading, setOpen }) => {
  const dispatch = useDispatch();

  const handleEditModal = (schedule) => {
    dispatch(setScheduleDetails(schedule));
    setOpen(true);
  };

  const progress = (status) => {
    let text = "text-blue-700 bg-blue-100";
    if (status === "done" || status === "confirmed")
      text = "text-green-700 bg-green-100";
    else if (status === "Open" || status === "regular")
      text = "text-gray-700 bg-gray-100";
    else if (
      status === "cancelled" ||
      status === "complaint" ||
      status === "byClient"
    )
      text = "text-red-700 bg-red-100";

    return (
      <p
        className={`inline-flex items-center rounded-md px-2 py-1 font-medium ${text} ring-1 ring-gray-300`}
      >
        {status === "byClient"
          ? "By Client"
          : status.charAt(0).toUpperCase() + status.slice(1)}
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
            <th className=" text-gray-600 w-40 font-normal text-left pr-4 text-sm tracking-normal">
              Client Name
            </th>
            <th className="text-gray-600 font-normal pr-4 text-left text-sm tracking-normal">
              Address
            </th>
            <th className="text-gray-600 w-28 font-normal pr-4 text-left text-sm tracking-normal">
              Complaint By
            </th>
            <th className="text-gray-600 w-[84px] font-normal pr-4 text-left text-sm tracking-normal">
              Phone No
            </th>
            <th className="text-gray-600 w-16 font-normal text-left text-sm tracking-normal">
              Date
            </th>
            <th className="text-gray-600 w-16 font-normal text-left text-sm tracking-normal">
              Time
            </th>
            <th className="text-gray-600 w-16 font-normal text-left text-sm tracking-normal">
              Duration
            </th>
            <th className="text-gray-600 w-40 font-normal text-left text-sm tracking-normal">
              Service
            </th>
            <th className="text-gray-600 w-28 font-normal text-left text-sm tracking-normal">
              Schedule Type
            </th>
            <th className="text-gray-600 w-24 font-normal text-left text-sm tracking-normal">
              Service Type
            </th>
            <th className="text-gray-600 font-normal pr-5  text-left text-sm tracking-normal">
              Status
            </th>
            <th className="text-gray-600 w-32 font-normal px-4 text-left text-sm tracking-normal">
              Technician
            </th>
          </tr>
        </thead>
        <tbody>
          {schedules?.map((schedule) => (
            <tr
              onClick={() => handleEditModal(schedule)}
              key={schedule._id}
              className="h-20 text-[12px] border-gray-300 border-t border-b hover:border-indigo-300 hover:shadow-md transition duration-150 ease-in-out hover:cursor-pointer"
            >
              <td className="text-center whitespace-no-wrap text-gray-800  tracking-normal">
                {schedule.contractNo}
              </td>
              <>
                <td className="p-2 text-left whitespace-no-wrap text-gray-800  tracking-normal">
                  {schedule.clientName}
                </td>
                <td className="pr-3 whitespace-no-wrap text-gray-800  tracking-normal">
                  {schedule.clientAddress}
                </td>
                <td className="pr-2 whitespace-no-wrap text-gray-800  tracking-normal">
                  {schedule.raiseBy}
                </td>
                <td className="pr-2 whitespace-no-wrap text-gray-800  tracking-normal">
                  {schedule.clientContact}
                </td>
                <td className="text-left whitespace-no-wrap text-gray-800  tracking-normal">
                  {dateFormat(schedule.date)}
                </td>
                <td className="px-1 whitespace-no-wrap text-gray-800  tracking-normal">
                  {schedule.time.label}
                </td>
                <td className="pr-2 whitespace-no-wrap text-gray-800  tracking-normal">
                  {schedule.jobDuration}
                </td>
                <td className="pr-2 whitespace-no-wrap text-gray-800  tracking-normal">
                  {schedule.serviceName.join(", ")}
                </td>
                <td>{progress(schedule.scheduleType)}</td>
                <td className="pr-1">{progress(schedule.serviceType)}</td>
                <td className="whitespace-no-wrap  text-gray-800  tracking-normal">
                  {progress(schedule.jobStatus)}
                </td>
                <td className="px-1 whitespace-no-wrap text-center text-gray-800  tracking-normal">
                  {schedule.assistantTechnician
                    ? schedule.technician?.name +
                      "/" +
                      schedule.assistantTechnician
                    : schedule.technician?.name}
                </td>
              </>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default ScheduleTable;
