// tslint:disable:no-string-literal

import { RxHR as client } from "@akanass/rx-http-request";
import { Observable, Subject, ReplaySubject, of } from "rxjs";
import { delay, switchMap, map, catchError } from "rxjs/operators";

// ------------------------------------------------------

export interface Token {
  access_token: string;
  id_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface BasicAuth {
  clientid: string;
  secret: string;
}

export interface EndpointInfo {
  tokenEndpoint: string;
  basicAuth?: BasicAuth;
}

export interface GetTokenOpts {
  username: string;
  password: string;
  scope: string;
}

export interface RefreshTokenOpts {
  refresh_token: string;
}

/**
 * Continue refresh token after start.
 * OAuth2 password flow
 */
export class OAuth2PasswordFlow {
  public readonly token$: Subject<Token> = new ReplaySubject(1);
  public token?: Token;

  constructor(public creds: EndpointInfo) { }

  public start(opts: GetTokenOpts): Observable<Token> {
    this.token$
      .pipe(
        switchMap((token) => of(token).pipe(delay((token.expires_in - 60) * 1000))),
        switchMap((token) => OAuth2PasswordFlow.refreshToken$({ ...this.creds, ...token }).pipe(
          catchError((e) => OAuth2PasswordFlow.getToken$({ ...this.creds, ...opts })),
        )),
      )
      .subscribe((token) => {
        this.token = token;
        this.token$.next(token);
      });

    OAuth2PasswordFlow.getToken$({ ...this.creds, ...opts }).subscribe(
      (token) => {
        console.info(JSON.stringify(token, null, 2));
        this.token = token;
        this.token$.next(token);
      },
    );

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
      headers["Authorization"] = `Basic ${new Buffer(opts.clientid + ":" + opts.secret).toString("base64")}`;
    }

    return headers;
  }

  public static refreshToken$(opts: EndpointInfo & RefreshTokenOpts): Observable<Token> {
    const headers = OAuth2PasswordFlow.getHeaders(opts.basicAuth);

    const body = {
      grant_type: "refresh_token",
      refresh_token: opts.refresh_token,
    };

    return client.post(opts.tokenEndpoint, { headers, json: true, body }).pipe(map((res) => res.body));
  }

  public static getToken$(opts: EndpointInfo & GetTokenOpts): Observable<Token> {
    const headers = OAuth2PasswordFlow.getHeaders(opts.basicAuth);

    const body = {
      grant_type: "password",
      username: opts.username,
      password: opts.password,
      scope: opts.scope,
    };

    return client.post(opts.tokenEndpoint, { headers, json: true, body }).pipe(map((res) => res.body));
  }
}
