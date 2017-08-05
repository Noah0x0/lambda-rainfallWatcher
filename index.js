'use strict';

const request = require('request-promise');
const iconv = require('iconv-lite');
const Promise = require('bluebird');
const csv=require('csvtojson')

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
        return iconv.decode(new Buffer(body, 'binary'), "SHIFT_JIS"); //作成したバッファを使い、iconv-liteでShift-jisからutf8に変換
    });
    csv({noheader:true})
    .fromString(data)
    .on('csv',(csvRow)=>{
        if (csvRow[0] == 56227) {
            console.log(csvRow);
        }
    })
    .on('done',()=>{
      console.log("end");
        //parsing finished
    })

    // TODO implement
    callback(null, 'Hello from Lambda');
};
