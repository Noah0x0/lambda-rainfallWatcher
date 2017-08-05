'use strict';

const request = require('request-promise');
const iconv = require('iconv-lite');
const Promise = require('bluebird');

module.exports.handler = (event, context, callback) => {
    return Promise.coroutine(processEvent)(event, context, callback);
}

function *processEvent(event, context, callback) {
    const REQ_URL =  "http://www.data.jma.go.jp/obd/stats/data/mdrr/pre_rct/alltable/pre1h00_rct.csv";

    const options = {
        url: REQ_URL,
        // あとからSHIFT_JISから変換する必要があるため
        encoding: null
    }

    const data = yield request(options).then(function (body) {
        var buf    = new Buffer(body, 'binary');     //バイナリバッファを一時的に作成する
        return iconv.decode(buf, "SHIFT_JIS"); //作成したバッファを使い、iconv-liteでShift-jisからutf8に変換
    });
    console.log(data);
    // TODO implement
    callback(null, 'Hello from Lambda');
};
