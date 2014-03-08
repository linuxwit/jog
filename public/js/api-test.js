//api
var data={
    'title':'跑步打卡',
    'content':'今天我跑了10公里花了一个小时，感觉很舒服！！！',
    'type':'word',
    'source':''
}
$.post('/api/post',data,function(res){
    console.log(res);
})

$.get('/api/post',function(res){
    console.log(res);
})