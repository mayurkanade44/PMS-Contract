import { useEffect, useState } from "react";
import { useGetTechnicianSchedulesQuery } from "../redux/scheduleSlice";
import AlertMessage from "./AlertMessage";
import Loading from "./Loading";
import Button from "./Button";
import { Link } from "react-router-dom";
import { dateFormat, formatDate, todaysDate } from "../utils/functionHelper";

const TechnicianScheduleTable = () => {
  const [date, setDate] = useState(todaysDate());
  const { data, isLoading, isFetching, error } = useGetTechnicianSchedulesQuery(
    { date }
  );

  const progress = (status) => {
    let text = "text-blue-700 bg-blue-100";
    if (status === "done") text = "text-green-700 bg-green-100";
    else text = "text-red-700 bg-red-100";

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

  const handleDate = (date) => {
    let currentDate = new Date();
    if(date === 'today'){
      setDate(formatDate(currentDate))
    } else if (date === "nextDay"){
      let nextDay = new Date(currentDate);
      nextDay.setDate(currentDate.getDate() + 1);
      setDate(formatDate(nextDay))
    }
  }

  return (
    <div>
      {isLoading || isFetching ? (
        <Loading />
      ) : (
        error && <AlertMessage>{error?.data?.msg || error.error}</AlertMessage>
      )}
      <div className="grid grid-cols-2 gap-x-5">
        <div>
          <Button
            label="Todays Schedule"
            width="w-full"
            color="bg-green-600"
            handleClick={() => handleDate("today")}
          />
        </div>
        <div>
          <Button
            label="Tomorrow Schedule"
            width="w-full"
            handleClick={() => handleDate("nextDay")}
          />
        </div>
      </div>
      {data && (
        <>
          {data.length === 0 && (
            <h6 className="text-red-500 text-xl font-semibold text-center my-2">
              No Schedule Today
            </h6>
          )}
          <div className="overflow-y-auto my-2">
            <table className="w-full border whitespace-normal">
              <thead>
                <tr className="h-8 w-full text-sm leading-none">
                  <th className="text-left  border-neutral-800 border-2 px-2">
                    Date
                  </th>
                  <th className="text-left  border-neutral-800 border-2 px-2">
                    Time
                  </th>
                  <th className="text-left w-40 border-neutral-800 border-2 whitespace-nowrap px-8">
                    Card No
                  </th>
                  <th className="text-left border-neutral-800 border-2 whitespace-nowrap px-2">
                    Job Status
                  </th>
                  <th className="text-left  border-neutral-800 border-2 px-12">
                    Name
                  </th>
                  <th className="text-left border-neutral-800 border-2 px-20">
                    Address
                  </th>
                  <th className="text-left border-neutral-800 border-2 whitespace-nowrap px-8">
                    Complaint By
                  </th>
                  <th className="text-left  border-neutral-800 border-2 px-5">
                    Contact
                  </th>
                  <th className="text-left  border-neutral-800 border-2 px-12">
                    Service
                  </th>
                  <th className="text-left border-neutral-800 border-2 px-2">
                    Update
                  </th>
                </tr>
              </thead>
              <tbody className="w-full">
                {data.map((schedule) => (
                  <tr
                    key={schedule._id}
                    className="h-8 text-xs leading-none text-gray-700 border-b border-neutral-500 bg-white "
                  >
                    <td className="px-2 border font-normal border-neutral-500">
                      {dateFormat(schedule.date)}
                    </td>
                    <td className="px-2 border font-normal border-neutral-500">
                      {schedule.time.charAt(0).toUpperCase() +
                        schedule.time.slice(1)}
                    </td>
                    <td className="px-2 border-r text-center font-normal border-neutral-500">
                      {schedule.contractNo}
                    </td>
                    <td className="px-2 border-r text-center font-normal border-neutral-500">
                      {progress(schedule.jobStatus)}
                    </td>
                    <td className="px-2 border-r font-normal  border-neutral-500">
                      {schedule.clientName}
                    </td>
                    <td className="px-2 py-1 border-r font-normal  border-neutral-500">
                      {schedule.clientAddress.toLowerCase()}
                    </td>
                    <td className="px-2 border-r font-normal border-neutral-500">
                      {schedule.raiseBy}
                    </td>
                    <td className="px-2  border-r font-normal border-neutral-500">
                      {schedule.clientContact}
                    </td>
                    <td className="px-2  border-r font-normal border-neutral-500">
                      {schedule.serviceName.join(", ")}
                    </td>
                    <td className="px-2 border-r font-normal border-neutral-500">
                      <Link to={`/service-card/${schedule.service}`}>
                        <Button label="Update" width="w-14" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};
export default TechnicianScheduleTable;
