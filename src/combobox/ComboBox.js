if(!javaxt) var javaxt={};
if(!javaxt.dhtml) javaxt.dhtml={};

//******************************************************************************
//**  ComboBox Class
//******************************************************************************
/**
 *   Form input with a pulldown list of options. By default, the options are
 *   accessed via a button or a "down arrow" key press. The list of options
 *   are automatically filtered as a user types in a value in the input field.
 *
 ******************************************************************************/

javaxt.dhtml.ComboBox = function(parent, config) {
    this.className = "javaxt.dhtml.ComboBox";

    var me = this;
    var input, button, mask;
    var menuDiv, menuOptions, newOption;
    var overflowDiv, overflowContainer;

    var defaultConfig = {

        placeholder: false, //Replace with placeholder text is needed
        spellcheck: false,  //Disable spellcheck on the input by default
        maxVisibleRows: 5,  //number of menu items before overflow
        scrollbar: true,    //true to show the vertical scrollbar
        showMenuOnFocus: true,
        typeAhead: true,
        readOnly: false,


        addNewOption: false,
        addNewOptionText: "Add New...",

        style: {
            width: "100%",

            input: {
                color: "#363636",
                fontSize: "14px",
                height: "24px",
                lineHeight: "24px",
                padding: "0px 4px",
                verticalAlign: "middle",
                transition: "border 0.2s linear 0s, box-shadow 0.2s linear 0s",
                backgroundColor: "#fff",
                border: "1px solid #ccc",
                borderRight: "0 none",
                boxShadow: "0 1px 1px rgba(0, 0, 0, 0.075) inset"
            },

            button: {
                color: "#363636",
                height: "24px",
                width: "24px",
                border: "1px solid #b4b4b4",
                cursor: "pointer",

                backgroundImage: "url(data:image/png;base64,iVBORw0KGgoAAAANSUh"+
                "EUgAAABAAAAAQCAYAAAAf8/9hAAAAlklEQVQ4jWNgGAUowNvbW9PBwUEAjxJGHx"+
                "8f/dDQUB4MGV9f3+TAwMD/AQEB97y8vOSxafb392+BqrlkbGzMhSLr7++/MTAw8"+
                "D8OQ+CaYdjb21sT3flKAQEBj7AYgqHZz8+vBqsHPT09ldENCQgImIysOSAgoBZP"+
                "GGEaQpJmfIYQrRmbITj9TAg4ODgIeHp6apGleegAAME5Y+rCcN+AAAAAAElFTkSuQmCC)",
                backgroundPosition: "3px 3px",
                backgroundRepeat: "no-repeat",
                backgroundColor: "#e4e4e4"
            },

            menu: {
                backgroundColor: "#ffffff",
                border: "1px solid #ccc",
                marginTop: "-1px",
                overflow: "hidden",
                boxShadow: "0 1px 4px 0 rgba(0, 0, 0, 0.15)"
            },

            option: {
                color: "#363636",
                whiteSpace: "nowrap",
                height: "22px",
                lineHeight: "22px",
                padding: "0px 4px",
                cursor: "default"
            },

            newOption: {
                borderTop: "1px solid #ccc",
                color: "#363636",
                whiteSpace: "nowrap",
                height: "24px",
                lineHeight: "24px",
                padding: "0px 4px",
                cursor: "default"
            },

            iscroll: null //If null or false, uses inline style. If "custom",
            //uses, "iScrollHorizontalScrollbar", "iScrollVerticalScrollbar",
            //and "iScrollIndicator" classes. You can also define custom class
            //names by providing a style map like this:
            /*
            iscroll: {
                horizontalScrollbar: "my-iScrollHorizontalScrollbar",
                verticalScrollbar: "my-iScrollVerticalScrollbar",
                indicator: "my-iScrollIndicator"
            }
            */
        }
    };


  //**************************************************************************
  //** Constructor
  //**************************************************************************
  /** Creates a new instance of this class. */

    var init = function(){

        if (typeof parent === "string"){
            parent = document.getElementById(parent);
        }
        if (!parent) return;


      //Clone the config so we don't modify the original config object
        var clone = {};
        merge(clone, config);


      //Merge clone with default config
        merge(clone, defaultConfig);
        config = clone;


      //Add noselect css rule before creating/styling any elements
        javaxt.dhtml.utils.addNoSelectRule();


      //Create main div
        var mainDiv = document.createElement("div");
        mainDiv.setAttribute("desc", me.className);
        mainDiv.style.width = config.style.width;
        mainDiv.style.position = "relative";
        parent.appendChild(mainDiv);
        me.el = mainDiv;


      //Create table with 2 columns
        var table = createTable();
        table.style.height = "";
        var tbody = table.firstChild;
        var tr = document.createElement('tr');
        tbody.appendChild(tr);
        mainDiv.appendChild(table);


      //Create input in the first column
        var td = document.createElement('td');
        td.style.width="100%";
        input = document.createElement('input');
        input.type = "text";
        setStyle(input, "input");
        if (config.readOnly===true){
            config.spellcheck = false;
            config.typeAhead = false;
            input.setAttribute("readonly", "true");
        }
        if (config.spellcheck===true){} else input.setAttribute("spellcheck", "false");
        if (config.placeholder) input.setAttribute("placeholder", config.placeholder);
        td.appendChild(input);
        tr.appendChild(td);

        input.onkeydown = function(e){
            if (e.keyCode===9){
                e.preventDefault();
            }
        };

        input.onkeyup = function(e){
            if (config.readOnly===true) return;
            if (e.keyCode===9){ //tab
                var d;
                if (menuDiv.style.visibility !== "hidden"){
                    d = getFirstOption();
                }
                if (d) select(d, true);
                else focusNext();
            }
            else if (e.keyCode===40){ //down arrow
                me.showMenu();
                var d = getFirstOption();
                if (d) d.focus();
            }
            else{
                me.filter();
            }
        };

        input.oninput = function(){
            //if (config.readOnly===true) return;
            var foundMatch = false;
            var filter = input.value.replace(/^\s*/, "").replace(/\s*$/, "").toLowerCase();
            for (var i=0; i<menuOptions.childNodes.length; i++){
                var div = menuOptions.childNodes[i];
                if (div.innerHTML.toLowerCase()===filter){
                    foundMatch = true;
                    input.data = div.value;
                    break;
                }
            }
            if (!foundMatch) input.data = null;

            me.onChange(input.value, input.data);
        };
        input.onpaste = input.oninput;
        input.onpropertychange = input.oninput;

        if (config.showMenuOnFocus){
            input.onclick = function(){
                me.showMenu(true);
                scroll();
                this.focus();
            };
        }



      //Create button in the second column
        td = document.createElement('td');
        button = document.createElement('button');
        //button.type = "button";
        setStyle(button, "button");
        td.appendChild(button);
        tr.appendChild(td);
        button.onclick = function(e){
            button.blur();
            e.preventDefault();
            if (menuDiv.style.visibility === "hidden"){
                me.showMenu(true);
                scroll();
            }
            else{
                me.hideMenu();
            }
        };



      //Create menu
        var div = document.createElement('div');
        div.style.position = "relative";
        div.style.width = "100%";
        mainDiv.appendChild(div);

        menuDiv = document.createElement('div');
        menuDiv.setAttribute("desc", "menuDiv");
        setStyle(menuDiv, "menu");
        menuDiv.style.position = "absolute";
        menuDiv.style.visibility = "hidden";
        menuDiv.style.display = "block"; //<--Required to get size
        menuDiv.style.width = "100%";
        menuDiv.style.zIndex = 1;
        menuDiv.style.boxSizing = "border-box";
        div.appendChild(menuDiv);


      //Create overflow divs
        overflowContainer = document.createElement("div");
        overflowContainer.style.position = "relative";
        overflowContainer.style.width = "100%";
        overflowContainer.style.height = "100%";

        overflowDiv = overflowContainer.cloneNode();
        overflowDiv.style.position = "absolute";
        overflowDiv.style.overflow = "hidden";
        overflowContainer.appendChild(overflowDiv);


      //Create menu options
        menuOptions = document.createElement("div");
        menuOptions.style.position = "relative";
        overflowDiv.appendChild(menuOptions);



        if (config.addNewOption===true){

            var menuTable = createTable();
            menuTable.style.height = "";
            tr = document.createElement("tr");
            menuTable.firstChild.appendChild(tr);
            td = document.createElement("td");
            td.style.width = "100%";
            td.style.height = "100%";
            td.style.verticalAlign = "top";
            tr.appendChild(td);
            td.appendChild(overflowContainer);


            tr = document.createElement("tr");
            menuTable.firstChild.appendChild(tr);
            td = document.createElement("td");
            tr.appendChild(td);

            newOption = document.createElement('div');
            setStyle(newOption, "newOption");
            newOption.innerHTML = config.addNewOptionText;
            newOption.tabIndex = -1; //allows the div to have focus
            var selectNewOption = function(){
                me.hideMenu();
                me.onAddNewOption();
            };
            newOption.onclick = selectNewOption;
            newOption.onkeydown = function(e){
                if (e.keyCode===9){
                    e.preventDefault();
                }
            };
            newOption.onkeyup = function(e){
                if (e.keyCode===9  || e.keyCode===13){ //tab or enter
                    selectNewOption();
                }
                else if (e.keyCode===38){ //up arrow
                    var previousSibling;
                    for (var i=menuOptions.childNodes.length-1; i>-1; i--){
                        var div = menuOptions.childNodes[i];
                        if (div.style.display !== "none"){
                            previousSibling = div;
                            break;
                        }
                    }
                    if (previousSibling) previousSibling.focus();
                }
            };

            newOption.onselectstart = function () {return false;};
            newOption.onmousedown = function () {return false;};

            td.appendChild(newOption);

            menuDiv.appendChild(menuTable);
        }
        else{
            menuDiv.appendChild(overflowContainer);
        }




      //Add event listener to hide menu if the client clicks outside of the menu div
        var hideMenu = function(e){
            if (!mainDiv.contains(e.target)){
                me.hideMenu();
            }
        };
        if (document.addEventListener) { // For all major browsers, except IE 8 and earlier
            document.addEventListener("click", hideMenu);
        }
        else if (document.attachEvent) { // For IE 8 and earlier versions
            document.attachEvent("onclick", hideMenu);
        }
    };


  //**************************************************************************
  //** show
  //**************************************************************************
    this.show = function(){
        me.el.style.visibility = '';
        me.el.style.display = '';
    };


  //**************************************************************************
  //** hide
  //**************************************************************************
    this.hide = function(){
        me.el.style.visibility = 'hidden';
        me.el.style.display = 'none';
    };


  //**************************************************************************
  //** enable
  //**************************************************************************
  /** Used to enable the button.
   */
    this.enable = function(){
        if (mask){
            var outerDiv = me.el;
            outerDiv.style.opacity = "";
            mask.style.visibility = "hidden";
        }
    };


  //**************************************************************************
  //** disable
  //**************************************************************************
    this.disable = function(){

        var outerDiv = me.el;
        outerDiv.style.opacity = "0.5";

        if (mask){
            mask.style.visibility = "visible";
        }
        else{

            mask = document.createElement('div');
            mask.setAttribute("desc", "mask");
            mask.style.position = "absolute";
            mask.style.zIndex = "1";
            mask.style.width = "100%";
            mask.style.height = "100%";

            outerDiv.insertBefore(mask, outerDiv.firstChild);
        }
    };

  //**************************************************************************
  //** reset
  //**************************************************************************
    this.reset = function(){
        input.value = "";
        input.data = null;
    };


  //**************************************************************************
  //** setValue
  //**************************************************************************
  /** Used to set the value for the input.
   */
    this.setValue = function(val){

        var setValue = function(value, data){
            input.value = value;
            input.data = data;
            input.oninput();
        };

        if (val==null || val==="") {
            setValue("", null);
            return;
        };


      //Try to match the val to one of the menu items using the menu data
        for (var i=0; i<menuOptions.childNodes.length; i++){
            var div = menuOptions.childNodes[i];
            if (div.value===val){
                setValue(div.innerHTML, div.value);
                return;
            }
        }

      //Try to match the val to one of the menu items using the menu text
        for (var i=0; i<menuOptions.childNodes.length; i++){
            var div = menuOptions.childNodes[i];
            if (div.innerHTML.toLowerCase() === getText(val).toLowerCase()){
                setValue(div.innerHTML, div.value);
                return;
            }
        }
    };


  //**************************************************************************
  //** getValue
  //**************************************************************************
  /** Returns the selected value associated with the input.
   */
    this.getValue = function(){
        return input.data;
    };


  //**************************************************************************
  //** getText
  //**************************************************************************
  /** Returns the text displayed in the input.
   */
    this.getText = function(){
        return input.value;
    };


  //**************************************************************************
  //** getOptions
  //**************************************************************************
  /** Returns a list of all the options currently available in the comboxbox.
   */
    this.getOptions = function(){
        var arr = [];
        for (var i=0; i<menuOptions.childNodes.length; i++){
            var div = menuOptions.childNodes[i];
            arr.push({
                text: div.innerHTML,
                value: div.value
            });
        }
        return arr;
    };


  //**************************************************************************
  //** getInput
  //**************************************************************************
  /** Returns the DOM element for the input.
   */
    this.getInput = function(){
        return input;
    };


  //**************************************************************************
  //** getButton
  //**************************************************************************
  /** Returns the DOM element for the button.
   */
    this.getButton = function(){
        return button;
    };


  //**************************************************************************
  //** onChange
  //**************************************************************************
  /** Called when the input value changes
   */
    this.onChange = function(text, value){};


  //**************************************************************************
  //** onAddNewOption
  //**************************************************************************
  /** Called when a user clicks on the new menu option
   */
    this.onAddNewOption = function(){};


  //**************************************************************************
  //** onAddNewOption
  //**************************************************************************
  /** Called when a user attempts to render the context menu on a menu option
   */
    this.onMenuContext = function(text, value, el){};


  //**************************************************************************
  //** filter
  //**************************************************************************
    this.filter = function(){

      //Show menu
        me.showMenu();

      //Get input value
        var filter = input.value.replace(/^\s*/, "").replace(/\s*$/, "").toLowerCase();

      //Filter menu items
        var numVisibleItems = 0;
        var h = 0;
        for (var i=0; i<menuOptions.childNodes.length; i++){
            var div = menuOptions.childNodes[i];

            if (div.innerHTML.toLowerCase().indexOf(filter) === 0) {
                div.style.display = "";
                numVisibleItems++;
                h = Math.max(div.offsetHeight, h);
            }
            else {
                div.style.display = "none";
            }
        }

      //Resize menu
        resizeMenu(numVisibleItems, h);
    };


  //**************************************************************************
  //** clear
  //**************************************************************************
  /** Clears the input and removes all items from the menu.
   */
    this.clear = function(){
        input.value = "";
        input.data = null;
        me.hideMenu();
        removeOverflow();
        menuDiv.style.height = "";
        menuOptions.innerHTML = "";
    };


  //**************************************************************************
  //** showMenu
  //**************************************************************************
  /** Renders the menu if it is hidden.
   *  @param removeFilter If true, expand the list and view all the options.
   */
    this.showMenu = function(removeFilter){

        if (menuDiv.style.visibility === "hidden"){


          //Unhide all the options as needed
            if (removeFilter===true){
                for (var i=0; i<menuOptions.childNodes.length; i++){
                    menuOptions.childNodes[i].style.display = '';
                }
            }


          //Check to see if the menu has anything to display
            var numVisibleItems = 0;
            var h = 0;
            for (var i=0; i<menuOptions.childNodes.length; i++){
                var div = menuOptions.childNodes[i];
                if (div.style.display !== "none"){
                    numVisibleItems++;
                    h = Math.max(div.offsetHeight, h);
                }
            }
            if (config.addNewOption===true){
                numVisibleItems++;
                h = Math.max(newOption.offsetHeight, h);
            }


            if (numVisibleItems>0){

              //Update menu size
                resizeMenu(numVisibleItems, h);


              //Show the menu
                menuDiv.style.visibility = '';


              //Hide bottom border
                input.style.borderBottomColor =
                button.style.borderBottomColor = "rgba(0,0,0,0)";


              //Scroll to top
                if (me.iScroll) me.iScroll.scrollTo(0,0);
                else overflowDiv.scrollTop = 0;
            }
        }
    };


  //**************************************************************************
  //** hideMenu
  //**************************************************************************
    this.hideMenu = function(){

        if (menuDiv.style.visibility !== "hidden"){
            input.style.borderBottomColor =
            button.style.borderBottomColor = '';
            setStyle(input, "input");
            setStyle(button, "button");
            input.style.width="100%";
            menuDiv.style.visibility = "hidden";
            input.focus();
        }
    };


  //**************************************************************************
  //** resizeMenu
  //**************************************************************************
    var resizeMenu = function(numVisibleItems, h){
        if (numVisibleItems>0){

            if (numVisibleItems>config.maxVisibleRows){
                addOverflow();
                var height = config.maxVisibleRows*h;
                if (newOption){
                    menuDiv.style.height = height + "px";
                    height = height-newOption.offsetHeight;
                    overflowContainer.style.height =
                    //menuOptions.style.height =
                    height + "px";
                }
                else{
                    //menuOptions.style.height =
                    menuDiv.style.height = height + "px";
                }
            }
            else{
                removeOverflow();
                overflowContainer.style.height = "100%"; //?
                //menuOptions.style.height =
                menuDiv.style.height = '';
            }

        }
        else{

            removeOverflow();
            overflowContainer.style.height = "100%"; //?
            //menuOptions.style.height =
            menuDiv.style.height = '';
        }
        if (me.iScroll) me.iScroll.refresh();
    };


  //**************************************************************************
  //** addOverflow
  //**************************************************************************
    var addOverflow = function(){

        overflowDiv.style.position = "absolute";
        if (config.scrollbar===true){
            if (typeof IScroll !== 'undefined'){
                if (!me.iScroll){
                    overflowDiv.style.overflowY = 'hidden';
                    me.iScroll = new IScroll(overflowDiv, {
                        scrollbars: config.style.iscroll ? "custom" : true,
                        mouseWheel: true,
                        fadeScrollbars: false,
                        hideScrollbars: false
                    });
                    if (config.style.iscroll) setStyle(me.iScroll, "iscroll");
                }
                if (me.iScroll) me.iScroll.refresh();
            }
            else{
                overflowDiv.style.overflowY = 'scroll';
            }
        }
        else{
            overflowDiv.style.overflowY = 'hidden';
        }

    };


  //**************************************************************************
  //** removeOverflow
  //**************************************************************************
    var removeOverflow = function(){
        overflowDiv.style.position = "relative";

        if (config.addNewOption===true){
            overflowDiv.style.overflowY = '';
        }
    };


  //**************************************************************************
  //** scroll
  //**************************************************************************
  /** Scrolls menu to the input value
   */
    var scroll = function(){

      //Scroll to a menu item that matches the text in the input
        for (var i=0; i<menuOptions.childNodes.length; i++){
            var div = menuOptions.childNodes[i];
            if (div.innerHTML===input.value){
                overflowDiv.scrollTop = div.offsetTop;
                div.focus();
                return;
            }
        }

      //If we're still here, we didn't find an exact match so we'll do a fuzzy search
        var a = input.value;
        var div = null;
        var max = 0;
        for (var i=0; i<menuOptions.childNodes.length; i++){
            var b = menuOptions.childNodes[i].innerHTML;
            var x = 0;
            for (var j=0; j<Math.min(a.length, b.length); j++) {
                if (a.charAt(j) !== b.charAt(j)){
                    break;
                }
                x++;
            }
            if (x>max){
                div = menuOptions.childNodes[i];
                max = x;
            }
        }

        if (div){
            overflowDiv.scrollTop = div.offsetTop;
            div.focus();
            return;
        }
    };


  //**************************************************************************
  //** add
  //**************************************************************************
  /** Used to add an entry to the menu.
   *  @param text Text to display in the input when selected.
   *  @param value Value associated with the input. If undefined, the text
   *  value is used instead.
   */
    this.add = function(text, value){
        var div = document.createElement('div');
        setStyle(div, "option");
        div.innerHTML = getText(text);
        div.value = (typeof value === "undefined") ? div.innerHTML : value;
        div.tabIndex = -1; //allows the div to have focus
        div.onclick = function(){
            select(this);
        };
        div.onkeydown = function(e){
            if (e.keyCode===9){
                e.preventDefault();
            }
        };
        div.onkeyup = function(e){
            if (e.keyCode===9 || e.keyCode===13){ //tab or enter
                select(this, true);
            }
            else if (e.keyCode===38){ //up arrow
                var previousSibling = this.previousSibling;
                if (previousSibling) previousSibling.focus();
            }
            else if (e.keyCode===40){ //down arrow
                var nextSibling = this.nextSibling;
                if (nextSibling) nextSibling.focus();
                else{
                    if (newOption) newOption.focus();
                }
            }
        };


        div.onselectstart = function () {return false;};
        div.onmousedown = function () {return false;};

        div.oncontextmenu = function(){
            var el = this;
            me.onMenuContext(el.innerHTML, el.value, el);
        };

        menuOptions.appendChild(div);
    };


  //**************************************************************************
  //** remove
  //**************************************************************************
  /** Removes an entry from the menu.
   */
    this.remove = function(name){
        var arr = [];
        for (var i=0; i<menuOptions.childNodes.length; i++){
            var div = menuOptions.childNodes[i];
            if (div.innerHTML === getText(name)){
                arr.push(div);
            }
        }
        for (i=0; i<arr.length; i++){
            menuOptions.removeChild(arr[i]);
        }
    };


  //**************************************************************************
  //** removeAll
  //**************************************************************************
  /** Removes all entries from the menu.
   */
    this.removeAll = function(){
        menuOptions.innerHTML = "";
        //Don't resize the menu div!
    };


  //**************************************************************************
  //** getText
  //**************************************************************************
  /** Formats a given item into a string that can be rendered in the input or
   *  as an entry in the menu.
   */
    var getText = function(name){
        if (name){
            if (typeof name === 'string' || name instanceof String){
                //keep the string as is
            }
            else{
                name += "";
            }
        }
        else{
            name = "";
        }
        return name;
    };


  //**************************************************************************
  //** select
  //**************************************************************************
  /** Used to select a given div in the menu.
   */
    var select = function(div, _focusNext){

        if (div){

          //Set input value and hide menu
            input.value = div.innerHTML;
            input.data = div.value;
            me.hideMenu();
            me.onChange(input.value, input.data);


          //Focus on the next input in the form
            if (_focusNext){
                focusNext();
            }

        }
    };


  //**************************************************************************
  //** focusNext
  //**************************************************************************
  /** Used to focus on the next available form element.
   */
    var focusNext = function(){
        var form = input.form;
        if (form){
            for (var i=0; i<form.elements.length; i++){
                if (form.elements[i]===input && i<form.elements.length-2){
                    form.elements[i+2].focus();
                    return;
                }
            }
        }
    };


  //**************************************************************************
  //** getFirstItem
  //**************************************************************************
  /** Returns the first visible menu item.
   */
    var getFirstOption = function(){
        for (var i=0; i<menuOptions.childNodes.length; i++){
            var div = menuOptions.childNodes[i];
            if (div.style.display !== "none"){
                return div;
            }
        }
        return null;
    };


  //**************************************************************************
  //** Utils
  //**************************************************************************
    var merge = javaxt.dhtml.utils.merge;
    var createTable = javaxt.dhtml.utils.createTable;
    var setStyle = function(el, style){
        javaxt.dhtml.utils.setStyle(el, config.style[style]);
        if (el.type === "text"){
            el.style.width="100%";
            if (config.readOnly===true){
                el.className += " javaxt-noselect";
                el.style.cursor = "default";
            }
        }
    };


    init();
};