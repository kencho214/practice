// -----------------------------------------------------
// type resolver for http-shutdown

export interface ILogger {
  info(message?: any, ...optionalParams: any[]): void;
  debug(message?: any, ...optionalParams: any[]): void;
  trace(message?: any, ...optionalParams: any[]): void;
  error(message?: any, ...optionalParams: any[]): void;
  warn(message?: any, ...optionalParams: any[]): void;
}

export const externals: {
  logger: ILogger,
} = {
  logger: console,
};

export function setLogger(logger: ILogger): ILogger {
  externals.logger = logger;
  return logger;
}

export function doSomething(num: string): number {
  return parseInt(num, 10);
}
