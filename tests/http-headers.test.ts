import { HttpHeadersLazy, HttpHeaders } from "../src/httpHeaders";

const APPLICATION_JSON_VALUE = 'application/json';
const CONTENT_TYPE_KEY = "Content-Type";

function getHeader(lazy: HttpHeadersLazy){
    return new HttpHeaders(lazy);
}


describe("http-headers test", () => {

    it("should be possible to add headers", () => {
        const headers = new HttpHeaders();
        headers.append(CONTENT_TYPE_KEY, APPLICATION_JSON_VALUE);
        expect(headers).toBeTruthy();
        expect(headers.get(CONTENT_TYPE_KEY)).toEqual(APPLICATION_JSON_VALUE);
    });
    it('should be possible to replace an existing header', function (){
       const headers = getHeader({
           "Accept": ["text/plain"]
       });
       expect(headers.get("Accept")).toStrictEqual('text/plain');
       headers.set('Accept', [APPLICATION_JSON_VALUE]);
       expect(headers.get('Accept')).toStrictEqual(APPLICATION_JSON_VALUE);
    });
    it("shouldn't be possible to append an header that already exist", function (){
        const headers = getHeader({
            "Accept": [APPLICATION_JSON_VALUE, 'text/plain'],
            "Authorization": "Barer TEST_TOKEN",
            "Content-Type": "application/json"
        });
        headers.append('content-type', 'text/plain')
        expect(headers.get('Accept')).toStrictEqual("application/json, text/plain");
        expect(headers.get('Authorization')).toStrictEqual("Barer TEST_TOKEN");
        expect(headers.get(CONTENT_TYPE_KEY)).toStrictEqual('application/json');
    });
    it('try to get an header should be case-insensitive', function () {
        const headers = new HttpHeaders();
        headers.append(CONTENT_TYPE_KEY, APPLICATION_JSON_VALUE);
        expect(headers.get('content-type')).toBeTruthy();
        expect(headers.get('Content-TYPE')).toBeTruthy();
        expect(headers.get('CONTENT-TYPE')).toBeTruthy();
        expect(headers.get('cOnteNT-TyPe')).toBeTruthy();
    });
    it('should save a copy of the original header', function () {
        const headers = new HttpHeaders();
        const headerKey = CONTENT_TYPE_KEY;
        const headerValue = APPLICATION_JSON_VALUE;
        headers.set(headerKey, headerValue);
        const rawHeader = headers.getRawHeader(headerKey);
        expect(rawHeader).toBeTruthy();
        expect(rawHeader!.lower).toStrictEqual(headerKey.toLowerCase());
        expect(rawHeader!.original).toStrictEqual(headerKey);
        expect(rawHeader!.values).toStrictEqual(headerValue);
    });
});
