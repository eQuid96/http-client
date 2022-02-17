import {HttpMethods, HttpRequest, HttpResponseType} from "./httpRequest";
import {HttpXhrHandler, IHttpRequestHandler} from "./httpRequestHandler";
import {IHttpResponse} from "./httpResponse";
import {HttpHeaders, HttpHeadersLazy} from "./httpHeaders";
import {IResponseConverter, IRequestConverter} from "./converters";

export interface IHttpClient {
    /**
     * Send a GET HttpRequest that parse the response body as JSON.
     * @param url The endpoint URL.
     * @param headers Additional HTTP Headers.
     * @param responseType by default is json
     */
    get(url: string, headers?: HttpHeadersLazy, responseType?: HttpResponseType): Promise<IHttpResponse>;
    /**
     * Send a DELETE HttpRequest that parse the response body as JSON.
     * @param url The endpoint URL.
     * @param headers Additional HTTP Headers.
     * @param responseType by default is json
     */
    delete(url: string, headers?: HttpHeadersLazy, responseType?: HttpResponseType): Promise<IHttpResponse>;

    /**
     * Send a POST HttpRequest that parse the response body as JSON.
     * @param url The endpoint URL.
     * @param body The request body.
     * @param headers Additional HTTP Headers.
     * @param responseType by default is json
     */
    post<T>(url: string, body: T, headers?: HttpHeadersLazy, responseType?: HttpResponseType): Promise<IHttpResponse>;
    /**
     * Send a PUT HttpRequest that parse the response body as JSON.
     * @param url The endpoint URL.
     * @param body The request body.
     * @param headers Additional HTTP Headers.
     * @param responseType by default is json
     */
    put<T>(url: string, body: T, headers?: HttpHeadersLazy, responseType?: HttpResponseType): Promise<IHttpResponse>;

    /**
     * Send predefined custom HTTPRequests.
     * @param request
     */
    send<T>(request: HttpRequest<T>): Promise<IHttpResponse>;

    /**
     * Register a new IRequestConverter to the current chain.
     * @param converter
     */
    addRequestConverter(converter: IRequestConverter): IHttpClient;

    /**
     * Register a new IResponseConverter to the current chain.
     * @param converter
     */
    addResponseConverter(converter: IResponseConverter): IHttpClient;
}

export class HttpClient implements IHttpClient {
    private requestConverters: IRequestConverter[] = [];
    private responseConverters: IResponseConverter[] = [];

    constructor(private readonly handler: IHttpRequestHandler) {}

    public get(url: string,headers?: HttpHeadersLazy, responseType?: HttpResponseType) {
        return this.sendRequest('GET', url, null, headers, responseType);
    }
    public delete(url: string,headers?: HttpHeadersLazy, responseType?: HttpResponseType) {
        return this.sendRequest('DELETE', url, null,headers, responseType);
    }
    public post<T>(url: string, body: T, headers?: HttpHeadersLazy, responseType?: HttpResponseType) {
        return this.sendRequest<T>('POST', url, body, headers, responseType);
    }
    public put<T>(url: string, body: T, headers?: HttpHeadersLazy, responseType?: HttpResponseType) {
        return this.sendRequest<T>('PUT', url, body, headers, responseType);
    }
    public send<T>(request: HttpRequest<T>){
        return this.sendRequest(request.method, request.url, request.body, request.headers, request.getResponseType());
    }
    public addRequestConverter(converter: IRequestConverter): IHttpClient {
        if(this.requestConverters.indexOf(converter) === -1){
            this.requestConverters.push(converter);
        }
        return this;
    }
    public addResponseConverter(converter: IResponseConverter): IHttpClient {
        if(this.responseConverters.indexOf(converter) === -1){
            this.responseConverters.push(converter);
        }
        return this;
    }

    public get requestConverterSize(){
        return this.requestConverters.length;
    }
    public get responseConverterSize(){
        return this.responseConverters.length;
    }

    private async sendRequest<T>(method:HttpMethods,
                           url: string,
                           body?: T,
                           headers?: HttpHeadersLazy | HttpHeaders,
                           responseType?: HttpResponseType) {
        let req = new HttpRequest(method, url, body, headers);
        if(responseType){
            req.setResponseType(responseType)
        }
        if(this.requestConverterSize > 0){
            for (let i = this.requestConverterSize - 1; i >= 0 ; --i) {
                const converter = this.requestConverters[i];
                req = converter.convert(req);
            }
        }
        let res = await this.handler.handle(req);
        if(this.responseConverterSize > 0){
            for (let i = this.responseConverterSize - 1; i >= 0 ; --i) {
                const converter = this.responseConverters[i];
                res = converter.convert(res);
            }
        }
        return Promise.resolve(res);
    }
}

//TODO: Switch request handler based on the runtime platform (dom or node);
let defaultClient: IHttpClient = new HttpClient(new HttpXhrHandler());

export function httpClient(): IHttpClient{
    return defaultClient;
}

