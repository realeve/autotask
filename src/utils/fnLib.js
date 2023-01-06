

const { axios } = require("./axios");
const R = require('ramda')
const qs = require('qs')
const moment = require('moment')
const lib = require('./lib')

const getFn = (str = 'return data') => eval(`data=>{
    ${str}
}
`)


module.exports.getFn = getFn