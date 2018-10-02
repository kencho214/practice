// tslint:disable:no-unused-expression
import { doSomething, ILogger, setLogger } from "./jest-test";

// ------------------------------------------------------------------------------------------------

describe("doSomething()", () => {
  let loggerMock: ILogger;

  describe("addGracefulShutdown()", () => {
    beforeEach(() => {
      loggerMock = {
        info: jest.fn(),
        debug: jest.fn(),
        trace: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
      };
      setLogger(loggerMock);
    });

    it("should call httpShutdown", () => {
      // arrage
      const expected = 12345;

      // act
      const actual = doSomething("12345");

      // assert
      expect(expected).toBe(actual);
    });
  });
});
