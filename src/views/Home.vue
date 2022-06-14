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
          <div v-for="room in rooms" v-bind:key="room.roomId">
            <p @click="()=>{selectRoom(room)}">
              [{{ room.name }}]
            </p>
            <div v-if="selectedRoom && selectedRoom.roomId == room.roomId">
              <div v-for="message in messages" v-bind:key="message.sender">
                <p v-if="message.isMe" class="text-right">
                  {{ message.text }}
                </p>
                <p v-else>
                  {{ message.text }}
                </p>
              </div>
              <div class="text-right mt-2 mb-2">
                <input v-model="message" class="border border-solid border-gray-300 px-2 py-1" />
                <button @click="sendMessageToRoom" class="inline-block px-6 py-2 bg-green-600 text-white font-medium text-xs leading-tight uppercase rounded ml-2">Send</button>
              </div>
            </div>
          </div>
        </div>
        <div>
        </div>
        <div>
          <h4 class="font-bold">Members: (Select one to send a message)</h4>
          <div v-for="member in members" v-bind:key="member.address">
            <p @click="()=>{selectUser(member.address);}">
              {{ member.name }}
              <span v-if="member.address == account">(you)</span>
            </p>
            <div v-if="selectedUser == member.address" class="text-right">
              <input v-model="message" class="border border-solid border-gray-300 px-2 py-1" />
              <button @click="sendMessage" class="inline-block px-6 py-2 bg-green-600 text-white font-medium text-xs leading-tight uppercase rounded ml-2">Send</button>
            </div>
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
  wabi: require("../abis/VectorToken.json"), // wrapped abi
  address: "0x2ae025c7Fb9d21838A4Ab23860C97BCb2Adb356a"
};
const MessageBox = {
  wabi: require("../abis/MessageBox.json"), // wrapped abi
  address: "0x1E93414cf36659084963E66c7cD24bDd00a55917"
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
    const selectedRoom = ref(null as any);
    const message = ref("");
    const justMinted = ref(false);
    const members = ref([] as Array<object>);
    const rooms = ref([] as Array<object>);
    const messages = ref([] as Array<object>);

    let prevProvider:ethers.providers.Web3Provider | null = null;
    const networkContext = computed(() => {
      if (prevProvider) {
        console.log("Calling removeAllListners()");
        prevProvider.removeAllListeners();
        prevProvider = null;
      }

      if (store.state.account && store.state.chainId == expectedNetwork) {
        const provider = new ethers.providers.Web3Provider(store.state.ethereum);
        const signer = provider.getSigner();
        const nounsville = new ethers.Contract(NounsVille.address, NounsVille.wabi.abi, signer);
        const messagebox = new ethers.Contract(MessageBox.address, MessageBox.wabi.abi, signer);
        const mintFilter = nounsville.filters.NounBought();
        provider.on(mintFilter, (log, event) => {
          console.log("**** got mint event", log, event);
          justMinted.value = false;
          fetchBalance();
        });
        const roomFilter = messagebox.filters.RoomCreated();
        provider.on(roomFilter, (log, event) => {
          console.log("**** got room event", log, event);
          fetchRooms();
        });
        const messageFilter = messagebox.filters.MessageReceived();
        provider.on(messageFilter, (log, event) => {
          console.log("**** got message event", log, event);
          if (selectedRoom.value) {
            fetchMessages();
          }
        });
        prevProvider = provider;

        return { provider, signer, nounsville, messagebox };
      }
      return null;
    });

    const fetchBalance = async () => {
      if (!networkContext.value) return;
      const count = await networkContext.value.nounsville.functions.balanceOf(store.state.account);
      //console.log("**** count", count[0].toNumber());
      tokenBalance.value = count[0].toNumber();
      // debug only
      const svg = await networkContext.value.nounsville.functions.generateSVG(0);
      console.log(svg[0]);
    };

    const fetchMessages = async () => {
      if (!networkContext.value) return;
      const messagebox = networkContext.value.messagebox;      
      const result = await messagebox.functions.getRoomInfo(selectedRoom.value.roomId);
      console.log("***** messageCount", result[0]);
      const messageCount = result[0][0].toNumber();
      const promises = [...Array(messageCount).keys()].map((index) => {
        return messagebox.functions.getMessage(selectedRoom.value.roomId, index);
      });
      const items = (await Promise.all(promises)).map((result) => {
        const value = result[0];
        const sender = value[0].toLowerCase();
        return { sender, isMe:(sender == account.value), senderName: shorten(sender), text: value[1] }
      });
      //console.log("***** messages", items);
      messages.value = items;
    };

    const fetchRooms = async () => {
      if (!networkContext.value) return;
      const messagebox = networkContext.value.messagebox;      
      const result = await messagebox.functions.roomCount();
      //console.log("***** room count", result[0].toNumber());
      const roomCount = result[0].toNumber();
      const promises = [...Array(roomCount).keys()].map(async (index) => {
        try {
          const result = await messagebox.functions.getRoomId(index);
          const roomId = result[0].toNumber();
          const resultRoomInfo = await messagebox.functions.getRoomInfo(roomId);
          const roomInfo = resultRoomInfo[0];
          const timestamp = roomInfo[1].toNumber();
          const members = roomInfo[2];
          // console.log("**** members", members, timestamp);
          return { roomId, timestamp, members };
        } catch (e) {
          console.error("Failed to get roomID and getRoomInfo", index, roomCount, e);
          return {};
        }
      });
      const items = (await Promise.all(promises)).map((result, index) => {
        const members = result.members.map((m:string) => { return m.toLowerCase(); });
        const roomId = result.roomId;
        const others = members.filter((m:string) => { return m != account.value; });
        const name = others.length > 0 ? others.map((m:string) => { return shorten(m); }).join(",") : "you";
        return { index, roomId, others, name, members };
      });
      rooms.value = items;
    };

    const fetchMembers = async () => {
      if (!networkContext.value) return;
      const nounsville = networkContext.value.nounsville;      
      const result = await nounsville.functions.totalSupply();
      //console.log("***** totalSupply", result);
      const itemCount = result[0].toNumber();
      const promises = [...Array(itemCount).keys()].map((index) => {
        return nounsville.functions.ownerOf(index);
      });
      members.value = (await Promise.all(promises)).map((result) => {
        const address = result[0].toLowerCase();
        return { address, name:shorten(address) };
      }).filter((user) => {return user.address !== '0x000000000000000000000000000000000000dead'});
      fetchRooms();
    };

    const mint = async () => {
      if (!networkContext.value) return;
      await networkContext.value.nounsville.functions.mint();
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
      fetchMembers();
      return "valid";      
    });
    const switchToValidNetwork = async () => {
      console.log(expectedNetwork);
      await switchNetwork(expectedNetwork);
    }
    const selectUser = (address:string) => {
      if (selectedUser.value && selectedUser.value == address) {
        selectedUser.value = "";
      } else {
        selectedUser.value = address;
      }
      selectedRoom.value = null;
    };
    const selectRoom = (room:any) => {
      if (selectedRoom.value && selectedRoom.value.roomId == room.roomId) {
        selectedRoom.value = null;
      } else {
        selectedRoom.value = room;
        messages.value = [];
        fetchMessages();
      }
      selectedUser.value = "";
    }
    const sendMessage = async () => {
      if (!networkContext.value) return;
      const messagebox = networkContext.value.messagebox;    
      console.log("calling send", selectedUser.value, message.value);
      const addressed = [store.state.account, selectedUser.value].sort();
      const result = await messagebox.functions.sendMessage(addressed, message.value); /*, {
        gasLimit: 100000
      });  */
      console.log("just send", result);
      selectedUser.value = "";
      message.value = "";
    };
    const sendMessageToRoom = async () => {
      if (!networkContext.value) return;
      const { roomId } = selectedRoom.value;
      console.log("****to", roomId);
      const messagebox = networkContext.value.messagebox;    
      const result = await messagebox.functions.sendMessageToRoom(roomId, message.value); 
      console.log("just send", result);
      message.value = "";
    }
    const account = computed(()=>{
      if (store.state.account) {
        return store.state.account.toLowerCase();
      }
      return null;
    });    
    return {
      account,
      members,
      rooms,
      selectedRoom, selectRoom, sendMessageToRoom,
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
