// tslint:disable:no-string-literal

import { RxHR as client } from "@akanass/rx-http-request";
import { Observable, Subject, ReplaySubject, of } from "rxjs";
import { delay, switchMap, map } from "rxjs/operators";

// ------------------------------------------------------

export interface Token {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface BasicAuth {
  client_id: string;
  client_secret: string;
}

export interface EndpointInfo {
  tokenEndpoint: string;
  basicAuth?: BasicAuth;
}

export interface GetTokenOpts {
  scope: string;
}

/**
 * Continue get token after start.
 * OAuth2 client credentials flow
 */
export class OAuth2ClientCredentialsFlow {
  public readonly token$: Subject<Token> = new ReplaySubject(1);
  public token?: Token;

  constructor(public creds: EndpointInfo) { }

  public start(opts: GetTokenOpts): Observable<Token> {
    this.token$
      .pipe(
        switchMap((token) => of(token).pipe(delay((token.expires_in - 60) * 1000))),
        switchMap((token) => OAuth2ClientCredentialsFlow.getToken$({ ...this.creds, ...opts })),
      )
      .subscribe((token) => {
        this.token = token;
        this.token$.next(token);
      });

    OAuth2ClientCredentialsFlow.getToken$({ ...this.creds, ...opts })
      .subscribe((token) => {
        this.token = token;
        this.token$.next(token);
      });

    return this.token$;
  }

  public end() {
    this.token$.complete();
  }

  public static getHeaders(opts?: BasicAuth): { [x: string]: string } {
    const headers: any = {
      "Content-Type": "application/json",
      "Accept": "application/json",
    };

    if (opts) {
      headers["Authorization"] = `Basic ${new Buffer(opts.client_id + ":" + opts.client_secret).toString("base64")}`;
    }

    return headers;
  }

  public static getToken$(opts: EndpointInfo & GetTokenOpts): Observable<Token> {
    const headers = OAuth2ClientCredentialsFlow.getHeaders(opts.basicAuth);

    const body = {
      grant_type: "client_credentials",
      scope: opts.scope,
    };

    return client.post(opts.tokenEndpoint, { headers, json: true, body }).pipe(map((res) => res.body));
  }
}
