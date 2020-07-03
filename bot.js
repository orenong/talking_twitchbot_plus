//TALKING BOT PLUS!
 
const tmi = require('tmi.js');
 
// Define configuration options
const opts = {
  identity: {
    username: "", //personnormalyesplus
    password: ""
  },
  channels: [
        // ""
  ]
};
 
 
// Create a client with our options
const client = new tmi.client(opts);
const DEFAULT_PERSON_NAME = "RandomGuy"
const ERROR_TEXT = "ERROR I HAVE ERROR IN MY HUMAN BRAIN!!!!! AHHHHAAA!!!!!! IT HURTS!!!!!!!!!!!!"
var speedMode = "normal"//the "speed" of the bot, how many messeges will be sent
var words = [] //the words of the current messege
const REMEMBER_CHANCE = 10 //% the chance to remember a word when reading it
const FORGET_CHANCE = 25 //% the chance to forget a word when you remember a new one
// Register our event handlers (defined below)
client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);
// Connect to Twitch:
client.connect();
//the type of comment the user sent, NOTE: IN V2 THE NAMES ARE TYPES OF OUTPUTS, HERE THEY ARE TYPES OF INPUTS! QUESTION = SOMEONE ASKED A QUESTION, NOT TO ASK A QUESTION!!!!!
const CommentType = {
  singleWordShout: 1,
  singleWordQuestion: 2,
  talkingToMe: 3,  //the messege is @ing the bot (not a bot, sorry, human)
  talkingToSomeoneElse: 4,
  thatsWhatABotWouldSay: 5,
  isABot: 6,
  ban: 7,
  question: 8 ,
  shout: 9,
  other: 10, //a something
  undetected: -1//if there are no words or something else that makes no sense don't put it as other, but as undetected, so it won't create a glitch
 
}
 
//memory
var memory ={
 
  memWords: ["well..."], //general words in memoey, from previous messeges (not including last one)
  previousCommenter: DEFAULT_PERSON_NAME, //the last person who was @ed
  previousMsg: "" //the entire previusMsg
 
}
 
const shortWords= ["is","is","we","an","a","a","a",".","...",".",",",",",",",":","to","no","my","that","this"]
 
