var pinyinize = require("pinyinize");

export const convertPinyin = (pinyin) => {
  if (!pinyin) {
    return "";
  }
  pinyin = pinyin.toLowerCase();
  if (pinyin.substr(-1) === "5") {
    return pinyin.substring(0, pinyin.length - 1);
  } else {
    return pinyinize(pinyin);
  }
};

export const convertMultiplePinyin = (pinyin) => {
  return pinyin
    .split(" ")
    .map((x) => convertPinyin(x))
    .join(" ");
};

export const numberWithCommas = (x) => {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export const removeDuplicates = (arr) => {
  let unique = arr.reduce(function (a, b) {
    if (a.indexOf(b) < 0) a.push(b);
    return a;
  }, []);
  return unique;
};
