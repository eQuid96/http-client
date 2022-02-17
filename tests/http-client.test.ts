import * as http from 'http';
import { IRequestConverter, IResponseConverter } from "../src/converters";
import { HttpClient, httpClient } from "../src/httpClient";
import { HttpRequest } from "../src/httpRequest";
import { IHttpRequestHandler } from "../src/httpRequestHandler";
import { IHttpResponse } from "../src/httpResponse";


class TestHttpServer {
    private server?: http.Server;
    private readonly PORT = 6969;
    private connections: any[] = []

    public start(){
        if(!this.server){
            this.server = http.createServer((req, res) => {
                this.addCORS(res);
                if(req.url === '/' && req.method === 'GET'){
                    res.writeHead(200, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({message: "Hello World"}));
                }

                else if(req.url === '/post' && req.method === 'POST'){
                    res.writeHead(200, {"Content-Type": "text/plain"});
                    res.end("Hello World");
                }

                else{
                    res.writeHead(404, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ message: "Route not found" }));
                }
            })
        }

        this.server.listen(this.PORT);
        this.server.on('connection', (socket) => {
            this.connections.push(socket);
            socket.on('close', _ => {
                const index = this.connections.indexOf(socket);
                this.connections.splice(index, 1);
            });
        });
    }

    
    public dispose(){
        for (const socket of this.connections) {
            socket.destroy();
        }
        this.server?.close();
    }

    private addCORS(response: http.ServerResponse){
        response.setHeader('Access-Control-Allow-Origin', '*');
        response.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
    }

}

const HTTP_TEST_SERVER_URL = 'http://localhost:6969'

describe("http-client with xhr request handler", () => {

    var server = new TestHttpServer();
    const client = httpClient();

    beforeAll(() => {
        server.start();
    });

    afterAll(async () => {
        await server.dispose();
    });

    it('should send get request and receive json body response', async function () {
        const res = await client.get(HTTP_TEST_SERVER_URL);
        expect(res).toBeTruthy();
        expect(res.body).toEqual({message: "Hello World"});
    });

    it('should send post request and ', async function () {
        const res = await client.post(HTTP_TEST_SERVER_URL+'/post', {value: 1}, {
            'Accept': '*/*'
        }, 'text');
        expect(res).toBeTruthy();
        expect(res.body).toEqual("Hello World");
    });

    it('should throw an 404 error', async function () {
        client.addResponseConverter(new TestResponseConverter());
        expect(client.get(HTTP_TEST_SERVER_URL + '/notfound')).rejects.toThrow();
    });
});


describe('http-client with fake request handler', () =>{
    var testHandler: HttpTestRequestHandler;
    var client: HttpClient;

    var testBody = {
        value: 1,
        arr: [1,2,3,4],
        obj: {
            key: 'string'
        }
    }
    beforeEach(() => {
        testHandler = new HttpTestRequestHandler();
        client = new HttpClient(testHandler);
    });

    it('get method should send HTTP GET request with null body', function () {
        const response = client.get(HTTP_TEST_SERVER_URL);
        const request = testHandler.getLastRequest();
        expect(request).toBeTruthy();
        expect(request.method).toStrictEqual('GET');
        expect(request.body).toStrictEqual(null);
        expect(request.url).toStrictEqual(HTTP_TEST_SERVER_URL);
        testHandler.resolve("Hello World");
        expect(response).resolves.toEqual({body: "Hello World", error: "", status: 200, url: HTTP_TEST_SERVER_URL});
    });

    it('post method should send a HTTP POST request', function () {
        const response = client.post(HTTP_TEST_SERVER_URL, {value: 1010});
        const request = testHandler.getLastRequest();
        expect(request).toBeTruthy();
        expect(request.method).toStrictEqual('POST');
        expect(request.body).toStrictEqual({value: 1010});
        expect(request.headers.has('Content-Type')).toBe(true);
        testHandler.resolve({response: 1});
        expect(response).resolves.toEqual({body: {response: 1}, error: "", status: 200, url: HTTP_TEST_SERVER_URL})
    });
    it('PUT method should send a HTTP PUT request', function () {
        const response = client.put(HTTP_TEST_SERVER_URL, {value: "put"});
        const request = testHandler.getLastRequest();
        expect(request).toBeTruthy();
        expect(request.method).toStrictEqual('PUT');
        expect(request.body).toStrictEqual({value: "put"});
        expect(request.headers.has('Content-Type')).toBe(true);
        testHandler.resolve({response: 1});
        expect(response).resolves.toEqual({body: {response: 1}, error: "", status: 200, url: HTTP_TEST_SERVER_URL})
    });
    it('send should accept custom HTTP REQUEST', function () {
        const response = client.send(new HttpRequest<object>('PUT', HTTP_TEST_SERVER_URL, testBody));
        const request = testHandler.getLastRequest();
        expect(request.method).toBe('PUT');
        expect(request.url).toBe(HTTP_TEST_SERVER_URL);
        expect(request.body).toStrictEqual(testBody);
        expect(request.headers).toBeTruthy();
        testHandler.resolve("DONE");
        expect(response).resolves.toEqual({body: "DONE", error: "", status: 200, url: HTTP_TEST_SERVER_URL});
    });
    it('should be possible to register a request converter', function () {
        const converter = new NullRequestConverter();
        expect(client.requestConverterSize).toBe(0);
        client.addRequestConverter(converter);
        expect(client.requestConverterSize).toBe(1);
    });
    it('should be possible to register a response converter', function () {
        const converter = new NullResponseConverter();
        expect(client.responseConverterSize).toBe(0);
        client.addResponseConverter(converter);
        expect(client.responseConverterSize).toBe(1);
    });
    it('should not be possible to add the same request/response converter twice', function () {
        const requestConverter = new NullRequestConverter();
        const responseConverter = new NullResponseConverter();
        client.addRequestConverter(requestConverter)
            .addResponseConverter(responseConverter)
            .addResponseConverter(responseConverter)
            .addResponseConverter(responseConverter)
        expect(client.requestConverterSize).toBe(1);
        expect(client.responseConverterSize).toBe(1);
    });
    it('should convert a HTTP request if there is RequestConverters', function () {
        const convert = new BodyChangerRequestConvert('BODY CONVERTED');
        client.addRequestConverter(convert);
        client.get(HTTP_TEST_SERVER_URL);
        const request = testHandler.getLastRequest();
        expect(request.method).toEqual('GET');
        expect(request.url).toEqual(HTTP_TEST_SERVER_URL);
        expect(request.body).toBe('BODY CONVERTED');
    });
    it('should convert a HTTP request in reverse order', function () {
        const first = new BodyChangerRequestConvert('first');
        const second = new BodyChangerRequestConvert('second');
        client.addRequestConverter(first)
            .addRequestConverter(second)
        client.post(HTTP_TEST_SERVER_URL, 1);
        const request = testHandler.getLastRequest();
        expect(request.body).toBe('first');

    });
    it('should convert a HTTP response if any converters', function () {
        const converter = new TestResponseConverter();
        client.addResponseConverter(converter);
        const response = client.get(HTTP_TEST_SERVER_URL);
        testHandler.resolve({
            arr: [1, 2, 3]
        });
        const expectedResponse: IHttpResponse = {
            url: HTTP_TEST_SERVER_URL,
            status: 200,
            body: {arr: ["ONE", "TWO", "THREE"]},
            error: '',
        }
        expect(response).resolves.toStrictEqual(expectedResponse);
    });
});