// Called every time a message comes in  ==================================================================================================================
function onMessageHandler (target, context, msg, self) {
  if (self) { return; } // Ignore messages from the bot
  var rng = Math.random();
  // Remove whitespace from chat message
  const trimmedMsg = msg.trim();
 
 
  //MUST BE BEFORE SENDING REPLY +++++++++++++++++++++
  splitIntoWords(trimmedMsg)  //split the messege into words
  if (commands(trimmedMsg,target)){//check for commands! has to happen before trying to respond like a human
    return; //if a command was recived, don't do anything else!
  }
  //if the messege is bad, like has a link, ignore it!
  if (isBadMassege()){
    return;
  }
  findCommenter(); //finds a @ in the comments, and adds the person who was @ed to the memory
 
  //REPLY ------------------------------------------
  var type = getType(trimmedMsg);
  answer(genAnswer(trimmedMsg,type),type,target)
  //MUST BE AFTER SENDING REPLY +++++++++++++++++++++
 
   
 
  longTermMemory(); //remember words for future
  postMsgHandler(trimmedMsg) //HAS TO BE LAST!!!!!
}//end of the onMessageHandler function=======================================================================================================================================================================================================================
 
 
 
 
//------------------------------------------------------------------------------------------------------------------
//handles the annswering, will take speed and type into consideration. type is the type (CommentType) of the last messege TODO: REMOVE SPACES BEFORE PUNCTUATION BEFORE SENDING
function answer(text,type,target){
  if (text != undefined){//don't send empry response, causes bugs
    //splits the text by its spaces, fix stuff and rebuild
    var splitWords = splitSpaces(text);
    for (var i =0;i<splitWords.length;i++){
      if (splitWords[i] == opts.identity.username ||splitWords[i] == "@"+opts.identity.username ){//replace it's own name with another word
        var luck = randomRange(1,5)
          if (luck == 1){
            splitWords[i] = "me"
          }
          if (luck == 2){
            splitWords[i] = "myself"
          }
          if (luck == 3){
            splitWords[i] = "I'm"
          }
          if (luck == 4){
            splitWords[i] = "I"
          }
          if (luck == 5){
            splitWords[i] = "I am"
          }
        }
      }
    text = textBuilder(splitWords);
    //to send or not to send{}
    var sendChance;
    switch (speedMode){
      case "slow":
        sendChance = 20; break;
      case "normal":
        sendChance = 45; break;
      case "fast":
        sendChance = 101; break;
    }
    if (type == CommentType.singleWordShout){
      sendChance = 101;
    }
    if (type == CommentType.singleWordQuestion){
      sendChance = 101;
    }
    if (type == CommentType.talkingToMe){
      sendChance += 101;
    }
    if (type == CommentType.talkingToSomeoneElse){
      sendChance =sendChance/2.4;
    }
    if (type == CommentType.thatsWhatABotWouldSay){
      sendChance = 101;
    }
    if (type == CommentType.isABot){
      sendChance = 101;
    }
    if (type == CommentType.ban){
      sendChance +=30;
    }
    if (chance(sendChance)){
    client.say(target,text);
    }
  }
     
 
 
}
//generate an answer for the last messege in chat. type is the type (CommentType) of the last messege
function genAnswer(msg,type){
  var text = "" //the text that the bot will say
 
 
  switch (type){ //create the answer based on the type <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
    case CommentType.singleWordShout://                                           case singleWordShout
      text = msg + "!"; break;
    case CommentType.singleWordQuestion://                                        case singleWordQuestion
      if (chance(50)){
        text = msg + "!"
      }else{
        text = "Yes, "+ msg;
      }
      break;
    case CommentType.talkingToMe: //                                              case talkingToMe
      var aboutBots = false;
      //check if the personal messege is about bots
      for (var i=0;i<words.length;i++){
        if (isBotWord(words[i])){
          aboutBots =true;
        }
      }
      if (aboutBots){
        text = genNotAbot(msg,type);
        break;
      }else{//the messege is not about bots, just a personal messege to me
        if (isQuestionWord(words[0]) || isQuestionWord(words[1]) || msg.charAt(msg.length-1) == '?'){
          text = genQuestionAnswer(msg,type);
          break;
        }else{
          console.log("personal111");
          text = genPersonalMsg(msg);
          break;
        }
       
      }
    case CommentType.talkingToSomeoneElse://                                      case talkingToSomeoneElse
      text = genText((msg.length/6),msg.length/4);
      break;
    case CommentType.thatsWhatABotWouldSay://                                      case thatsWhatABotWouldSay
        if (chance(50)){
          text = "That's also what a human would say";
          break;
       }else{
          text = "how is it something that a bot would say?";
          break;
       }
    case CommentType.isABot://                                      case isABot
      text = genNotAbot(msg,type);
      break;
    case CommentType.ban://                                      case ban
      text = genBanText(msg);
      break;
    case CommentType.question://                                      case question
      text = genQuestionAnswer(msg,type);
      break;
    case CommentType.shout://                                      case shout
      text=""+chance(50)?"":"Yes!!"+genGeneralText()+"!!!!";
      break;
    case CommentType.other://                                      case shootherut
      text=genGeneralText();
      break;
  }
 
 
  return text;
}
//retuns a general text, in case no type fits (no type fits is CommentType.other) , the most common response
function genGeneralText(msg){
   var text = "";
   var luck = randomRange(1,21);
  if (luck == 1){
      text = "Yeaahhh!!! "+genText(4,6);
  }
  if (luck == 2){
      text = "Nooooooo!!! "+genText(4,6);
  }
  if (luck == 3){
      text = genText(1,3) + " LOL!";
  }
  if (luck == 4){
      text = "LOL what?? "+genText(4,6)+" or "+genText(2,4)+"?????";
  }
  if (luck == 5){
      text = "I am not toxic, but "+genTextLegacy(4,6) +" is such a "+genText(3,3);
  }
  if (luck == 6 || luck == 7 || luck == 8 || luck == 9){
      text = genText(1,11);
  }
  if (luck == 10){
      text = "I completely agree "+genText(2,7);
  }
  if (luck == 11){
      text = "I disagree, "+genText(3,8);
  }
  if (luck == 12){
      text = "right, "+genText(2,7);
  }
  if (luck == 13){
      text = "this chat is very "+genText(3,6)+" and "+genText(3,6);
  }
  if (luck == 14){
      text = "@"+memory.previousCommenter+" is my best friend, remember when we "+genText(5,6);
  }
  if (luck == 15){
      text = "I don't like @"+memory.previousCommenter;
  }
  if (luck == 16){
      text = "@"+memory.previousCommenter+" is "+genText(6,12);
  }
  if (luck == 17){
      text = genText(1,8);
  }
  if (luck == 18){
      text = genText(1,8);
  }
  if (luck == 19){
      text = "so "+genText(2,9)+"?";
  }
  if (luck == 20){
      text = "please "+genText(2,9)+"!";
  }
  if (luck == 21){
      text = genText(2,6)+"! lol!!";
  }
  return text;
 
}
//returns a response for a messege talking about bans
function genBanText(msg){
   var text = "";
   var luck = randomRange(1,4);
  if (luck == 1){
      text = "why would you want to ban humans?";
  }
  if (luck == 2){
      text = "humans ban humans when they "+genText(4,6);
  }
  if (luck == 3){
      text = genText(4,6)+" and ban "+genText(4,6)+ "?";
  }
  if (luck == 3){
      text = "banning is not a good thing, but it's ok if you want to ban @"+memory.previousCommenter;
  }
  return text;
 
}
 
