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

    });


}

exports.notify=function(post){
    var deleteUrl='http://www.lovejog.com/edit/'+post.wx_openid+'/'+post._id;

    var content;
    if (post.content){
        content=post.content+'<br/>'
    }else{
        content+='<img src="'+post.wx_imge_url+'" /><br/>';
    }
    content+='<a href="'+deleteUrl+'">查看</a>';

    console.log(content);

    this.send(
        '有新发布！',
        content,
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