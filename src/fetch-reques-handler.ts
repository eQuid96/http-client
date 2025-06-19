import { HttpRequest } from "./http-request";
import { IHttpResponse } from "./http-response";
import { IHttpRequestHandler } from "./http-request-handler";

export class HttpFetchHandler implements IHttpRequestHandler {
    public async handle(request: HttpRequest<any>): Promise<IHttpResponse> {
        const requestHeaders: { [key: string]: string } = {};
        request.headers.foreach((key, value) => {
            requestHeaders[key] = value;
        });
        let response: IHttpResponse = {
            url: request.url,
            status: 400,
            body: "",
            error: "",
        };
        try {
            const res = await fetch(request.url, {
                method: request.method,
                headers: requestHeaders,
                body: request.getSerializedBody(),
            });
            if (!res.ok) {
                const body = await res.json();
                if (body) {
                    return Promise.reject(body);
                } else {
                    throw new Error(res.statusText);
                }
            }
            response = {
                url: request.url,
                status: res.status,
                body: res.body,
                error: res.statusText,
            };

            if (request.getResponseType() === "json") {
                const bodyToJson = await res.json();
                response.body = bodyToJson;
            }
            return Promise.resolve(response);
        } catch (error: any) {
            return Promise.reject(error);
        }
    }
}
