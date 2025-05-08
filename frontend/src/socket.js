import { io } from "socket.io-client"
import { useUserStore } from "@/stores/userStore"

const socket = io("http://127.0.0.1:3000") // sunucu adresin

socket.on("connect", () => {
  console.log("Socket.IO bağlandı:", socket.id);

  // Otomatik olarak login olan kullanıcıyı bildir
  const userStore = useUserStore()
  if (userStore.id) {
    socket.emit("user_login", userStore.id)
  }
})

export default socket
