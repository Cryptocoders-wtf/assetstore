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
  keyMessage: {
    message1:
      "これは、フル・オンチェーンNFTの表現力をより高めるために、ブロック・チェーン上にさまざまなベクトル画像をアップロードし、人類の共有アセットとして活用しようという「On-Chain Asset Store」プロジェクトの一環です。",
    message2:
      "大量のベクトル画像をチェーン上にアップロードするには多くの「ガス代」が必要ですが、それをNFTをミントする方に少しつづ負担していただく「クラウドミント」への参加をみなさんにお願いしています。",
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
    nftListTitle: "クラウドミント済みのNFT",
    resources: "参考リンク",
    loading: "読み込み中です...",
  },
  storyView: {
    message:
      "以下は、これまでクラウドミントによりブロックチェーン上にセーブされたベクトルアセットで、他のスマートコントラクトからアクセスが可能になっています。グループ、カテゴリーを選び、表示されたイメージとクリックすると、アクセスの方法が表示されます。",
    totalAssetCount: "アセット総数",
    loadingGroups: "グループ読込中...",
    loadingCategories: "カテゴリー読込中...",
    loadingAssets: "アセット読込中...",
    selectAssets: "下からアセットを１つ選択してください",
    sampleCodeMessage: "このアッセとのSVG画像を取得するサンプルコードです",
    fetchedImage: '取得した"SVG"のデータ',
  },
  assetPanel: {
    mint: "下に表示されている画像の一つをクリックし、下に表示されるミントボタンを押して下さい。",
    thanks: "今回の発行分（{totalCount}個）に関しては、クラウドミントが完了いたししました。ご協力、ありがとうございます。さらにNFTを追加する予定なので、少々お待ちください。",
  },
  languages,
};

export default lang;
