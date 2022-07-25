import languages from "./languages";

const lang = {
  menu: {
    connect: "Connect",
    connected: "Connected",
    nometamask: "No Metamask",
  },
  header: {
    home: "Home",
    material: "Material",
    kamon: "Kamon",
  },
  keyMessage: {
    message1:
      'This is a part of "On-Chain Asset Store" project, which is an effort to make variety of vector assets available on blockchains.',
    message2:
      'We are using a "crowd-minting" method, where each minter pays a small amount of gas fees to upload a vector image to the blockchain, and receives multiple NFTs as rewards.',
  },
  mint: {
    switchNetwork: "Please switch the network.",
    connectMetamask: "Please connect with Metamask.",
  },
  message: {
    notFoundMessage: "Page not Found",
    hello: "hello world",
    noAccount: "Please connect Metamask.",
    invalidNetwork: "Please switch network to { networkName }.",
    processing: "Processing...",
    copy: "copy",
    nftListTitle: "List of crowd-minted NFTs",
    resources: "Resources",
    loading: "Loading...",
  },
  storyView: {
    message:
      'You are able to see the list of vector assets already uploaded to the blockchain by minters. Please select "group" and "category", and click one of images below. It will explain how to access the vector data.',
    totalAssetCount: "Total Asset Count",
    loadingGroups: "Loading groups...",
    loadingCategories: "Loading categories...",
    loadingAssets: "Loading assets...",
    selectAssets: "Please select one of assets below.",
    sampleCodeMessage: "A sample code to fetch the SVG image of this asset.",
    fetchedImage: 'The fetched "svg" data.',
  },
  assetPanel: {
    mint: "Please select one of images below and the follow the instruction displayed further below.",
    thanks: "Thanks to all the minters, the current release of { totalCount } NFTs were sold out. We are going to add more NTFs soon. Please stay tuned!",
  },
  languages,
};

export default lang;
