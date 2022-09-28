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
    emoji: "絵文字",
    flags: "国旗",
  },
  keyMessage: {
    message1:
      "これは、フル・オンチェーンNFTの表現力をより高めるために、ブロック・チェーン上にさまざまなベクトル画像をアップロードし、人類の共有アセットとして活用しようという「On-Chain Asset Store」プロジェクトの一環です。",
    message1a: "このプロジェクトの詳細は、",
    message1b: "を参照してください。",
    message2:
      "大量のベクトル画像をチェーン上にアップロードするには多くの「ガス代」が必要ですが、それをNFTをミントする方に少しつづ負担していただく「クラウドミント」への参加をみなさんにお願いしています。",
  },
  mint: {
    switchNetwork: "ネットワークを切り替えて下さい。",
    switchNetworkButton: "ネットワーク切り替え",
    connectMetamask: "Metamaskと接続してください。",
  },
  mintPanel: {
    writeName: "Asset Storeに刻み込む名前。",
    maxLength: "最大32バイト。",
    cc0Message:
      "ここで投稿した画像は、cc0（パブリックドメイン）として他の方に自由に再利用・加工していただくことが可能になりますので、そこに同意した上でミントして下さい。",
    drawMessage:
      "全部自分で描いた場合はフリーミントですが(画像の複雑度に応じたガス代は必要です)、リミックスやオーバーレイを活用した場合は{mintPrice}ETHが必要です。このミント代の97.5%はクリエーターに渡されますが、逆に、自分が描いた絵が他の人に利用された場合、それがあなたの収入になります（Draw2Earn）。",
    mintMessage1:
      "フリーミントですが、ガス代が{ low }〜{ high } ETH程度かかります（画像の複雑さや混雑状況によって大きく変動）。",
    mintMessage2:
      "クラウドミンティングにご協力していただいた方には、「プライマリーNFT」と呼ばれるあなたがクラウドミンティングに協力した証のNFT1つと、転売用の「ボーナスNFT」を{ bonousTokensPerAsset}つ、合計{ tokensPerAsset }つのNFTを発行します。",
    placeHolder: "お名前（オプション、Twitter名推奨）",
    thanks:
      "クラウドミンティングにご協力ありがとうございます。ブロックチェーンへの反映には少し時間がかかります。順調に反映されれば、このメッセージは自動的に消滅します。",
    sorry:
      "残念ながら、他のユーザーによりちょうどミントされたところです。別の画像を選択してください。",
    mint: "ミント",
    preparing: "ミントの準備中...",
    preparing2: "Preparing to mint...",
    error1: "以下のエラーメッセージを受け取りました。",
    error2: "再度、画像の選択からやり直してください。",
  },
  message: {
    notFoundMessage: "ページが見つかりません",
    hello: "こんにちは、世界",
    noAccount: "メタマスに接続してください",
    invalidNetwork: "ネットワークを切り替えてください { networkName }.",
    processing: "処理中...",
    copy: "コピー",
    nftListTitle: "クラウドミント済みのNFT ({count}個)",
    recentNFTs: "最近ミントされたNFT",
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
    sampleCodeMessage: "このアセットのSVG画像を取得するサンプルコードです",
    fetchedImage: '取得した"SVG"のデータ',
  },
  assetPanel: {
    mint: "下に表示されている画像の一つをクリックし、下に表示されるミントボタンを押して下さい。",
    thanks:
      "今回の発行分（{totalCount}個）に関しては、クラウドミントが完了いたししました。ご協力、ありがとうございます。さらにNFTを追加する予定なので、少々お待ちください。",
  },
  dfraw: {
    remix: "リミックス",
    overlay: "オーバーレイ",
  },
  assetPicker: {
    chooseProvider: "プロバイダーを選んで下さい",
    chooseGroup: "グループを選んで下さい",
    chooseCategory: "カテゴリーを選んで下さい",
  },
  draw: {
    message1:
      "これは、自由に絵を描いて、それをフルオンチェーンNFTとしてミントできるサービスです。",
    message2:
      "全てを自分で描く限りは、フリーミントです（絵の複雑さに応じたガス代が必要です）。",
    message3: "他の人の作品をベースに絵を描いたり（リミックス）、",
    message4:
      "ブロックチェーン上のアセットを貼り付けることも可能です（オーバーレイ）。",
    message5:
      "リミックスやオーバーレイをした作品をミントする場合は有料で、そのお金はクリエーターたちに配布されます。",
    message6:
      "つまり、あなた自身がクリエーターとしてお金を稼ぐことも可能なのです（Draw2Earn）。",
    message7: "下のプラスアイコンをクリックして描き初めてください。",
    message8:
      "描き終わったら、右上のXボタンでキャンバスを閉じ、NFTをミントしてみて下さい。",
    message9: "",
  },
  languages,
};

export default lang;
