# HTTP Client

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)

A lightweight, zero-dependency HTTP client for JavaScript and TypeScript applications with powerful request and response interceptors.

## Features

-   **Zero External Dependencies** - Built entirely with native browser APIs
-   **Cross-Browser Compatibility** - Automatically uses `fetch()` API when available, falls back to `XMLHttpRequest` for older browsers
-   **Request/Response Converters** - Powerful middleware system to transform requests and responses
-   **TypeScript Support** - Full type definitions included
-   **Promise-Based API** - Modern, clean syntax with async/await support

## Quick Start

```typescript
import { HttpClientBuilder } from "http-client";

// Create a new HTTP client
const client = new HttpClientBuilder().build();

// Make a simple GET request
client
    .get("https://api.example.com/data")
    .then((response) => {
        console.log(response.body);
    })
    .catch((error) => {
        console.error("Request failed:", error);
    });

// Using async/await
async function fetchData() {
    try {
        const response = await client.get("https://api.example.com/data");
        return response.body;
    } catch (error) {
        console.error("Request failed:", error);
    }
}
```

## API Reference

### HttpClientBuilder

The builder pattern makes it easy to configure your client with various options:

```typescript
import { HttpClientBuilder } from "http-client";

const client = new HttpClientBuilder()
    .withHeaders({
        "Content-Type": "application/json",
        Accept: "application/json",
    })
    .withAuthToken("Bearer your-auth-token")
    .withRequestConverter(myRequestConverter)
    .withResponseConverter(myResponseConverter)
    .build();
```

### HTTP Methods

The client supports all standard HTTP methods:

```typescript
// GET request
client.get("https://api.example.com/users");

// POST request with data
client.post("https://api.example.com/users", {
    name: "John Doe",
    email: "john@example.com",
});

// PUT request
client.put("https://api.example.com/users/123", {
    name: "John Updated",
});

// DELETE request
client.delete("https://api.example.com/users/123");
```

### Request Converters

Request converters allow you to intercept and modify requests before they are sent:

```typescript
import { IRequestConverter } from "http-client";

class LoggingRequestConverter implements IRequestConverter {
    convert(request) {
        console.log("Sending request:", request.method, request.url);
        return request;
    }
}

// Add to client
client.addRequestConverter(new LoggingRequestConverter());
```

### Response Converters

Response converters let you transform or process responses:

```typescript
import { IResponseConverter } from "http-client";

class ErrorHandlingConverter implements IResponseConverter {
    convert(response) {
        if (response.status >= 400) {
            // Add custom error handling
            console.error("API Error:", response.body);
        }
        return response;
    }
}

// Add to client
client.addResponseConverter(new ErrorHandlingConverter());
```

### Custom Requests

For more complex scenarios, you can create custom request objects:

```typescript
import { HttpRequest } from "http-client";

const request = new HttpRequest(
    "POST",
    "https://api.example.com/upload",
    new Blob([fileData], { type: "application/octet-stream" }),
    {
        "Content-Type": "application/octet-stream",
        "X-Custom-Header": "custom-value",
    }
);

// Send the custom request
client.send(request).then((response) => {
    console.log("Upload complete:", response.body);
});
```

## Browser Compatibility

The HTTP Client automatically detects browser capabilities:

-   In modern browsers, it uses the Fetch API for better performance and features
-   In older browsers, it falls back to XMLHttpRequest for maximum compatibility

No additional polyfills are needed - everything works out of the box.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