// A Request Converter that do nothing to the HTTP request.
class NullRequestConverter implements IRequestConverter{
    public convert(request: HttpRequest<any>): HttpRequest<any> {
        return request;
    }
}

// A Response Converter that do nothing to the HTTP response.
class NullResponseConverter implements IResponseConverter{
    public convert(response: IHttpResponse): IHttpResponse {
        return response;
    }
}

// A Request converter that change the body with a new one.
class BodyChangerRequestConvert implements IRequestConverter{
    constructor(private newBody: any) {
    }
    public convert(request: HttpRequest<any>): HttpRequest<any> {
        return request.clone({
            body: this.newBody
        })
    }
}

interface TestBodyNumberArray{
    arr: number[];
}
interface TestBodyStringArray{
    arr: string[];
}

//An Http Response Converter that convert a TestBodyNumberArray into a TestBodyStringArray.
class TestResponseConverter implements IResponseConverter{
    convert(response: IHttpResponse): IHttpResponse {
        const res = <TestBodyNumberArray>response.body;
        let convertedResponse: TestBodyStringArray = {
            arr: []
        };
        if(res.arr.length > 0){
            for (let i = 0; i < res.arr.length; i++) {
                const elem = res.arr[i];
                if(elem === 1){
                    convertedResponse.arr.push('ONE');
                }
                if(elem === 2){
                    convertedResponse.arr.push('TWO');
                }
                if(elem === 3){
                    convertedResponse.arr.push('THREE');
                }
            }
            return {
                url: response.url,
                status: response.status,
                body: convertedResponse,
                error: ''
            }
        }
        return response;
    }
}

class HttpTestRequestHandler implements IHttpRequestHandler{
    private responses: Promise<IHttpResponse>[] = [];
    private request: HttpRequest<any>[] = [];
    private executors: {resolve: (value: IHttpResponse) => void, reject:(value: IHttpResponse) => void}[] = []
    public handle(request: HttpRequest<any>): Promise<IHttpResponse> {
        const promise = new Promise<IHttpResponse>((resolve, reject) => {
            this.executors.push({
                resolve: resolve,
                reject: reject,
            });
        });
        this.request.push(request);
        this.responses.push(promise);
        return promise;
    }

    public getLastRequest(){
        return this.request[this.request.length - 1];
    }

    /**
     * Resolve the last HTTP Request with the given body.
     * @param body the body of the HTTP Response.
     */
    public resolve<T>(body: T){
        if(this.responses.length > 0){
            const request = this.request.pop()!;
            const response = this.responses.pop();
            const exec = this.executors.pop();
            if(exec){
                exec.resolve({
                    url: request.url,
                    body: body,
                    status: 200,
                    error: '',
                });
            }
        }
    }
}