

var Circle = function(x, y, r){
    this.r = r;
    this.x = x;
    this.y = y;
}
Circle.prototype.getPointByAngle = function(angle){
    var angleUnit = Math.PI/180;
    Math.sin(Math.PI/180*30)
    var x = this.x + (Math.sin(angleUnit * angle) * this.r);
    var y = this.y - (Math.cos(angleUnit * angle) * this.r);
    return {x:x, y:y};
}

var appData = { };
var v = new Vue({ 
    el: '#app',
    data: { appData: appData },
    methods: {

    }
});
//
var itemArr = [
    {id:"0", txt:"申請"},
{id:"1", txt:"レコードタイプ"},
{id:"2", txt:"ユーザ"},
{id:"3", txt:"クライアント"},
{id:"4", txt:"承認パラメータマスタ"},
{id:"5", txt:"グループ"},
{id:"6", txt:"アセスメント"},
{id:"7", txt:"クライアント担当者"},
{id:"8", txt:"契約"},
{id:"9", txt:"支社"},
{id:"10", txt:"キャリア開発"},
{id:"11", txt:"キャリアサポート申込情報"},
{id:"12", txt:"キャリアサポート"},
{id:"13", txt:"職務経歴"},
{id:"14", txt:"業種"},
{id:"15", txt:"クライアント整理"},
{id:"16", txt:"TSRクライアント情報"},
{id:"17", txt:"エントリー媒体情報"},
{id:"18", txt:"マッチングパイプライン"},
{id:"19", txt:"経験職種"},
{id:"20", txt:"職種"},
{id:"21", txt:"ジョブ"},
{id:"22", txt:"支社クライアント"},
{id:"23", txt:"契約"},
{id:"24", txt:"IV振分け設定"},
{id:"25", txt:"案件"},
{id:"26", txt:"マスタープロジェクト"},
{id:"27", txt:"標準料金"},
{id:"28", txt:"スキルカード"},
{id:"29", txt:"職種/スキル紐づけ"},
{id:"30", txt:"資格・スキルマスタ"},
{id:"31", txt:"他媒体エントリー時キャンディデイト情報"},
{id:"32", txt:"地域分類マスタ"},
{id:"33", txt:"検索条件通知履歴"},
{id:"34", txt:"検索条件"},
{id:"35", txt:"メール送信履歴"},
{id:"36", txt:"Candidate"},
{id:"37", txt:"oggLocation"},
{id:"38", txt:"産業分類コードマスタ"},
{id:"39", txt:"名刺"},
{id:"40", txt:"企業グループ"},
{id:"41", txt:"アクションリンクテンプレート"},
{id:"42", txt:"アクションリンクグループテンプレート"},
{id:"43", txt:"お知らせ"},
{id:"44", txt:"フィード項目"},
{id:"45", txt:"グループ"},
{id:"46", txt:"Apex テストキュー項目"},
{id:"47", txt:"Apex テスト実行結果"},
{id:"48", txt:"Apex テスト結果"},
{id:"49", txt:"Apex テスト結果制限"},
{id:"50", txt:"納入商品"},
{id:"51", txt:"商品"},
{id:"52", txt:"添付ファイル"},
{id:"53", txt:"CSS ユーザ"},
{id:"54", txt:"Lightning コンポーネント定義"},
{id:"55", txt:"Lightning コンポーネントバンドル"},
{id:"56", txt:"マーケティングメンバー"},
{id:"57", txt:"メルマガ対象者"},
{id:"58", txt:"ケース"},
{id:"59", txt:"ケースチームのメンバー"},
{id:"60", txt:"定義済みケースチームのメンバー"},
{id:"61", txt:"ケースチームメンバーロール"},
{id:"62", txt:"定義済みケースチーム"},
{id:"63", txt:"カテゴリデータ"},
{id:"64", txt:"カテゴリノード"},
{id:"65", txt:"ナレッジ・FAQ"},
{id:"66", txt:"賃金テーブル"},
{id:"67", txt:"コンテンツ配信"},
{id:"68", txt:"コンテンツバージョン"},
{id:"69", txt:"コンテンツドキュメント"},
{id:"70", txt:"コンテンツフォルダ"},
{id:"71", txt:"カスタムブランドアセット"},
{id:"72", txt:"カスタムブランド"},
{id:"73", txt:"ドキュメント"},
{id:"74", txt:"フォルダ"},
{id:"75", txt:"ドキュメントエンティティの対応付け"},
{id:"76", txt:"メールテンプレート"},
{id:"77", txt:"重複レコード項目"},
{id:"78", txt:"重複レコードセット"},
{id:"79", txt:"メールメッセージ"},
{id:"80", txt:"ToDo"},
{id:"81", txt:"メールサービスアドレス"},
{id:"82", txt:"メールサービス"},
{id:"83", txt:"レターヘッド"},
{id:"84", txt:"営業活動"},
{id:"85", txt:"承認者"},
{id:"86", txt:"フィードコメント"},
{id:"87", txt:"項目権限"},
{id:"88", txt:"権限セット"},
{id:"89", txt:"コミュニティ"},
{id:"90", txt:"コミュニティのコメント"},
{id:"91", txt:"マクロの説明"},
{id:"92", txt:"マクロ"},
{id:"93", txt:"マージギア設定項目"},
{id:"94", txt:"マージギア設定"},
{id:"95", txt:"検索パターン"},
{id:"96", txt:"価格表"},
{id:"97", txt:"商談商品"},
{id:"98", txt:"価格表エントリ"},
{id:"99", txt:"PLデータ"},
{id:"100", txt:"支社実績"},
{id:"101", txt:"予実績"},
{id:"102", txt:"プロファイル"},
{id:"103", txt:"プラットフォームキャッシュ区分種別"},
{id:"104", txt:"プラットフォームキャッシュ区分"},
{id:"105", txt:"クイックテキスト 共有"},
{id:"106", txt:"クイックテキスト"},
{id:"107", txt:"ビジネスプロセス"},
{id:"108", txt:"Sコントロールのローカライズ"},
{id:"109", txt:"カスタムSコントロール"},
{id:"110", txt:"SkyEditorDummy"},
{id:"111", txt:"名刺自動連携条件設定"},
{id:"112", txt:"名刺基本設定"},
{id:"113", txt:"ソーシャル投稿 共有"},
{id:"114", txt:"ソーシャル投稿"},
{id:"115", txt:"ストリーミングチャネル 共有"},
{id:"116", txt:"ストリーミングチャネル"},
{id:"117", txt:"自動配信情報"},
{id:"118", txt:"自動配信リスト情報"},
{id:"119", txt:"バルク配信クリックフィードバック"},
{id:"120", txt:"バルク配信コンテンツ"},
{id:"121", txt:"バルク配信条件"},
{id:"122", txt:"バルク配信スケジュール"},
{id:"123", txt:"バルク配信設定"},
{id:"124", txt:"キャンペーン配信絞込条件"},
{id:"125", txt:"キャンペーン配信スケジュール"},
{id:"126", txt:"キャンペーン配信連結"},
{id:"127", txt:"キャンペーン配信設定"},
{id:"128", txt:"ステップ配信条件"},
{id:"129", txt:"ステップ配信スケジュール"},
{id:"130", txt:"ステップ配信設定"},
{id:"131", txt:"Goals 共有"},
{id:"132", txt:"Goals"},
{id:"133", txt:"翻訳"},
{id:"134", txt:"トピック"},
{id:"135", txt:"ロール"},
{id:"136", txt:"UserAppMenuCustomization 共有"},
{id:"137", txt:"UserAppMenuCustomization"},
{id:"138", txt:"ユーザリストビュー条件"},
{id:"139", txt:"ユーザリストビュー"},
{id:"140", txt:"ユーザプロビジョニングログ"},
{id:"141", txt:"ユーザプロビジョニング要求"},
{id:"142", txt:"ユーザプロビジョニング設定"},
{id:"143", txt:"ユーザプロビジョニングアカウント"},
{id:"144", txt:"カスタムボタンまたはカスタムリンク"},
{id:"145", txt:"Visualforce ページ"},
{id:"146", txt:"カスタムリンクのローカライズ"},
{id:"147", txt:"最優先ビューの詳細"},
{id:"148", txt:"最優先ビュー"},
{id:"149", txt:"oggMapAnalyze"},
{id:"150", txt:"oggMapPlot"},
{id:"151", txt:"oggLocationSet"},
{id:"152", txt:"oggObjectAccountGrandChild"},
{id:"153", txt:"oggObjectAccountChild"},
{id:"154", txt:"oggObjectDetail"},
{id:"155", txt:"oggObjectMaster"},
{id:"156", txt:"チームメンバー"},
{id:"157", txt:"チーム"},
{id:"158", txt:"oggTestObject"}
];
var itemRelationArr = [
    
    { from: 0, to: 1, text: "" },
    { from: 0, to: 2, text: "" },
    { from: 0, to: 3, text: "" },
    { from: 4, to: 5, text: "" },
    { from: 6, to: 7, text: "" },
    { from: 8, to: 9, text: "" },
    { from: 10, to: 8, text: "" },
    { from: 11, to: 12, text: "" },
    { from: 13, to: 13, text: "" },
    { from: 13, to: 14, text: "" },
    { from: 15, to: 15, text: "" },
    { from: 15, to: 16, text: "" },
    { from: 17, to: 18, text: "" },
    { from: 19, to: 20, text: "" },
    { from: 21, to: 22, text: "" },
    { from: 21, to: 21, text: "" },
    { from: 21, to: 23, text: "" },
    { from: 21, to: 24, text: "" },
    { from: 21, to: 25, text: "" },
    { from: 21, to: 26, text: "" },
    { from: 21, to: 27, text: "" },
    { from: 18, to: 28, text: "" },
    { from: 29, to: 30, text: "" },
    { from: 31, to: 32, text: "" },
    { from: 33, to: 34, text: "" },
    { from: 35, to: 36, text: "" },
    { from: 3, to: 37, text: "" },
    { from: 3, to: 38, text: "" },
    { from: 3, to: 39, text: "" },
    { from: 3, to: 40, text: "" },
    { from: 41, to: 42, text: "" },
    { from: 43, to: 44, text: "" },
    { from: 43, to: 45, text: "" },
    { from: 46, to: 47, text: "" },
    { from: 48, to: 46, text: "" },
    { from: 49, to: 48, text: "" },
    { from: 50, to: 50, text: "" },
    { from: 50, to: 51, text: "" },
    { from: 52, to: 0, text: "" },
    { from: 52, to: 53, text: "" },
    { from: 54, to: 55, text: "" },
    { from: 56, to: 57, text: "" },
    { from: 58, to: 58, text: "" },
    { from: 59, to: 60, text: "" },
    { from: 59, to: 61, text: "" },
    { from: 60, to: 62, text: "" },
    { from: 63, to: 64, text: "" },
    { from: 63, to: 65, text: "" },
    { from: 45, to: 43, text: "" },
    { from: 7, to: 66, text: "" },
    { from: 67, to: 68, text: "" },
    { from: 67, to: 69, text: "" },
    { from: 70, to: 70, text: "" },
    { from: 71, to: 72, text: "" },
    { from: 71, to: 73, text: "" },
    { from: 73, to: 74, text: "" },
    { from: 75, to: 76, text: "" },
    { from: 77, to: 78, text: "" },
    { from: 79, to: 80, text: "" },
    { from: 79, to: 79, text: "" },
    { from: 81, to: 82, text: "" },
    { from: 76, to: 83, text: "" },
    { from: 84, to: 85, text: "" },
    { from: 84, to: 84, text: "" },
    { from: 44, to: 86, text: "" },
    { from: 87, to: 88, text: "" },
    { from: 89, to: 90, text: "" },
    { from: 89, to: 89, text: "" },
    { from: 91, to: 92, text: "" },
    { from: 93, to: 94, text: "" },
    { from: 34, to: 95, text: "" },
    { from: 25, to: 96, text: "" },
    { from: 97, to: 98, text: "" },
    { from: 99, to: 100, text: "" },
    { from: 99, to: 101, text: "" },
    { from: 88, to: 102, text: "" },
    { from: 103, to: 104, text: "" },
    { from: 105, to: 106, text: "" },
    { from: 1, to: 107, text: "" },
    { from: 108, to: 109, text: "" },
    { from: 110, to: 110, text: "" },
    { from: 111, to: 112, text: "" },
    { from: 113, to: 114, text: "" },
    { from: 115, to: 116, text: "" },
    { from: 117, to: 118, text: "" },
    { from: 119, to: 120, text: "" },
    { from: 121, to: 122, text: "" },
    { from: 122, to: 123, text: "" },
    { from: 124, to: 125, text: "" },
    { from: 126, to: 127, text: "" },
    { from: 128, to: 129, text: "" },
    { from: 129, to: 130, text: "" },
    { from: 131, to: 132, text: "" },
    { from: 133, to: 134, text: "" },
    { from: 2, to: 135, text: "" },
    { from: 136, to: 137, text: "" },
    { from: 138, to: 139, text: "" },
    { from: 140, to: 141, text: "" },
    { from: 141, to: 142, text: "" },
    { from: 141, to: 143, text: "" },
    { from: 144, to: 145, text: "" },
    { from: 146, to: 144, text: "" },
    { from: 147, to: 148, text: "" },
    { from: 149, to: 150, text: "" },
    { from: 37, to: 151, text: "" },
    { from: 152, to: 153, text: "" },
    { from: 154, to: 155, text: "" },
    { from: 156, to: 157, text: "" },
    { from: 158, to: 158, text: "" }
];

