import { useDispatch } from "react-redux";
import { setScheduleDetails } from "../redux/allSlice";
import { dateFormat } from "../utils/functionHelper";

const ScheduleTable = ({ schedules, setOpen }) => {
  const dispatch = useDispatch();

  const handleEditModal = (schedule) => {
    dispatch(setScheduleDetails(schedule));
    setOpen(true);
  };

  const downloadImages = (contractNo, images) => {
    if (images.length > 0) {
      images.forEach((image, index) => {
        const extension = image.split(".").pop();
        saveAs(image, `${contractNo} Image-${index + 1}.${extension}`);
      });
    }
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
          <tr className="w-full h-12 border-gray-300 border-b py-10 bg-indigo-100 ">
            <th className="font-semibold w-24 whitespace-nowrap px-2 text-center text-sm">
              Contract No
            </th>
            <th className="font-semibold w-32 whitespace-nowrap px-2 text-center text-sm">
              Client Name
            </th>
            <th className="font-semibold w-52 whitespace-nowrap px-16 lg:px-2 text-center text-sm">
              Address
            </th>
            <th className="font-semibold w-28 whitespace-nowrap px-2 text-center text-sm">
              Complaint By
            </th>
            <th className="font-semibold w-[90px] whitespace-nowrap px-4 lg:px-2 text-center text-sm">
              Phone No
            </th>
            <th className="font-semibold w-16 whitespace-nowrap px-2 text-center text-sm">
              Date
            </th>
            <th className="font-semibold w-24 whitespace-nowrap px-1 text-center text-sm">
              Time & Duration
            </th>
            <th className="font-semibold w-44 whitespace-nowrap px-12 lg:px-1 text-center text-sm">
              Service
            </th>
            <th className="font-semibold w-32 whitespace-nowrap px-6 lg:px-1 text-center text-sm">
              Instructions
            </th>
            <th className="font-semibold w-24 whitespace-nowrap px-1 text-center text-sm">
              Schedule Type
            </th>
            <th className="font-semibold w-24 whitespace-nowrap px-1 text-center text-sm">
              Service Type
            </th>
            <th className="font-semibold px-1 text-center text-sm">Status</th>
            <th className="w-32 px-4 text-left text-sm font-semibold">
              Technicians
            </th>
          </tr>
        </thead>
        <tbody>
          {schedules?.map((schedule) => (
            <tr
              key={schedule._id}
              className="h-20 text-[12px] border-gray-300 border-t border-b hover:border-indigo-300 hover:shadow-md transition duration-150 ease-in-out hover:cursor-default"
            >
              <td
                onClick={() => handleEditModal(schedule)}
                className="text-center whitespace-no-wrap text-gray-800 px-2 border-r hover:cursor-pointer hover:text-blue-600 hover:font-semibold hover:bg-orange-100"
              >
                {schedule.contractNo}
              </td>
              <td className="text-center whitespace-no-wrap text-gray-800 px-2 border-r">
                {schedule.clientName}
              </td>
              <td className="text-gray-800 px-2 border-r">
                {schedule.clientAddress}
              </td>
              <td className="text-gray-800 px-1 border-r">
                {schedule.raiseBy}
              </td>
              <td className="text-gray-800 px-2 border-r">
                {schedule.clientContact}
              </td>
              <td className="text-center text-gray-800 px-1 border-r">
                {dateFormat(schedule.date)}
              </td>
              <td className="text-center text-gray-800 px-1 border-r">
                {schedule.jobDuration
                  ? schedule.time.label + " / " + schedule.jobDuration
                  : schedule.time.label}
              </td>
              <td className=" text-gray-800 px-1 border-r">
                {schedule.serviceName.join(", ")}
              </td>
              <td className="text-gray-800 px-1 border-r">
                {schedule.instruction}
              </td>
              <td className="text-gray-800 text-center border-r">
                {progress(schedule.scheduleType)}
              </td>
              <td className="text-gray-800 text-center border-r">
                {progress(schedule.serviceType)}
              </td>
              <td
                onClick={() =>
                  downloadImages(schedule.contractNo, schedule.image)
                }
                className={`px-2 border-r ${
                  schedule.jobStatus == "done" &&
                  "hover:bg-green-400 hover:cursor-pointer"
                }`}
              >
                {progress(schedule.jobStatus)}
              </td>
              <td className="px-1 whitespace-no-wrap text-center text-gray-800">
                {schedule.assistantTechnician
                  ? schedule.technician?.name +
                    "/ " +
                    schedule.assistantTechnician
                  : schedule.technician?.name}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default ScheduleTable;
