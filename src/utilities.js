var pinyinize = require("pinyinize");

export const convert_pinyin = (pinyin) => {
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

export const numberWithCommas = (x) => {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};
