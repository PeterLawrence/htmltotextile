/*
   A basic JavaScript for converting html to Textile
   
   Alpha Version 0.0.1 - P.J.Lawrence 2011
   
   Developed for a Redmine plugin, a task I've never got around to finishing..
   see https://github.com/PeterLawrence/redmine_wysiwyg_textile
   
*/
OutputText="";
ClosingTag=false;
ReturnChar='\n';

function isPrintable(aChar)
{
   if (aChar!='\n')
     return(true);
   return (false);
}


function MatchHTMLCommand(TheTag,TheCommand)
{
    if (TheCommand==TheTag) {
       ClosingTag=false;
       return (true);
    }
    TheCommand="/"+TheCommand;
    if (TheCommand==TheTag) {
       ClosingTag=true;
       return (true);
    }
    return (false);
}

var basictags={"b":"**","u":"=","i":"__","em":"_","strong":"*","cite":"??","sup":"^","sub":"~","span":"%","del":"-","code":"@","ins":"+","pre":"pre.\n"};
var headertags={"h1":"h1. ","h2":"h2. ","h3":"h3. ","h4":"h4. "};

var newlinetags={"br":0,"p":1};
var prefomattedtags={"pre":0,"code":1,"{{":2};

var aligntags={'>':'right','<':'left','=':'center','<>':'justify','~':'bottom','^':'top'};

var tablecount=0;
var tablestags={"table":0,"tr":1,"td":2};

var indentstack = new Array;
var bullettags={"ul":0,"ol":1,"li":2};

function CheckHTMLCommand(TheTag)
{
    TheTag=TheTag.toLowerCase();

    for(aTag in basictags) {
       if (MatchHTMLCommand(TheTag,aTag))
       {
          if (ClosingTag) {
             if (aTag=='pre') {
                OutputText+='/';
             }
             OutputText+=basictags[aTag];     
          }
          else {
             OutputText+=basictags[aTag];
          }
          return(true);
       }
    }

    for(aTag in headertags) {
       if (MatchHTMLCommand(TheTag,aTag))
       {
          if (ClosingTag) {
             OutputText+=ReturnChar+ReturnChar;     
          }
          else {
             OutputText+=headertags[aTag];
          }
          return(true);
       }
    }
    for(aTag in tablestags) {
       if (MatchHTMLCommand(TheTag,aTag))
       {
          if (ClosingTag) {
             switch (tablestags[aTag])
             {
               case 0:
                 if (tablecount>0) { tablecount--; }
                 break;
               case 1:
                 OutputText+=ReturnChar;
                 break;
               case 2:
                 OutputText+="|";
                 break;
             }     
          }
          else {
             switch (tablestags[aTag])
             {
               case 0:
                 tablecount++;
                 break;
               case 1:
                 OutputText+="|";
                 break;
               case 2:
                 break;
             }
          }
          return(true);
       }
    }
    for(aTag in newlinetags) {
       if (MatchHTMLCommand(TheTag,aTag))
       {
          if (ClosingTag) {
             if (newlinetags[aTag]!=2)
               OutputText+=ReturnChar;     
          }
          else {
             if (newlinetags[aTag]!=1)
             	OutputText+=ReturnChar;
          }
          return(true);
       }
    }
    return (false);
}

function CheckPreformattedCommand(TheTag)
{
    TheTag=TheTag.toLowerCase();

    for(aTag in prefomattedtags) {
       if (MatchHTMLCommand(TheTag,aTag))
       {
          if (ClosingTag) {
            return (2);
          }
          else {
            return(1);
          }
       }
    }
    return (0);
}

function CheckBulletCommand(TheTag)
{
    TheTag=TheTag.toLowerCase();

    for(aTag in bullettags) {
       if (MatchHTMLCommand(TheTag,aTag))
       {
         var indentsize=indentstack.length;
         if (ClosingTag) {
             switch (bullettags[aTag])
             {
             case 0:
             case 1:
               if (indentsize>0)
                 indentstack.pop();
               break;
             case 2:
               if (indentsize>0)
                 OutputText+=ReturnChar;
               break;
             }     
          }
          else {
             switch (bullettags[aTag])
             {
             case 0:
             case 1:
                 indentstack.push(bullettags[aTag]);
               break;
             case 2:
               if (indentsize>0) {
                 var Identype=indentstack[indentsize-1];
                 for (i=0;i<indentsize;i++) {
                   if (Identype==0) {
                     OutputText+='*';
                   }
                   else
                     OutputText+='#';
                   }
                 }
                 OutputText+=' ';
               }
               break;
          }
          return(true);
       }
    }
    return (0);
}

