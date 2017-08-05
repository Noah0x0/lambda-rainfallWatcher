'use strict';

const request = require('request-promise');
const iconv = require('iconv-lite');
const promise = require('bluebird');
const aws = require('aws-sdk');
const csv = require('csvtojson');
const s3 = new aws.S3({ apiVersion: '2006-03-01' });

module.exports.handler = (event, context, callback) => {
    return promise.coroutine(processEvent)(event, context, callback);
}

function *processEvent(event, context, callback) {
    const url = "http://www.data.jma.go.jp/obd/stats/data/mdrr/pre_rct/alltable/pre1h00_rct.csv";

    const options = {
        url: url,
        // あとからSHIFT_JISから変換する必要があるため
        encoding: null
    };

    const data = yield request(options).then(function (body) {
        return iconv.decode(new Buffer(body, 'binary'), "SHIFT_JIS"); //作成したバッファを使い、iconv-liteでShift-jisからutf8に変換
    });

    csv().fromString(data).on('json',(jsonObj)=>{
        // 金沢市のみのデータ取得
        const kanazawa = 56227;
        if (jsonObj['観測所番号'] == kanazawa) {
            // TODO ファイル名の同意
            const fileName = 'kanazawa.json';
            const params = {
                Bucket: process.env.S3_BUCKET,
                Key: fileName,
                Body: JSON.stringify(jsonObj),
                ContentType: 'application/json'
            };

            let putObjectPromise = s3.putObject(params).promise();
            putObjectPromise.then(function(data) {
                console.log('Success');
            }).catch(function(err) {
                console.log(err);
            });
        }
    });
};
