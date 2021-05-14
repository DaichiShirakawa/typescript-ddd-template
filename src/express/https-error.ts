import { ORMHelper } from "../helpers/orm-helper";
/**
 * Marupakuri from:
 * https://github.com/firebase/firebase-functions/blob/98bf467aa436f7e27969a8ad3887abe0345f66d3/src/providers/https.ts
 */

export type FunctionsErrorCode =
  | "ok"
  | "cancelled"
  | "unknown"
  | "invalid-argument"
  | "deadline-exceeded"
  | "not-found"
  | "already-exists"
  | "permission-denied"
  | "resource-exhausted"
  | "failed-precondition"
  | "aborted"
  | "out-of-range"
  | "unimplemented"
  | "internal"
  | "unavailable"
  | "data-loss"
  | "unauthenticated";

/** @hidden */
export type CanonicalErrorCodeName =
  | "OK"
  | "CANCELLED"
  | "UNKNOWN"
  | "INVALID_ARGUMENT"
  | "DEADLINE_EXCEEDED"
  | "NOT_FOUND"
  | "ALREADY_EXISTS"
  | "PERMISSION_DENIED"
  | "UNAUTHENTICATED"
  | "RESOURCE_EXHAUSTED"
  | "FAILED_PRECONDITION"
  | "ABORTED"
  | "OUT_OF_RANGE"
  | "UNIMPLEMENTED"
  | "INTERNAL"
  | "UNAVAILABLE"
  | "DATA_LOSS";

/** @hidden */
interface HttpErrorCode {
  canonicalName: CanonicalErrorCodeName;
  status: number;
}

/**
 * Standard error codes and HTTP statuses for different ways a request can fail,
 * as defined by:
 * https://github.com/googleapis/googleapis/blob/master/google/rpc/code.proto
 *
 * This map is used primarily to convert from a client error code string to
 * to the HTTP format error code string and status, and make sure it's in the
 * supported set.
 */
const errorCodeMap: { [name in FunctionsErrorCode]: HttpErrorCode } = {
  ok: { canonicalName: "OK", status: 200 },
  cancelled: { canonicalName: "CANCELLED", status: 499 },
  unknown: { canonicalName: "UNKNOWN", status: 500 },
  "invalid-argument": { canonicalName: "INVALID_ARGUMENT", status: 400 },
  "deadline-exceeded": { canonicalName: "DEADLINE_EXCEEDED", status: 504 },
  "not-found": { canonicalName: "NOT_FOUND", status: 404 },
  "already-exists": { canonicalName: "ALREADY_EXISTS", status: 409 },
  "permission-denied": { canonicalName: "PERMISSION_DENIED", status: 403 },
  unauthenticated: { canonicalName: "UNAUTHENTICATED", status: 401 },
  "resource-exhausted": { canonicalName: "RESOURCE_EXHAUSTED", status: 429 },
  "failed-precondition": { canonicalName: "FAILED_PRECONDITION", status: 400 },
  aborted: { canonicalName: "ABORTED", status: 409 },
  "out-of-range": { canonicalName: "OUT_OF_RANGE", status: 400 },
  unimplemented: { canonicalName: "UNIMPLEMENTED", status: 501 },
  internal: { canonicalName: "INTERNAL", status: 500 },
  unavailable: { canonicalName: "UNAVAILABLE", status: 503 },
  "data-loss": { canonicalName: "DATA_LOSS", status: 500 },
};

/** @hidden */
interface HttpErrorWireFormat {
  details?: unknown;
  message: string;
  status: CanonicalErrorCodeName;
}

/**
 * An explicit error that can be thrown from a handler to send an error to the
 * client that called the function.
 */
export class HttpsError extends Error {
  /**
   * A standard error code that will be returned to the client. This also
   * determines the HTTP status code of the response, as defined in code.proto.
   */
  public readonly code: FunctionsErrorCode;

  /**
   * Extra data to be converted to JSON and included in the error response.
   */
  public readonly details: unknown;

  /**
   * A wire format representation of a provided error code.
   *
   * @hidden
   */
  public readonly httpErrorCode: HttpErrorCode;

  constructor(code: FunctionsErrorCode, message: string, details?: unknown) {
    super(message);

    // A sanity check for non-TypeScript consumers.
    if (code in errorCodeMap === false) {
      throw new Error(`Unknown error code: ${code}.`);
    }

    this.code = code;
    this.details = ORMHelper.convertFrontEntityRecursively(details);
    this.httpErrorCode = errorCodeMap[code];
  }

  /** @hidden */
  public toJSON(): HttpErrorWireFormat {
    const {
      details,
      httpErrorCode: { canonicalName: status },
      message,
    } = this;

    return {
      ...(details === undefined ? {} : { details }),
      message,
      status,
    };
  }
}