var itemIdMap = {};
function createIdMap(itemArr){
    itemArr.forEach(item => {
        itemIdMap[item.id] = item;
    });
}
createIdMap(itemArr);


function createRandomLocation(width , height){
    return {x:parseInt(Math.random() * width), y: parseInt(Math.random() * height)};
}

var randomColors = ["#E52B50","#FFBF00","#9966CC","#FBCEB1","#7FFFD4","#007FFF","#89CFF0","#000000","#0000FF","#0095B6","#8A2BE2","#DE5D83","#CD7F32","#964B00","#800020","#702963","#960018","#DE3163","#007BA7","#F7E7CE","#7FFF00","#7B3F00","#0047AB","#6F4E37","#B87333","#F88379","#DC143C","#00FFFF","#EDC9Af","#7DF9FF","#50C878","#00FF3F","#FFD700","#808080","#00FF00","#3FFF00","#4B0082","#00A86B","#29AB87","#B57EDC","#FFF700","#C8A2C8","#BFFF00","#FF00FF","#FF00AF","#800000","#E0B0FF","#000080","#CC7722","#808000","#FFA500","#FF4500","#DA70D6","#FFE5B4","#D1E231","#CCCCFF","#1C39BB","#FFC0CB","#8E4585","#003153","#CC8899","#800080","#E30B5C","#FF0000","#C71585","#FF007F","#E0115F","#FA8072","#92000A","#0F52BA","#FF2400","#C0C0C0","#708090","#A7FC00","#00FF7F","#D2B48C","#483C32","#008080","#40E0D0","#3F00FF","#EE82EE","#40826D","#FFFF00"];
function getRandomColor(){
    var r = Math.random() * 1000;
    return randomColors[parseInt(r / randomColors.length)];
}
function createSvgLine(){
    var el = $(document.createElementNS('http://www.w3.org/2000/svg', "line"));
    el.addClass("lineStyle");
    el.css("stroke", getRandomColor());
    return el;
}

