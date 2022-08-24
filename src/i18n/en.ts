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
    emoji: "Emoji",
    flags: "Flags",
  },
  keyMessage: {
    message1:
      'This is a part of "On-Chain Asset Store" project, which is an effort to make variety of vector assets available on blockchains and make them composable.',
    message1a: "Please see",
    message1b: "for the details.",
    message2:
      'We are using a "crowd-minting" method, where each minter pays a small amount of gas fees to upload a vector image to the blockchain, and receives multiple NFTs as rewards.',
  },
  mint: {
    switchNetwork: "Please switch the network.",
    switchNetworkButton: "Switch Network.",
    connectMetamask: "Please connect with Metamask.",
  },
  mintPanel: {
    writeName: "Name to be permanently stored to the Asset Store.",
    maxLength: "Maximum 32 bytes.",
    cc0Message:
      "Images you mint here will be available for other people to reuse and remix as cc0 (public domain).",
    mintMessage1:
      "This is a free mint, but you need to pay the gas fee, which is typically { low }〜{ high } ETH (depending on the complexity of the image, assuming the Gas price is ~15 Gwei).",
    mintMessage2:
      "If you participate in this crowd-minting effort, you will receive not only the primary NFT (which is the proof that you are one of minters), but also { bonousTokensPerAs } additional bonus NFTs.",
    placeHolder: "Name (such as Twitter Id, optional)",
    thanks:
      "Thank you for participating in this crowd-minting effort. When the blockchain is updated, this message will dissapear automatically.",
    sorry:
      "Another user has just minted this NFT. Please select another image.",
    mint: "Mint",
    preparing: "Preparing to mint...",
    error1: "We have received the following error message.",
    error2: "Please try again from the selection of an image.",
  },
  message: {
    notFoundMessage: "Page not Found",
    hello: "hello world",
    noAccount: "Please connect Metamask.",
    invalidNetwork: "Please switch network to { networkName }.",
    processing: "Processing...",
    copy: "copy",
    nftListTitle: "List of crowd-minted NFTs ({count})",
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
    thanks:
      "Thanks to all the minters, the current release of { totalCount } NFTs were sold out. We are going to add more NTFs soon. Please stay tuned!",
  },
  languages,
};

export default lang;
