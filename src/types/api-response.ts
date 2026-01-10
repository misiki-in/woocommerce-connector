export type PaginatedResponse<T extends Record<string, any>> = {
  limit?: number;
  offset?: number;
  count?: number;
} & T;
