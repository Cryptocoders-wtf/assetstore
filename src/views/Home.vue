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
          <p>You need to have a contract token to play with this app</p>
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

const PrideSquiggle = {
  wabi: require("../abis/VectorToken.json"), // wrapped abi
  address: "0x2ae025c7Fb9d21838A4Ab23860C97BCb2Adb356a"
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
    const justMinted = ref(false);

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
        const contract = new ethers.Contract(PrideSquiggle.address, PrideSquiggle.wabi.abi, signer);
        const mintFilter = contract.filters.NounBought();
        provider.on(mintFilter, (log, event) => {
          console.log("**** got mint event", log, event);
          justMinted.value = false;
          fetchBalance();
        });
        prevProvider = provider;

        return { provider, signer, contract };
      }
      return null;
    });

    const fetchBalance = async () => {
      if (!networkContext.value) return;
      const count = await networkContext.value.contract.functions.balanceOf(store.state.account);
      //console.log("**** count", count[0].toNumber());
      tokenBalance.value = count[0].toNumber();
      // debug only
      const svg = await networkContext.value.contract.functions.generateSVG(0);
      console.log(svg[0]);
    };

    const mint = async () => {
      if (!networkContext.value) return;
      await networkContext.value.contract.functions.mint();
      justMinted.value = true;
    };
    const tokenGate = computed(()=>{
      if (!store.state.account) {
        return "noAccount"
      }
      if (store.state.chainId != expectedNetwork) {
        return "invalidNetwork"
      }
      return "valid";      
    });
    const switchToValidNetwork = async () => {
      console.log(expectedNetwork);
      await switchNetwork(expectedNetwork);
    }
    const account = computed(()=>{
      if (store.state.account) {
        return store.state.account.toLowerCase();
      }
      return null;
    });    
    return {
      account,
      mint, justMinted,
      tokenGate,
      tokenBalance,
      switchToValidNetwork
    }
  }
});
</script>
