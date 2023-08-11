import { Link } from "react-router-dom";

const ServiceTable = ({
  th,
  data,
  handleButton1,
  handleButton2,
  handleButton3,
}) => {
  return (
    <div className="overflow-y-auto">
      <table className="min-w-full border text-sm font-light dark:border-neutral-500">
        <thead className="border-b font-medium dark:border-neutral-800 border-2">
          <tr>
            {th.map((item) => (
              <th
                className="border-r px-2 py-1 dark:border-neutral-800 border-2"
                key={item}
              >
                {item}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.services?.map((service) => (
            <tr className="border-b dark:border-neutral-500" key={service._id}>
              <td className="border-r w-32 px-2 py-1 font-normal dark:border-neutral-500">
                {service.services.map((item) => item.label + ", ")}
              </td>
              <td className="border-r w-24 px-2 py-1 font-normal dark:border-neutral-500">
                {service.area}
              </td>
              <td className="border-r w-36 px-2 py-1 font-normal dark:border-neutral-500">
                {service.frequency.name}
              </td>
              <td className="text-left border-r px-2 py-1 font-normal dark:border-neutral-500">
                {service.serviceMonths?.join(", ")}
              </td>
              <td className="border-r w-80 px-1 gap-1 py-1 font-normal dark:border-neutral-500">
                <button
                  type="button"
                  disabled={true}
                  onClick={handleButton1}
                  className="text-white font-semibold mx-1 items-start justify-start px-2 py-2 bg-green-700 disabled:bg-green-500 disabled:cursor-not-allowed rounded"
                >
                  Service Card
                </button>
                <button
                  type="button"
                  onClick={handleButton2}
                  className="text-white font-semibold mx-1 items-start justify-start px-2 py-2 bg-cyan-700 disabled:bg-cyan-500 disabled:cursor-not-allowed rounded"
                >
                  QR Code
                </button>
                <button
                  type="button"
                  onClick={handleButton3}
                  className="text-white font-semibold mx-1 items-start justify-start px-2 py-2 bg-green-700 disabled:bg-green-500 disabled:cursor-not-allowed rounded"
                >
                  Service Report
                </button>
              </td>
              <td className="text-left border-r px-2 py-1 font-normal dark:border-neutral-500">
                <Link
                  to="/service-card/:id"
                  className="text-white font-semibold items-start justify-start px-2 py-2 bg-blue-700 rounded"
                >
                  Update
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default ServiceTable;
