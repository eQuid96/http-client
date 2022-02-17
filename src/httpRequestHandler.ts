import {HttpRequest} from "./httpRequest";
import {IHttpResponse} from "./httpResponse";

export interface IHttpRequestHandler {
    handle(request: HttpRequest<any>): Promise<IHttpResponse>;
}

export class HttpXhrHandler implements IHttpRequestHandler {
    private readonly XSSI_REGEX = /^\)\]\}',?\n/;
    private readonly HTTP_STATUS_OK = 200;
    private readonly DEFAULT_REQUEST_TIMEOUT = 10000;

    public handle(request: HttpRequest<any>) {
        return new Promise<IHttpResponse>((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open(request.method, request.url, true);
            xhr.timeout = this.DEFAULT_REQUEST_TIMEOUT;
            xhr.responseType = request.getResponseType();
            this.setRequestHeaders(xhr, request);

            const onLoad = () => {
                let responseBody = (xhr.responseType === 'text' && !xhr.response) ? xhr.responseText : xhr.response;
                let responseStatus = xhr.status;
                if (responseStatus === 0 && !!responseBody) {
                    responseStatus = this.HTTP_STATUS_OK;
                }
                let ok = responseStatus >= 200 && responseStatus < 300;
                const response: IHttpResponse = {url: request.url, status: xhr.status, body: responseBody, error: ''};
                //Json body isn't already parsed.
                if (xhr.responseType === 'json' && typeof responseBody === 'string') {
                    if (ok) {
                        try {
                            //prevent from Cross Site Script Inclusion (XSSI).
                            const temp = responseBody.replace(this.XSSI_REGEX, '');
                            response.body = (temp !== '') ? JSON.parse(temp) : null;
                            resolve(response);
                        } catch (error) {
                            response.error = 'Error parsing json body';
                            reject(response);
                        }
                    }
                }

                //Json body is already parsed.
                if (ok) {
                    resolve(response);
                }else{
                    reject(response);
                }
            }

            const onError = (event: ProgressEvent) => {
                const response: IHttpResponse = {
                    url: request.url,
                    status: xhr.status,
                    body: xhr.response,
                    error: xhr.statusText || 'Unknown Error'
                }
                reject(response);
            }
            xhr.addEventListener('load', onLoad);
            xhr.addEventListener('error', onError);
            xhr.addEventListener('timeout', onError);
            xhr.addEventListener('abort', onError);

            xhr.send(request.getSerializedBody());
        });
    }

    private setRequestHeaders(xhr: XMLHttpRequest, request: HttpRequest<any>) {
        request.headers.foreach((key, value) => xhr.setRequestHeader(key, value));
    }

}