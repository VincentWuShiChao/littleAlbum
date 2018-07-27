/**
 * Created by Danny on 2015/9/22 15:30.
 */
var file = require("../models/file.js");
var formidable = require('formidable');
var path = require("path");
var fs = require("fs");
var adm_zip=require('adm-zip');
//首页
exports.showIndex = function(req,res,next){
    //错误的：传统思维，不是node的思维：
    //res.render("index",{
    //    "albums" : file.getAllAlbums()
    //});

    //这就是Node.js的编程思维，就是所有的东西，都是异步的
    //所以，内层函数，不是return回来东西，而是调用高层函数提供的
    //回调函数。把数据当做回调函数的参数来使用。
    file.getAllAlbums(function(err,allAlabums){
        //err是字符串
        if(err){
            next(); //交给下面适合他的中间件
            return;
        }
        res.render("index",{
            "albums" : allAlabums
        });
    })
}

//相册页
exports.showAlbum = function(req,res,next){
    //遍历相册中的所有图片
    var albumName = req.params.albumName;
    //具体业务交给model
    file.getAllImagesByAlbumName(albumName,function(err,imagesArray){
        if(err){
            next(); //交给下面的中间件
            return;
        }
        res.render("album",{
            "albumname" : albumName,
            "images" : imagesArray
        });
    });
};

//显示上传
exports.showUp = function(req,res,next){
    //命令file模块（我们自己写的函数）调用getAllAlbums函数
    //得到所有文件夹名字之后做的事情，写在回调函数里面
    file.getAllAlbums(function(err,albums){
        res.render("up",{
            albums : albums
        });
    });
};
exports.unzip= function (req,res,next) {
    console.log("解压中");
    unZip(function () {
        console.log("解压完成");
    });
    res.send("解压完成");
}
//上传表单
exports.doPost = function(req,res,next){
    var form = new formidable.IncomingForm();

    form.uploadDir = path.normalize(__dirname + "/../tempup/");

    form.parse(req, function(err, fields, files,next) {
        console.log("文件夹：",fields);
        console.log("文件：",files);
        //改名
        if(err){
            next();     //这个中间件不受理这个请求了，往下走
            return;
        }
        var extname = path.extname(files.tupian.name);
        if(extname!=".zip"){
            res.send("必须为zip文件");
            return;
        }
        file.getAllImagesByAlbumName("zip",function(err,imagesArray){
            if(err){
                next(); //交给下面的中间件
                return;
            }
            console.log("imagesArray:",imagesArray);

            var has_wenjian=false;
			var tag="";
            for(var i=0;i<imagesArray.length;i++){
                if(imagesArray[i]===files.tupian.name){
                    has_wenjian=true;
					tag=imagesArray[i];
                    break;
                }
            }
            if(has_wenjian){
                fs.unlinkSync(__dirname + "/../uploads/zip"  + "/" + tag);
                res.send("存在此文件,并删除了，可以再次上传");
            }else {
                var wenjianjia = fields.wenjianjia;
                var oldpath = files.tupian.path ;
                var newpath = path.normalize(__dirname + "/../uploads/" + wenjianjia + "/" + files.tupian.name);
                fs.rename(oldpath,newpath,function(err){
                    if(err){
                        res.send("改名失败");
                        return;
                    }
                    unZip(files.tupian.name,function () {
                        console.log("解压完成");
                    });
                    res.send("解压完成");
                    //res.send("成功");
                });
            }
        });


    });
};
exports.download= function (req,res,next) {
    console.log("download");
    var path=__dirname+"/../uploads/小狗/mongoose_test(mongoose).rar";
    var f=fs.createReadStream(path);
    res.writeHead(200, {
        'Content-Type': 'application/force-download',
        'Content-Disposition': 'attachment; filename=mongoose_test(mongoose).rar'
    });
    console.log(f);
    f.pipe(res);
};
function unZip(name,callback){
    var unzip=new adm_zip(__dirname+"/../uploads/zip/"+name);
    unzip.extractAllTo("/root/project/h1v1_wenjian/",true);
    callback();
}
