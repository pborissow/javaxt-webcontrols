if(!javaxt) var javaxt={};
if(!javaxt.dhtml) javaxt.dhtml={};

//******************************************************************************
//**  TabPanel
//******************************************************************************
/**
 *   Standard tab control used to show/hide individual panels, one panel at a
 *   time.
 *
 ******************************************************************************/


javaxt.dhtml.TabPanel = function(parent, config) {
    this.className = "javaxt.dhtml.TabPanel";

    var me = this;
    var tabList;
    var tabContent;

    var defaultConfig = {
        closable: false,
        style : {
            tabBar: {
                border: "1px solid #ccc",
                backgroundColor: "#eaeaea",
                height: "30px",
                borderBottom: "0px"
            },
            activeTab: {
                lineHeight: "30px",
                padding: "0 7px",
                backgroundColor: "#fafafa",
                cursor: "default",
                borderRight: "1px solid #ccc",
                borderBottom: "1px solid #fafafa"
            },
            inactiveTab: {
                lineHeight: "30px",
                padding: "0 7px",
                cursor: "pointer",
                borderRight: "1px solid #ccc",
                borderBottom: "0px"
            },
            tabBody: {
                border: "1px solid #ccc",
                verticalAlign: "top"
            },
            closeIcon: {

            }
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


      //Create main table
        var table = createTable();
        table.setAttribute("desc", me.className);
        var tbody = table.firstChild;


      //Row 1
        var tr = document.createElement('tr');
        tbody.appendChild(tr);
        var td = document.createElement('td');
        setStyle(td, "tabBar");
        td.style.width = "100%";
        tr.appendChild(td);

        tabList = document.createElement('ul');
        tabList.style.listStyle = "none outside none";
        tabList.style.padding = 0;
        tabList.style.margin = 0;
        tabList.style.height = "100%";
        td.appendChild(tabList);


      //Row 2
        tr = document.createElement('tr');
        tbody.appendChild(tr);
        var td = document.createElement('td');
        setStyle(td, "tabBody");
        td.style.width = "100%";
        td.style.height = "100%";
        tr.appendChild(td);


        tabContent = document.createElement('div');
        tabContent.style.width = "100%";
        tabContent.style.height = "100%";
        tabContent.style.position = "relative";
        td.appendChild(tabContent);


        parent.appendChild(table);
        me.el = table;
    };


  //**************************************************************************
  //** addTab
  //**************************************************************************
  /** Used to add a new tab to the panel.
   *  @param name Title or name associated with the tab.
   *  @param _el DOM element rendered when the tab is active.
   */
    this.addTab = function(name, _el){

        var el = document.createElement('div');
        el.style.width = "100%";
        el.style.height = "100%";
        el.style.position = "absolute";
        el.appendChild(_el);



        var tab = document.createElement('li');
        setStyle(tab, "inactiveTab");
        tab.style.position = "relative";
        tab.style.float = "left";
        tab.style.height = "100%";
        tab.innerHTML = name;
        tab.el = el;
        tab.onclick = function(){
            raiseTab(this);
        };
        tab.onselectstart = function () {return false;};
        tab.onmousedown = function () {return false;};
        tabList.appendChild(tab);
        for (var i=0; i<tabList.childNodes.length; i++){
            var t = tabList.childNodes[i];
            if (t!==tab){
                setStyle(t, "inactiveTab");
                t.style.position = "relative";
                t.style.float = "left";
                t.style.height = "100%";
                t.el.style.display = 'none';
            }
        }

        el.style.display='none'; //<-- style used to test whether the tab is visible (see raiseTab)

        tabContent.appendChild(el);

        raiseTab(tab);
    };


  //**************************************************************************
  //** getTabs
  //**************************************************************************
  /** Returns a list of tabs in the tab panel.
   */
    this.getTabs = function(){
        var tabs = [];
        for (var i=0; i<tabList.childNodes.length; i++){
            var tab = tabList.childNodes[i];
            tabs.push(getTabInfo(tab));
        }
        return tabs;
    };


  //**************************************************************************
  //** raiseTab
  //**************************************************************************
    this.raiseTab = function(id){
        var tab = findTab(id);
        if (tab) raiseTab(tab);
    };


    var raiseTab = function(tab){

        if (tab.style.display === 'none') return; //tab is hidden

        if (tab.el.style.display === 'none'){

          //Find current tab
            var currTab = null;
            for (var i=0; i<tabList.childNodes.length; i++){
                var t = tabList.childNodes[i];
                if (t.el.style.display === 'block'){
                    currTab = t;
                    break;
                }
            }


          //Make tab active
            setStyle(tab, "activeTab");
            tab.style.position = "relative";
            tab.style.float = "left";
            tab.style.height = "100%";
            tab.el.style.display = '';


          //Make other tabs inactive
            for (var i=0; i<tabList.childNodes.length; i++){
                var t = tabList.childNodes[i];
                if (t!==tab){
                    if (t.style.display !== 'none'){
                        setInactive(t);
                    }
                }
            }


          //Display tab content
            tab.el.style.display = 'block';


          //Call onTabChange
            me.onTabChange(getTabInfo(tab), getTabInfo(currTab));
        }
    };


  //**************************************************************************
  //** getTabInfo
  //**************************************************************************
    var getTabInfo = function(tab){
        if (tab==null) return null;

        var hidden = (tab.style.display === 'none');
        var active = (tab.el.style.display !== 'none');
        return {
            name: tab.innerText,
            el: tab.el,
            hidden: hidden,
            active: active
        };
    };


  //**************************************************************************
  //** setActiveTab
  //**************************************************************************
    this.setActiveTab = this.raiseTab;


  //**************************************************************************
  //** onTabChange
  //**************************************************************************
    this.onTabChange = function(currTab, prevTab){};


  //**************************************************************************
  //** removeTab
  //**************************************************************************
    this.removeTab = function(id){
        var tab = findTab(id);
        if (tab){
            var nextTab = tab.nextSibling;
            if (!nextTab) nextTab = tab.previousSibling;

            tabContent.removeChild(tab.el);
            tabList.removeChild(tab);

            if (nextTab) raiseTab(nextTab);
        }
    };


  //**************************************************************************
  //** hideTab
  //**************************************************************************
    this.hideTab = function(id){
        var tab = findTab(id);
        if (tab){
            if (tab.style.display === 'none') return;

            var nextTab = tab.nextSibling;
            if (!nextTab) nextTab = tab.previousSibling;

            setInactive(tab);
            tab.style.display = 'none';
            tab.el.style.display = 'none';


            if (nextTab) raiseTab(nextTab);
        }
    };


  //**************************************************************************
  //** showTab
  //**************************************************************************
    this.showTab = function(id){
        var tab = findTab(id);
        if (tab) tab.style.display = '';
    };


  //**************************************************************************
  //** findTab
  //**************************************************************************
    var findTab = function(id){
        if (isNaN(id)){
            if (typeof id === "string"){
                for (var i=0; i<tabList.childNodes.length; i++){
                    var t = tabList.childNodes[i];
                    if (t.innerHTML === id ){
                        return t;
                    }
                }
            }
        }
        else{
            if (id<tabList.childNodes.length){
                return tabList.childNodes[id];
            }
        }
        return null;
    };


  //**************************************************************************
  //** setInactive
  //**************************************************************************
  /** Updated the style of a given tab and hides its contents.
   */
    var setInactive = function(tab){
        setStyle(tab, "inactiveTab");
        tab.style.position = "relative";
        tab.style.float = "left";
        tab.style.height = "100%";
        tab.el.style.display = 'none';
    };




  //**************************************************************************
  //** Utils
  //**************************************************************************
    var merge = javaxt.dhtml.utils.merge;
    var createTable = javaxt.dhtml.utils.createTable;
    var setStyle = function(el, style){
        javaxt.dhtml.utils.setStyle(el, config.style[style]);
    };

    init();
};