# Http-Client 
An easy and zero dependencies promise based http-client with Request and Response Converters.

## TODO:
- [x] Browser support.
- [x] HttpRequest Converter.
- [x] HttpResponse Converter.
- [ ] Github CI/CD.
- [ ] Node support.

> :warning: This project is not completely finished yet.

## Usage ##

Simple Http GET request:
```ts
const response = await httpClient().get('https://yoururl:someport');
```

Simple Http POST request:
```ts
const response = await httpClient().post('https://yoururl:someport/post', {value: 1});
```

Http POST request with custom headers that expect a response body as plain text (by default http responses are treated as `application/json`):
```ts
const response = await httpClient().post('https://yoururl/post', {value: 1}, {
    'Accept': '*/*'
}, 'text');
```

Fully customizable HttpRequest:
```ts
const res = httpClient().send(new HttpRequest<ICarsDto>('PUT', 'https://yoururl/updateCars', somebody));
```