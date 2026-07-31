export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: true;
  pagination: {
    count: number;
    total_pages: number;
    current_page: number;
    next: string | null;
    previous: string | null;
  };
  results: T[];
}

export interface DataResponse<T> {
  success: true;
  message?: string;
  data: T;
}

export interface MessageResponse {
  success: true;
  message: string;
}

export interface ErrorResponse {
  success: false;
  error: {
    code?: string;
    message: string;
    detail?: Record<string, string[]>;
  };
}
