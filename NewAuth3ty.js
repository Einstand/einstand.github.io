//需使用 jQuery
//2017/10/29 : 初建立
//2017/12/27 : 加上 NewAu30API.cookie 及 dumpCookieTable
//2017/12/27 : 在 <script> 加上 "data-baseURL" 屬性, 用來指定 NewAu30API.baseURL
//2017/12/31 : 加上 NewAu30API.global
//2018/01/30 : 修改 hello, 若 accountID 為空字串或 null, 就直接攔截, 不必呼叫 aspx
//2018/01/30 : 將單引號字串改為雙引號字串, 以符合 JSLint 的規格
//2018/11/01 : 修改 dumpCookieTable, 修正 subCookie 轉換為 table 時的 BUG
//2018/11/16 : 修改 hello , 由 hello.aspx 改為 NewAuthHello.aspx
//             修改 checkToken, 由 checkToken.aspx 改為 NewAuthCheckToken.aspx
(function() {
    "use strict";
    var NewAu30API = (typeof window === "undefined") ? global.NewAu30API = global.NewAu30API || {} : window.NewAu30API = window.NewAu30API || {};// 這一行在 JSLint 會被視為 Error, 不理它
    NewAu30API.baseURL = "./";

  //- 因為這一段程式是一被載入就立刻執行, 所以最後一個 script 就是這個 script
    var allScripts = document.getElementsByTagName("script");
    var lastScript = allScripts[allScripts.length-1];
    var dataBaseURL=lastScript.getAttribute("data-baseURL");
    if (dataBaseURL)
    {
        NewAu30API.baseURL =dataBaseURL;
    }

    NewAu30API.request=[];
    NewAu30API.cookie=[];
    NewAu30API.global=[];

    var href=window.location.href;
    if (href.indexOf("?")!=-1)
    {
        var hashes = href.slice(href.indexOf("?") + 1).split("&");
        for(var i = 0; i < hashes.length; i++)
        {
            var hash = hashes[i].split("=");
            NewAu30API.request.push(hash[0]);
            NewAu30API.request[hash[0]] = hash[1];
        }
    }

    var cookieNameValueArray = document.cookie.split(";");
    for (var i = 0; i < cookieNameValueArray.length; i++)
    {
        var thisNameValue=cookieNameValueArray[i];
        var p1=thisNameValue.indexOf("=");
        if (p1!=-1)
        {
            var key=thisNameValue.substring(0,p1).trim();
            var val=thisNameValue.substring(p1+1,thisNameValue.length).trim();
            if (val.indexOf("=")==-1)
            {
                NewAu30API.cookie.push(key);
                NewAu30API.cookie[key] = unescape(val);
            }
            else
            {
                var subCookie=[];
                var keyValueArray = val.split("&");
                for (var j = 0; j < keyValueArray.length; j++)
                {
                    var thisKeyValue=keyValueArray[j].split("=");
                    if (thisKeyValue.length==2)
                    {
                        var cName = unescape(thisKeyValue[0].trim());
                        var cValue = unescape(thisKeyValue[1].trim());
                        subCookie.push(cName);
                        subCookie[cName]=cValue;
                    }
                }
                NewAu30API.cookie.push(key);
                NewAu30API.cookie[key] = subCookie;
            }
        }
    }


    NewAu30API.hello=function(accountID,successFunc)
    {
        if (accountID)
        {
            var sUri=this.baseURL+"NewAuthHello.aspx";
            var sUrl=sUri+"?u="+accountID;
            $.ajax(
            {
                url: sUrl,
                xhrFields: {
                    withCredentials: false //暫時
                },
                success: function(result)
                {
                    NewAu30API.helloSuccess(result,accountID);
                    if (successFunc)
                    {
                        successFunc(result);
                    }
                },
                error: function(xhr)
                {
                    alert("hello error : " + sUri+ "\r\n" + xhr.status + " " + xhr.statusText);
                }
            });
        }
        else
        {
            alert("hello error : accountID Missing");
        }
    }

    NewAu30API.helloSuccess=function(result,accountID)
    {
        console.log("helloSuccess");
        console.log(result);
        var check=result.substring(0,accountID.length);
        if (check===accountID)
        {
            var temp=result.substr(accountID.length);
            eval(temp);
        }
        else
        {
            console.log("NewAu30API.helloSuccess return unknown");
        }
    }

    NewAu30API.checkToken=function(sToken,successFunc)
    {
        if (sToken)
        {
            var sUri=this.baseURL+"NewAuthCheckToken.aspx";
            var sUrl=sUri+"?input_token="+sToken;
            $.ajax(
            {
                url: sUrl,
                xhrFields: {
                    withCredentials: true //暫時
                },
                success: function(result)
                {
                    if (successFunc)
                    {
                        successFunc(result);
                    }
                },
                error: function(xhr)
                {
                    alert("checkToken error : " + sUri + "\r\n"+ xhr.status + " " + xhr.statusText);
                }
            });
        }
        else
        {
            alert("checkToken error : sToken Missing");
        }
    }

    NewAu30API.dumpRequestTable=function(selector)
    {
      var row1 = $("<tr bgcolor='#C0C0C0'/>");
      row1.append($("<td colspan=2/>").html("Request"));
      $(selector).append(row1);
      for (var i = 0; i < this.request.length; i++)
      {
        row1 = $("<tr/>");
        var key=this.request[i];
        row1.append($("<td/>").html(key));
        var val=this.request[key];
        row1.append($("<td/>").html(val));
        $(selector).append(row1);
      }
    }

    NewAu30API.dumpCookieTable=function(selector)
    {
      var row1 = $("<tr bgcolor='#C0C0C0'/>");
      row1.append($("<td colspan=2/>").html("Cookie"));
      $(selector).append(row1);
      for (var i = 0; i < this.cookie.length; i++)
      {
        row1 = $("<tr/>");
        var key=this.cookie[i];
        row1.append($("<td/>").html(key));
        var val=this.cookie[key];
        if ($.isArray(val))
        {
            var subTable=$("<table border=1 width='100%'/>");
            row1.append($("<td/>").append(subTable));
            var subCookie = val;
            for (var j = 0; j < subCookie.length; j++)
            {
              var row2 = $("<tr/>");
              key=subCookie[j];
              val=subCookie[key];
              row2.append($("<td/>").html(key));
              row2.append($("<td/>").html(val));
              subTable.append(row2);
            }
        }
        else
        {
            row1.append($("<td/>").html(val));
        }
        $(selector).append(row1);
      }
    }
})();

