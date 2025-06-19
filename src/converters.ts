import { HttpRequest } from "./http-request";
import { IHttpResponse } from "./http-response";

/**
 * Implements this interface to intercept an out coming HttpRequest
 * remember to register it to the HttpClient like so:
 * @example
 * httpClient().addRequestConverter(IRequestConverter)
 */
export interface IRequestConverter {
    /**
     * This method will be called just before an HttpRequest will be sent to the server.
     * if this isn't the desired request remember to return the original one.
     * @param request the original request.
     * @return HttpRequest the new updated request.
     */
    convert(request: HttpRequest<any>): HttpRequest<any>;
}

/**
 * Implements this interface to intercept an incoming HttpResponse
 * remember to register it to the HttpClient like so:
 * @example
 * httpClient().addResponseConverter(IResponseConverter)
 */
export interface IResponseConverter {
    /**
     * This method will be called when an HttpResponse is received from the server.
     * if this isn't the desired response remember to return the original one.
     * @param response the original response.
     * @return IHttpResponse the new updated response.
     */
    convert(response: IHttpResponse): IHttpResponse;
}
