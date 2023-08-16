import { Button } from "../components";

const AdminTable = ({ th, data }) => {
  return (
    <table className="border text-sm font-light dark:border-neutral-500">
      <thead className="border-b font-medium dark:border-neutral-800 border-2">
        <tr>
          <th className="border-r px-2 py-1 dark:border-neutral-800 border-2">
            {th}
          </th>
          <th className="border-r px-2 py-1 dark:border-neutral-800 border-2">
            Action
          </th>
        </tr>
      </thead>
      <tbody>
        {data?.map((item, index) => (
          <tr className="border-b  dark:border-neutral-500" key={index}>
            <td className="border-r px-2 py-1 font-normal dark:border-neutral-500">
              {item.label}
            </td>
            <td className="border-r flex justify-center w-32 px-2 py-1 font-normal dark:border-neutral-500">
              <Button label="Delete" color="bg-red-600" />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
export default AdminTable;
