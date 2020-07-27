const API_TOKEN = "public_api_key";
const Chat = API.load(API_TOKEN);

Chat.on("mods_loaded", mods => {
  log(`MODS SUCCESSIFULLY MLOADED DAT:`, mods);
})

Chat.on("user_join", userId => {
  var user = Chat.getUser(userId);

  log(user)

  //user.joinChannel(0);


  log(`user coneNCTED:`, userId);
})