function init(){
    var divs = [];
    itemArr.forEach(item => {
        var location = createRandomLocation(window.innerWidth,window.innerHeight);
        item.x = location.x;
        item.y = location.y;

        var div = $("<div class='item'>");
        div.offset({top:item.y, left:item.x});
        div.html(item.txt);
        div.data("item", item);

        item.div = div;

        divs.push(div);

    });

    divs.forEach(d => {
        //$(".pageRoot").append(d);
    });

    itemRelationArr.forEach(rel => {
        var from = itemIdMap[rel.from];
        var to = itemIdMap[rel.to];

        var line = createSvgLine();
        line.attr("x1", from.x + from.div.outerWidth()/2);
        line.attr("y1", from.y + from.div.outerHeight()/2);
        line.attr("x2", to.x + to.div.outerWidth()/2);
        line.attr("y2", to.y + to.div.outerHeight()/2);
        
        //$("#bkSvg").append(line);
    });


    var c = new Circle(500,500,250);
    var p1 = c.getPointByAngle(30); 
    var p2 = c.getPointByAngle(45);
    var p3 = c.getPointByAngle(60);
    

    for(var i=0 ; i<360 ; i = i + 5){
        var p = c.getPointByAngle(i);
        var l = createSvgLine();
        l.attr("x1", p.x);
        l.attr("y1", p.y)
        l.attr("x2", 200);
        l.attr("y2", 200);
        //$("#bkSvg").append(l);
    }

}

