var template = `
<div ref="div" class="resizehandle" style="height:100%;user-select:none;" @mousedown="onMouseDown" >
</div>
`;

Vue.component('resizehandle-x', {
    props: [],
    template: template,
    data: function () {
        return {};
    },
    created: function () {
    },
    methods: {
        onMouseDown:function(e){
            let me = this;
            this.mousemove = function(e){
                me.onMouseMove(e);
            };
            $(window).mousemove(this.mousemove);
            this.mouseup = function(){
                me.onMouseUp();
            }
            $(window).mouseup(this.mouseup);

            this.mouseDownPoint = $(this.$refs.div).offset();
        },
        onMouseMove:function(e){
            if(!this.handleEl){
                this.handleEl = $(`<div id="dragMask" style="position:absolute;background:gray;z-index:999;"></div>`);
                this.handleEl.width(this.$refs.div.offsetWidth);
                this.handleEl.height(this.$refs.div.offsetHeight);
                $(document.body).append(this.handleEl);
            }
            let p = $(this.$refs.div).offset();
            this.handleEl.css("top",  p.top + "px");
            this.handleEl.css("left", e.pageX + "px");
        },
        onMouseUp:function(){
            let offset = this.handleEl.offset().left - this.mouseDownPoint.left;
            this.handleEl.remove();
            this.handleEl = null;
            $(window).off("mousemove", this.mousemove);
            $(window).off("mouseup", this.mouseup);
            this.mouseDownPoint = null;
            this.$emit('onresize', offset);
        }
    }
})