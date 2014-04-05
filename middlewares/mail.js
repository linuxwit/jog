var nodemailer = require("nodemailer");


exports.send=function(subject,content,from,to){
    var transport = nodemailer.createTransport("SMTP", {
        host: "smtp.exmail.qq.com", // hostname
        secureConnection: true, // use SSL
        port: 465, // port for secure SMTP
        auth: {
            user: "support@lovejog.com",
            pass: "qwert54321"
        }
    });

    messageOptions={
        from: from,
        to: to,
        subject: subject,
        html: content // html body
    };

    transport.sendMail(messageOptions, function(error, response){
        transport.close();

        if(error){
            console.log(error);
            return;
        }
        console.log('send ok');
        // response.statusHandler only applies to 'direct' transport
        response.statusHandler.once("failed", function(data){
            console.log(
                "Permanently failed delivering message to %s with the following response: %s",
                data.domain, data.response);
        });

        response.statusHandler.once("requeue", function(data){
            console.log("Temporarily failed delivering message to %s", data.domain);
        });

        response.statusHandler.once("sent", function(data){
            console.log("Message was accepted by %s", data.domain);
        });
    });


}

exports.notify=function(post){
    var deleteUrl='http://www.lovejog.com/edit/'+post.wx_openid+'/'+post._id;
    this.send(
        '有新发布！',
        '<img src="'+post.wx_imge_url+'" /><br/>post.conent<br/> <a href="'+deleteUrl+'">查看</a>',
        'support@lovejog.com',
        '376300248@qq.com'
    );
}

exports.event=function(message){

    this.send(
        '新事件',
        message.Event,
        'support@lovejog.com',
        '376300248@qq.com'
    );
}