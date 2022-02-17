import { HttpRequest } from "../src/httpRequest";

describe("http-request", () => {
    const testUrl = "http://localhost:3000/";

    it("should have an URL", function(){
        const req = new HttpRequest("GET", testUrl);
        expect(req).toBeTruthy();
        expect(req.url).toBe(testUrl);
    });
    it('should have a valid HttpMethod', function(){
        const req = new HttpRequest('POST', testUrl);
        expect(req.method).toBe('POST');
        const reqLower = new HttpRequest('post', testUrl);
        expect(reqLower.method).toBe('POST');
    });
    it('should have default headers', function(){
        const req = new HttpRequest('GET', testUrl);
        expect(req.headers).toBeTruthy();
        expect(req.headers.get('Accept')).toBeTruthy();
    });
    it('should have custom headers', function(){
        const req = new HttpRequest('get', testUrl, null,{
            "Content-Type": "text/html",
        });
        expect(req.headers.get('Content-Type')).toBe('text/html');
    });
    it('should have an optional body', function(){
        const req = new HttpRequest<string>('POST', testUrl, "test body");
        expect(req.body).toBe("test body");
    });

    it('should serialize body in json format', function(){
        const testBody = {
            value: 1,
            arr: [1,2,3]
        };
        const json = JSON.stringify(testBody);
        const req = new HttpRequest('POST', testUrl, testBody);

        expect(req.getSerializedBody()).toBe(json);
    });

    it('should serialize array in json format', function(){
        const testBody = [1,2,3,4,5,3,2];
        const json = JSON.stringify(testBody);
        const req = new HttpRequest<number[]>('POST', testUrl, testBody);
        expect(req.getSerializedBody()).toBe(json);
        const deserialized = JSON.parse(<string>req.getSerializedBody());
        expect(deserialized).toHaveLength(testBody.length);
        expect(deserialized).toEqual(testBody);
    });
    it('should not serialize a string', function () {
        const req = new HttpRequest('POST', testUrl, "test-string");
        const body = req.getSerializedBody();
        expect(body).toStrictEqual("test-string");
        expect(typeof body).toBe("string");
    });
    it('should not serialize a Blob', function () {
        const data = ["<p> html data </p>"];
        const blob = new Blob(data, {type: "text/html"});
        const req = new HttpRequest('POST', testUrl, blob);
        const body = req.getSerializedBody();
        expect(body).toBeTruthy();
        expect(body).toBeInstanceOf(Blob);
        if(body instanceof Blob){
            expect(body.size).toBe(data[0].length);
        }
    });
});