import { useEffect, useState } from "react";
import {
  AdminTable,
  AlertMessage,
  Button,
  InputRow,
  Loading,
} from "../components";
import { useForm } from "react-hook-form";
import {
  useAddAdminValueMutation,
  useDeleteAdminValueMutation,
  useGetAdminValueQuery,
} from "../redux/adminSlice";
import { toast } from "react-toastify";

const adminNavbar = [
  "All Users",
  "All Services",
  "All Sales Person",
  "All Service Comments",
];

const Admin = () => {
  const [showTable, setShowTable] = useState("All Users");
  const [service, setService] = useState([]);

  const { data, isLoading, refetch, error } = useGetAdminValueQuery();
  const [addValue, { isLoading: addValueLoading }] = useAddAdminValueMutation();
  const [deleteValue, { isLoading: deleteValueLoading }] =
    useDeleteAdminValueMutation();

  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      serviceName: "",
      serviceComment: "",
      sales: "",
    },
  });

  const handleTable = (item) => {
    setShowTable(item);
  };

  const handleDelete = async (id) => {
    let data = { id: id };
    try {
      const res = await deleteValue(data).unwrap();
      toast.success(res.msg);
      refetch();
    } catch (error) {
      console.log(error);
      toast.error(error?.data?.msg || error.error);
    }
  };

  const submit = async (data) => {
    let form = {};
    if (data.serviceName) {
      form.serviceName = {
        label: data.serviceName,
        value: "30ml / 20ml / 10ml / 5ml                    ODR / GEL / SPRAY",
      };
    }

    try {
      const res = await addValue(form).unwrap();
      toast.success(res.msg);
      refetch();
      reset();
    } catch (error) {
      console.log(error);
      toast.error(error?.data?.msg || error.error);
    }
  };

  return (
    <div className="py-14 lg:py-0">
      {isLoading || deleteValueLoading || addValueLoading ? (
        <Loading />
      ) : (
        error && <AlertMessage>{error?.data?.msg || error.error}</AlertMessage>
      )}
      {data && (
        <>
          <div className="flex items-center justify-center py-2 bg-gray-100 border">
            {adminNavbar.map((item, index) => (
              <button
                className="mx-4 font-medium hover:text-blue-500"
                key={index}
                onClick={() => handleTable(item)}
              >
                {item}
              </button>
            ))}
          </div>
          <div className="flex justify-center py-2 gap-5">
            {showTable === "All Users" ? (
              <div>
                <Button label="New User" width="w-32" height="h-9" />
                <AdminTable th="Users" data={data.comments} />
              </div>
            ) : showTable === "All Services" ? (
              <div>
                <form
                  className="flex items-center gap-8"
                  onSubmit={handleSubmit(submit)}
                >
                  <InputRow
                    label="Service Name"
                    message="Service name is required"
                    placeholder="Enter new service"
                    id="serviceName"
                    errors={errors}
                    register={register}
                  />
                  <Button
                    label="Add Service"
                    color="bg-green-600"
                    width="w-28"
                    height="h-9"
                    type="submit"
                  />
                </form>
                <div className="flex justify-center mt-4">
                  <AdminTable
                    th="Services"
                    data={data?.services}
                    handleDelete={handleDelete}
                  />
                </div>
              </div>
            ) : showTable === "All Sales Person" ? (
              <>
                <AdminTable th="Sales" data={data.sales} />
                <Button label="New Person" width="w-32" height="h-9" />
              </>
            ) : showTable === "All Service Comments" ? (
              <>
                <AdminTable th="Comments" data={data.comments} />
                <Button
                  label="New Comment"
                  color="bg-green-600"
                  width="w-32"
                  height="h-9"
                />
              </>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
};
export default Admin;
