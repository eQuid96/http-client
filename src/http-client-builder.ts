import { IRequestConverter, IResponseConverter } from "./converters";
import { HttpFetchHandler } from "./fetch-reques-handler";
import { HttpClient, IHttpClient } from "./http-client";
import { CommonHeaders, HttpHeaders, HttpHeadersLazy } from "./http-headers";
import { HttpXhrHandler } from "./http-xhr-request-handler";

export class HttpClientBuilder {
    private requestConverters: IRequestConverter[] = [];
    private responseConverters: IResponseConverter[] = [];
    private headers?: HttpHeaders;

    public withRequestConverter(converters: IRequestConverter | IRequestConverter[]): HttpClientBuilder {
        if (Array.isArray(converters)) {
            this.requestConverters.push(...converters);
        } else {
            this.requestConverters.push(converters);
        }
        return this;
    }

    public withResponseConverter(converters: IResponseConverter[] | IResponseConverter): HttpClientBuilder {
        if (Array.isArray(converters)) {
            this.responseConverters.push(...converters);
        } else {
            this.responseConverters.push(converters);
        }
        return this;
    }

    public withHeaders(headers: HttpHeadersLazy) {
        this.headers = new HttpHeaders(headers);
        return this;
    }

    public withAuthToken(token: string) {
        const headers = this.headers ?? new HttpHeaders();
        headers.set(CommonHeaders.Authorization, token);
        this.headers = headers;
        return this;
    }

    public build(): IHttpClient {
        let client: IHttpClient;
        if (this.headers) {
            if (!this.headers.has(CommonHeaders.Accept)) {
                this.headers.set(CommonHeaders.Accept, "*/*");
            }
        }
        if (window.fetch === undefined) {
            client = new HttpClient(new HttpXhrHandler(), this.headers);
        } else {
            client = new HttpClient(new HttpFetchHandler(), this.headers);
        }

        this.responseConverters.map((converter) => client.addResponseConverter(converter));
        this.requestConverters.map((converter) => client.addRequestConverter(converter));

        return client;
    }
}
