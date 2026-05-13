import { ConfigStorage } from "mzfw/device/Path";
function saveNewMessageToFile(data) {
  var _a, _b;
  const chatDataStorage = new ConfigStorage(data.context_id + ".json");
  const messages = (_a = chatDataStorage.getItem("messages")) != null ? _a : [];
  if (messages.length == 0) {
    const listStorage = new ConfigStorage("chat_list.json");
    const chats = (_b = listStorage.getItem("chats")) != null ? _b : [];
    chats.push({
      id: data.context_id,
      name: data.message
    });
    listStorage.setItem("chats", chats);
    listStorage.writeChanges();
  }
  messages.push({ role: "user", content: data.message });
  if (data.server_message) messages.push(data.server_message);
  messages.push({ role: "assistant", content: "..." });
  chatDataStorage.setItem("messages", messages);
  chatDataStorage.writeChanges();
}
export {
  saveNewMessageToFile
};
