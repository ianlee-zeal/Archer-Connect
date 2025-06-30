export class HttpError {
  static NoConnection = 0;
  static BadRequest = 400;
  static Unauthorized = 401;
  static Forbidden = 403;
  static NotFound = 404;
  static TimeOut = 408;
  static UnprocessableEntity = 422;
  static InternalServerError = 500;
}