function addChild(itemArr){
    itemArr.forEach(item => {
        item.children = [];
    });
}

function computChild(itemIdMap){
    itemRelationArr.forEach(rel => {
        var from = itemIdMap[rel.from];
        if(from.children == undefined){
            from.children = [];
        }
        if(rel.from != rel.to){
            from.children.push(rel.to);
        }
    });
}

function createNode(item){
    c = new Circle(item.offset.left, item.offset.top , 100);
    var au = 360 / item.children.length;
    for (let i = 0; i < item.children.length; i++) {
        const childItem = itemIdMap[item.children[i]];
        
        if(childItem.divCreated == true){

            // var line = createSvgLine();
            // line.attr("x1", item.offset.left);
            // line.attr("y1", item.offset.top);
            // line.attr("x2", childItem.offset.left);
            // line.attr("y2", childItem.offset.top);

            // $("#bkSvg").append(line);
        }else{
            var p = c.getPointByAngle(au * i);

            div = $("<div class='item'>");

            div.html(childItem.txt);
            console.log(childItem.txt);
            $(".pageRoot").append(div);

            childItem.offset = {top:p.y, left:p.x};

            div.offset({top:p.y - (div.outerHeight()/2), left:p.x - (div.outerWidth()/2)});
            div.data("item", childItem);
            childItem.divCreated = true;

            var line = createSvgLine();
            line.attr("x1", item.offset.left);
            line.attr("y1", item.offset.top);
            line.attr("x2", p.x);
            line.attr("y2", p.y);

            $("#bkSvg").append(line);

            // if(childItem.children.length > 0){
            //     createNode(childItem);
            // }
        }

    }
}

