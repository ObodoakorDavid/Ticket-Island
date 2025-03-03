export function formatDate(dateString) {
  // Helper function to get the ordinal suffix
  function getOrdinalSuffix(day) {
    if (day > 3 && day < 21) return "th";
    switch (day % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  }

  // Create a Date object from the ISO 8601 string
  const date = new Date(dateString);

  const day = date.getUTCDate();
  const monthName = date.toLocaleString("en-US", { month: "long" });
  const year = date.getUTCFullYear();
  const dayWithSuffix = `${day}${getOrdinalSuffix(day)}`;

  // Format time in 12-hour format with AM/PM
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  const amPm = hours >= 12 ? "PM" : "AM";
  const formattedHours = hours % 12 || 12; // Convert 0 to 12 for 12-hour format
  const formattedMinutes = minutes.toString().padStart(2, "0"); // Ensure two-digit minutes

  const time = `${formattedHours}:${formattedMinutes} ${amPm}`;

  return `${dayWithSuffix} ${monthName} ${year}, ${time} UTC`;
}


