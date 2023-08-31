import { Button } from "../components";

const AdminTable = ({ th, data, handleDelete }) => {
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
        {data?.map((item) => (
          <tr className="border-b  dark:border-neutral-500" key={item.id}>
            <td className="border-r px-2 py-1 font-normal dark:border-neutral-500">
              {item.name}
            </td>
            <td className="border-r flex justify-center w-32 px-2 py-1 font-normal dark:border-neutral-500">
              <Button
                label="Delete"
                color="bg-red-600"
                width="w-20"
                handleClick={() => handleDelete(item.id)}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
export default AdminTable;
