import { Link } from "react-router-dom";
import { saveAs } from "file-saver";

const ServiceTable = ({ th, data, handleButton1, handleButton3 }) => {
  const downloadImage = ({ url, name }) => {
    saveAs(url, `${name}.png`); // Put your image url here.
  };

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
              <td className="border-r w-44 px-2 py-1 font-normal dark:border-neutral-500">
                {service.services.map((item) => item.label + ", ")}
              </td>
              <td className="border-r w-24 px-2 py-1 font-normal dark:border-neutral-500">
                {service.area}
              </td>
              <td className="border-r w-36 px-2 py-1 font-normal dark:border-neutral-500">
                {service.frequency}
              </td>
              <td className="text-left border-r px-2 py-1 font-normal dark:border-neutral-500">
                {service.serviceMonths?.join(", ")}
              </td>
              <td className="border-r w-[260px] px-1 gap-1 py-1 font-normal dark:border-neutral-500">
                <button
                  type="button"
                  disabled={service.card ? false : true}
                  onClick={handleButton1}
                  className="text-white font-semibold mx-1 items-start justify-start px-2 py-2 bg-green-700 disabled:bg-green-500 disabled:cursor-not-allowed rounded"
                >
                  <a
                    style={{
                      textDecoration: "none",
                      color: "white",
                    }}
                    href={service.card}
                  >
                    Service Card
                  </a>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    downloadImage({ url: service.qr, name: "QR Code" })
                  }
                  disabled={service.qr ? false : true}
                  className="text-white font-semibold mx-1 items-start justify-start px-2 py-2 bg-cyan-700 disabled:bg-cyan-500 disabled:cursor-not-allowed rounded"
                >
                  QR Code
                </button>
                <button
                  type="button"
                  onClick={() => handleButton3(service._id)}
                  className="text-white font-semibold mx-1 items-start justify-start px-2 py-2 bg-orange-500 disabled:bg-green-500 disabled:cursor-not-allowed rounded"
                >
                  Report
                </button>
              </td>
              <td className="text-left w-20 border-r px-2 py-1 font-normal dark:border-neutral-500">
                <Link
                  to={`/service-card/${service._id}`}
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
