import languages from "./languages";

const lang = {
  menu: {
    connect: "Connect",
    connected: "Connected",
    nometamask: "No Metamask",
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
  },
  storyView: {
    message: 'You are able to see the list of vector assets already uploaded to the blockchain by minters. Please select "group" and "category", and click one of images below. It will explain how to access the vector data.',
    totalAssetCount: "Total Asset Count",
    loadingGroups: "Loading groups...",
    loadingCategories: "Loading categories...",
    loadingAssets: "Loading assets...",
    selectAssets: "Please select one of assets below.",
    sampleCodeMessage: "A sample code to fetch the SVG image of this asset.",
    fetchedImage: 'The fetched "svg" data.',
  },
  languages,
};

export default lang;
