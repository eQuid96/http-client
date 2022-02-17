import {HttpHeaders, HttpHeadersLazy} from "./httpHeaders";

type HttpMethod = "GET" | "HEAD" | "POST" | "PUT" | "DELETE" | "CONNECT" | "OPTIONS" | "TRACE" | "PATCH";
export type HttpMethods = HttpMethod | Lowercase<HttpMethod>;
export type HttpResponseType = 'arraybuffer'|'blob'|'json'|'text';

export class HttpRequest<T> {
    public readonly url: string;
    public readonly method: HttpMethods;
    public readonly headers: HttpHeaders;
    public readonly body: T | null;

    //By default responseType is json
    private responseType: HttpResponseType;

    constructor(method: HttpMethods, url: string, body?: T | null, headers?: HttpHeadersLazy | HttpHeaders) {
        this.method = <HttpMethod> method.toUpperCase();
        this.url = url;
        this.body = (body !== undefined) ? body : null;
        if(headers instanceof HttpHeaders){
            this.headers = headers;
        }else{
            this.headers = (headers !== undefined) ? new HttpHeaders(headers) : this.getDefaultHeaders();
        }
        this.responseType = 'json';
    }

    private getDefaultHeaders(): HttpHeaders {
        const detectedContentType = this.getContentType();
        if(detectedContentType){
            return new HttpHeaders({
                "Accept": ["application/json", "text/plain", "*/*"],
                "Content-Type": detectedContentType
            });
        }
        return new HttpHeaders({
            "Accept": ["application/json", "text/plain", "*/*"],
        });
    }

    public getSerializedBody(): ArrayBuffer|Blob|FormData|string|null{
        if (this.body === null) {
            return null;
        }
        if (isArrayBuffer(this.body) || isBlob(this.body) || isFormData(this.body) ||
            isUrlSearchParams(this.body) || typeof this.body === 'string') {
            return this.body;
        }
        if (typeof this.body === 'object' || typeof this.body === 'boolean' ||
            Array.isArray(this.body)) {
            return JSON.stringify(this.body);
        }
        return (this.body as any).toString();
    }

    public getContentType() {
        if (this.body === null) {
            return null;
        }
        if (typeof this.body === 'string') {
            return 'text/plain; charset=UTF-8';
        }
        if (typeof this.body === 'object' || typeof this.body === 'number' ||
            typeof this.body === 'boolean' || Array.isArray(this.body)) {
            return 'application/json; charset=UTF-8';
        }
        return null;
    }

    public getResponseType(){
        return this.responseType;
    }

    public setResponseType(response: HttpResponseType){
        this.responseType = response;
    }

    /**
     * Create a clone of the actual HttpRequest with the new updated values.
     * @param update the values to change.
     */
    public clone(update: {method?: HttpMethods, url?: string, body?: T, headers?: HttpHeadersLazy}): HttpRequest<any>{
        const method = update.method || this.method;
        const url = update.url || this.url;
        const body = (update.body !== undefined) ? update.body : this.body;
        var headers = (update.headers !== undefined) ? update.headers : this.headers;
        return new HttpRequest(method, url, body, headers);
    }
}

function isArrayBuffer(body: any): body is ArrayBuffer{
    return typeof ArrayBuffer !== 'undefined' && body instanceof ArrayBuffer;
}

function isBlob(body: any): body is Blob{
    return typeof Blob !== 'undefined' && body instanceof Blob;
}

function isFormData(body: any): body is FormData{
    return typeof FormData !== 'undefined' && body instanceof FormData;
}

function isUrlSearchParams(body: any): body is URLSearchParams{
    return typeof URLSearchParams !== 'undefined' && body instanceof URLSearchParams;
}