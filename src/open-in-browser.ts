import * as cp from 'child_process';
import * as os from 'os';
import * as path from 'path';
import * as marked from 'marked';
import { dir_ensureExists, file_readAllText, file_readFile, file_writeNew, file_writeText } from 'sr_core_ts';

// -------------------------- openTextLinesInBrowser --------------------------
export async function openTextLinesInBrowser( textStream: string, filePath:string, isMarkdown = false)
{
  let html = '';
  let toHtml: { tempDir: string, htmlPath: string } | undefined;
  let errmsg = '' ;

  // replace tabs with spaces.
  textStream = textStream.replace(/\t/g, '  ');

  const basename = path.basename(filePath) ;
  if ( isMarkdown )
  {
    html = markdown_toHtml(filePath, textStream);
  }
  else
  {
    const lines = textStream.split('\n');
    html = sourceFile_toHtml(filePath, lines)
  }

  try
  {
    // write the html of web page into file in temporary folder.
    const tempDir = path.join(os.tmpdir(), 'open-in-browser');
    const { created, errmsg } = await dir_ensureExists(tempDir);
    const htmlPath = path.join(tempDir, basename + '.html');
    await file_writeNew(htmlPath, html);
    toHtml = { tempDir, htmlPath };

    const start = (process.platform == 'darwin' ? 'open' : process.platform == 'win32' ? 'start' : 'xdg-open');
    {
      const url = require('url');
      const file_url = url.pathToFileURL(toHtml.htmlPath).toString();
      cp.exec(start + ' chrome ' + file_url);
    }
  }
  catch (err)
  {
    errmsg = err.message ;
  }

  return errmsg ;
}

// ------------------------------- iFindReplaceItem -------------------------------
interface iFindReplaceItem
{
  find: string;
  replace: string;
}

// ------------------------------- htmlShell_insert -------------------------------
// apply find/replace instructions to an html shell script.
// Each instruction consists of text to find in the html script and the replace 
// text to insert in its place.
function htmlShell_insert(shell: string, findReplaceArr: iFindReplaceItem[])
{
  let result = shell;
  for (const item of findReplaceArr)
  {
    result = result.replace(item.find, item.replace);
  }
  return result;
}

// ------------------------------ htmlShell_bootstrap ------------------------------
function htmlShell_bootstrap()
{
  const shell = `
  <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <link rel="stylesheet" 
    href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css"
    integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" 
    crossorigin="anonymous">

<style>{{style text}}</style>

  <title>{{page title}}</title>
</head>
<body>
  <html>
  
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=windows-1252">
  </head>
  
  <body>
  <div class="container mt-3">
    {{body html}}
  </div>

  <br>
  <br>
  <script src="https://code.jquery.com/jquery-3.3.1.slim.min.js"
    integrity="sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo" 
    crossorigin="anonymous"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js"
    integrity="sha384-UO2eT0CpHqdSJQ6hJty5KVphtPhzWj9WO1clHTMGa3JDZwrnQq4sF86dIHNDz0W1" 
    crossorigin="anonymous"></script>
  <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js"
    integrity="sha384-JjSmVgyd0p3pXB1rRibZUAYoIIy6OrQ6VrjIEaFf/nJGzIxFDsf4x0xIM+B07jRM" 
    crossorigin="anonymous"></script>
  </body>
  </html>
  `;
  return shell;
}

// ------------------------------- sourceFile_toHtml -------------------------------
function sourceFile_toHtml(filePath: string, lines: string[])
{
  const basename = path.basename(filePath);
  const styleText =
    `
div#srcmbrEdit span {
  font-family:"Lucida Console";
  font-size:0.9em;
  line-height:1.35em;
  display: block;
  white-space: pre;
}

div#srcmbrEdit span:before
{
  content: attr(xsrcseq) ;
  margin-right:2.2em;
  line-height:1.35em;
  width:4em;
  text-align:right;
  display: inline-block;
  font-size:0.9em;
  xfont-family:'Lucida Console';
}
  `;

  // body html - will be inserted into html shell.
  let body_html = `<h5>${filePath} <span class="ml-3">${new Date().toLocaleString()}</span></h5><hr>`;

  // build html from source lines.
  body_html += `<div id="srcmbrEdit">`;
  let seqnbr = 0;
  for (const line of lines)
  {
    seqnbr += 1;
    const line_html = `<span xsrcseq="${seqnbr}">${htmlEncode(line)}</span>`;
    body_html += line_html;
  }
  body_html += `</div>`;

  // insert markdown converted html into html of  shell web page.
  const shell = htmlShell_bootstrap();
  const findReplaceArr: iFindReplaceItem[] = [
    { find: '{{style text}}', replace: styleText },
    { find: '{{page title}}', replace: basename },
    { find: '{{body html}}', replace: body_html }
  ];
  const html = htmlShell_insert(shell, findReplaceArr);

  return html;
}

// -------------------------------- markdown_toHtml --------------------------------
function markdown_toHtml(basename: string, markdown_text: string)
{
  // convert markdown to html.
  const markdown_html = marked(markdown_text);

  const styleText =
    `
pre {
    padding:.5em;
    background-color: rgb(236, 225, 225);
  }
            `;

  // insert markdown converted html into html of  shell web page.
  const shell = htmlShell_bootstrap();
  const findReplaceArr: iFindReplaceItem[] = [
    { find: '{{style text}}', replace: styleText },
    { find: '{{page title}}', replace: basename },
    { find: '{{body html}}', replace: markdown_html }
  ];
  const html = htmlShell_insert(shell, findReplaceArr);

  return html;
}

// ---------------------------------- htmlEncode ----------------------------------
function htmlEncode(text: string)
{
  text = text.replace(/&/g, '&amp;');
  text = text.replace(/</g, '&lt;');
  text = text.replace(/>/g, '&gt;');
  return text;
}