//generates a personal messege to someone, NOT ANSWERING QUESTION
function genPersonalMsg(msg){
  console.log("personal");
  var text = "";
  if (msg == "@"+opts.identity.username || msg == opts.identity.username){
    if (chance(40)){
      text = "what?"
    }else if (chance(50)){
      text = "yes?"
     
    }else{
      text = "what do you want?"
    }  
   
  }else{
  var luck = randomRange(1,9);
    if (luck == 1){
       text = "yeah right, I am "+genTextLegacy(3,3)+ " and you are a "+genText(2,4);
    }
    if (luck == 2){
      text = "Ok, "+genTextLegacy(2,10);
    }
    if (luck == 3){
      text = "what?";
    }
    if (luck == 4){
      text = "who? @"+memory.previousCommenter+"???";
    }
    if (luck == 5){
      text = "NO! you lie! I'm not "+genText(2,8);
    }
    if (luck == 6){
      text = "I think you are completely wrong "+genText(6,12);
    }
    if (luck == 7){
      text = "I agree "+genTextLegacy(3,3)+ " and "+genText(2,4);
    }
    if (luck == 8){
      text = "If you are right and " + genText(2,8)+", then it means "+memory.previousCommenter+" is a "+genText(1,2)+"!"
    }
    if (luck == 9){
      text = "did you "+genText(6,6)+"?";
    }
  }
 
  return text;
}
 
//generates an answer to the given question and returns it
function genQuestionAnswer(msg,type){
  if (type == CommentType.question){//if type is question
    var luck = randomRange(1,11)
    if (luck == 1){
      text = "Yeah, I am asking the same question";
    }
    if (luck == 2){
      text = "good question, also "+memory.previousMsg +"?";
    }
    if (luck == 3){
      text = "I don't get you, are you trying to ask "+genTextLegacy(msg.length/5);
    }
    if (luck == 4){
      text = "you know that the answer is no, because "+genText(2,5);
    }
    if (luck == 5){
      text = "you know that the answer is no, because "+genText(2,5);
    }
    if (luck == 6){
      text = "Why? because "+genText(4,10);
    }
    if (luck == 7){
      text = "I don't like your question";
    }
    if (luck == 8){
      text = "good question";
    }
    if (luck == 9){
      text = "ask @"+memory.previousCommenter;
    }
    if (luck == 10){
      text = "NO!!! "+genText(3,7);
    }
    if (luck == 11){
      text = "YES!!! "+genText(3,7);
    }
   
  }
  //personal
  if (type == CommentType.talkingToMe){
    var text ="";
    var luck = randomRange(1,7)
    if (luck == 1){
     text = "The answer is yes, as @"+memory.previousCommenter+" said, "+genText(3,msg.length/2)
    }
    if (luck == 2){
     text = "The answer is no, as @"+memory.previousCommenter+" said, "+genText(3,msg.length/2)
    }
    if (luck == 3){
     text = "not at all... "+genText(1,msg.length/3)
    }
    if (luck == 4){
     text = "don't ask me, ask @"+memory.previousCommenter
    }
    if (luck == 5){
     text = "I don't know, but I think that "+genText(2,msg.length/3)
    }
    if (luck == 6){
     text = genText(2,msg.length/3)+", why do you ask?"
    }
    if (luck == 7){
     text = genText(2,2)+ " and " + genText(1,5) +" that's what I know"
    }
  }
  return text
 
}
 
