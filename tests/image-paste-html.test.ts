// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { collectPlainImageSrcsFromHtml } from "../src/renderer/utils/text";

describe("collectPlainImageSrcsFromHtml", () => {
  it("空壳包裹的纯图片剪贴板提取 src（空行残留回归）", () => {
    expect(collectPlainImageSrcsFromHtml('<p><img src="a.png"></p>')).toEqual(["a.png"]);
    expect(collectPlainImageSrcsFromHtml('<br><img src="a.png">')).toEqual(["a.png"]);
    expect(collectPlainImageSrcsFromHtml('<div><img src="a.png"><br></div>')).toEqual(["a.png"]);
    expect(collectPlainImageSrcsFromHtml('<img src="a.png"><img src="b.png">')).toEqual(["a.png", "b.png"]);
    expect(collectPlainImageSrcsFromHtml('<p><img src="a.png" alt="截图"></p>')).toEqual(["a.png"]);
  });

  it("图文混排或无图片时返回空，交给默认解析", () => {
    expect(collectPlainImageSrcsFromHtml('<p>文字</p><img src="a.png">')).toEqual([]);
    expect(collectPlainImageSrcsFromHtml("<p>没有图片</p>")).toEqual([]);
    expect(collectPlainImageSrcsFromHtml("")).toEqual([]);
    expect(collectPlainImageSrcsFromHtml('<img src="">')).toEqual([]);
  });
});
