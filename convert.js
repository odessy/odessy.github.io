var showdown  = require('showdown');
var fs = require('fs');
var hljs = require ('highlight.js');

let filename = "README.md";
let pageTitle = process.argv[2] || "";

showdown.extension('highlight', function () {
  function htmlunencode(text) {
    return (
      text
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')      
      );
  }
  function htmlencode(text) {
    return (
      text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;")        
      );
  }
  function clipboardButton(text){
    return `
    <div class="clipboard-container" style="position:absolute; right:0; top:0;">
    <clipboard-copy aria-label="Copy" class="ClipboardButton btn" data-copy-feedback="Copied!" data-tooltip-direction="w" value="${htmlencode(text)}" tabindex="0" role="button">
      <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16">
       <path fill-rule="evenodd" d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 010 1.5h-1.5a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-1.5a.75.75 0 011.5 0v1.5A1.75 1.75 0 019.25 16h-7.5A1.75 1.75 0 010 14.25v-7.5z"></path><path fill-rule="evenodd" d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0114.25 11h-7.5A1.75 1.75 0 015 9.25v-7.5zm1.75-.25a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-7.5a.25.25 0 00-.25-.25h-7.5z"></path>
      </svg>
      <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" style="display:none;">
      <path fill-rule="evenodd" d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"></path>
      </svg>
    </clipboard-copy>
  </div>`;
  }

  return [{
    type: "output",
    filter: function (text, converter, options) {
      var left = "<pre><code\\b[^>]*>",
          right = "</code></pre>",
          flags = "g";

      var containerLeft = `<div class="content" style="position: relative;">`,
      containerRight = `</div>`;

      var replacement = function (wholeMatch, match, left, right) {
        match = htmlunencode(match);
        var lang = (left.match(/class=\"([^ \"]+)/) || [])[1];
        left = left.slice(0, 18) + 'hljs ' + left.slice(18);
        if (lang && hljs.getLanguage(lang)) {
          return containerLeft + clipboardButton(match) + left + hljs.highlight(match, {language: lang}).value + right + containerRight;
        } else {
          return containerLeft + clipboardButton(match) + left + hljs.highlightAuto(match).value + right + containerRight;
        }
      };
      return showdown.helper.replaceRecursiveRegExp(text, replacement, left, right, flags);
    }
  }];
});

showdown.extension('tabs', function () {
  return [{
    type: "output",
    filter: function (text, converter, options) {
      var left = "\\[tabs\\]",
          right = "\\[/tabs\\]",
          flags = "g";
          
      var leftTab = "\\[tab\\b[^\\]]*\\]",
          rightTab = "\\[/tab\\]";
          
      var tabReplacement = function (wholeMatch, match, left, right) {
        var name = (left.match(/name=\"([^\"]+)/) || [])[1];
        return '<div class="tab" name="'+name+'"><span class="tab-name">'+name+'</span>' + match + '</div>';
      };
      
      var replacement = function (wholeMatch, match, left, right) {
        return '<div class="tabs">' + 
        showdown.helper.replaceRecursiveRegExp(match, tabReplacement, leftTab, rightTab, flags) + 
        '</div>';
      };
      return showdown.helper.replaceRecursiveRegExp(text, replacement, left, right, flags);
    }
  }];
});



fs.readFile(__dirname + '/script.js', function (err, scriptData) {
fs.readFile(__dirname + '/style.css', function (err, styleData) {
  fs.readFile(process.cwd() + '/' + filename, function (err, data) {
    if (err) {
      throw err; 
    }
    let text = data.toString();

    converter = new showdown.Converter({
      ghCompatibleHeaderId: true,
      simpleLineBreaks: true,
      ghMentions: true,
      tables: true,
      extensions: ['tabs', 'highlight']
    });

    let preContent = `
    <html>
      <head>
        <title>` + pageTitle + `</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style type='text/css'>` + styleData + `</style>        
        <!-- Global site tag (gtag.js) - Google Analytics -->
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-XJY07B7F4G"></script>
        <script>
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-XJY07B7F4G');
        </script>        
      </head>
      <body>
        <div id='content'>`;

    let postContent = `

        </div>
        <button type="button" class="btn btn--scroll-top" data-scroll-top-button></button>
        <script>` + scriptData + `</script>
      </body>
    </html>`;

    html = preContent + converter.makeHtml(text) + postContent

    converter.setFlavor('github');
    //console.log(html);

    let filePath = process.cwd() + "/README.html";
    fs.writeFile(filePath, html, { flag: "w" }, function(err) {
      if (err) {
        console.log("File '" + filePath + "' already exists. Aborted!");
      } else {
        console.log("Done, saved to " + filePath);
      }
    });
  });
});
});