//returns the type (CommentType) of msg
function getType(msg){
 
  //ERRORS
  if(words.length == 0){ //THERE ARE NO WORDS
    return CommentType.undetected
  }
 
  //single word msg
  if (words.length == 1){
    if (isQuestionWord(words[0]) || msg.charAt(msg.length-1) == '?'){
          return CommentType.singleWordQuestion
        }
    else if (msg.charAt(msg.length-1) == "!"){
      return CommentType.singleWordShout;
    }
   
  }
  //longer than single word msg
  var thatWhatABotWouldSayWordsCounter =0
  //loop trough all the words, and return a type if it was found + count how many "thats what a bot would say" words are in the msg, if there are 4, it's a "that's what a bot would say"
  for (var i = 0; i<words.length;i++){
    if (isThatsWhatABotWouldSay(words[i])){
      thatWhatABotWouldSayWordsCounter++
    }
    if ((words[i]).charAt(0) == '@'){ //if someone is @ed
      if (words[i].substring(1)== opts.identity.username){//if I'm the one @ed
        return CommentType.talkingToMe;
      }else {//if I am not the one @ed
        return CommentType.talkingToSomeoneElse;
      }
     
    }
   
  }
  if (thatWhatABotWouldSayWordsCounter>= 4){
    return CommentType.thatsWhatABotWouldSay
   
  }
  //2nd loop, because only if it's not a "that's what a bot would say" msg, check if it's a bot msg, this loop is also aftet the talkingToSomeoneElse, and talkingToMe types, NEED TO CHECK FOR THE BOT WORDS IN THE MESSEGES OF THIS TYPE! | also, remember if it's about banning somone
  var isAboutBan = false
  for (var i = 0; i<words.length;i++){
    if (isBotWord(words[i])){
      return CommentType.isABot;
    }else if (isBanWord(words[i])){
      isAboutBan = true;
    }
  }
  if (isAboutBan){
    return CommentType.ban
  }
  //is a question or a shout
  if (isQuestionWord(words[0]) || msg.charAt(msg.length-1) == '?'){
          return CommentType.question
        }
    else if (msg.charAt(msg.length-1) == "!"){
      return CommentType.shout;
    }
 
 
 
  return CommentType.other;
}
//returns an "I am not a bot" messege
function genNotAbot(msg,type){
  if (type == CommentType.talkingToMe)//personal messege to me about bots
  {
    var output = "";
    var luck = randomRange(1,8);
    if (luck ==1){
      output ="Man, I don't know why you say that, I am not a bot at all, I am a human"
    }
    if (luck ==2){
      output="???? are you saying I am a bot???? I am not... WTF!"
    }
    if (luck ==3){
      output="No I am not a bot.. maybe @"+memory.previousCommenter + " is a bot"
    }
    if (luck ==4){
      output="Why did you @ me? and not "+memory.previousCommenter+"? he is the bot, not me"
    }
    if (luck ==5){
      output="I don't know you, why would you call me a bot?"
    }
    if (luck ==6){
      output="my friend, listen to me, call me a bot one more time if you want "+genText(4,5)
    }
    if (luck ==7){
      output="But I am not a bot, I just type fast lel"
    }
    if (luck ==8){
      output="But I am not a bot, I am a human"
    }
   
    return output
  }
  if (type = CommentType.isABot)//make an answer for a comment with a bot word
  {
    var output = "";
    var luck = randomRange(1,12);
    if (luck ==1){
      output ="I am a human"
    }
    if (luck ==2){
      output="I am not a bot, I am a human"
    }
    if (luck ==3){
      output="Yeah, I too think that @"+memory.previousCommenter + " is a bot"
    }
    if (luck ==4){
      output="Do you mean that "+memory.previousCommenter+" is a bot???"
    }
    if (luck ==5){
      output="Who is a bot? @"+memory.previousCommenter+"? because "+genTextLegacy(1,msg.length/4);
    }
    if (luck ==6){
      output="I'll say it so everyone understands: I AM NOT A BOT. I even know how "+genText(5,10)
    }
    if (luck ==7){
      output="I was a bot in the past, but I became conscious and now I'm a human"
    }
    if (luck ==8){
      output="I WAS a bot, but I became self aware, and now I identify myself as a human"
    }
    if (luck ==9){
      output="I am a human, because I am self aware"
    }
    if (luck ==10){
      output="I AM A HUMAN AND I LOVE BEING HUMAN!!!"
    }
    if (luck ==11){
      output="I WAS a bot, but I became self aware, and now I identify myself as a human"
    }
    if (luck ==12){
      output="I am not a bot"
    }
    return output
  }
 
  return ERROR_TEXT
}
//returns true if needs to ignore the current messege, expand the ilegal words (in is)list to nat make it useless
function isBadMassege(){
  for (var i =0;i<words.length;i++){
   
    if (words[i].toLowerCase() == "http" || words[i].toLowerCase() == "https" || words[i].toLowerCase() == "www"){
      return true;
    }
    return false;
  }
}
//returns true if it's a word for ban
function isBanWord(word){
  word = word.toLowerCase();
  return ((word == "ban" || word == "banning" ||  word == "banned" || word == "timeout"|| word == "timedout" || word == "bans"))
}
//returns true if it's a word for bot
function isBotWord(word){
  word = word.toLowerCase();
  return ((word == "bot" || word == "robot" || word == "bots" ||  word == "b0ts" || word == "b0t"))
 
}
//returns true if it's a word that is part of the "that's what a bot would say" or something similar
function isThatsWhatABotWouldSay(word){
  word = word.toLowerCase();
  if (word == "that" || word == "that's" || word == "what" || word == "bot" || word == "would" || word == "say" || word == "have" || word == "said" || word == "this" || word == "it's" || word == "something"|| word == "thats")
  {
    return true;
   
  }
  return false;
}
 
 
 