function HtmlToTextile(HtmlData) 
{
      var aHTMLCommand=false;
      var TheHTMLCommand="";
      var aParm=false;
      var aHTMLCode = false;
      var i=0;
      OutputText="";
      var PreChar="";
      var EscapeChar=false;
      var preformatted=false;
      var aMacro=false;
     
      for (i=0;i<HtmlData.length;i++)
      {
          var aChar=HtmlData.charAt(i);
          if (aChar=='\\' || EscapeChar)
          {
              if (aChar!='\n')
              {
                // escape charactor
                if (EscapeChar) {
                   // this was the character to escape
                   EscapeChar=false;
                }
                else {
                   aChar=PreChar; // make sure PreChar is not over written
                   EscapeChar=true;
                }
              }
          }
          else if (aHTMLCommand)
          {
              if ((aChar=='>' || (aHTMLCode && aChar==';') || aChar==' ' || aChar=='\n'))
              {   
                  if (aHTMLCode)
                  {
                     // CheckHTMLCode(TheHTMLCommand);
                  }
                  else
                  {
                      if (aParm) {
                      }
                      else {                        
                        if (preformatted==false) {
                           TagIdentified=false;
                           TagIdentified=CheckHTMLCommand(TheHTMLCommand);
                           if (TagIdentified==false) {
                              CheckBulletCommand(TheHTMLCommand);
                           }
                        } 
                        else {
                           TagIdentified=true;
                        }
                        isPreformatted=false;
                        if (TagIdentified==true) {
                           isPreformatted=CheckPreformattedCommand(TheHTMLCommand);
                        }
                        if (preformatted==true) {
                          if (isPreformatted==2) {
                             preformatted=false;
                             CheckHTMLCommand(TheHTMLCommand);
                          }
                          else {
                             // just output the text
                             OutputText+='<'+TheHTMLCommand+aChar;
                             aHTMLCommand=false;
                          }
                        }
                        else {
		          if (isPreformatted==1) {
		            preformatted=true;
		           }
                        }
                      }
                  }
                  if (aHTMLCode) {
                     aHTMLCode=false;
                     aHTMLCommand=false;
                  }
                  else if (aChar=='>') {
                     aHTMLCommand=false;
                     aParm=false;
                  }
                  else {
                     aParm=true; // the next input could be a parm
                  }
                  TheHTMLCommand=""; // erase command
              }
              else
              {
                  if (isPrintable(aChar))
                  {
                       TheHTMLCommand+=aChar;
                  }
                  if (aHTMLCode && (TheHTMLCommand.length>8 || aChar==32))
                  {
                       // problem with html code
                       OutputText+=TheHTMLCommand;
                       aHTMLCommand=false;
                       aHTMLCode=false;
                       aParm=false;
                  }
              }
          }
          else if (aMacro) {
               if (isPrintable(aChar)) {
                   OutputText+=aChar;
               }
               else if (aChar=='\n') {
                   OutputText+=ReturnChar;  // new line
               }
               if (aChar=='}') {
                   if (i>0 && HtmlData.charAt(i-1)=='}') {
                       OutputText+=' ';
                       aMacro=false;
                   }
               }
          }
          else if (preformatted) 
          {
              if (aChar=='<') {
                 aHTMLCommand=true;
              }
              else {
                 if (isPrintable(aChar) ) {
                   OutputText+=aChar;
                 }
                 else if (aChar=='\n') {
                   OutputText+=ReturnChar;  // new line
                 }
              }
          }
          else
          {
              if (aChar=='<' || aChar=='&')
              {
                  aHTMLCommand=true;
                  if (aChar=='&')
                  {
                       aHTMLCode=true;
                  }
                  TheHTMLCommand=""; // erase
               }
               else
               {
                  if (isPrintable(aChar) ) {
                         OutputText+=aChar;
                  }
                  else if (aChar=='\n')
                  {
                      LastPos=OutputText.length;
                      if (LastPos>0)
                      {
                        LastChar=OutputText.charAt(LastPos-1);
                        if (LastChar!='\n') {
                           OutputText+=ReturnChar;  // new line
                        }
                      }
                      else {
                         OutputText+=ReturnChar;  // new line
                      }
                  }
               }
               if (aChar=='{')
               {
                   if (i>0 && HtmlData.charAt(i-1)=='{') {
                       aMacro=true;
                   }
               }
          }
          PreChar=aChar;
      }
      return (OutputText);
}
