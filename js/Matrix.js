class DragImpl {
    constructor(el, rect = null) {
        this.el = el;
        this.rect = rect;
        this.mouseDownCallback = [];
        this.mouseMoveCallback = [];
        this.mouseUpCallback = [];
        let me = this;
        me.mouseDownFun = me._onMouseDown.bind(me);
        el.addEventListener("mousedown", me.mouseDownFun);
    }
    _onMouseDown(e) {
        let p = Point.init(e.offsetX, e.offsetY);
        if (this.rect != null && this.rect.containPoint(p) == false)
            return;
        this.lastOffsetPoint = p;
        for (let fun of this.mouseDownCallback) {
            fun(e, this.lastOffsetPoint);
        }
        this.mouseMoveFun = this._onMouseMove.bind(this);
        this.el.addEventListener("mousemove", this.mouseMoveFun);
        this.mouseUpFun = this._onMouseUp.bind(this);
        // @ts-ignore
        window.addEventListener("mouseup", this.mouseUpFun);
    }
    _onMouseMove(e) {
        let p = Point.init(e.offsetX, e.offsetY);
        if (this.rect != null && this.rect.containPoint(p) == false)
            return;
        this.offsetPoint = Point.init(e.offsetX - this.lastOffsetPoint.x, e.offsetY - this.lastOffsetPoint.y);
        for (let fun of this.mouseMoveCallback) {
            fun(e, this.offsetPoint);
        }
        this.lastOffsetPoint = p;
    }
    _onMouseUp(e) {
        for (let fun of this.mouseUpCallback) {
            fun(e);
        }
        this.offsetPoint = null;
        this.el.removeEventListener("mousemove", this.mouseMoveFun);
        // @ts-ignore
        window.removeEventListener("mouseup", this.mouseUpFun);
    }
    onMouseDown(fun) {
        this.mouseDownCallback.push(fun);
    }
    onMouseMove(fun) {
        this.mouseMoveCallback.push(fun);
    }
    onMouseUp(fun) {
        this.mouseUpCallback.push(fun);
    }
}
class TableRow {
    constructor(height) {
        this.height = height;
    }
}
class TableCol {
    constructor(width) {
        this.width = width;
    }
}
class Size {
    static init(width, height) {
        let s = new Size();
        s.width = width, s.height = height;
        return s;
    }
}
class Rect {
    static init(x, y, width, height) {
        let r = new Rect();
        r.x = x, r.y = y, r.width = width, r.height = height;
        return r;
    }
    setPosition(p) {
        this.x = p.x;
        this.y = p.y;
    }
    setSize(size) {
        this.width = size.width;
        this.height = size.height;
    }
    xyPoint() {
        return Point.init(this.x, this.y);
    }
    containPoint(p) {
        if (this.x <= p.x && this.x + this.width >= p.x &&
            this.y <= p.y && this.y + this.height >= p.y) {
            return true;
        }
        else {
            return false;
        }
    }
    containRect(rect) {
        if (this.x <= rect.x &&
            this.x + this.width >= rect.x + rect.width &&
            this.y <= rect.y &&
            this.y + this.height >= rect.y + rect.height) {
            return true;
        }
        else {
            return false;
        }
    }
}
class Point {
    static init(x, y) {
        let p = new Point();
        p.x = x, p.y = y;
        return p;
    }
}
// @ts-nocheck
Array.prototype.removeEl = function (o) {
    for (let i = this.length - 1; i >= 0; i++) {
        if (this[i] == 0) {
            this.splice(i, 1);
            return;
        }
    }
};
class Cmp {
    constructor() {
        this.mouseDownPoint = null;
        this.dragLastPoint = null;
        this.eventMap = new Map();
        this.childCmps = new Array();
        this.parentCmp = null;
        let me = this;
        this.rect = Rect.init(0, 0, 0, 0);
        this.config = {};
        this.config.enableMouseDown = false;
        this.config.enableMouseMove = false;
        this.config.enableMouseUp = false;
        this.config.enableMouseDrag = false;
        // this.on("paint", (ctx)=>{
        //   ctx.save();
        //   console.log(typeof me  + JSON.stringify(me.rect));
        //   ctx.translate(me.rect.x, me.rect.y);
        //   me.onPaint(ctx);
        //   ctx.restore();
        // });
    }
    paint(ctx) {
        //console.log(this.constructor.name  + JSON.stringify(this.rect));
        this.onPaint(ctx);
    }
    firePaint(ctx) {
        ctx.save();
        ctx.translate(this.rect.x, this.rect.y);
        for (const child of this.childCmps) {
            child.firePaint(ctx);
        }
        this.paint(ctx);
        ctx.restore();
    }
    beginPaint(ctx, xy0 = null) {
        ctx.save();
        if (xy0 != null) {
            ctx.translate(xy0.x, xy0.y);
        }
    }
    endPaint(ctx) {
        ctx.restore();
    }
    drawVerticalLine(ctx, left, top, width) {
        ctx.fillRect(left, top, 1, width);
    }
    ;
    drawHorizontalLine(ctx, left, top, width) {
        ctx.fillRect(left, top, width, 1);
    }
    appendChild(cmp) {
        if (cmp.parentCmp != null) {
            cmp.parentCmp.removeChild(cmp);
        }
        this.childCmps.push(cmp);
        cmp.parentCmp = this;
    }
    removeChild(cmp) {
        cmp.parentCmp = null;
        this.childCmps.removeEl(cmp);
    }
    fireEvent(eventName, param = null) {
        if (eventName == "mousedown") {
            let p = Point.init(param.offsetX, param.offsetY);
            this.fireMouseDown(p, param.shiftKey, param.ctrlKey);
            return;
        }
        else if (eventName == "mousemove") {
            let p = Point.init(param.offsetX, param.offsetY);
            this.fireMouseMove(p, param.shiftKey, param.ctrlKey);
            return;
        }
        else if (eventName == "mouseup") {
            let p = Point.init(param.offsetX, param.offsetY);
            this.fireMouseUp(p);
            return;
        }
        else if (eventName == "dblclick ") {
            let p = Point.init(param.offsetX, param.offsetY);
            this.fireMouseDblClick(p);
            return;
        }
        let arr = this.eventMap.get(eventName);
        if (arr) {
            for (const fun of arr) {
                fun(param);
            }
        }
        for (const child of this.childCmps) {
            child.fireEvent(eventName, param);
        }
    }
    onMouseDown(p, shift, ctrl) {
    }
    fireMouseDown(p, shift, ctrl) {
        if (this.config.enableMouseDown != true)
            return;
        this.onMouseDown(p, shift, ctrl);
        this.mouseDownPoint = p;
        this.dragLastPoint = p;
        for (let c of this.childCmps) {
            if (c.rect.containPoint(p)) {
                c.fireMouseDown(Point.init(p.x - c.rect.x, p.y - c.rect.y), shift, ctrl);
            }
        }
    }
    onMouseMove(p, shift, ctrl) {
    }
    fireMouseMove(p, shift, ctrl) {
        if (this.config.enableMouseMove != true)
            return;
        this.onMouseMove(p, shift, ctrl);
        if (this.mouseDownPoint && this.config.enableMouseDrag == true) {
            this.onMouseDrag(Point.init(p.x - this.mouseDownPoint.x, p.y - this.mouseDownPoint.y), Point.init(p.x - this.dragLastPoint.x, p.y - this.dragLastPoint.y), p, shift, ctrl);
            this.dragLastPoint = p;
        }
        for (let c of this.childCmps) {
            if (c.rect.containPoint(p)) {
                c.fireMouseMove(Point.init(p.x - c.rect.x, p.y - c.rect.y), shift, ctrl);
            }
        }
    }
    onMouseUp(p) {
    }
    fireMouseUp(p) {
        if (this.config.enableMouseUp != true)
            return;
        this.onMouseUp(p);
        this.mouseDownPoint = null;
        this.dragLastPoint = null;
        for (let c of this.childCmps) {
            c.fireMouseUp();
        }
    }
    onMouseDrag(offsetPoint, dragOffsetPoint, p, shift, ctrl) {
    }
    fireMouseDblClick(p) {
        this.onMouseDblClick(p);
        for (let c of this.childCmps) {
            if (c.rect.containPoint(p)) {
                c.fireMouseDblClick(Point.init(p.x - c.rect.x, p.y - c.rect.y));
            }
        }
    }
    onMouseDblClick(p) {
    }
    on(eventName, fun) {
        let em = this.eventMap;
        let arr = em.get(eventName);
        if (!arr) {
            arr = [];
            em.set(eventName, arr);
        }
        arr.push(fun);
    }
    off(eventName, fun) {
        let em = this.eventMap;
        let arr = em.get(eventName);
        if (!arr) {
            return false;
        }
        for (let i = arr.length - 1; i >= 0; i++) {
            if (fun == arr[i]) {
                arr.splice(i, 1);
                return true;
            }
        }
    }
}
class TableSetting {
    constructor() {
        this.cellDefaultMaxWidth = 600;
        this.font = "16px arial,sans-serif";
        this.fontStyle = 'black';
        this.cellBorderStyle = '#a7bfcc';
        this.cellSelectedFillStyle = "#ccdfeb";
        this.cellEditedFillStyle = "#F58E00";
        this.cellPaddingH = 8;
        this.cellPaddingV = 8;
        this.row0Height = 30;
        this.col0Width = 40;
        this.headerLinearGradientStart = "#cfd9df";
        this.headerLinearGradientEnd = "white";
        this.headerColor = "#429ed8";
        this.scrollbarColor = "#429ed8";
        this.scrollbarWidth = 20;
    }
    ;
}
class DataCell {
    constructor(text) {
        this.text = text;
        this.selected = false;
        this.selectedStart = false;
        this.edited = false;
        this.rect = Rect.init(0, 0, 0, 0);
    }
    setVal(v, matrix) {
        this.text = v;
        this.edited = true;
        this.refreshSize(matrix);
    }
    clearEdit() {
        this.edited = false;
    }
    refreshSize(matrix) {
        let size = matrix.measureCellSize(this);
        size.width += matrix.setting.cellPaddingH * 2;
        size.height += matrix.setting.cellPaddingV * 2;
        this.size = size;
    }
}
class Matrix extends Cmp {
    constructor(elParam) {
        super();
        this.config.enableMouseDown = true;
        this.config.enableMouseMove = true;
        this.config.enableMouseUp = true;
        this.config.enableMouseDrag = true;
        this.setting = new TableSetting();
        this.scrollTop = 0;
        this.scrollLeft = 0;
        this.spaceDown = false;
        if (typeof (elParam) == "string") {
            this.elId = elParam;
            this.el = document.getElementById(this.elId);
        }
        else {
            this.el = elParam;
            this.elId = elParam.id;
        }
        if (!this.el.getAttribute("tabindex")) {
            this.el.setAttribute("tabindex", "999");
        }
        // this.el.style.outline = "none";
        this.rect = Rect.init(0, 0, this.el.offsetWidth, this.el.offsetHeight);
        this.initCtx();
        this.initChild();
        this.initEvent();
    }
    initCtx() {
        this.refreshCtx();
    }
    refreshCtx() {
        this.ctx = this.el.getContext("2d");
        this.ctx.font = this.setting.font;
        this.ctx.textBaseline = "middle";
        this.ctx.textAlign = 'left';
        this.ctx.strokeStyle = "#000000";
        this.ctx.lineWidth = 1;
    }
    initChild() {
        this.row0 = new MatrixRow0(this);
        this.appendChild(this.row0);
        this.col0 = new MatrixCol0(this);
        this.appendChild(this.col0);
        this.centerData = new MatrixCenterData(this);
        this.appendChild(this.centerData);
        this.scrollbarH = new ScrollbarH();
        this.appendChild(this.scrollbarH);
        this.scrollbarV = new ScrollbarV();
        this.appendChild(this.scrollbarV);
    }
    initEvent() {
        let me = this;
        let mouseup = function (e) {
            me.fireEvent("mouseup", e);
            window.removeEventListener("mouseup", mouseup);
        };
        this.el.addEventListener("mousedown", (e) => {
            me.fireEvent("mousedown", e);
            window.addEventListener("mouseup", mouseup);
        });
        this.el.addEventListener("mousemove", (e) => {
            me.fireEvent("mousemove", e);
        });
        this.el.ondblclick = (e) => {
            me.fireEvent("dblclick ", e);
        };
        this.el.addEventListener("keydown", (e) => {
            if (e.code == "Space" && me.spaceDown == false) {
                me.spaceDown = true;
                me.el.style.cursor = "grab";
            }
            let r = this.onkeyDown(e.code, e.shiftKey, e.ctrlKey);
            if (r) {
                e.preventDefault();
            }
            if (e.code == "Space") {
                e.preventDefault();
            }
        });
        this.el.addEventListener("keyup", (e) => {
            if (e.code == "Space") {
                me.spaceDown = false;
                me.el.style.cursor = "unset";
                e.preventDefault();
            }
        });
        this.el.addEventListener("wheel", (e) => {
            me.scrollTo(me.scrollTop - e.wheelDeltaY, me.scrollLeft - e.wheelDeltaX);
        });
        document.body.addEventListener("paste", (e) => {
            me.fireEvent("paste", e);
        });
    }
    resetSize(width, height) {
        this.el.width = width;
        this.el.height = height;
        this.rect = Rect.init(0, 0, this.el.offsetWidth, this.el.offsetHeight);
        this.reLayout(true);
        this.repaint();
    }
    onkeyDown(keyCode, shift, ctrl) {
        return this.centerData.onkeyDown(keyCode, shift, ctrl);
    }
    onMouseDown(p) {
        if (p.x < this.row0.rect.x && p.y < this.col0.rect.y) {
            this.centerData.selectAllCells();
        }
    }
    onMouseDblClick(p) {
        if (p.x < this.row0.rect.x && p.y < this.col0.rect.y) {
            this.row0.resizeAllColumn();
        }
    }
    setCursor(cursor) {
        this.el.style.cursor = cursor;
    }
    showObjDataWidthResize(headers, datas, width, height) {
        this.el.width = width;
        this.el.height = height;
        this.rect = Rect.init(0, 0, this.el.offsetWidth, this.el.offsetHeight);
        this.showObjData(headers, datas);
    }
    // 数组里面obj显示
    showObjData(headers, datas) {
        let dataList = [];
        for (let row of datas) {
            let rowList = [];
            for (let header of headers) {
                rowList.push(row[header]);
            }
            dataList.push(rowList);
        }
        this.showData(headers, dataList);
    }
    // 二维数组显示
    showData(headers, datas) {
        this.initCtx();
        this.centerData.setData(datas);
        this.row0.setHeaderData(headers);
        this.col0.resetData();
        this.reLayout();
        this.firePaint(this.ctx);
    }
    getEditedRowObjs() {
        return this.centerData.getEditedRowObjs();
    }
    clearEdit() {
        this.centerData.clearEdit();
    }
    reLayout(resetHeader = false) {
        if (resetHeader == false) {
            this.centerData.reLayout();
            this.row0.reLayout();
        }
        else {
            this.row0.resetCanvasSize();
        }
        this.col0.reLayout();
        this.centerData.reComputeCellPosition();
        let st = this.setting;
        this.row0.rect = Rect.init(st.col0Width, 0, this.rect.width - st.col0Width - this.scrollbarV.getWidth(), st.row0Height);
        this.col0.rect = Rect.init(0, st.row0Height, st.col0Width, this.rect.height - st.row0Height - this.scrollbarH.getHeight());
        this.centerData.rect = Rect.init(st.col0Width, st.row0Height, this.rect.width - st.col0Width - this.scrollbarV.getWidth(), this.rect.height - st.row0Height - this.scrollbarH.getHeight());
        if (this.scrollbarV.isVisible()) {
            this.scrollbarV.rect = Rect.init(this.col0.rect.width + this.centerData.rect.width, 0, st.scrollbarWidth, this.rect.height);
        }
        if (this.scrollbarH.isVisible()) {
            this.scrollbarH.rect = Rect.init(0, this.row0.rect.height + this.centerData.rect.height, this.rect.width - this.scrollbarV.getWidth(), st.scrollbarWidth);
        }
        this.centerData.reRend();
        this.row0.reRend();
        this.col0.reRend();
    }
    onPaint(ctx) {
        ctx.fillStyle = this.setting.cellBorderStyle;
        this.drawHorizontalLine(ctx, 0, 0, this.rect.width);
        this.drawHorizontalLine(ctx, 0, this.rect.height - 1, this.rect.width);
        this.drawHorizontalLine(ctx, 0, this.setting.row0Height - 1, this.setting.col0Width);
        this.drawVerticalLine(ctx, 0, 0, this.rect.height);
        this.drawVerticalLine(ctx, this.rect.x + this.rect.width - 1, 0, this.rect.height);
        this.drawVerticalLine(ctx, this.setting.col0Width - 1, 0, this.setting.row0Height);
    }
    measureCellSize(cell) {
        let m = this.ctx.measureText(cell.text);
        let width = Math.ceil(m.width);
        let height = Math.ceil(m.actualBoundingBoxAscent + m.actualBoundingBoxDescent);
        return Size.init(width, height);
    }
    scrollTo(scrollTop, scrollLeft) {
        if (this.scrollbarV.isVisible()) {
            this.scrollTop = scrollTop;
            if (this.scrollTop < 0)
                this.scrollTop = 0;
            if (this.scrollTop + this.el.offsetHeight > this.row0.canvasSize.height + this.centerData.canvasSize.height + this.scrollbarH.getHeight()) {
                this.scrollTop = this.row0.canvasSize.height + this.centerData.canvasSize.height + this.scrollbarH.getHeight() - this.el.offsetHeight;
            }
        }
        if (this.scrollbarH.isVisible()) {
            this.scrollLeft = scrollLeft;
            if (this.scrollLeft < 0)
                this.scrollLeft = 0;
            if (this.scrollLeft + this.el.offsetWidth > this.col0.canvasSize.width + this.centerData.canvasSize.width + this.scrollbarV.getWidth()) {
                this.scrollLeft = this.col0.canvasSize.width + this.centerData.canvasSize.width + this.scrollbarV.getWidth() - this.el.width + 1;
            }
        }
        this.repaint();
    }
    repaint() {
        this.firePaint(this.ctx);
    }
}
class MatrixCenterData extends Cmp {
    constructor(matrix) {
        super();
        this.config.enableMouseDown = true;
        this.config.enableMouseMove = true;
        this.config.enableMouseUp = true;
        this.config.enableMouseDrag = true;
        this.matrix = matrix;
        this.canvasEl = document.createElement("canvas");
        this.canvasCtx = this.canvasEl.getContext("2d");
        this.selectedCells = [];
        this.selectStartCell = null;
        this.mouseDownCell = null;
        this.editedCells = [];
        // document.body.appendChild(this.canvasEl);
        let me = this;
        this.on("paste", (e) => {
            if (me.parentCmp.el == document.activeElement) {
                me.onPaste(e);
            }
        });
    }
    onMouseDown(p, shift, ctrl) {
        if (this.matrix.spaceDown) {
            this.mouseDownScrollTop = this.matrix.scrollTop;
            this.mouseDownScrollLeft = this.matrix.scrollLeft;
        }
        else {
            let cell = this.getCellByPoint(p.x, p.y);
            if (!cell)
                return;
            if (shift && this.selectedCells.length > 0) {
                this.selectCellRange(this.selectStartCell, cell);
            }
            else {
                this.mouseDownCell = cell;
                this.lastDragCell = cell;
                this.selectCell(cell);
            }
        }
        // console.log("mousedown" + JSON.stringify(arguments));
    }
    onMouseDblClick(p) {
        let cell = this.getCellByPoint(p.x, p.y);
        if (!cell)
            return;
        this.inputCellValue(cell);
    }
    onMouseDrag(offsetPoint, dragOffsetPoint, p, shift, ctrl) {
        if (this.matrix.spaceDown) {
            this.matrix.scrollTo(this.mouseDownScrollTop - offsetPoint.y, this.mouseDownScrollLeft - offsetPoint.x);
        }
        else {
            let cell = this.getCellByPoint(p.x, p.y);
            if (!cell || this.lastDragCell == cell)
                return;
            this.lastDragCell = cell;
            if (cell != this.mouseDownCell) {
                if (shift && this.selectedCells.length > 0) {
                    this.selectCellRange(this.selectStartCell, cell);
                }
                else {
                    this.selectCellRange(this.mouseDownCell, cell);
                }
            }
        }
    }
    onMouseUp() {
        this.mouseDownCell = null;
    }
    onkeyDown(keyCode, shift, ctrl) {
        let returnVal = false;
        if (this.selectedCells.length == 0)
            return;
        let tsc;
        let newSelectCells = [];
        let reSelectFlg = false;
        if (keyCode == "ArrowUp") {
            tsc = ctrl ? this.getColFirstCell(this.selectStartCell) : this.getUpCell(this.selectStartCell);
            if (!tsc)
                return;
            reSelectFlg = true;
        }
        else if (keyCode == "ArrowDown") {
            tsc = ctrl ? this.getColLastCell(this.selectStartCell) : this.getDownCell(this.selectStartCell);
            if (!tsc)
                return;
            reSelectFlg = true;
        }
        else if (keyCode == "ArrowLeft") {
            tsc = ctrl ? this.getRowFirstCell(this.selectStartCell) : this.getLeftCell(this.selectStartCell);
            if (!tsc)
                return;
            reSelectFlg = true;
        }
        else if (keyCode == "ArrowRight") {
            tsc = ctrl ? this.getRowLastCell(this.selectStartCell) : this.getRightCell(this.selectStartCell);
            if (!tsc)
                return;
            reSelectFlg = true;
        }
        else if (keyCode == "Enter" || keyCode == "NumpadEnter") {
            tsc = ctrl ? this.getColLastCell(this.selectStartCell) : this.getDownCell(this.selectStartCell);
            if (!tsc)
                return;
            reSelectFlg = true;
        }
        else if (keyCode == "Tab") {
            tsc = ctrl ? this.getRowLastCell(this.selectStartCell) : this.getRightCell(this.selectStartCell);
            if (!tsc)
                return;
            reSelectFlg = true;
        }
        else {
            if (ctrl && keyCode == "KeyC") {
                let vs = [];
                let corner = this.getSelectedCorner();
                for (let row = corner.leftTop.rowIndex; row <= corner.rightBottom.rowIndex; row++) {
                    let rowVs = [];
                    for (let col = corner.leftTop.colIndex; col <= corner.rightBottom.colIndex; col++) {
                        rowVs.push(this.getCell(row, col).text);
                    }
                    vs.push(rowVs.join("\t"));
                }
                navigator.clipboard.writeText(vs.join("\n"));
            }
            else if (keyCode == "F2") {
                this.inputCellValue(this.selectStartCell);
            }
            return;
        }
        if (reSelectFlg) {
            let corner = this.getSelectedCorner();
            if (this.selectStartCell == corner.leftTop) {
                this.selectCell(tsc);
                if (shift)
                    this.selectCellRange(corner.rightBottom, tsc);
            }
            if (this.selectStartCell == corner.leftBottom) {
                this.selectCell(tsc);
                if (shift)
                    this.selectCellRange(corner.rightTop, tsc);
            }
            if (this.selectStartCell == corner.rightTop) {
                this.selectCell(tsc);
                if (shift)
                    this.selectCellRange(corner.leftBottom, tsc);
            }
            if (this.selectStartCell == corner.rightBottom) {
                this.selectCell(tsc);
                if (shift)
                    this.selectCellRange(corner.leftTop, tsc);
            }
            returnVal = true;
        }
        this.scrollToViewCell(tsc);
        return returnVal;
    }
    onPaste(e) {
        let v = e.clipboardData.getData('Text');
        let rows = v.split(/\n|\r\n/);
        let values = [];
        for (let row of rows) {
            values.push(row.split("\t"));
        }
        if (values.length == 1 && values[0].length == 1) {
            let v = values[0][0];
            for (let cell of this.selectedCells) {
                this.setCellValue(cell, v);
            }
            this.repaintCell(this.selectedCells);
        }
        else {
            let repaintCells = [];
            let cc = this.selectStartCell;
            for (let row = 0; row < values.length; row++) {
                for (let col = 0; col < values[row].length; col++) {
                    let c = this.getCell(this.selectStartCell.rowIndex + row, this.selectStartCell.colIndex + col);
                    if (c) {
                        this.setCellValue(c, values[row][col]);
                        repaintCells.push(c);
                    }
                }
            }
            this.repaintCell(repaintCells);
        }
    }
    setData(data) {
        this.data = data;
        let dataCells = new Array();
        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            let cellRow = new Array();
            for (let j = 0; j < row.length; j++) {
                let cell = new DataCell(row[j]);
                cell.rowIndex = i;
                cell.colIndex = j;
                cellRow.push(cell);
            }
            dataCells.push(cellRow);
        }
        this.dataCells = dataCells;
    }
    reLayout() {
        for (let i = 0; i < this.dataCells.length; i++) {
            let row = this.dataCells[i];
            for (let j = 0; j < row.length; j++) {
                let cell = row[j];
                cell.rowIndex = i;
                cell.colIndex = j;
                cell.refreshSize(this.matrix);
            }
        }
    }
    reComputeCellPosition() {
        for (let i = 0; i < this.dataCells.length; i++) {
            const row = this.dataCells[i];
            const col0Cell = this.matrix.col0.col0Cells[i];
            for (let j = 0; j < row.length; j++) {
                const cell = row[j];
                const row0Cell = this.matrix.row0.row0Cells[j];
                cell.rect = Rect.init(row0Cell.rect.x, col0Cell.rect.y, row0Cell.rect.width, col0Cell.rect.height);
            }
        }
        this.resetCanvasSize();
    }
    resetCanvasSize() {
        let cells = this.dataCells;
        let lastRow = cells[cells.length - 1];
        let lastCell = lastRow[lastRow.length - 1];
        this.canvasSize = Size.init(lastCell.rect.x + lastCell.rect.width, lastCell.rect.y + lastCell.rect.height);
        this.canvasEl.setAttribute("width", this.canvasSize.width);
        this.canvasEl.setAttribute("height", this.canvasSize.height);
    }
    getCanvasCtx() {
        let ctx = this.canvasCtx;
        ctx.font = this.matrix.setting.font;
        ctx.textBaseline = "middle";
        ctx.textAlign = 'left';
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 1;
        return ctx;
    }
    reRend() {
        let ctx = this.getCanvasCtx();
        ctx.clearRect(0, 0, this.canvasSize.width, this.canvasSize.height);
        for (let row of this.dataCells) {
            for (let cell of row) {
                this._drawCell(ctx, cell);
            }
        }
    }
    getImageData(rect) {
        return this.canvasCtx.getImageData(rect.x, rect.y, rect.width, rect.height);
    }
    inputCellValue(cell) {
        let v = prompt("input value:", cell.text);
        if (v && v != cell.text) {
            this.setCellValue(this.selectStartCell, v);
            this.repaintCell([this.selectStartCell]);
        }
    }
    selectCellRange(c1, c2) {
        let startRowIndex = -1;
        let endRowIndex = -1;
        let startColIndex = -1;
        let endColIndex = -1;
        if (c1.rowIndex < c2.rowIndex) {
            startRowIndex = c1.rowIndex;
            endRowIndex = c2.rowIndex;
        }
        else {
            startRowIndex = c2.rowIndex;
            endRowIndex = c1.rowIndex;
        }
        if (c1.colIndex < c2.colIndex) {
            startColIndex = c1.colIndex;
            endColIndex = c2.colIndex;
        }
        else {
            startColIndex = c2.colIndex;
            endColIndex = c1.colIndex;
        }
        let selectCells = [];
        for (let i = startRowIndex; i <= endRowIndex; i++) {
            for (let j = startColIndex; j <= endColIndex; j++) {
                selectCells.push(this.dataCells[i][j]);
            }
        }
        this.selectCell(selectCells);
    }
    selectAllCells() {
        let cs = [];
        for (let row of this.dataCells) {
            for (let cell of row) {
                cs.push(cell);
            }
        }
        this.selectCell(cs);
    }
    selectRowCells(rowIndex) {
        let cs = [];
        let row = this.dataCells[rowIndex];
        for (let cell of row) {
            cs.push(cell);
        }
        this.selectCell(cs);
    }
    selectCell(cs) {
        let repaintCells = [];
        for (let c of this.selectedCells) {
            c.selected = false;
            if (!Array.isArray(cs)) {
                c.selectedStart = false;
            }
            repaintCells.push(c);
        }
        if (!Array.isArray(cs)) {
            this.selectStartCell = null;
        }
        this.selectedCells = [];
        if (Array.isArray(cs)) {
            for (let c of cs) {
                c.selected = true;
                this.selectedCells.push(c);
                repaintCells.push(c);
            }
        }
        else {
            cs.selected = true;
            cs.selectedStart = true;
            this.selectStartCell = cs;
            this.selectedCells.push(cs);
            repaintCells.push(cs);
        }
        this.repaintCell(repaintCells);
    }
    clearSelect() {
        let repaintCells = [];
        for (let c of this.selectedCells) {
            c.selected = false;
            c.selectedStart = false;
            repaintCells.push(c);
        }
        this.repaintCell(repaintCells);
    }
    scrollToViewCell(cell) {
        let r = cell.rect;
        let view = Rect.init(this.matrix.scrollLeft, this.matrix.scrollTop, this.rect.width, this.rect.height);
        if (view.containRect(r)) {
        }
        else {
            if (r.x + r.width > view.x + view.width) {
                let offset = (r.x + r.width) - (view.x + view.width);
                this.matrix.scrollLeft += offset; // + xScrollOffset;
            }
            else if (r.x < view.x) {
                let offset = view.x - r.x;
                this.matrix.scrollLeft -= offset;
            }
            else if (r.y + r.height > view.y + view.height) {
                let offset = (r.y + r.height) - (view.y + view.height);
                this.matrix.scrollTop += offset; // + yScrollOffset;
            }
            else if (r.y < view.y) {
                let offset = view.y - r.y;
                this.matrix.scrollTop -= offset;
            }
            this.matrix.repaint();
        }
    }
    repaintCell(cs) {
        let ctx = this.getCanvasCtx();
        for (let c of cs) {
            this._drawCell(ctx, c);
        }
        // this.onPaint(this.matrix.ctx);
        this.matrix.repaint();
    }
    onPaint(ctx) {
        //console.log("paint");
        // this.paintToContext(ctx, Point.init(0,0), Rect.init(0, 0, this.rect.width, this.rect.height) )
        let imDat = this.getImageData(Rect.init(this.matrix.scrollLeft, this.matrix.scrollTop, this.rect.width, this.rect.height));
        ctx.putImageData(imDat, this.matrix.setting.col0Width, this.matrix.setting.row0Height);
        // ctx.fillStyle = "blue";
        // ctx.fillRect(0, 0, this.rect.width, this.rect.height);
    }
    _drawCell(ctx, cell) {
        const setting = this.matrix.setting;
        this.beginPaint(ctx, cell.rect.xyPoint());
        let defStrokeStyle = ctx.strokeStyle;
        // draw bg
        if (cell.selected) {
            ctx.fillStyle = setting.cellSelectedFillStyle;
            ctx.fillRect(2, 2, cell.rect.width - 3, cell.rect.height - 3);
            if (cell.selectedStart) {
                ctx.beginPath();
                ctx.rect(2, 2, cell.rect.width - 3, cell.rect.height - 3);
                ctx.stroke();
            }
        }
        else {
            ctx.clearRect(1, 1, cell.rect.width - 1, cell.rect.height - 1);
        }
        // draw edited cell icon
        if (cell.edited) {
            ctx.fillStyle = setting.cellEditedFillStyle;
            ctx.fillRect(5, cell.rect.height - 5, cell.rect.width - 10, 2);
        }
        // draw border
        ctx.fillStyle = setting.cellBorderStyle;
        this.drawHorizontalLine(ctx, 0, cell.rect.height, cell.rect.width);
        this.drawVerticalLine(ctx, cell.rect.width, 0, cell.rect.height);
        // 如果文字宽度大于单元格宽度，设置裁切范围
        // if(cell.rect.width < cell.size.width){
        ctx.beginPath();
        ctx.rect(1, 1, cell.rect.width - 2, cell.rect.height - 2);
        ctx.clip();
        // }
        // draw text
        ctx.fillStyle = setting.fontStyle;
        if (cell.text != null) {
            ctx.fillText(cell.text, setting.cellPaddingH, cell.rect.height / 2);
        }
        this.endPaint(ctx);
    }
    sortByColIndex(colIndex, sort) {
        this.clearSelect();
        let fun = (a, b) => {
            if (a[colIndex].text == null)
                return 1;
            return a[colIndex].text > b[colIndex].text ? 1 : -1;
        };
        if (sort == "desc") {
            fun = (a, b) => {
                if (a[colIndex].text == null)
                    return -1;
                return a[colIndex].text > b[colIndex].text ? -1 : 1;
            };
        }
        this.dataCells.sort(fun);
        this.matrix.reLayout();
        this.matrix.repaint();
    }
    getCellByPoint(x, y) {
        x = this.matrix.scrollLeft + x;
        y = this.matrix.scrollTop + y;
        let rowIndex = -1;
        let colIndex = -1;
        let row0 = this.dataCells[0];
        for (let i = 0; i < row0.length; i++) {
            if (x >= row0[i].rect.x && x <= row0[i].rect.x + row0[i].rect.width) {
                colIndex = i;
            }
        }
        for (let i = 0; i < this.dataCells.length; i++) {
            if (y >= this.dataCells[i][0].rect.y &&
                y <= this.dataCells[i][0].rect.y + this.dataCells[i][0].rect.height) {
                rowIndex = i;
            }
        }
        if (rowIndex == -1 || colIndex == -1) {
            return null;
        }
        return this.getCell(rowIndex, colIndex);
    }
    setCellValue(cell, val) {
        if (cell.text == val)
            return;
        cell.setVal(val, this.matrix);
        this.editedCells.push(cell);
    }
    getEditedRowObjs() {
        let result = [];
        let editdRowIndex = new Set();
        for (let cell of this.editedCells) {
            editdRowIndex.add(cell.rowIndex);
        }
        let idColIndex = null;
        let idColName = null;
        let idReg = /^id$/i;
        for (let i = 0; i < this.matrix.row0.row0Cells.length; i++) {
            let header = this.matrix.row0.row0Cells[i];
            if (idReg.test(header.text)) {
                idColIndex = i;
                idColName = header.text;
                break;
            }
        }
        for (let rowIndex of editdRowIndex) {
            let row = this.dataCells[rowIndex];
            let rec = {};
            for (let cell of this.editedCells) {
                if (cell.rowIndex == rowIndex) {
                    let header = this.matrix.row0.row0Cells[cell.colIndex].text;
                    rec[header] = cell.text;
                }
            }
            if (idColIndex != null) {
                rec[idColName] = this.dataCells[rowIndex][idColIndex].text;
            }
            result.push(rec);
        }
        return result;
    }
    clearEdit() {
        for (let editedCell of this.editedCells) {
            editedCell.clearEdit();
        }
        this.repaintCell(this.editedCells);
        this.editedCells = [];
    }
    getCell(rowIndex, colIndex) {
        if (rowIndex >= this.dataCells.length || colIndex >= this.dataCells[0].length) {
            return null;
        }
        return this.dataCells[rowIndex][colIndex];
    }
    getUpCell(cell) {
        if (cell.rowIndex - 1 < 0) {
            return null;
        }
        return this.dataCells[cell.rowIndex - 1][cell.colIndex];
    }
    getDownCell(cell) {
        if (cell.rowIndex + 1 >= this.dataCells.length) {
            return null;
        }
        return this.dataCells[cell.rowIndex + 1][cell.colIndex];
    }
    getLeftCell(cell) {
        if (cell.colIndex - 1 < 0) {
            return null;
        }
        return this.dataCells[cell.rowIndex][cell.colIndex - 1];
    }
    getRightCell(cell) {
        if (cell.colIndex + 1 >= this.dataCells[cell.rowIndex].length) {
            return null;
        }
        return this.dataCells[cell.rowIndex][cell.colIndex + 1];
    }
    getRowLastCell(cell) {
        return this.dataCells[cell.rowIndex][this.dataCells[cell.rowIndex].length - 1];
    }
    getRowFirstCell(cell) {
        return this.dataCells[cell.rowIndex][0];
    }
    getColLastCell(cell) {
        return this.dataCells[this.dataCells.length - 1][cell.colIndex];
    }
    getColFirstCell(cell) {
        return this.dataCells[0][cell.colIndex];
    }
    getSelectedCorner() {
        let left = null;
        let top = null;
        let right = null;
        let bottom = null;
        for (let sc of this.selectedCells) {
            if (left == null || sc.colIndex < left) {
                left = sc.colIndex;
            }
            if (top == null || sc.rowIndex < top) {
                top = sc.rowIndex;
            }
            if (right == null || sc.colIndex > right) {
                right = sc.colIndex;
            }
            if (bottom == null || sc.rowIndex > bottom) {
                bottom = sc.rowIndex;
            }
        }
        return { leftTop: this.getCell(top, left),
            rightTop: this.getCell(top, right),
            leftBottom: this.getCell(bottom, left),
            rightBottom: this.getCell(bottom, right) };
    }
}
class MatrixRow0 extends Cmp {
    constructor(matrix) {
        super();
        this.config.enableMouseDown = true;
        this.config.enableMouseMove = true;
        this.config.enableMouseUp = false;
        this.config.enableMouseDrag = true;
        this.matrix = matrix;
        this.dragingRect = null;
        this.dragingCell = null;
        this.sortCell = null;
    }
    // headerCell new instance
    setHeaderData(headerData) {
        this.headerData = headerData;
        let row0Cells = new Array();
        for (let d of headerData) {
            let dataCell = new DataCell(d);
            row0Cells.push(dataCell);
        }
        this.row0Cells = row0Cells;
        this.canvasEl = document.createElement("canvas");
        this.canvasCtx = this.canvasEl.getContext("2d");
        // document.body.appendChild(this.canvasEl);
    }
    // set headerCell's rect info
    reLayout() {
        let dataCells = this.matrix.centerData.dataCells;
        let colCount = dataCells[0].length;
        for (let colIndex = 0; colIndex < colCount; colIndex++) {
            let colMaxWidth = 0;
            for (let rowIndex = 0; rowIndex < dataCells.length; rowIndex++) {
                let cell = dataCells[rowIndex][colIndex];
                if (cell.size.width > colMaxWidth) {
                    colMaxWidth = cell.size.width;
                }
            }
            let headerCell = this.row0Cells[colIndex];
            headerCell.refreshSize(this.matrix);
            if (headerCell.size.width > colMaxWidth) {
                colMaxWidth = headerCell.size.width;
            }
            if (colMaxWidth > this.matrix.setting.cellDefaultMaxWidth) {
                colMaxWidth = this.matrix.setting.cellDefaultMaxWidth;
            }
            headerCell.rect.setSize(Size.init(colMaxWidth, this.matrix.setting.row0Height));
        }
        let offSetWidth = 0;
        for (let i = 0; i < this.row0Cells.length; i++) {
            let headerCell = this.row0Cells[i];
            headerCell.rect.setPosition(Point.init(offSetWidth, 0));
            offSetWidth += headerCell.rect.width;
        }
        // 总长度小于组件宽度的时候，最后一列拉长自适应
        // let lastCell = this.row0Cells[this.row0Cells.length-1];
        // if(lastCell.rect.x + lastCell.rect.width < this.rect.width){
        //     let adjustWidth = this.matrix.setting.col0Width + this.matrix.setting.scrollbarWidth;
        //     lastCell.rect.width = this.matrix.el.offsetWidth - lastCell.rect.x - adjustWidth;
        // }
        this.resetCanvasSize();
    }
    resetCanvasSize() {
        let lastHeaderCell = this.row0Cells[this.row0Cells.length - 1];
        this.canvasSize = Size.init(lastHeaderCell.rect.x + lastHeaderCell.rect.width, this.matrix.setting.row0Height);
        this.canvasEl.setAttribute("width", this.canvasSize.width);
        this.canvasEl.setAttribute("height", this.canvasSize.height);
    }
    getImageData(rect) {
        return this.canvasCtx.getImageData(rect.x, rect.y, rect.width, rect.height);
    }
    onPaint(ctx) {
        let imDat = this.getImageData(Rect.init(this.matrix.scrollLeft, 0, this.rect.width, this.rect.height));
        ctx.putImageData(imDat, this.matrix.setting.col0Width, 0);
    }
    reRend() {
        let ctx = this.canvasCtx;
        ctx.font = this.matrix.setting.font;
        ctx.textBaseline = "middle";
        ctx.textAlign = 'left';
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 1;
        ctx.clearRect(0, 0, this.canvasSize.width, this.canvasSize.height);
        this._drawCells(ctx);
    }
    _drawCells(ctx) {
        let setting = this.matrix.setting;
        ctx.fillStyle = setting.cellBorderStyle;
        this.drawHorizontalLine(ctx, 0, 0, this.canvasSize.width);
        this.drawHorizontalLine(ctx, 0, this.canvasSize.height - 1, this.canvasSize.width);
        ctx.fillStyle = "white";
        for (let i = 0; i < this.row0Cells.length; i++) {
            const cell = this.row0Cells[i];
            this._drawCell(ctx, cell, i);
        }
        this.beginPaint(ctx, Point.init(0, 0));
        if (this.dragingRect != null) {
            ctx.fillStyle = "black";
            ctx.globalAlpha = 0.5;
            ctx.fillRect(this.dragingRect.x, this.dragingRect.y, this.dragingRect.width, this.dragingRect.height);
            ctx.globalAlpha = 1.0;
        }
        this.endPaint(ctx);
    }
    _drawCell(ctx, cell, index) {
        this.beginPaint(ctx, cell.rect.xyPoint());
        ctx.fillStyle = this.matrix.setting.headerColor;
        ctx.fillRect(2, 2, cell.rect.width - 3, this.matrix.setting.row0Height - 4);
        ctx.fillStyle = this.matrix.setting.cellBorderStyle;
        this.drawVerticalLine(ctx, cell.rect.width, 0, this.matrix.setting.row0Height);
        if (index == 0) {
            this.drawVerticalLine(ctx, -1, 0, this.matrix.setting.row0Height);
        }
        ctx.fillStyle = "white";
        let txt = cell.text;
        let sort = cell.sort;
        if (sort == "asc")
            txt = "↑ " + txt;
        if (sort == "desc")
            txt = "↓ " + txt;
        ctx.fillText(txt, this.matrix.setting.cellPaddingH, this.matrix.setting.row0Height / 2 + 2);
        this.endPaint(ctx);
    }
    onMouseMove(p, shift, ctrl) {
        p.x += this.matrix.scrollLeft;
        p.y += this.matrix.scrollTop;
        if (this.isPointOnPadding(p)) {
            this.matrix.setCursor("col-resize");
        }
        else {
            this.matrix.setCursor("default");
        }
    }
    onMouseDown(p, shift, ctrl) {
        p.x += this.matrix.scrollLeft;
        p.y += this.matrix.scrollTop;
        if (this.isPointOnPadding(p)) {
            this.dragingCell = this.getDragCell(p);
            this.dragingRect = Rect.init(p.x - 3, 0, 6, this.rect.height);
            this.reRend();
            this.matrix.repaint();
            this.onWindowMouseUpFun = this.onWindowMouseUp.bind(this);
            window.addEventListener("mouseup", this.onWindowMouseUpFun);
        }
        this.onClickSort(p, ctrl);
    }
    onMouseDrag(offsetPoint, dragOffsetPoint, p, shift, ctrl) {
        if (this.dragingCell == null)
            return;
        console.log(dragOffsetPoint);
        this.dragingRect = Rect.init(p.x - 3, 0, 6, this.rect.height);
        if (this.dragingRect.x + 3 - this.dragingCell.rect.x < 15) {
            this.dragingRect.x = this.dragingCell.rect.x + 15;
        }
        this.reRend();
        this.matrix.repaint();
    }
    onWindowMouseUp() {
        let x = this.dragingRect.x + 3;
        this.dragingCell.rect.width = x - this.dragingCell.rect.x;
        let dragingCellIndex = null;
        for (let i = 0; i < this.row0Cells.length; i++) {
            const cell = this.row0Cells[i];
            if (cell == this.dragingCell) {
                dragingCellIndex = i;
            }
            if (dragingCellIndex != null &&
                i > dragingCellIndex) {
                this.row0Cells[i].rect.x = this.row0Cells[i - 1].rect.x + this.row0Cells[i - 1].rect.width;
            }
        }
        this.dragingRect = null;
        this.dragingCell = null;
        this.matrix.reLayout(true);
        this.matrix.repaint();
        window.removeEventListener("mouseup", this.onWindowMouseUpFun);
        this.mouseDownPoint = null;
        this.dragLastPoint = null;
    }
    onMouseDblClick(p) {
        p.x += this.matrix.scrollLeft;
        p.y += this.matrix.scrollTop;
        if (this.isPointOnPadding(p)) {
            this.dragingCell = this.getDragCell(p);
            let index = this.row0Cells.indexOf(this.dragingCell);
            let toWidth = 0;
            for (let row of this.matrix.centerData.dataCells) {
                if (toWidth < row[index].size.width) {
                    toWidth = row[index].size.width;
                }
            }
            this.dragingCell.rect.width = toWidth;
            this.recomputeRow0X();
            this.matrix.reLayout(true);
            this.matrix.repaint();
        }
    }
    recomputeRow0X() {
        for (let i = 1; i < this.row0Cells.length; i++) {
            const cell = this.row0Cells[i];
            this.row0Cells[i].rect.x = this.row0Cells[i - 1].rect.x + this.row0Cells[i - 1].rect.width;
        }
    }
    resizeAllColumn() {
        for (let index = 0; index < this.matrix.centerData.dataCells[0].length; index++) {
            let toWidth = 0;
            for (let row of this.matrix.centerData.dataCells) {
                if (toWidth < row[index].size.width) {
                    toWidth = row[index].size.width;
                }
            }
            this.row0Cells[index].rect.width = toWidth;
        }
        this.recomputeRow0X();
        this.matrix.reLayout(true);
        this.matrix.repaint();
    }
    getDragCell(p) {
        for (let i = 0; i < this.row0Cells.length; i++) {
            const cell = this.row0Cells[i];
            if (cell.rect.x <= p.x && cell.rect.x + cell.rect.width >= p.x) {
                if (p.x - cell.rect.x <= 3) {
                    if (i == 0)
                        return null;
                    return this.row0Cells[i - 1];
                }
                else if (cell.rect.x + cell.rect.width - p.x <= 3) {
                    return this.row0Cells[i];
                }
                else {
                    return null;
                }
            }
        }
    }
    isPointOnPadding(p) {
        for (let i = 0; i < this.row0Cells.length; i++) {
            const cell = this.row0Cells[i];
            if (cell.rect.x <= p.x && cell.rect.x + cell.rect.width >= p.x) {
                if (p.x - cell.rect.x <= 3) {
                    return i == 0 ? false : true;
                }
                else if (cell.rect.x + cell.rect.width - p.x <= 3) {
                    return true;
                }
                else {
                    return false;
                }
            }
        }
        return false;
    }
    getCellByPoint(p) {
        for (let i = 0; i < this.row0Cells.length; i++) {
            let c = this.row0Cells[i];
            if (c.rect.x < p.x && c.rect.x + c.rect.width > p.x) {
                return c;
            }
        }
    }
    getCellIndex(c) {
        return this.row0Cells.indexOf(c);
    }
    onClickSort(p, ctrl) {
        if (ctrl) {
            let c = this.getCellByPoint(p);
            let colIndex = this.getCellIndex(c);
            if (this.sortCell && this.sortCell != c) {
                delete this.sortCell.sort;
            }
            let cell = c;
            if (cell.sort) {
                cell.sort = cell.sort == "asc" ? "desc" : "asc";
            }
            else {
                cell.sort = "asc";
            }
            this.sortCell = c;
            this.matrix.centerData.sortByColIndex(colIndex, cell.sort);
        }
    }
}
class MatrixCol0 extends Cmp {
    constructor(matrix) {
        super();
        this.matrix = matrix;
        this.col0Cells = null;
        this.config.enableMouseDown = true;
        this.config.enableMouseMove = false;
        this.config.enableMouseUp = false;
        this.config.enableMouseDrag = false;
        this.canvasEl = document.createElement("canvas");
        this.canvasCtx = this.canvasEl.getContext("2d");
        // document.body.appendChild(this.canvasEl);
    }
    onMouseDown(p, shift, ctrl) {
        let ri = this.getCellIndex(this.getCellByPoint(p));
        this.matrix.centerData.selectRowCells(ri);
    }
    resetData() {
        let cells = this.matrix.centerData.dataCells;
        let col0 = [];
        for (let i = 0; i < cells.length; i++) {
            col0.push(new DataCell(i + 1));
        }
        this.col0Cells = col0;
    }
    reLayout() {
        let offsetHeight = 0;
        let lineHeight = this.matrix.centerData.dataCells[0][0].size.height;
        for (let cell of this.col0Cells) {
            cell.rect = Rect.init(0, offsetHeight, this.matrix.setting.col0Width, lineHeight);
            offsetHeight += lineHeight;
        }
        let lastHeaderCell = this.col0Cells[this.col0Cells.length - 1];
        this.canvasSize = Size.init(this.matrix.setting.col0Width, lastHeaderCell.rect.y + lastHeaderCell.rect.height);
        this.canvasEl.setAttribute("width", this.canvasSize.width);
        this.canvasEl.setAttribute("height", this.canvasSize.height);
    }
    reRend() {
        let ctx = this.canvasCtx;
        ctx.font = this.matrix.setting.font;
        ctx.textBaseline = "middle";
        ctx.textAlign = 'left';
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 1;
        ctx.clearRect(0, 0, this.canvasSize.width, this.canvasSize.height);
        this._drawCells(ctx);
    }
    _drawCells(c) {
        let setting = this.matrix.setting;
        var grd = c.createLinearGradient(0, 0, setting.col0Width, 0);
        grd.addColorStop(0, setting.headerLinearGradientStart);
        grd.addColorStop(1, setting.headerLinearGradientEnd);
        c.fillStyle = grd;
        c.fillRect(0, 0, setting.col0Width, this.canvasSize.height);
        c.fillStyle = setting.cellBorderStyle;
        this.drawHorizontalLine(c, 0, -1, setting.col0Width);
        for (let cell of this.col0Cells) {
            this.drawHorizontalLine(c, 0, cell.rect.y + cell.rect.height, setting.col0Width);
        }
        this.drawVerticalLine(c, 0, 0, this.canvasSize.height);
        this.drawVerticalLine(c, setting.col0Width - 1, 0, this.canvasSize.height);
        c.fillStyle = setting.fontStyle;
        let i = 1;
        for (let cell of this.col0Cells) {
            c.fillText(i + "", 0 + setting.cellPaddingH, cell.rect.y + cell.rect.height / 2);
            i++;
        }
    }
    getCellByPoint(p) {
        for (let i = 0; i < this.col0Cells.length; i++) {
            let c = this.col0Cells[i];
            if (c.rect.y < p.y && c.rect.y + c.rect.height > p.y) {
                return c;
            }
        }
    }
    getCellIndex(c) {
        return this.col0Cells.indexOf(c);
    }
    getImageData(rect) {
        return this.canvasCtx.getImageData(rect.x, rect.y, rect.width, rect.height);
    }
    onPaint(ctx) {
        let imDat = this.getImageData(Rect.init(0, this.matrix.scrollTop, this.rect.width, this.rect.height));
        ctx.putImageData(imDat, 0, this.matrix.setting.row0Height);
    }
}
class ScrollbarH extends Cmp {
    constructor() {
        super();
        this.config.enableMouseDown = true;
        this.config.enableMouseMove = true;
        this.config.enableMouseUp = true;
        this.config.enableMouseDrag = true;
        this.mouseDownX = null;
    }
    isVisible() {
        let matrix = this.parentCmp;
        return matrix.centerData.canvasSize.width > matrix.rect.width - matrix.setting.col0Width - matrix.setting.scrollbarWidth;
    }
    getHeight() {
        let matrix = this.parentCmp;
        return this.isVisible() ? matrix.setting.scrollbarWidth : 0;
    }
    handleXToScrollLeft(x) {
        let matrix = this.parentCmp;
        return ((x - 2) / (this.rect.width - 4)) * matrix.centerData.canvasSize.width;
    }
    onMouseDown(p) {
        let matrix = this.parentCmp;
        this.mouseDownX = this.handleRect.x;
        if (this.handleRect.containPoint(p) == false) {
            this.mouseDownX = p.x - (this.handleRect.width / 2);
            let scrollleft = this.handleXToScrollLeft(this.mouseDownX);
            matrix.scrollTo(matrix.scrollTop, scrollleft);
        }
        let me = this;
        this.mouseMoveFunc = function (e) {
            me.onWindowMouseDrag(e);
        };
        window.addEventListener("mousemove", this.mouseMoveFunc);
        this.mouseUpFunc = function (e) {
            me.onWindowMouseUp(e);
        };
        window.addEventListener("mouseup", this.mouseUpFunc);
    }
    onWindowMouseDrag(e) {
        let offsetX = e.offsetX - this.mouseDownPoint.x;
        let matrix = this.parentCmp;
        this.handleRect.x = this.mouseDownX + offsetX;
        let scrollleft = this.handleXToScrollLeft(this.handleRect.x);
        matrix.scrollTo(matrix.scrollTop, scrollleft);
    }
    onWindowMouseUp(e) {
        window.removeEventListener("mousemove", this.mouseMoveFunc);
        window.removeEventListener("mouseup", this.mouseUpFunc);
    }
    onMouseDrag(offsetPoint, dragOffsetPoint, p, shift, ctrl) {
        // let matrix = this.parentCmp as Matrix;
        // this.handleRect.x = this.mouseDownX + offsetPoint.x;
        // let scrollleft = this.handleXToScrollLeft(this.handleRect.x);
        // matrix.scrollTo(matrix.scrollTop, scrollleft);
    }
    computeHandleRect() {
        let matrix = this.parentCmp;
        let viewPortWidth = matrix.rect.width - matrix.col0.rect.width;
        this.handleRect = Rect.init((this.rect.width - 4) * (matrix.scrollLeft / matrix.centerData.canvasSize.width) + 2, 2, (this.rect.width - 4) * (viewPortWidth / matrix.centerData.canvasSize.width), this.rect.height - 4);
    }
    onPaint(ctx) {
        if (this.isVisible() == false)
            return;
        this.computeHandleRect();
        let matrix = this.parentCmp;
        ctx.clearRect(0, 0, this.rect.width, this.rect.height);
        ctx.fillStyle = matrix.setting.cellBorderStyle;
        this.drawHorizontalLine(ctx, 0, 0, this.rect.width);
        ctx.fillStyle = matrix.setting.scrollbarColor;
        ctx.fillRect(this.handleRect.x, this.handleRect.y, this.handleRect.width, this.handleRect.height);
    }
}
class ScrollbarV extends Cmp {
    constructor() {
        super();
        this.config.enableMouseDown = true;
        this.config.enableMouseMove = true;
        this.config.enableMouseUp = true;
        this.config.enableMouseDrag = true;
        this.mouseDownY = null;
    }
    isVisible() {
        let matrix = this.parentCmp;
        return matrix.centerData.canvasSize.height > matrix.rect.height - matrix.setting.row0Height - matrix.setting.scrollbarWidth;
    }
    getWidth() {
        let matrix = this.parentCmp;
        return this.isVisible() ? matrix.setting.scrollbarWidth : 0;
    }
    handleYToScrolltop(y) {
        let matrix = this.parentCmp;
        return ((y - 2) / (this.rect.height - 4)) * matrix.centerData.canvasSize.height;
    }
    onMouseDown(p) {
        let matrix = this.parentCmp;
        this.mouseDownY = this.handleRect.y;
        if (this.handleRect.containPoint(p) == false) {
            this.mouseDownY = p.y - (this.handleRect.height / 2);
            let scrollTop = this.handleYToScrolltop(this.mouseDownY);
            matrix.scrollTo(scrollTop, matrix.scrollLeft);
        }
        let me = this;
        this.mouseMoveFunc = function (e) {
            me.onWindowMouseDrag(e);
        };
        window.addEventListener("mousemove", this.mouseMoveFunc);
        this.mouseUpFunc = function (e) {
            me.onWindowMouseUp(e);
        };
        window.addEventListener("mouseup", this.mouseUpFunc);
    }
    onWindowMouseDrag(e) {
        let offsetY = e.offsetY - this.mouseDownPoint.y;
        let matrix = this.parentCmp;
        this.handleRect.y = this.mouseDownY + offsetY;
        let scrollTop = this.handleYToScrolltop(this.handleRect.y);
        matrix.scrollTo(scrollTop, matrix.scrollLeft);
    }
    onWindowMouseUp(e) {
        window.removeEventListener("mousemove", this.mouseMoveFunc);
        window.removeEventListener("mouseup", this.mouseUpFunc);
    }
    onMouseDrag(offsetPoint, dragOffsetPoint, p, shift, ctrl) {
        // let matrix = this.parentCmp as Matrix;
        // this.handleRect.y = this.mouseDownY + offsetPoint.y;
        // let scrollTop = this.handleYToScrolltop(this.handleRect.y);
        // matrix.scrollTo(scrollTop, matrix.scrollLeft);
    }
    computeHandleRect() {
        let matrix = this.parentCmp;
        let viewPortHeight = matrix.rect.height - matrix.row0.rect.height;
        this.handleRect = Rect.init(2, (this.rect.height - 4) * (matrix.scrollTop / matrix.centerData.canvasSize.height) + 2, this.rect.width - 4, (this.rect.height - 4) * (viewPortHeight / matrix.centerData.canvasSize.height));
    }
    onPaint(ctx) {
        if (this.isVisible() == false)
            return;
        this.computeHandleRect();
        let matrix = this.parentCmp;
        ctx.clearRect(0, 0, this.rect.width, this.rect.height);
        ctx.fillStyle = matrix.setting.cellBorderStyle;
        this.drawVerticalLine(ctx, 0, 0, this.rect.height);
        ctx.fillStyle = matrix.setting.scrollbarColor;
        ctx.fillRect(this.handleRect.x, this.handleRect.y, this.handleRect.width, this.handleRect.height);
    }
}
/// <reference path="Base/DragImpl.ts"/>
/// <reference path="CmpBase/SimpleObject.ts"/>
/// <reference path="CmpBase/Cmp.ts"/>
/// <reference path="Cmp/TableSetting.ts"/>
/// <reference path="Cmp/DataCell.ts"/>
/// <reference path="Cmp/Matrix.ts"/>
/// <reference path="Cmp/MatrixCenterData.ts"/>
/// <reference path="Cmp/MatrixRow0.ts"/>
/// <reference path="Cmp/MatrixCol0.ts"/>
/// <reference path="Cmp/ScrollbarH.ts"/>
/// <reference path="Cmp/ScrollbarV.ts"/>
