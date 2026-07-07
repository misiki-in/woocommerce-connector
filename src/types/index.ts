export interface PaginatedResponse<T> {
  data: T[]
  total?: number
  page?: number
  perPage?: number
}
export interface Resource { id?: string | number; [key: string]: unknown }