function aa(){
    addChild(itemArr);
    computChild(itemIdMap);

    itemArr.sort((a, b) => b.children.length - a.children.length);

    var c = null;
    var i = 0;
    itemArr.forEach(item => 
    {
        if(i > 0){
            //return;
        }
        if(item.divCreated == true){
            
        }else{
            div = $("<div class='item'>");

            div.html(item.txt);
            $(".pageRoot").append(div);

            item.offset = {top:Math.random() * 1000, left:Math.random() * 1000};

            div.offset({top:item.offset.top - (div.outerHeight()/2), left:item.offset.left - (div.outerWidth()/2)});
            div.data("item", item);
            item.divCreated = true;

            createNode(item);
        }

        i++;
    });

    console.log(itemArr);
}



init();
//aa();


function get2PointCenter(p1, p2){
    var p = {x:(p1.x+p2.x)/2, y:(p1.y+p2.y)/2}
    el = $(document.createElementNS('http://www.w3.org/2000/svg', "circle"));
    el = $(el).attr("cx", p.x).attr("cy", p.y).attr("r", 5).attr("fill", "green");
    $("#bkSvg").append(el);

    return p;
}

function getCenterOfPoints(pArr){
    var sumX = 0;
    var sumY = 0;
    pArr.forEach(p => {
        sumX += p.x;
        sumY += p.y;
    });
    return {x:sumX/pArr.length , y:sumY/pArr.length};
}

function pp(){
    var ps = [];
    for(var i=0 ; i<10; i++){
        var p = {x: Math.random() * 1000, y : Math.random() * 1000};
        ps.push(p);
    }
    ps.forEach(p => {
        var el = $(document.createElementNS('http://www.w3.org/2000/svg', "circle"));
        el = $(el).attr("cx", p.x).attr("cy", p.y).attr("r", 5).attr("fill", "red");
        $("#bkSvg").append(el);
    });

    var centerP = getCenterOfPoints(ps);
    el = $(document.createElementNS('http://www.w3.org/2000/svg', "circle"));
    el = $(el).attr("cx", centerP.x).attr("cy", centerP.y).attr("r", 5).attr("fill", "blue");
    $("#bkSvg").append(el);
}

pp();

var allRect =[];

function innerRect(rect1, rect2){
    var center1x = rect1.x + rect1.width/2;
    var center2x = rect2.x + rect2.width/2;
    var center1y = rect1.y + rect1.height/2;
    var center2y = rect2.y + rect2.height/2;
    if(Math.abs(center1x - center2x) < ((rect1.width/2) + (rect2.width/2))
       && Math.abs(center1y - center2y) < ((rect1.height/2) + (rect2.height/2))){
        return true;
    }else{
        return false;
    }
}

function createDiv(x, y, html){
    var div = $("<div class='item'>");
    div.html(html);
    $(".pageRoot").append(div);
    div.offset({top:y - (div.outerHeight()/2), left:x - (div.outerWidth()/2)});
}

function createLine(x1,y1,x2,y2){
    var l = $(document.createElementNS('http://www.w3.org/2000/svg', "line"));
    l.addClass("lineStyle");
    l.css("stroke", getRandomColor());
    l.attr("x1", x1);
    l.attr("y1", y1)
    l.attr("x2", x2);
    l.attr("y2", y2);
    $("#bkSvg").append(l);
}

function ss(){

    addChild(itemArr);
    computChild(itemIdMap);

    itemArr.sort((a, b) => b.children.length - a.children.length);

    var c = null;
    var i = 0;
    itemArr.forEach(item => 
    {
    });
}