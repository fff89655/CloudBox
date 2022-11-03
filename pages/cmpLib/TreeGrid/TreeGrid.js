// base class overwrite
Array.prototype.insert = function ( index, item ) {
    this.splice( index, 0, item );
};
Array.prototype.remove = function ( index ) {
    this.splice(index, 1);
};
Array.prototype.removeByValue = function() {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};

// api base class

var TreeNode = function(config, component){
    this.children = [];
    this.parent = null;
    this.toggleFlg = false;
    this.visible = true;
    this.selected = false;
    if(config){
        this.model = config;
    }
    if(component === undefined){
        throw "no componnet";
    }
    this.cmp = component;
    
}
TreeNode.prototype.appendChild = function(node){
    if(node.parent){
        node.parent.children.remove(node.parent.children.indexOf(node));
    }
    this.children.push(node);
    node.parent = this;
}
TreeNode.prototype.insertBefore = function(node){
    if(node.parent){
        node.parent.children.remove(node.parent.children.indexOf(node));
    }
    this.parent.children.insert(this.parent.children.indexOf(this), node);
    node.parent = this.parent;
}
TreeNode.prototype.insertAfter = function(node){
    if(node.parent){
        node.parent.children.remove(node.parent.children.indexOf(node));
    }
    this.parent.children.insert(this.parent.children.indexOf(this) + 1, node);
    node.parent = this.parent;
}
TreeNode.prototype.getAllGenerations = function(){
    var result = [];
    //result.push(this);
    this.getAllGenerationsLoop(result);
    this.refreshLeftPadding();
    return result;
}
TreeNode.prototype.getAllGenerationsLoop = function(list){
    for(var i = 0 ; i<this.children.length ; i++){
        list.push(this.children[i]);
        this.children[i].getAllGenerationsLoop(list);
    }
}
TreeNode.prototype.createChilds = function(model, component){
    this.model = {title:"DictMenu",children:[model]};
    this.createChildsLoop(this.model, component);
    this.refreshLeftPadding();
}
TreeNode.prototype.createChildsLoop = function(model, component){
    if(model.children){
        for(var i=0 ; i<model.children.length ; i++){
            var childModel = model.children[i];
            var childTreeNode = new TreeNode(childModel, component);
            this.appendChild(childTreeNode);
            childTreeNode.createChildsLoop(childModel, component);   
        }
    }
}
TreeNode.prototype.getLastChild = function(){
    if(this.children.length > 0){
        return this.children[this.children.length - 1];
    }else{
        return null;
    }
}
TreeNode.prototype.getNextNeighbor = function(){
    var thisIndex = this.parent.children.indexOf(this);
    if(thisIndex != -1 && thisIndex < (this.parent.children.length-1)){
        return this.parent.children[thisIndex + 1];
    }
}
TreeNode.prototype.refreshLeftPadding = function(){
    var level = 0;
    this.refreshLeftPaddingLoop(level);
}
TreeNode.prototype.refreshLeftPaddingLoop = function(level){
    for (var i = 0; i < this.children.length; i++) {
        var child = this.children[i];
        child.paddingLeft = level * 20;
        child.refreshLeftPaddingLoop(level + 1);
    }
}
TreeNode.prototype.isAllParentVisible = function(){
    var parentNode = this.parent;
    while(parentNode){
        if(parentNode.visible == false){
            return false;
        }
        parentNode = parentNode.parent;
    }
    return true;
}
TreeNode.prototype.selectNode = function(){
    if(this.cmp.selectedNode != null){
        this.cmp.selectedNode.selected = false;
    }
    this.selected = true;
    this.cmp.selectedNode = this;
}
TreeNode.prototype.click = function(){
    if(this.cmp.selectedNode != null){
        this.cmp.selectedNode.selected = false;
    }
    this.selected = true;
    this.cmp.selectedNode = this;
}
TreeNode.prototype.toggle = function(){
    if(this.toggleFlg == false){
        this.toggleFlg = true;
        this.setAllChildHide();
    }else{
        this.toggleFlg = false;
        this.setAllChildShow();
    }

}
TreeNode.prototype.setAllChildShow = function(){
    this.toggleFlg = false;
    for (var i = 0; i < this.children.length; i++) {
        var c = this.children[i];
        c.visible = true;
    }
}
TreeNode.prototype.setAllChildHide = function(){
    this.toggleFlg = true;
    for (var i = 0; i < this.children.length; i++) {
        var c = this.children[i];
        c.visible = false;
    }
}
TreeNode.prototype.expendAll = function(){
    this.toggleFlg = false;
    this.setAllChildVisibleLoop(this, true);
}
TreeNode.prototype.collapseAll = function(){
    this.toggleFlg = true;
    this.setAllChildVisibleLoop(this, false);
}
TreeNode.prototype.setAllChildVisibleLoop = function(node , visible){
    for (var i = 0; i < node.children.length; i++) {
        var c = node.children[i];
        c.visible = visible;
        c.toggleFlg = !visible;
        node.setAllChildVisibleLoop(c, visible);
    }
}
TreeNode.prototype.startDrag = function(dragOverCallBack){

    this.cmp.DragNode = this;

    this.mouseDownPoint = {x:event.pageX, y:event.pageY};
    var me = this;

    var dragDiv = null;

    var mouseMove = function(event){
        if(dragDiv == null){
            dragDiv = $("<div class='dragTreeNodeDiv'>");
            dragDiv.html(me.model.title);
            // dragDiv.offset({left:event.pageX + 20, top:event.pageY});
            $(document.body).append(dragDiv);
        }else{
            if(me.mouseDownPoint.x == event.pageX && me.mouseDownPoint.y == event.pageY){
                return;
            }
        }
        dragDiv.offset({left:event.pageX + 20, top:event.pageY});
        me.setAllChildHide();
    }
    $(document).on("mousemove", mouseMove);

    var mouseUp = function(event){
        
        if(me.cmp.DragNodeMoveOn != null){
            if(me.cmp.DragNodeMoveOn.dragPosition == "top"){
                me.cmp.DragNodeMoveOn.insertBefore(me.cmp.DragNode);
            }else if(me.cmp.DragNodeMoveOn.dragPosition == "bottom"){
                me.cmp.DragNodeMoveOn.insertAfter(me.cmp.DragNode);
            }else{
                me.cmp.DragNodeMoveOn.appendChild(me.cmp.DragNode);
            }
        }

        $(document).off("mousemove", mouseMove);
        $(document).off("mouseup", mouseUp);
        if(dragDiv != null){
            dragDiv.remove();
                
            if(dragOverCallBack){
                dragOverCallBack();
            }
        }
        me.cmp.DragNode = null;
        me.cmp.DragNodeMoveOn = null;

        $(".treeNode").off("mousemove", this.mouseMoveFun);
    }
    $(document).on("mouseup", mouseUp);
}
TreeNode.prototype.mouseOver = function(){
    if(this.cmp.DragNode == null){
        return;
    }
    if(this.cmp.DragNode == this){
        return;
    }
    
    this.cmp.DragNodeMoveOn = this;
    $(event.currentTarget).addClass("dragMoveOn");
    var me = this;
    this.mouseMoveFun = function(){
        
        var height = $(event.currentTarget).height();
        me.cmp.DragNodeMoveOn.dragPosition = null;
        $(event.currentTarget).removeClass("dragMoveOn_Top");
        $(event.currentTarget).removeClass("dragMoveOn_Bottom");
        if(event.offsetY < (height/4)){
            $(event.currentTarget).addClass("dragMoveOn_Top");
            me.cmp.DragNodeMoveOn.dragPosition = "top";
        }else if(event.offsetY > (height/4 * 3)){
            $(event.currentTarget).addClass("dragMoveOn_Bottom");
            me.cmp.DragNodeMoveOn.dragPosition = "bottom";
        }
    }
    $(event.currentTarget).on("mousemove", this.mouseMoveFun);
}

