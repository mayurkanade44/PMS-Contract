const ContactTable = ({ contacts }) => {
  return (
    <div className="overflow-y-auto">
      <table className="min-w-full border text-center text-sm font-light dark:border-neutral-500">
        <thead className="border-b font-medium dark:border-neutral-800 border-2">
          <tr>
            <th className="border-r px-6 py-1 dark:border-neutral-800 border-2">
              Name
            </th>
            <th className="border-r px-6 py-1 dark:border-neutral-800 border-2">
              Contact
            </th>
            <th className="border-r px-6 py-1 dark:border-neutral-800 border-2">
              Email
            </th>
          </tr>
        </thead>
        <tbody>
          {contacts.map((contact, index) => (
            <tr className="border-b dark:border-neutral-500" key={index}>
              <td className="whitespace-nowrap border-r px-2 py-1 font-normal dark:border-neutral-500">
                {contact.name}
              </td>
              <td className="whitespace-nowrap border-r px-2 py-1 font-normal dark:border-neutral-500">
                {contact.number}
              </td>
              <td className="whitespace-nowrap border-r px-2 py-1 font-normal dark:border-neutral-500">
                {contact.email}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default ContactTable;
