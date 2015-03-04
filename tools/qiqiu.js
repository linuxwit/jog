var qiniu = require('node-qiniu');
var fs = require('fs');
qiniu.config({
	access_key: 'YG9uh4iBBLoeX20AeoAZKQIctJjn0fdH5UXoPNkC',
	secret_key: 'lZAgNj8yCY_TmcPbcX4fPHPqB-Zg1h7IlaOyZpcb'
});
var imagesBucket = qiniu.bucket('lovejog');
console.log(Date.now());
key = 1;
var imgurl = 'http://mmbiz.qpic.cn/mmbiz/1t1YEsZic0qTmWO13sic1U1icOn8g2sVy4h8AP63MVbbGB75BSqKtic6HIZ563xJmB2POt5ZF7lmv8ApgKLoVurVew/0';



function uploadFile(key,imgurl) {
	var request = require('request');
	request(imgurl).pipe(fs.createWriteStream(key + "")).on('finish', function(data) {
		imagesBucket.putFile(key, key + "")
			.then(
				function(reply) {
					// 上传成功
					console.dir(reply);
				},
				function(err) {
					// 上传失败
					console.error(err);
				}
			);
	});
}


function p(key, imgurl) {
	var puttingStream = imagesBucket.createPutStream(key);
	var request = require('request');
	request(imgurl).pipe(puttingStream)
		.on('error', function(err) {
			console.log('同步失败');
			console.log(err);
		})
		.on('end', function(data) {
			console.log('end');
			console.log(data);
		});
}

function p2(key, img) {
	var puttingStream = imagesBucket.createPutStream(key);
	var readingStream = fs.createReadStream(img);
	readingStream.pipe(readingStream)
		.on('error', function(err) {
			console.log('出错');
			console.error(err);
		})
		.on('end', function(reply) {
			console.dir(reply);
		});
}

//p2(14, 'test.png');
//p(15, imgurl);
//
uploadFile(17, imgurl);