

const { axios } = require("./axios");
const R = require('ramda')
const qs = require('qs')
const moment = require('moment')
const lib = require('./lib')
const { rtxMsg } = require('./db')

/**
 * 返回用户可执行的函数，此处引用多个函数，在str中可直接引用
 * @param {*} str 代码片断
 * @returns 可执行函数
 */
const getFn = (str = 'return data') => eval(`data=>{
    ${str}
}
`)


module.exports.getFn = getFn