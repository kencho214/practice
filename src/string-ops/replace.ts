import * as yargs from "yargs";

export class Replace {
  public static byLoop(src: string, target: string, toBeReplaced: string[]): string {
    let dest = src;
    const tbr = [...toBeReplaced];
    while (dest.indexOf(target) >= 0) {
      dest = dest.replace(target, tbr.shift() as any);
    }
    return dest;
  }

  public static byReplacer(src: string, target: RegExp, toBeReplaced: string[]): string {
    const tbr = [...toBeReplaced];
    return src.replace(target, () => tbr.shift() as any);
  }

  public static try() {
    const source = "? ? ? ? ? ? ? ?";
    const newStrings = "23456789".split("");

    console.log("-----------------------------------------------------");
    console.log("preset");
    console.log("source string              : " + source);
    console.log("new strings to be replaced : " + newStrings.join(" "));
    console.log("-----------------------------------------------------");
    console.log("result");
    console.log("replace by string key      : " + source.replace("?", "X"));
    console.log("replace loop by string key : " + Replace.byLoop(source, "\?", newStrings));
    console.log("replace by replacer        : " + Replace.byReplacer(source, /\?/g, newStrings));
    console.log("-----------------------------------------------------");
  }
}

// tslint:disable-next-line:no-unused-expression
yargs
  .command("try", "Run sample code", {}, (args) => Replace.try())
  .demandCommand(1)
  .help("h")
  .alias("h", "help")
  .argv;
