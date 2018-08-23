window.onload = function() {
    if (localStorage.ftpHostName && localStorage.ftpUserName && localStorage.ftpPassWord && localStorage.ftpArticleDirectory) {
        var Client = require('ftp');
        var c = new Client();
        c.connect({
            host: localStorage.ftpHostName,
            port: 21, //portが21の場合は省略可能
            user: localStorage.ftpUserName,
            password: localStorage.ftpPassWord
        })

        c.on('ready', function() {
            c.cwd(localStorage.ftpArticleDirectory, function(err, currentDir) {
                if (err) throw err;
                c.list(function(err, list) {
                    document.getElementById("list").innerHTML = "";
                    for (var i = 0; i < list.length; i++) {
                        if (list[i].type !== "d") {
                            var elem = document.createElement("a");
                            elem.innerHTML = list[i].name;
                            elem.href = "javascript:void(0)";
                            elem.className = "file";
                            elem.onclick = new Function('go("' + list[i].name + '")');
                            document.getElementById("list").appendChild(elem);
                            moveToList();
                        }
                    };
                });
            });
        });

        c.on('error', function(err) {
            alert(err);
        })

        c.on('greeting', function(message) {
            console.log(message);
        })
    } else {
        moveToSetting();
    }
}

function go(s) {
    var fs = require("fs");
    var Client = require('ftp');
    var c = new Client();
    c.connect({
        host: localStorage.ftpHostName,
        port: 21, //portが21の場合は省略可能
        user: localStorage.ftpUserName,
        password: localStorage.ftpPassWord
    })

    c.get(localStorage.ftpArticleDirectory + s, function(err, stream) {
        if (err) throw err;
        stream.once('close', function() {
            c.end();
        });
        stream.pipe(fs.createWriteStream('edit/' + s));
        fs.readFile('edit/' + s, 'utf8', function(err, text) {
            document.getElementById("editor").value = text;
            document.getElementById("fileInfo").innerHTML = s + "を編集中"
            nowEditFile = s;
			document.getElementById("articleName").value = s;
            moveToEdit();
        });
    });
}

function moveToEdit() {
    document.getElementById("edit").style.display = "block";
    document.getElementById("list").style.display = document.getElementById("setting").style.display = "none";
    document.getElementById("menuEdit").className = "menuLink selected";
    document.getElementById("menuList").className = document.getElementById("menuSetting").className = "menuLink noselected";
}

function moveToSetting() {
    document.getElementById("setting").style.display = "block";
    document.getElementById("list").style.display = document.getElementById("edit").style.display = "none";
    document.getElementById("menuSetting").className = "menuLink selected";
    document.getElementById("menuList").className = document.getElementById("menuEdit").className = "menuLink noselected";
    if (localStorage.ftpHostName && localStorage.ftpUserName && localStorage.ftpPassWord && localStorage.ftpArticleDirectory) {
        document.getElementById("ftpHostName").value = localStorage.ftpHostName;
        document.getElementById("ftpUserName").value = localStorage.ftpUserName;
        document.getElementById("ftpPassWord").value = localStorage.ftpPassWord;
        document.getElementById("ftpDirectory").value = localStorage.ftpArticleDirectory;
    }
}

function moveToList() {
    document.getElementById("list").style.display = "block";
    document.getElementById("setting").style.display = document.getElementById("edit").style.display = "none";
    document.getElementById("menuList").className = "menuLink selected";
    document.getElementById("menuEdit").className = document.getElementById("menuSetting").className = "menuLink noselected";
}