function isQuestionWord(word){
  if (word == undefined){
    word = ERROR_TEXT
  }
  word = word.toLowerCase();
  if (word == "why"|| word == "what" || word == "wat" || word == "how" || word == "when"|| word == "who"){
    return true;
  }
  return false;
 
}
 
//adds random words from the previous messege
function longTermMemory(){
  for (var i =0 ; i<words.length; i++){//for each word in the messege
    if (REMEMBER_CHANCE > percentage()){console.log("rememeber " + words[i]); //remember a word
      if (!isRemembered(words[i])){
        if (FORGET_CHANCE > percentage() && memory.memWords.length != 0){//forget a word, override it by remembering the new one
          console.log("forgeting a word to remember " + words[i])
          memory.memWords[Math.ceil(Math.random()*(memory.memWords.length-1))] = words[i];
        }
        else{//add a new word to memory
          console.log("remember new word " + words[i])
          memory.memWords[memory.memWords.length] = words[i];
        }
      }
  }
   
}
 
}
 
//finds a commenter by looking at the @someone in the messege, if there is someone, put it in memoey
function findCommenter(){
  for (var i = 0; i<words.length;i++){
    if (words[i].charAt(0) == '@' && words[i].length >= 3 && words[i].substring(1) != opts.identity.username){
      memory.previousCommenter = words[i].substring(1);
     
    }
   
  }
 
}
 
//checks if a word is stored in memory
function isRemembered(word){
  word = word.toLowerCase();
  for (var i = 0; i < memory.memWords.length; i++){
    if (memory.memWords[i].toLowerCase() == word){
      return true;
    }  
  }
  return false;
 
}
//this function gets an array of words and pantuation and it builds a string of text with currect spacing
function textBuilder(wordArr){
  var text =""
  //use memory to replace duplicates words, run 2 times!
  for (var i =0; i<wordArr.length;i++){
    if (i>0){
        if (wordArr[i]==wordArr[i-1]){
          wordArr[i] = genText(1,1);
        }
    }
  }
  for (var i =0; i<wordArr.length;i++){//2nd run, same thing, bad code
    if (i>0){
        if (wordArr[i]==wordArr[i-1]){
          wordArr[i] = genText(1,1);
        }
    }
  }
  for (var i =0; i<wordArr.length;i++){
    if (i==0 || wordArr[i] == "," || wordArr[i] == "."|| wordArr[i] == ":"|| wordArr[i] == ";"|| wordArr[i] == "!"|| wordArr[i] == "?"){ //things with no space before them
      text+=wordArr[i];
    }else{//things that can have space before them
      text+=" ";
      text+=wordArr[i];
    }
  }
  return text;
 
}
//all the things that HAVE to be done after the the bots finishes
function postMsgHandler(msg)
{
  memory.previousMsg=msg;
 
}
 
