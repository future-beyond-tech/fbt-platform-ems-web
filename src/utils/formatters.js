export function formatDate(value, withTime = false) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    ...(withTime
      ? {
          hour: "2-digit",
          minute: "2-digit",
        }
      : {}),
  }).format(date);
}

export function formatHours(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "-";
  return `${Number(value).toFixed(2)} hrs`;
}

export function toArray(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.records)) return payload.records;
  if (Array.isArray(payload?.result)) return payload.result;
  return [];
}

export function getPaginationInfo(payload, fallbackPage = 1, fallbackPageSize = 10) {
  return {
    totalCount: payload?.totalCount ?? payload?.count ?? toArray(payload).length,
    pageNumber: payload?.pageNumber ?? fallbackPage,
    pageSize: payload?.pageSize ?? fallbackPageSize,
    totalPages:
      payload?.totalPages ??
      Math.max(1, Math.ceil((payload?.totalCount ?? toArray(payload).length) / (payload?.pageSize ?? fallbackPageSize))),
  };
}

export function parseApiError(error) {
  const status = error?.response?.status;
  const data = error?.response?.data;
  const message =
    data?.message ||
    data?.title ||
    (Array.isArray(data?.errors) ? data.errors.join(", ") : null) ||
    error?.message ||
    "Unexpected error";

  return { status, message, data };
}
