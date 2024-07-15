export const dateFormat = (date) => {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });
};

export const todaysDate = () => {
  let currentDate = new Date();
  let year = currentDate.getFullYear();
  let month = String(currentDate.getMonth() + 1).padStart(2, "0"); // Months are zero-based
  let day = String(currentDate.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const formatDate = (date) => {
  let year = date.getFullYear();
  let month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
  let day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
