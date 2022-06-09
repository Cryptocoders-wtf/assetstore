<template>
  <div class="max-w-lg mx-auto text-left p-2">
    <div v-if="tokenGate == 'noAccount'">
      <p>{{ tokenGate }}</p>
    </div>
    <div v-else-if="tokenGate == 'invalidNetwork'">
      <p>{{ tokenGate }}</p>
      <button @click="switchToValidNetwork" class="underline">Switch Network</button>
    </div>
    <div v-else>
      <div v-if="tokenBalance == 0">
        <div v-if="justMinted">
          <p>Thank you for minting. Please wait a little bit...</p>
        </div>
        <div v-else>
          <p>You need to have a Nounsville token to play with this app</p>
          <p>Please <button @click="mint" class="underline">mint</button> (free, but you need to pay a gas).</p>
        </div>
      </div>
      <div v-else>
        <div>
          <h4 class="font-bold">Rooms:</h4>
          <div v-for="room in rooms" v-bind:key="room.another">
            <p @click="()=>{selectRoom(room.index)}">
              {{ room.name }}
              <span v-if="selectedRoom == room.index">*</span>
            </p>
          </div>
        </div>
        <div>
          <h4 class="font-bold">Inbox:</h4>
          <div v-for="message in messages" v-bind:key="message.sender">
            <p>
              {{ message.senderName }}
              : {{ message.text }}
            </p>
          </div>
        </div>
        <div>
          <h4 class="font-bold">Members: (Select one to send a message)</h4>
          <div v-for="user in users" v-bind:key="user.address" @click="()=>{selectUser(user.address);}">
            <p>
              {{ user.name }}
              <span v-if="user.address == account">(you)</span>
            </p>
            <p v-if="selectedUser == user.address">
              <input v-model="message" class="border border-solid border-gray-300" />
              <button @click="sendMessage">Send</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from "vue";
import { useStore } from "vuex";
import { ethers } from "ethers";
import { ChainIds, switchNetwork } from "../utils/MetaMask";

const NounsVille = {
  wabi: require("../abis/NounsvilleToken.json"), // wrapped abi
  address: "0x163B3906884df904EFF51bf21E7Ee3D3f87098D3"
};
const MessageBox = {
  wabi: require("../abis/MessageBox.json"), // wrapped abi
  address: "0x9F2dC3f778c07987Fcf5a225c3EFD29400930D50"
};

// no topics means any events
const filter = {
  address: NounsVille.address,
  /*
  topics: [
    utils.id("NounBought(uint256,address)")
  ]
  */
};

const shorten = (address: string) => {
  return address.substring(0,6) + "..." + address.substring(38);
};

export default defineComponent({
  name: "HomePage",
  components: {
  },
  setup() {
    const expectedNetwork = ChainIds.RinkebyTestNet;
    const store = useStore();
    const tokenBalance = ref(0);
    const selectedUser = ref("");
    const selectedRoom = ref(-1);
    const message = ref("");
    const justMinted = ref(false);
    const users = ref([] as Array<object>);
    const rooms = ref([] as Array<object>);
    const messages = ref([] as Array<object>);
    const holder = computed(() => {
      if (store.state.account && store.state.chainId == expectedNetwork) {
        const provider = new ethers.providers.Web3Provider(store.state.ethereum);
        const signer = provider.getSigner();
        const nounsville = new ethers.Contract(NounsVille.address, NounsVille.wabi.abi, signer);
        const messagebox = new ethers.Contract(MessageBox.address, MessageBox.wabi.abi, signer);
        provider.on(filter, (log, event) => {
          console.log("**** got event", log, event);
          justMinted.value = false;
          fetchBalance();
        });
        return { nounsville, provider, signer, messagebox };
      }
      return null;
    });
    const fetchBalance = async () => {
      if (!holder.value) return;
      const count = await holder.value.nounsville.functions.balanceOf(store.state.account);
      //console.log("**** count", count[0].toNumber());
      tokenBalance.value = count[0].toNumber();
    };
    const fetchMessages = async () => {
      if (!holder.value) return;
      const messagebox = holder.value.messagebox;      
      const result = await messagebox.functions.messageCount(selectedRoom.value);
      console.log("***** messageCount", result[0].toNumber());
      const itemCount = result[0].toNumber();
      const promises = [...Array(itemCount).keys()].map((index) => {
        return messagebox.functions.getMessage(selectedRoom.value, index);
      });
      const items = (await Promise.all(promises)).map((result) => {
        const value = result[0];
        return { sender: value[0], senderName: shorten(value[0]), text: value[2] }
      });
      console.log("***** messages", items);
      messages.value = items;
    };
    const fetchRooms = async () => {
      if (!holder.value) return;
      const messagebox = holder.value.messagebox;      
      const result = await messagebox.functions.roomCount();
      console.log("***** room count", result[0].toNumber());
      const itemCount = result[0].toNumber();
      const promises = [...Array(itemCount).keys()].map((index) => {
        return messagebox.functions.getMembers(index);
      });
      const items = (await Promise.all(promises)).map((result, index) => {
        const members = result[0];
        const another = (members[0].toLowerCase() == account.value.toLowerCase()) ? members[1] : members[0];
        const name = shorten(another);
        return { index, another, name, members };
      });
      console.log("***** rooms", items);
      rooms.value = items;
    };
    const fetchUsers = async () => {
      if (!holder.value) return;
      const nounsville = holder.value.nounsville;      
      const result = await nounsville.functions.totalSupply();
      //console.log("***** totalSupply", result);
      const itemCount = result[0].toNumber();
      const promises = [...Array(itemCount).keys()].map((index) => {
        return nounsville.functions.ownerOf(index);
      });
      const owners = (await Promise.all(promises)).map((result) => {
        const address = result[0].toLowerCase();
        return { address, name:shorten(address) };
      }).filter((user) => {return user.address !== '0x000000000000000000000000000000000000dead'});
      //console.log("***** users", owners);
      users.value = owners;
    };
    const mint = async () => {
      if (!holder.value) return;
      await holder.value.nounsville.functions.mint();
      justMinted.value = true;
    };
    const tokenGate = computed(()=>{
      if (!store.state.account) {
        return "noAccount"
      }
      if (store.state.chainId != expectedNetwork) {
        return "invalidNetwork"
      }
      fetchBalance();
      fetchUsers();
      fetchRooms();
      return "valid";      
    });
    const switchToValidNetwork = async () => {
      console.log(expectedNetwork);
      await switchNetwork(expectedNetwork);
    }
    const selectUser = (address:string) => {
      selectedUser.value = address;
    };
    const selectRoom = (index:number) => {
      selectedRoom.value = index;
      messages.value = [];
      fetchMessages();
    }
    const sendMessage = async () => {
      if (!holder.value) return;
      const messagebox = holder.value.messagebox;    
      console.log("calling send", selectedUser.value, message.value);
      const result = await messagebox.functions.sendMessage(selectedUser.value, message.value); /*, {
        gasLimit: 100000
      });  */
      console.log("just send", result);
      selectedUser.value = "";
      message.value = "";
    };
    const account = computed(()=>{
      if (store.state.account) {
        return store.state.account.toLowerCase();
      }
      return null;
    });    
    return {
      account,
      users,
      rooms,
      selectedRoom, selectRoom,
      selectedUser, selectUser,
      message, sendMessage, messages,
      mint, justMinted,
      tokenGate,
      tokenBalance,
      switchToValidNetwork
    }
  }
});
</script>
