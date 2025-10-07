export class APIError extends Error {
  constructor(status: string, message: string, data: string) {
    super(message);
    this.status = status;
    this.data = data;
  }
  status;
  data;
  errorPage = false;
}

APIError.prototype.name = "APIError";
