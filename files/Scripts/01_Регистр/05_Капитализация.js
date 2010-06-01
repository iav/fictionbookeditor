//скрипт смены регистра by Sclex
//v1.1

function Run() {
 //вид обработки, которой подвергается выделенный текст
 // 1 - перевод в верхний регистр
 // 2 - перевод в нижний регистр
 var ObrabotkaType=2;
 //имя тэга, который будет использован для маркеров начала и конца выделения
 var MyTagName="B";

 capCol={};
 var k=0;

 var tr;
 var errMsg="Нет выделения.\n\nПеред запуском скрипта нужно выделить текст, который будет обработан.";
 tr=document.selection.createRange();
 if (!tr || tr.compareEndPoints("StartToEnd",tr)==0) {
  MsgBox(errMsg);
  return;
 }
 window.external.BeginUndoUnit(document,"Нижний регистр");
 if (tr.parentElement().nodeName=="TEXTAREA") {
   //код для обработки выделения в INPUT'е
  var tr1=document.body.createTextRange();
  tr1.moveToElementText(tr.parentElement());
  tr1.setEndPoint("EndToStart",tr);
  var tr2=document.body.createTextRange();
  tr2.moveToElementText(tr.parentElement());
  tr2.setEndPoint("StartToEnd",tr);
  s=tr.text;
  //код обработки: начало
  var tmp = "";
  var re10 =  new RegExp("[а-яёa-z]+[^а-яёa-z]*","gi"); 
  var mass=s.match(re10);   //    MsgBox(s+ "\n" +mass);
  var sum = "";

  var re11 =  new RegExp("[а-яёa-z]","gi"); 
  var frst=s.search(re11);
  var fst = "key";

  if (mass==null) { return; }
  else {
   for (k=0; k<mass.length; k++) {
    tmp = mass[k];
    capCol[k] = tmp.substr(0,1).toUpperCase()+tmp.substr(1,tmp.length).toLowerCase();
    sum = sum + capCol[k];
   }
   if (frst>0) { capCol[fst] = s.substr(0,frst); s = capCol[fst]+sum; }
   else         { s = sum; }
  }
  //код обработки: конец
  tr.parentElement().value=tr1.text+s+tr2.text;
 }
 else if (tr.parentElement().nodeName!="INPUT") {
  var body=document.getElementById("fbw_body");
  var coll=tr.getClientRects();
  var ttr1 = body.document.selection.createRange();
  var el=body.document.elementFromPoint(coll[0].left, coll[0].top);
  // поставим маркеры блока в виде пустых ссылок
  tr=ttr1.duplicate();
  tr.collapse();
  tr.pasteHTML("<"+MyTagName+" id=BlockStart></"+MyTagName+">");
  tr=ttr1.duplicate();
  tr.collapse(false);
  tr.pasteHTML("<"+MyTagName+" id=BlockEnd></"+MyTagName+">");
  // поднимаемся вверх по дереву, пока не найдем DIV или P,
  // в который входит начало выделения
  while (el && el.nodeName!="DIV" && el.nodeName!="P") { el=el.parentNode; }
  var InsideP = false; // true, если находимся внутри тэга P
  var InsideSelection = false; // true, когда текущая позиция внутри выделенного текста
  var ProcessingEnded=false; // true, когда обработка закончена и пора выходить
  ptr=el;
  while (!ProcessingEnded) {
   // напомню: nodeType=1 для элемента (тэга) и nodeType=3 для текста
   // если встретили тэг P, меняем флаг, что мы внутри P
   if (ptr.nodeType==1 && ptr.nodeName=="P") {InsideP=true};
   // если встретили маркер начала блока, ...
   if (ptr.nodeType==1 && ptr.nodeName==MyTagName &&
       ptr.getAttribute("id")=="BlockStart") {
    // меняем флаг, т.к. попали внутрь выделения
    InsideSelection=true;
    // запомним ноду ссылки, чтобы потом удалить ее
    var BlockStartNode=ptr;
   }
   // аналогично для маркера конца выделения
   if (ptr.nodeType==1 && ptr.nodeName==MyTagName &&
       ptr.getAttribute("id")=="BlockEnd") {
    InsideSelection=false;
    ProcessingEnded=true;
    var BlockEndNode=ptr;
   }
   // если нашли текст и находимся внутри P и внутри выделения...
   if (ptr.nodeType==3 && InsideP && InsideSelection) {
     // получаем текстовое содержимое узла
     var s=ptr.nodeValue;
     // обрабатываем как надо
     var tmp = "";
     var re10 =  new RegExp("[а-яёa-z]+[^а-яёa-z]*","gi"); 
     var mass=s.match(re10);   //    MsgBox(s+ "\n" +mass);
     var sum = "";

     var re11 =  new RegExp("[а-яёa-z]","gi"); 
     var frst=s.search(re11);
     var fst = "key";

     if (mass==null) { return; }
     else {
      for (k=0; k<mass.length; k++) {
       tmp = mass[k];
       capCol[k] = tmp.substr(0,1).toUpperCase()+tmp.substr(1,tmp.length).toLowerCase();
       sum = sum + capCol[k];
      }
      if (frst>0) { capCol[fst] = s.substr(0,frst); s = capCol[fst]+sum; }
      else         { s = sum; }
     }
     // и возвращаем на место
     ptr.nodeValue=s;
   }
   // теперь надо найти следующий по дереву узел для обработки
   if (ptr.firstChild!=null) {
     ptr=ptr.firstChild; // либо углубляемся...
   } else {
     while (ptr.nextSibling==null) {
      ptr=ptr.parentNode; // ...либо поднимаемся (если уже сходили вглубь)
      // поднявшись до элемента P, не забудем поменять флаг
      if (ptr && ptr.nodeType==1 && ptr.nodeName=="P") {InsideP=false}
     }
    ptr=ptr.nextSibling; //и переходим на соседний элемент
   }
  }
  // удаляем маркеры блока
  var tr1=document.body.createTextRange();
  tr1.moveToElementText(BlockStartNode);
  var tr2=document.body.createTextRange();
  tr2.moveToElementText(BlockEndNode);
  tr1.setEndPoint("StartToStart",tr2);
  tr1.select();
  BlockStartNode.parentNode.removeChild(BlockStartNode);
  BlockEndNode.parentNode.removeChild(BlockEndNode);
 }
 window.external.EndUndoUnit(document);
}