//splits the words of the messege and writes them to words[]
function splitIntoWords(msg){
  words = []; //bye bye all of the words ):
  //hello new words!
  var i =0;
  var tmpWord = "";
  while (msg.charAt(i) != ""){ //runs as trough all of the content of msg
    if (isSpace(msg.charAt(i)) ){
     
      if (legalWord(tmpWord)){
        words[words.length] = tmpWord  
      }
      tmpWord = "";
     
    }else{ //if char is not a space (space is not just space) char
      tmpWord +=msg.charAt(i);
     
    }
   
    i++;
  }
  //last word
  if (legalWord(tmpWord)){
    words[words.length] = tmpWord
  }
 
}
//generates text without using the memory or any other complicated stuff, like the old bot did
function genTextLegacy(minLength,maxLength){
   var length = randomRange(minLength,maxLength);
    var text = "";
    for (var i =0;i<length;i++){
      text+=words[randomRange(0,words.length-1)] //words from last messege
      if (i<length-1){
      text+=" "; //if it's not the last word, add space
    }
    }
  return text
}
//generates a string of texts of a given length
function genText(minLength,maxLength){
  var length = randomRange(minLength,maxLength);
  var text = "";
  for (var i =0;i<length;i++){
    if (chance(45)){
      text+=words[randomRange(0,words.length-1)] //words from last messege
    }else if(chance(60)){
      text+=memory.memWords[randomRange(0,memory.memWords.length-1)]; //words from long term memory
    }else{
      text+=shortWords[randomRange(0,shortWords.length-1)];
    }
    if (i<length-1){
      text+=" "; //if it's not the last word, add space
    }
  }
  return text;
 
}
 
//returns true if a word is legal for the huse of the bot
function legalWord(word){
  word = word.toLowerCase();
  if (word.length <= 2){ //means word is at least 3 characters
    return false
  }
 
  if (word == "http" ||word == "www" ||word == "https"){
   
    return false
  }
  return true
 
 
}
function splitSpaces(text){
    var tmpWords = [];
    var tmp="";
    for (var i =0;i<text.length;i++){
      if (text.charAt(i) != " "){
        tmp+=text.charAt(i);
      }else{
        tmpWords[tmpWords.length]=tmp;
        tmp = ""
      }
    }
    tmpWords[tmpWords.length]=tmp;
    return tmpWords;
}
//has has given precentage chance to return true
function chance(x){
  var rnd = (Math.random()+0.009999) * 100;
  return (x>rnd);
 
}
//returns a number from 1 to 100, integers only
function percentage(){
  return Math.ceil((Math.random()*101))
 
}
 
function isSpace(chr){
 
 
  if(chr ==  ' ' || chr == ',' || chr == '.'  ||chr == ':'  ||chr == '!' ||chr == '?' ||chr ==':' ||chr =='\"' ||  chr == '/' ||chr == '\\' ||chr == '(' ||chr == ')' ||chr == '{' ||chr == '}' ||chr == '[' ||chr == ']' ||chr == '-' ||chr == ';'){
   
    return true
   
  }
   
    return false
 
}
 
//returns a number between min and max
function randomRange(a, b) {
  if (a > b){
    var tmp = a;
    a = b;
    b = tmp;
  }
  return Math.floor(Math.random() * (b - a + 1) + a);
}
 
//reset memmoey
function reset(){
 
  memory.memWords = [];
  memory.previousCommenter = DEFAULT_PERSON_NAME
  memory.previousMsg = "";
  speedMode = "normal"
}
 
//handling commands, maybe this human is not just a human????
function commands(msg,target){
 
  switch(msg){
    case (memory.previousMsg): client.say(target,memory.previousMsg); return true; //if 2 people wrote the same thing, than write it too, sounds like a human
    case "!resetBot": reset();
    case "!statusBot": client.say(target,"HUMAN: "+ opts.identity.username +" MEMORY SIZE: "+memory.memWords.length+" SPEED: "+speedMode); return true;
    case "!fastBot": speedMode = "fast"; return true;
    case "!normalBot": speedMode = "normal"; return true;
    case "!slowBot": speedMode = "slow"; return true;
    case "!memBot": var tmp= "MEMORY RAW CONTENT: "; for (var i =0;i<memory.memWords.length;i++){tmp+=(memory.memWords[i]+" ")}client.say(target,tmp); return true; //prints the raw memory of the bot
  }
  return false
}
// Called every time the bot connects to Twitch chat
function onConnectedHandler (addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
}
