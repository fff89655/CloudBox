
// This variation on ForceDirectedLayout does not move any selected Nodes
// but does move all other nodes (vertexes).
function ContinuousForceDirectedLayout() {
    go.ForceDirectedLayout.call(this);
    this._isObserving = false;
}
go.Diagram.inherit(ContinuousForceDirectedLayout, go.ForceDirectedLayout);
/** @override */
ContinuousForceDirectedLayout.prototype.isFixed = function (v) {
    return v.node.isSelected;
}
// optimization: reuse the ForceDirectedNetwork rather than re-create it each time
/** @override */
ContinuousForceDirectedLayout.prototype.doLayout = function (coll) {
    if (!this._isObserving) {
        this._isObserving = true;
        // cacheing the network means we need to recreate it if nodes or links have been added or removed or relinked,
        // so we need to track structural model changes to discard the saved network.
        var lay = this;
        this.diagram.addModelChangedListener(function (e) {
            // modelChanges include a few cases that we don't actually care about, such as
            // "nodeCategory" or "linkToPortId", but we'll go ahead and recreate the network anyway.
            // Also clear the network when replacing the model.
            if (e.modelChange !== "" ||
                (e.change === go.ChangedEvent.Transaction && e.propertyName === "StartingFirstTransaction")) {
                lay.network = null;
            }
        });
    }
    var net = this.network;
    if (net === null) {  // the first time, just create the network as normal
        this.network = net = this.makeNetwork(coll);
    } else {  // but on reuse we need to update the LayoutVertex.bounds for selected nodes
        this.diagram.nodes.each(function (n) {
            var v = net.findVertex(n);
            if (v !== null) v.bounds = n.actualBounds;
        });
    }
    // now perform the normal layout
    go.ForceDirectedLayout.prototype.doLayout.call(this, coll);
    // doLayout normally discards the LayoutNetwork by setting Layout.network to null;
    // here we remember it for next time
    this.network = net;
}
// end ContinuousForceDirectedLayout
function init() {
    if (window.goSamples) goSamples();  // init for these samples -- you don't need to call this
    var $ = go.GraphObject.make;  // for conciseness in defining templates
    myDiagram =
        $(go.Diagram, "myDiagramDiv",  // must name or refer to the DIV HTML element
            {
                initialAutoScale: go.Diagram.Uniform,  // an initial automatic zoom-to-fit
                contentAlignment: go.Spot.Center,  // align document to the center of the viewport
                layout:
                    $(ContinuousForceDirectedLayout,  // automatically spread nodes apart while dragging
                        { defaultSpringLength: 30, defaultElectricalCharge: 100 }),
                // do an extra layout at the end of a move
                "SelectionMoved": function (e) { e.diagram.layout.invalidateLayout(); }
            });
    // dragging a node invalidates the Diagram.layout, causing a layout during the drag
    myDiagram.toolManager.draggingTool.doMouseMove = function () {
        go.DraggingTool.prototype.doMouseMove.call(this);
        if (this.isActive) { this.diagram.layout.invalidateLayout(); }
    }
    // define each Node's appearance
    myDiagram.nodeTemplate =
        $(go.Node, "Auto",  // the whole node panel
            // define the node's outer shape, which will surround the TextBlock
            $(go.Shape, "Circle",
                { fill: "CornflowerBlue", stroke: "black", spot1: new go.Spot(0, 0, 5, 5), spot2: new go.Spot(1, 1, -5, -5) }),
            $(go.TextBlock,
                { font: "bold 10pt helvetica, bold arial, sans-serif", textAlign: "center", maxSize: new go.Size(100, NaN) },
                new go.Binding("text", "text"))
        );
    // the rest of this app is the same as samples/conceptMap.html
    // replace the default Link template in the linkTemplateMap
    myDiagram.linkTemplate =
        $(go.Link,  // the whole link panel
            $(go.Shape,  // the link shape
                { stroke: "black" }),
            $(go.Shape,  // the arrowhead
                { toArrow: "standard", stroke: null }),
            $(go.Panel, "Auto",
                $(go.Shape,  // the label background, which becomes transparent around the edges
                    {
                        fill: $(go.Brush, "Radial", { 0: "rgb(240, 240, 240)", 0.3: "rgb(240, 240, 240)", 1: "rgba(240, 240, 240, 0)" }),
                        stroke: null
                    }),
                $(go.TextBlock,  // the label text
                    {
                        textAlign: "center",
                        font: "10pt helvetica, arial, sans-serif",
                        stroke: "#555555",
                        margin: 4
                    },
                    new go.Binding("text", "text"))
            )
        );
    // create the model for the concept map
    var nodeDataArray = [
        { key: 0, text: "申請" },
        { key: 1, text: "レコードタイプ" },
        { key: 2, text: "ユーザ" },
        { key: 3, text: "クライアント" },
        { key: 4, text: "承認パラメータマスタ" },
        { key: 5, text: "グループ" },
        { key: 6, text: "アセスメント" },
        { key: 7, text: "クライアント担当者" },
        { key: 8, text: "契約" },
        { key: 9, text: "支社" },
        { key: 10, text: "キャリア開発" },
        { key: 11, text: "キャリアサポート申込情報" },
        { key: 12, text: "キャリアサポート" },
        { key: 13, text: "職務経歴" },
        { key: 14, text: "業種" },
        { key: 15, text: "クライアント整理" },
        { key: 16, text: "TSRクライアント情報" },
        { key: 17, text: "エントリー媒体情報" },
        { key: 18, text: "マッチングパイプライン" },
        { key: 19, text: "経験職種" },
        { key: 20, text: "職種" },
        { key: 21, text: "ジョブ" },
        { key: 22, text: "支社クライアント" },
        { key: 23, text: "契約" },
        { key: 24, text: "IV振分け設定" },
        { key: 25, text: "案件" },
        { key: 26, text: "マスタープロジェクト" },
        { key: 27, text: "標準料金" },
        { key: 28, text: "スキルカード" },
        { key: 29, text: "職種/スキル紐づけ" },
        { key: 30, text: "資格・スキルマスタ" },
        { key: 31, text: "他媒体エントリー時キャンディデイト情報" },
        { key: 32, text: "地域分類マスタ" },
        { key: 33, text: "検索条件通知履歴" },
        { key: 34, text: "検索条件" },
        { key: 35, text: "メール送信履歴" },
        { key: 36, text: "Candidate" },
        { key: 37, text: "oggLocation" },
        { key: 38, text: "産業分類コードマスタ" },
        { key: 39, text: "名刺" },
        { key: 40, text: "企業グループ" },
        { key: 41, text: "アクションリンクテンプレート" },
        { key: 42, text: "アクションリンクグループテンプレート" },
        { key: 43, text: "お知らせ" },
        { key: 44, text: "フィード項目" },
        { key: 45, text: "グループ" },
        { key: 46, text: "Apex テストキュー項目" },
        { key: 47, text: "Apex テスト実行結果" },
        { key: 48, text: "Apex テスト結果" },
        { key: 49, text: "Apex テスト結果制限" },
        { key: 50, text: "納入商品" },
        { key: 51, text: "商品" },
        { key: 52, text: "添付ファイル" },
        { key: 53, text: "CSS ユーザ" },
        { key: 54, text: "Lightning コンポーネント定義" },
        { key: 55, text: "Lightning コンポーネントバンドル" },
        { key: 56, text: "マーケティングメンバー" },
        { key: 57, text: "メルマガ対象者" },
        { key: 58, text: "ケース" },
        { key: 59, text: "ケースチームのメンバー" },
        { key: 60, text: "定義済みケースチームのメンバー" },
        { key: 61, text: "ケースチームメンバーロール" },
        { key: 62, text: "定義済みケースチーム" },
        { key: 63, text: "カテゴリデータ" },
        { key: 64, text: "カテゴリノード" },
        { key: 65, text: "ナレッジ・FAQ" },
        { key: 66, text: "賃金テーブル" },
        { key: 67, text: "コンテンツ配信" },
        { key: 68, text: "コンテンツバージョン" },
        { key: 69, text: "コンテンツドキュメント" },
        { key: 70, text: "コンテンツフォルダ" },
        { key: 71, text: "カスタムブランドアセット" },
        { key: 72, text: "カスタムブランド" },
        { key: 73, text: "ドキュメント" },
        { key: 74, text: "フォルダ" },
        { key: 75, text: "ドキュメントエンティティの対応付け" },
        { key: 76, text: "メールテンプレート" },
        { key: 77, text: "重複レコード項目" },
        { key: 78, text: "重複レコードセット" },
        { key: 79, text: "メールメッセージ" },
        { key: 80, text: "ToDo" },
        { key: 81, text: "メールサービスアドレス" },
        { key: 82, text: "メールサービス" },
        { key: 83, text: "レターヘッド" },
        { key: 84, text: "営業活動" },
        { key: 85, text: "承認者" },
        { key: 86, text: "フィードコメント" },
        { key: 87, text: "項目権限" },
        { key: 88, text: "権限セット" },
        { key: 89, text: "コミュニティ" },
        { key: 90, text: "コミュニティのコメント" },
        { key: 91, text: "マクロの説明" },
        { key: 92, text: "マクロ" },
        { key: 93, text: "マージギア設定項目" },
        { key: 94, text: "マージギア設定" },
        { key: 95, text: "検索パターン" },
        { key: 96, text: "価格表" },
        { key: 97, text: "商談商品" },
        { key: 98, text: "価格表エントリ" },
        { key: 99, text: "PLデータ" },
        { key: 100, text: "支社実績" },
        { key: 101, text: "予実績" },
        { key: 102, text: "プロファイル" },
        { key: 103, text: "プラットフォームキャッシュ区分種別" },
        { key: 104, text: "プラットフォームキャッシュ区分" },
        { key: 105, text: "クイックテキスト 共有" },
        { key: 106, text: "クイックテキスト" },
        { key: 107, text: "ビジネスプロセス" },
        { key: 108, text: "Sコントロールのローカライズ" },
        { key: 109, text: "カスタムSコントロール" },
        { key: 110, text: "SkyEditorDummy" },
        { key: 111, text: "名刺自動連携条件設定" },
        { key: 112, text: "名刺基本設定" },
        { key: 113, text: "ソーシャル投稿 共有" },
        { key: 114, text: "ソーシャル投稿" },
        { key: 115, text: "ストリーミングチャネル 共有" },
        { key: 116, text: "ストリーミングチャネル" },
        { key: 117, text: "自動配信情報" },
        { key: 118, text: "自動配信リスト情報" },
        { key: 119, text: "バルク配信クリックフィードバック" },
        { key: 120, text: "バルク配信コンテンツ" },
        { key: 121, text: "バルク配信条件" },
        { key: 122, text: "バルク配信スケジュール" },
        { key: 123, text: "バルク配信設定" },
        { key: 124, text: "キャンペーン配信絞込条件" },
        { key: 125, text: "キャンペーン配信スケジュール" },
        { key: 126, text: "キャンペーン配信連結" },
        { key: 127, text: "キャンペーン配信設定" },
        { key: 128, text: "ステップ配信条件" },
        { key: 129, text: "ステップ配信スケジュール" },
        { key: 130, text: "ステップ配信設定" },
        { key: 131, text: "Goals 共有" },
        { key: 132, text: "Goals" },
        { key: 133, text: "翻訳" },
        { key: 134, text: "トピック" },
        { key: 135, text: "ロール" },
        { key: 136, text: "UserAppMenuCustomization 共有" },
        { key: 137, text: "UserAppMenuCustomization" },
        { key: 138, text: "ユーザリストビュー条件" },
        { key: 139, text: "ユーザリストビュー" },
        { key: 140, text: "ユーザプロビジョニングログ" },
        { key: 141, text: "ユーザプロビジョニング要求" },
        { key: 142, text: "ユーザプロビジョニング設定" },
        { key: 143, text: "ユーザプロビジョニングアカウント" },
        { key: 144, text: "カスタムボタンまたはカスタムリンク" },
        { key: 145, text: "Visualforce ページ" },
        { key: 146, text: "カスタムリンクのローカライズ" },
        { key: 147, text: "最優先ビューの詳細" },
        { key: 148, text: "最優先ビュー" },
        { key: 149, text: "oggMapAnalyze" },
        { key: 150, text: "oggMapPlot" },
        { key: 151, text: "oggLocationSet" },
        { key: 152, text: "oggObjectAccountGrandChild" },
        { key: 153, text: "oggObjectAccountChild" },
        { key: 154, text: "oggObjectDetail" },
        { key: 155, text: "oggObjectMaster" },
        { key: 156, text: "チームメンバー" },
        { key: 157, text: "チーム" },
        { key: 158, text: "oggTestObject" },
    ];
    var linkDataArray = [
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
        { from: 158, to: 158, text: "" },
    ];
    myDiagram.model = new go.GraphLinksModel(nodeDataArray, linkDataArray);
}
function reload() {
    //myDiagram.layout.network = null;
    var text = myDiagram.model.toJson();
    myDiagram.model = go.Model.fromJson(text);
    //myDiagram.layout =
    //  go.GraphObject.make(ContinuousForceDirectedLayout,  // automatically spread nodes apart while dragging
    //    { defaultSpringLength: 30, defaultElectricalCharge: 100 });
}