export  function formatDateString(dateString) {
    const options = { year: "numeric", month: "short", day: "numeric" };
    const formattedDate = new Date(dateString).toLocaleDateString("en-US", options);
    return formattedDate;
  }