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
  return [{
    type: "output",
    filter: function (text, converter, options) {
      var left = "<pre><code\\b[^>]*>",
          right = "</code></pre>",
          flags = "g";
      var replacement = function (wholeMatch, match, left, right) {
        match = htmlunencode(match);
        var lang = (left.match(/class=\"([^ \"]+)/) || [])[1];
        left = left.slice(0, 18) + 'hljs ' + left.slice(18);
        if (lang && hljs.getLanguage(lang)) {
          return left + hljs.highlight(match, {language: lang}).value + right;
        } else {
          return left + hljs.highlightAuto(match).value + right;
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
      </head>
      <body>
        <div id='content'>
    `

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
