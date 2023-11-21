import { Router, Request } from 'express';


// ============== HTTP INTERFACES ================ //
export interface HttpRoutesInterface {
  index(): Router
}

export interface TypedRequestBody<T> extends Request {
  body: T
}