function ftpSetSave() {
    if (document.getElementById("ftpHostName").value !== "" &&
        document.getElementById("ftpUserName").value !== "" &&
        document.getElementById("ftpPassWord").value !== "" &&
        document.getElementById("ftpDirectory").value !== "") {
        localStorage.ftpHostName = document.getElementById("ftpHostName").value;
        localStorage.ftpUserName = document.getElementById("ftpUserName").value;
        localStorage.ftpPassWord = document.getElementById("ftpPassWord").value;
        if (document.getElementById("ftpDirectory").value.slice(-1) == "/") {
            localStorage.ftpArticleDirectory = document.getElementById("ftpDirectory").value;
        } else {
            localStorage.ftpArticleDirectory = document.getElementById("ftpDirectory").value + "/";
        }

        var Client = require('ftp');
        var c = new Client();
        c.connect({
            host: localStorage.ftpHostName,
            port: 21, //portが21の場合は省略可能
            user: localStorage.ftpUserName,
            password: localStorage.ftpPassWord
        })

        c.on('ready', function() {
            c.cwd(localStorage.ftpArticleDirectory, function(err, currentDir) {
                if (err) throw err;
                c.list(function(err, list) {
                    document.getElementById("list").innerHTML = "";
                    for (var i = 0; i < list.length; i++) {
                        if (list[i].type !== "d") {
                            var elem = document.createElement("a");
                            elem.innerHTML = list[i].name;
                            elem.href = "javascript:void(0)";
                            elem.className = "file";
                            elem.onclick = new Function('go("' + list[i].name + '")');
                            document.getElementById("list").appendChild(elem);
                        }
                    };
                });
            });
        });

        c.on('error', function(err) {
            alert(err);
        })

        c.on('greeting', function(message) {
            console.log(message);
        })
    } else {
        alert("入力されていない項目があります");
    }
}

function fileSaveAndUpload() {
    if (document.getElementById("articleName").value !=="") {
        writeFile("edit/" + document.getElementById("articleName").value, document.getElementById("editor").value);
		nowEditFile = document.getElementById("articleName").value;
        var Client = require('ftp');
        var c = new Client();
        c.connect({
            host: localStorage.ftpHostName,
            port: 21, //portが21の場合は省略可能
            user: localStorage.ftpUserName,
            password: localStorage.ftpPassWord
        });
        c.on('ready', function() {
            c.put('edit/' + nowEditFile, localStorage.ftpArticleDirectory + nowEditFile, function(err) {
                if (err) throw err;
                c.end();
            });
        });
		moveToList();
		window.setTimeout(function(){
		updateList();
		},1500);

    } else {
        alert("ファイル名が設定されていないため、この操作は実行できません")
    }
}

function writeFile(path, data) {
    var fs = require('fs');
    fs.writeFile(path, data, function(err) {
        if (err) {
            throw err;
        }
    });
}
function newArticle(){
     document.getElementById("fileInfo").innerHTML = "新しいファイルを編集中";
	 nowEditFile = undefined;
	 document.getElementById("editor").value = "";
	 document.getElementById("articleName").value = "";
     moveToEdit();
		
}
function updateList(){
    if (localStorage.ftpHostName && localStorage.ftpUserName && localStorage.ftpPassWord && localStorage.ftpArticleDirectory) {
        var Client = require('ftp');
        var c = new Client();
        c.connect({
            host: localStorage.ftpHostName,
            port: 21, //portが21の場合は省略可能
            user: localStorage.ftpUserName,
            password: localStorage.ftpPassWord
        })

        c.on('ready', function() {
            c.cwd(localStorage.ftpArticleDirectory, function(err, currentDir) {
                if (err) throw err;
                c.list(function(err, list) {
                    document.getElementById("list").innerHTML = "";
                    for (var i = 0; i < list.length; i++) {
                        if (list[i].type !== "d") {
                            var elem = document.createElement("a");
                            elem.innerHTML = list[i].name;
                            elem.href = "javascript:void(0)";
                            elem.className = "file";
                            elem.onclick = new Function('go("' + list[i].name + '")');
                            document.getElementById("list").appendChild(elem);
                            moveToList();
                        }
                    };
                });
            });
        });

        c.on('error', function(err) {
            alert(err);
        })

        c.on('greeting', function(message) {
            console.log(message);
        })
}
}