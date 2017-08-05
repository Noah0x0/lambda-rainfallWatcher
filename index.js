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
    const data = yield requestRainFall();

    csv().fromString(data).on('json',(jsonObj)=>{
        // 金沢市のみのデータ取得
        const kanazawa = '56227';
        if (jsonObj['観測所番号'] === kanazawa) {

            putS3(jsonObj)
                .then(() => {
                    callback(nil, 'success');
                })
                .catch((err) => {
                    console.log(err.stack);
                    callback(err);
                });
        }
    });
};

function requestRainFall() {
    const url = "http://www.data.jma.go.jp/obd/stats/data/mdrr/pre_rct/alltable/pre1h00_rct.csv";
    const options = {
        url: url,
        // あとからSHIFT_JISから変換する必要があるため
        encoding: null
    };

    return request(options).then(function (body) {
        return iconv.decode(new Buffer(body, 'binary'), "SHIFT_JIS"); //作成したバッファを使い、iconv-liteでShift-jisからutf8に変換
    });
}

function putS3(jsonObj) {
    // TODO ファイル名の同意
    const fileName = 'kanazawa.json';
    const params = {
        Bucket: process.env.S3_BUCKET,
        Key: fileName,
        Body: JSON.stringify(jsonObj),
        ContentType: 'application/json'
    };

    return s3.putObject(params).promise();
}
