import { useState } from "react";
import {
  AdminTable,
  AlertMessage,
  Button,
  InputRow,
  Loading,
  InputSelect,
} from "../components";
import { useForm, Controller } from "react-hook-form";
import {
  useAddAdminValueMutation,
  useAddUserMutation,
  useAllUsersQuery,
  useDeleteAdminValueMutation,
  useDeleteUserMutation,
  useGetAdminValueQuery,
} from "../redux/adminSlice";
import { toast } from "react-toastify";
import { adminNavbar, userRoles } from "../utils/dataHelper";
import { useSelector } from "react-redux";

const Admin = () => {
  const [showTable, setShowTable] = useState("All Users");
  const { user } = useSelector((store) => store.all);

  const { data, isLoading, refetch, error } = useGetAdminValueQuery();
  const [addValue, { isLoading: addValueLoading }] = useAddAdminValueMutation();
  const [deleteValue, { isLoading: deleteValueLoading }] =
    useDeleteAdminValueMutation();

  const { data: allUsers, isLoading: userLoading } = useAllUsersQuery();
  const [deleteUser, { isLoading: deleteUserLoading }] =
    useDeleteUserMutation();
  const [addUser, { isLoading: addUserLoading }] = useAddUserMutation();

  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
    control,
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "Technician",
      serviceName: "",
      commentLabel: "",
      commentValue: "",
      sales: "",
    },
  });

  const handleTable = (item) => {
    setShowTable(item);
    reset();
  };

  const handleDelete = async (id) => {
    let data = { id: id };
    try {
      let res;
      if (showTable === "All Users") {
        res = await deleteUser(data).unwrap();
      } else {
        res = await deleteValue(data).unwrap();
        refetch();
      }
      toast.success(res.msg);
    } catch (error) {
      console.log(error);
      toast.error(error?.data?.msg || error.error);
    }
  };

  const submit = async (data) => {
    let form = {};
    if (showTable === "All Services") {
      form.serviceName = {
        label: data.serviceName,
        value: data.serviceName,
      };
    } else if (showTable === "All Sales Person") {
      form.sales = { label: data.sales, value: data.sales };
    } else if (showTable === "All Service Comments") {
      form.serviceComment = {
        label: data.commentLabel,
        value: data.commentValue,
      };
    }

    try {
      let res;
      if (showTable === "All Users") {
        res = await addUser(data).unwrap();
      } else {
        res = await addValue(form).unwrap();
        refetch();
      }
      toast.success(res.msg);
      reset();
    } catch (error) {
      console.log(error);
      toast.error(error?.data?.msg || error.error);
    }
  };

  return (
    <div className="pb-10">
      {isLoading ||
      deleteValueLoading ||
      addValueLoading ||
      userLoading ||
      deleteUserLoading ||
      addUserLoading ? (
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
                <form
                  className="flex items-center gap-8 mb-4"
                  onSubmit={handleSubmit(submit)}
                >
                  <div>
                    <InputRow
                      label="User Name"
                      placeholder="Enter full name"
                      id="name"
                      errors={errors}
                      register={register}
                    />
                    <p className="text-xs text-red-500 -bottom-4 pl-1">
                      {errors.name && "Name is required"}
                    </p>
                  </div>
                  <div>
                    <InputRow
                      label="Email"
                      placeholder="abc@pms.in"
                      id="email"
                      errors={errors}
                      register={register}
                    />
                    <p className="text-xs text-red-500 -bottom-4 pl-1">
                      {errors.email && "Email id is required"}
                    </p>
                  </div>
                  <div>
                    <InputRow
                      label="Password"
                      message="Password is required"
                      placeholder="Minium 5 letters"
                      id="password"
                      errors={errors}
                      register={register}
                    />
                    <p className="text-xs text-red-500 -bottom-4 pl-1">
                      {errors.password && "Password is required"}
                    </p>
                  </div>
                  <div>
                    <Controller
                      name="role"
                      control={control}
                      rules={{ required: true }}
                      render={({ field: { onChange, value, ref } }) => (
                        <InputSelect
                          options={userRoles}
                          onChange={onChange}
                          value={value}
                          label="Role"
                        />
                      )}
                    />
                    <p className="text-xs text-red-500 -bottom-4 pl-1">
                      {errors.role && "Role is required"}
                    </p>
                  </div>

                  <Button
                    label="Add User"
                    color="bg-green-600"
                    width="w-28"
                    height="h-9"
                    type="submit"
                  />
                </form>
                <div className="flex justify-center">
                  <table className="border text-sm font-light dark:border-neutral-500">
                    <thead className="border-b font-medium dark:border-neutral-800 border-2">
                      <tr>
                        <th className="border-r px-2 py-1 dark:border-neutral-800 border-2">
                          Name
                        </th>
                        <th className="border-r px-2 py-1 dark:border-neutral-800 border-2">
                          Email
                        </th>
                        <th className="border-r px-2 py-1 dark:border-neutral-800 border-2">
                          Role
                        </th>
                        <th className="border-r px-2 py-1 dark:border-neutral-800 border-2">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {allUsers?.map((item) => (
                        <tr
                          className="border-b  dark:border-neutral-500"
                          key={item._id}
                        >
                          <td className="border-r px-2 py-1 font-normal dark:border-neutral-500">
                            {item.name}
                          </td>
                          <td className="border-r px-2 py-1 font-normal dark:border-neutral-500">
                            {item.email}
                          </td>
                          <td className="border-r px-2 py-1 font-normal dark:border-neutral-500">
                            {item.role}
                          </td>
                          <td className="border-r flex justify-center w-32 px-2 py-1 font-normal dark:border-neutral-500">
                            {item.name !== "Sandeep" &&
                              item._id !== user._id && (
                                <Button
                                  label="Delete"
                                  color="bg-red-600"
                                  width="w-20"
                                  handleClick={() => handleDelete(item._id)}
                                />
                              )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : showTable === "All Services" ? (
              <div>
                <form
                  className="flex items-center gap-8 mb-4"
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
                <AdminTable
                  th="Services"
                  data={data?.services}
                  handleDelete={handleDelete}
                />
              </div>
            ) : showTable === "All Sales Person" ? (
              <div>
                <form
                  className="flex items-center gap-8 mb-4"
                  onSubmit={handleSubmit(submit)}
                >
                  <InputRow
                    label="Sales Name"
                    message="Service name is required"
                    placeholder="Enter person name"
                    id="sales"
                    errors={errors}
                    register={register}
                  />
                  <Button
                    label="Add Person"
                    color="bg-green-600"
                    width="w-28"
                    height="h-9"
                    type="submit"
                  />
                </form>
                <AdminTable
                  th="Sales"
                  data={data.sales}
                  handleDelete={handleDelete}
                />
              </div>
            ) : showTable === "All Service Comments" ? (
              <div>
                <form
                  className="flex items-center gap-8 mb-4"
                  onSubmit={handleSubmit(submit)}
                >
                  <InputRow
                    label="English Comment"
                    message="Comment is required"
                    placeholder="Enter comment in english"
                    id="commentValue"
                    errors={errors}
                    register={register}
                  />
                  <InputRow
                    label="Hindi Comment"
                    message="Comment is required"
                    placeholder="Enter comment in hindi"
                    id="commentLabel"
                    errors={errors}
                    register={register}
                  />
                  <Button
                    label="Add Comment"
                    color="bg-green-600"
                    width="w-32"
                    height="h-9"
                    type="submit"
                  />
                </form>
                <AdminTable
                  th="Comments"
                  data={data.comments}
                  handleDelete={handleDelete}
                />
              </div>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
};
export default Admin;
