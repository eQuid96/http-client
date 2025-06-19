import { hashCode } from "./utils";

export enum CommonHeaders {
  Accept = "Accept",
  AcceptCharset = "Accept-Charset",
  AcceptEncoding = "Accept-Encoding",
  AcceptLanguage = "Accept-Language",
  AcceptDateTime = "Accept-Datetime",
  AccessControlRequestMethod = "Access-Control-Request-Method",
  AccessControlRequestHeaders = "Access-Control-Request-Headers",
  Authorization = "Authorization",
  CacheControl = "Cache-Control",
  Connection = "Connection",
  ContentLenght = "Content-Length",
  ContentType = "Content-Type",
  Cookie = "Cookie",
  Date = "Date",
  Expect = "Expect",
  Forwarded = "Forwarded",
  From = "From",
  Host = "Host",
  IfMatch = "If-Match",
  IfModiedSince = "If-Modified-Since",
  IfNoneMatch = "If-None-Match",
  IfRange = "If-Range",
  InUnmodifiedSince = "If-Unmodified-Since",
  MaxForwards = "Max-Forwards",
  Origin = "Origin",
  Pragma = "Pragma",
  ProxyAuthorization = "Proxy-Authorization",
  Tange = "Range",
  Referer = "Referer",
  TE = "TE",
  UserAgent = "User-Agent",
  Upgrade = "Upgrade",
  Via = "Via",
  Warning = "Warning",
  XRequestedWith = "X-Requested-With",
  XCSRFToken = "X-CSRF-Token",
}

export type HttpHeadersLazy = {
  [key: string]: string | string[];
};

interface IHttpHeader {
  /**
   * Lower-Case form of the HTTP Header key.
   */
  lower: string;
  /**
   * Original copy of the HTTP Header key.
   */
  original: string;
  values: string | string[];
}

export class HttpHeaders {
  //Headers are stored by their lower-case key hash.
  private readonly headers = new Map<number, IHttpHeader>();
  constructor(lazyHeaders?: HttpHeadersLazy) {
    if (lazyHeaders) {
      this.from(lazyHeaders);
    }
  }

  public has(key: string) {
    return this.headers.has(this.getHashCode(key));
  }

  /**
   * Return the actual value of the specified HTTP Header.
   * @param key Header key
   */
  public get(key: string) {
    const header = this.headers.get(this.getHashCode(key));
    if (header) {
      return this.combine(header.values);
    }
    return null;
  }

  public getRawHeader(key: string) {
    return this.headers.get(this.getHashCode(key));
  }

  /**
   * Append an item to the actual header's list without substitute an existing one.
   * @param header
   * @param values
   */
  public append(header: string, values: string | string[]) {
    if (this.has(header)) {
      return;
    }
    this.set(header, values);
  }

  /**
   * Add an item to the actual header's list.
   * If the header already has been set it will replace with the new one.
   * @param key
   * @param values
   */
  public set(key: string, values: string | string[]) {
    const lowerCase = key.toLowerCase();
    const headers: IHttpHeader = {
      lower: lowerCase,
      original: key,
      values: values,
    };
    this.headers.set(hashCode(lowerCase), headers);
  }

  public foreach(fn: (key: string, value: string) => void) {
    this.headers.forEach((header, key) => {
      fn(header.lower, this.combine(header.values));
    });
  }

  public from(headers: HttpHeadersLazy) {
    Object.keys(headers).map((key) => {
      const values = headers[key];
      this.set(key, values);
    });
  }

  private combine(values: string | string[]) {
    if (Array.isArray(values)) {
      return values.join(", ");
    }
    return values;
  }

  private getHashCode(key: string) {
    return hashCode(key.toLowerCase());
  }
}
