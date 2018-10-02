// tslint:disable:no-unused-expression
import { doSomething, ILogger, setLogger } from "./jest-test";

// ------------------------------------------------------------------------------------------------

describe("jest-test", () => {
  let loggerMock: ILogger;

  describe("doSomething()", () => {
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

    it("should do something good", () => {
      // arrage
      const expected = 12345;

      // act
      const actual = doSomething("12345");

      // assert
      expect(expected).toBe(actual);
    });
  });
});
