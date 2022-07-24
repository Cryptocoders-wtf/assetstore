import languages from "./languages";

const lang = {
  menu: {
    connect: "接続",
    connected: "接続済み",
    nometamask: "メタマスクがありません",
  },
  header: {
    home: "ホーム",
    material: "マテリアル",
    kamon: "家紋",
  },
  mint: {
    switchNetwork: "ネットワークを切り替えて下さい。",
    connectMetamask: "Metamaskと接続してください。",
  },
  message: {
    notFoundMessage: "ページが見つかりません",
    hello: "こんにちは、世界",
    noAccount: "メタマスに接続してください",
    invalidNetwork: "ネットワークを切り替えてください { networkName }.",
    processing: "処理中...",
    copy: "コピー", 
  },
  storyView: {
    message: "以下は、これまでクラウドミントによりブロックチェーン上にセーブされたベクトルアセットで、他のスマートコントラクトからアクセスが可能になっています。グループ、カテゴリーを選び、表示されたイメージとクリックすると、アクセスの方法が表示されます。",
    totalAssetCount: "アセット総数",
    loadingGroups: "グループ読込中...",
    loadingCategories: "カテゴリー読込中...",
    loadingAssets: "アセット読込中...",
    selectAssets: "下からアセットを１つ選択してください",
    sampleCodeMessage: "このアッセとのSVG画像を取得するサンプルコードです",
    fetchedImage: '取得した"SVG"のデータ',
  },
  languages,
};

export default lang;
