import { toast } from "react-toastify";

export function handleApiError(err, defaultMsg = "Đã xảy ra lỗi!") {
  if (err.response?.data?.errors) {
    const errorMessages = Object.values(err.response.data.errors)
      .flat()
      .join("\n");
    toast.error(errorMessages);
  } else {
    toast.error(err.response?.data?.message || defaultMsg);
  }
}
