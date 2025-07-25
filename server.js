/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import express from "express";
import config from "./whatsApp.js";
//import axios from "axios";

const GRAPH_FACEBOOK_URL = "https://graph.facebook.com/"
const MESSAGE_END_POINT = "/messages"
const app = express();
var wapp,business_phone_number_id,logstr;
app.use(express.json());

const DEFAULT_PORT=8000
const ALL_IPS='0.0.0.0'
const {PORT,IP,WEBHOOK_VERIFY_TOKEN, GRAPH_API_TOKEN, ENDPOINT_VERSION} = process.env
const BIND_PORT=PORT??DEFAULT_PORT
const BIND_IP=IP??ALL_IPS

const MsgType=Object.freeze({DOC:"document",TEXT:"text",IMAGE:"image",UNKNOW:'unknow'});

  // check if the incoming message contains text
  //if (message?.type === "text") 

const func={
  text:(msg)=>{
     let msgText = msg.text.body
     if (msg.text.body.includes("comprar")) {
     wapp.sendFlow(msg.from,"Pedido"); return;
     }
     if (msgText.includes("list")) {
         wapp.sendInteractive(msg.from,"Selecione o tipo do documento.","TechSupport TM");
         return;
     } 
     wapp.sendMessage(msg.from,"Bom receber sua mensagem.",msg.id);
  },
  image:(msg)=>{
     console.log(`Recebido imagem ${msg.image.id}: ${msg.image.caption}`);
     wapp.send(msg.from,"Recebimento de documentos ainda não foi implementado.");
  },
  document:(msg)=>{
    let pos = msg.document.mime_type.search("/")+1
    let str = "O documento " + msg.document.filename + " tipo "
    str += msg.document.mime_type.slice(pos).toUpperCase() + " foi recebido."
    wapp.sendMessage(msg.from,str,msg.id)
  },
  interactive:(msg)=>{
    const inter={
      list_repy:(msg)=>{
        let listReply = msg.interactive.list_reply;
        console.info(listReply);
        console.info(msg.from," selected option ", listReply.id,listReply.title);
        wapp.sendMessage(msg.from,"Opção selecionada:"+listReply.title);
      }
    }
    inter[msg.interactive.type](msg);
  }
}

func[MsgType.UNKNOW]=(msg)=>{
  console.log("Formato de mensagem desconhecido.");        
  wapp.send(msg.from,"Sua mensagem não foi compreendida.\nConsulte o suporte ao cliente.",msg.id)
}

let doc = { type: 'document',
  document: {
    filename: '2402954.pdf',
    mime_type: 'application/pdf',
    sha256: '0nRskj4q+g7qbaN6I0d4rvjKgyqRwq2Z0nH3GpXeht8=',
    id: '1699334064013068'
  }
}


app.post("/webhook", async (req, res) => {
  // log incoming messages
  //console.log("Incoming webhook message:", JSON.stringify(req.body, null, 2));
  
  const account_id               = req.body.entry?.[0]?.id
  const metadata = req.body.entry?.[0].changes?.[0].value?.metadata
  const business_display_phone   = metadata.display_phone_number
  const business_phone_number_id = metadata.phone_number_id;
  // check if the webhook request contains a message
  // details on WhatsApp text message payload: https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/payload-examples#text-messages
  const messages = req.body.entry?.[0].changes?.[0].value?.messages ?? []; //?.[0];
  let msgCount = messages ? messages.length:0;
  const statuses = req.body.entry?.[0].changes?.[0].value?.statuses ?? []
  wapp = config(business_phone_number_id);
  
  //console.info(msgCount," mensagem recebida para ", business_display_phone, "[", account_id, "]");
  console.info(`Notificação de ${msgCount} mensagem para ${business_display_phone} ${business_phone_number_id }`)
  console.log(req.body)
  console.log(req.body.entry[0].changes)

  for (const msg of messages) { 
    console.info(msg);
    func[msg.type](msg);
    const procedure=func[msg.type] || ((msg)=>{console.info(`Formato de mensagem ${msg.type} ainda não é aceito.`)})
    procedure(msg)
    
    // mark incoming message as read
    wapp.setMsgAsRead(msg.id)
  }
  for (const status of statuses) {
    console.info("Status notification",status);
    
  }
  res.sendStatus(200);
});

    // send a reply message as per the docs here https://developers.facebook.com/docs/whatsapp/cloud-api/reference/messages
    const axios_put_data ={
      method: "POST",
      url: GRAPH_FACEBOOK_URL + ENDPOINT_VERSION + 
           "/" + business_phone_number_id + MESSAGE_END_POINT,
      headers: {
        Authorization: `Bearer ${GRAPH_API_TOKEN}`,
      },
      data: {
        messaging_product: "whatsapp",
        to: "recipient",
        text: { body: "Message body goes here." },
        context: {
          message_id: "wapp_message_id", // shows the message as a reply to the original user message
        },
      },
    };

// accepts GET requests at the /webhook endpoint. You need this URL to setup webhook initially.
// info on verification request payload: https://developers.facebook.com/docs/graph-api/webhooks/getting-started#verification-requests
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  // check the mode and token sent are correct
  if (mode === "subscribe" && token === WEBHOOK_VERIFY_TOKEN) {
    // respond with 200 OK and challenge token from the request
    res.status(200).send(challenge);
    console.log("Webhook verified successfully!");
  } else {
    // respond with '403 Forbidden' if verify tokens do not match
    res.sendStatus(403);
  }
});

app.get("/", (req, res) => {
  res.send(`<pre>Nothing to see here.
Checkout README.md to start.</pre>`);
});

const server=app.listen(BIND_PORT, BIND_IP, () => {
  const addr=server.address()
  console.log(`Server is listening on ${addr.address}:${addr.port}`);
});
