import { HttpRequest } from "./http-request";
import { IHttpResponse } from "./http-response";

export interface IHttpRequestHandler {
    handle(request: HttpRequest<any>): Promise<IHttpResponse>;
}