TreeNode.prototype.mouseLeave = function(){
    if(this.cmp.DragNodeMoveOn == this){
        this.cmp.DragNodeMoveOn.dragPosition = null;
        this.cmp.DragNodeMoveOn = null;
    }
    $(event.currentTarget).removeClass("dragMoveOn");
    $(event.currentTarget).removeClass("dragMoveOn_Top");
    $(event.currentTarget).removeClass("dragMoveOn_Bottom");
    $(event.currentTarget).off("mousemove", this.mouseMoveFun);
}


Vue.component('tree-grid', {
    template: `
<div class="treeRoot noselect">
    <div>
        <table class="treeTitle" style="width:100%;">
            <tr>
                <td class="treeTitleContent">Tree</td>
                <td style="width:150px;">
                    <button v-on:click="collAll">CA</button>
                    <button v-on:click="expendAll">EA</button>
                </td>
            </tr>
        </table>
    </div>
    <div v-for="node in treeNodeList" 
        v-bind:class="'treeNode' + (node.children.length == 0 ? ' leafNode':'') + (node.selected? ' selectedNode': '')" 
        v-show="node.visible && node.isAllParentVisible()"
        v-on:mousedown="treeNodeMouseDown(node)"
        v-on:mouseover="treeNodeMouseOver(node)"
        v-on:mouseleave="treeNodeMouseLeave(node)"
        v-on:click="rowClick(node)">
        <div class="treeHandle"
        v-bind:style="{paddingLeft: node.paddingLeft + 'px'}" >
            <span v-if="node.children.length == 0">-</span>
            <span v-if="node.children.length != 0 && node.toggleFlg == true" v-on:click="toggleClick(node)">▷</span>
            <span v-if="node.children.length != 0 && node.toggleFlg == false" v-on:click="toggleClick(node)">▼</span>
            <div class="treeNodeName">
                <span>{{node.model.title}}</span>
            </div>
            <div v-if="editable" class="treeNodeButton">
                <button class="treeBtn" v-on:click="addChild(node)">+</button>
                <button class="treeBtn" v-on:click="deleteNode(node)">D</button>
                <button class="treeBtn" v-on:click="renameNode(node)">R</button>
            </div>
        </div>
        <!--<div class="treeGrid">
            <div class="treeGridCell" v-for="col in columns" v-bind:style="{width: col.width}"> 
                {{node.model[col.propertyName]}} &nbsp;
            </div>
        </div>-->
    </div>
</div>
` ,
    props:["tree_data", "columns", "editable"],
    data : function(){
        console.log("create data");
        return {treeNodeList:[], rootNode:{}, selectedNode:{}};
    },
    created:function(){
        // ChromeAPI.saveLocalData("SQLListMap",{title:"sql");
        this.loadTreeData(this.tree_data);
    },
    methods:{
        loadTreeData : function(data){
            this.rootNode = new TreeNode({}, this);
            this.rootNode.createChilds(data, this);
            this.rootNode.selectNode();
            this.treeNodeList = this.rootNode.getAllGenerations();
            
            if(this.rootNode.children.length > 0){
                for (let index = 0; index < this.rootNode.children[0].children.length; index++) {
                    const node = this.rootNode.children[0].children[index];
                    node.collapseAll();
                }
            }
        },
        rowClick : function(node){
            node.click();
            this.$emit('onrowclick', node.model);
        },
        toggleClick : function(node){
            node.toggle();
        },
        collAll : function(){
            this.selectedNode.collapseAll();
        },
        expendAll : function(){
            this.selectedNode.expendAll();
        },
        addChild : function(clickNode){
            var txt = prompt("addText");
            if(txt){
                var tn = new TreeNode({title:txt}, this);
                clickNode.appendChild(tn);
                var lastChild = clickNode.getLastChild();
                var lastChildIndex = this.treeNodeList.indexOf(lastChild);
                this.treeNodeList = this.rootNode.getAllGenerations();

                if(!clickNode.model.children){
                    clickNode.model.children = [];
                }
                clickNode.model.children.push({title:txt});
                this.$emit('onaddchild', clickNode.model);
            }
        },
        treeNodeMouseDown : function(node){
            me = this;
            node.startDrag(function(){
                me.treeNodeList = me.rootNode.getAllGenerations();
            });
        },
        treeNodeMouseOver : function(node){
            node.mouseOver();
        },
        treeNodeMouseLeave : function(node){
            node.mouseLeave();
        },
        deleteNode : function(node){
            if(!confirm("Delete ?")){
              return;
            }
            node.parent.children.removeByValue(node);
            this.treeNodeList = this.rootNode.getAllGenerations();
            
            node.parent.model.children.remove(node.model);
            this.$emit('ondeletechild', node);
        },
        renameNode : function(node){
          var oldName = node.model.title;
          var con = prompt("input new name.", oldName);
          if(con){
            node.model.title = con;
          }
          this.$emit('onrename', node);
        }
      }
})