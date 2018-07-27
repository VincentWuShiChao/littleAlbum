var express = require("express");
var app = express();
//控制器
var router = require("./controller");
var http=require("http");
//设置模板引擎
app.set("view engine", "ejs");

//路由中间件，静态页面
app.use(express.static("./public"));
app.use(express.static("./uploads"));
//首页
app.get("/unZip",router.unzip);
app.get("/index", router.showIndex);
app.get("/:albumName", router.showAlbum);
app.get("/up", router.showUp);
app.post("/up", router.doPost);
app.get("/download",router.download);

//404
app.use(function (req, res) {
    res.render("err");
});

http.createServer(app).listen(3000,"0.0.0.0",function(){
	console.log("open");
});