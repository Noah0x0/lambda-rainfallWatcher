'use strict';

const request = require('request-promise');
const iconv = require('iconv-lite');
const promise = require('bluebird');
const moment = require('moment');
const aws = require('aws-sdk');
const csv = require('csvtojson');
const s3 = new aws.S3({ apiVersion: '2006-03-01' });

module.exports.handler = (event, context, callback) => {
    return promise.coroutine(processEvent)(event, context, callback);
};

function *processEvent(event, context, callback) {
    const data = yield requestRainFall();

    csv().fromString(data).on('json',(jsonObj)=>{
        // 金沢市のみのデータ取得
        const kanazawa = '56227';
        if (jsonObj['観測所番号'] === kanazawa) {

            putS3(jsonObj)
                .then(() => {
                    callback(null, 'success');
                    return;
                })
                .catch((err) => {
                    console.log(err.stack);
                    callback(err);
                    return;
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
    const year = jsonObj['現在時刻(年)'];
    const month = jsonObj['現在時刻(月)'];
    const date = jsonObj['現在時刻(日)'];
    const hours = jsonObj['現在時刻(時)'];
    const minutes = jsonObj['現在時刻(分)'];

    const mo = moment(`${year}-${month}-${date}T${hours}:${minutes}:00+09:00`).utc();

    const directory = `rainFall/japan/ishikawa/asano/${mo.format('YYYY')}/${mo.format('MM')}/${mo.format('DD')}/`;
    const fileName = `${mo.format('hh')}:${mo.format('mm')}:00.json`;
    console.log(`${directory}${fileName}`);

    const params = {
        Bucket: process.env.S3_BUCKET,
        Key: `${directory}${fileName}`,
        Body: JSON.stringify({
            timestamp: mo.format(),
            rainFall: jsonObj['現在値(mm)'],
            observation: `${jsonObj['都道府県']}${jsonObj['地点']}`
        }),
        ContentType: 'application/json'
    };

    return s3.putObject(params).promise();
}
