import { useState } from "react";
import { useDispatch } from "react-redux";
import { setScheduleDetails } from "../../redux/allSlice";
import { useGetClientDetailsQuery } from "../../redux/scheduleSlice";
import Button from "../Button";
import Modal from "./Modal";

import { IoMdCloseCircleOutline } from "react-icons/io";
import Loading from "../Loading";

const SearchClientModal = ({ open, close, setOpen }) => {
  const dispatch = useDispatch();
  const [tempSearch, setTempSearch] = useState("");
  const [search, setSearch] = useState("");
  const [skip, setSkip] = useState(true);

  const { data, isLoading, isFetching } = useGetClientDetailsQuery(
    { search },
    { skip }
  );

  const handleSearch = (e) => {
    e.preventDefault();
    setSkip(false);
    setSearch(tempSearch);
  };

  console.log(data);
  
  const handleClose = () => {
    setSkip(true);
    setSearch("");
    setTempSearch("");
    close();
  };

  const handleEditModal = (schedule) => {
    dispatch(setScheduleDetails(schedule));
    close();
    setOpen(true);
    setSearch("");
    setSkip(true);
  };

  return (
    <>
      {isLoading || isFetching ? (
        <Loading />
      ) : (
        <Modal open={open}>
          <div className="md:my-10 lg:my-1 md:w-[500px]">
            <div className="relative">
              <div className="flex justify-around mb-8">
                <h4 className="text-center text-xl font-semibold">
                  New Schedule
                </h4>
                <IoMdCloseCircleOutline
                  className="w-6 h-6 text-red-500 mt-1 hover:cursor-pointer"
                  type="button"
                  onClick={handleClose}
                />
              </div>
              <form className="flex" onSubmit={handleSearch}>
                <input
                  type="text"
                  className="p-2 border-2 w-2/3 text-sm rounded text-gray-600 placeholder-gray-500 "
                  placeholder="Search Contract Number"
                  value={tempSearch}
                  onChange={(e) => setTempSearch(e.target.value)}
                />
                <div className="w-1/3 ml-4">
                  <Button
                    label="Search"
                    height="h-10"
                    width="w-full"
                    type="submit"
                  />
                </div>
              </form>
              {data?.contractNo ? (
                <div className="mt-1 max-h-40 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                  <div
                    className="relative group py-1 pl-3 pr-9 text-black hover:cursor-pointer hover:bg-blue-300"
                    onClick={() => handleEditModal(data)}
                  >
                    <div className="">
                      <p>Client Name: {data.clientName}</p>
                      <p>Client Name: {data.clientContact}</p>
                      <p>Services: {data.services?.map(item => item.label + ", ")}</p>
                    </div>
                  </div>
                </div>
              ) : (
                !skip && (
                  <div className="mt-1 max-h-40 w-full overflow-auto rounded-md bg-white text-red-500 py-1 pl-2 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                    <p>No Contract Found</p>
                  </div>
                )
              )}
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};
export default SearchClientModal;
