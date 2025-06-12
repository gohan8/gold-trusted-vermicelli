import axios from "axios";



const { WEBHOOK_VERIFY_TOKEN, GRAPH_API_TOKEN, ENDPOINT_VERSION} = process.env;
const wappHeader = {
  messaging_product: "whatsapp",
  recipient_type: "individual",
}
function interList(headerTxt,bodyTxt,footerTxt,laction)  {
  return {... {
    "type": "interactive",
    "interactive": {
      "type": "list",
      "header": {
        "type": "text",
        "text": headerTxt
      },
      ... interListBody(bodyTxt,footerTxt),
      ... laction
    }
  }  }
}

function interListBody(bodyTxt,footerTxt) {
  return {
  "body": {
      "text": bodyTxt
  },
  "footer": {
      "text": footerTxt
  },
  }
}

function interListAction(btnText, sections) {
    const action = {
    	"action": {
            "sections": sections,
            "button"  : btnText
        }
    }
    return action;
}

function listSection(title, itens) {
  const section = {
	  "title": title, "rows": itens,
  }
  return section;
}

function listSectionItem(id, itemTxt, descr){
  return {
	  "id": id, "title":  itemTxt, "description": descr,
  }
}

let wapp={}
let configData={},inst

export default function config(business_phone_number_id) {
  configData = {
    url: `${business_phone_number_id}/messages`,
    baseURL: `https://graph.facebook.com/v${ENDPOINT_VERSION}/`,
    headers: {
          Authorization: `Bearer ${GRAPH_API_TOKEN}`,
          "Content-Type": "application/json"
        },
    responseType: 'json', // default
    responseEncoding: 'utf8', // default
    decompress: true // default
  };
  inst=axios.create(configData);
  return wapp;
} 

wapp.sendMessage=function(recipient,msg,replyMsgID) {
  let msgData={//...wappHeader,...{
    messaging_product: "whatsapp",
    to:recipient,
    text:{
      body: msg
    },
    context:{ // shows the message as a reply to the original user message
      message_id: replyMsgID ?? ""
    },
  }
 
  inst.post(configData.url, msgData).then(
    ()=>console.log(`Mensagem enviada para ${msgData.to}`)
  ).catch((err)=>console.error("sendMessage() failed:",err))
}
  // mark incoming message as read
wapp.setMsgAsRead = function(msgID) {
    //const url = `${business_phone_number_id}/messages`;
    //BaseURL is set on config: https://graph.facebook.com/v18.0/
    const data={
        messaging_product: "whatsapp",
        status: "read",
        message_id: msgID,
      }
    inst.post(configData.url,data,
      ).then(()=>console.log(`${msgID} was marked as read.`)
      ).catch((err)=>console.error("setMsgAsRead() failed:",err)
      )
  }

wapp.sendInteractive=function(recep,bodyTxt,footerTxt) {
  const session = listSection("Documentos Pessoais", [
    listSectionItem("rg","Identidade","Documento de Identidade com foto"),
listSectionItem("cpf","CPF","Cartão do CPF emitido pelo portal da Receita Federal")
  ]);
const ia = interListAction("Selecionar", [session]);
  const ilist = interList("Enviar Documento", bodyTxt, footerTxt,ia);
  let data={
    ... wappHeader, 
    ...{"to": recep },
    ... ilist
  }
  inst.post(configData.url,data,
      ).then(()=>console.info(`interactive list message send to ${recep}.`)
      ).catch((err)=>console.error("sendInteractive() failed:",err)
      )
}

wapp.sendFlow=function (recip,flowName) {
  const data = {
  "to": recip,
  "type": "interactive",
  "interactive": {
    "type": "flow",
    "header": {
      "type": "text",
      "text": "Suely Joias"
    },
    "body": {
      "text": "Você pode iniciar sua compra"
    },
    "footer": {
      "text": "Flow message footer"
    },
    "action": {
      "name": "flow",
      "parameters": {
        "flow_message_version": "3",
        "flow_name": flowName, //or flow_id
        "flow_cta": "Comprar"
      }
    }
  }
  }

}//end of function sendFlow

const a={
  "messaging_product":"whatsapp","recipient_type":"individual","to":"recp WhatsApp num",
         "interactive":{"type":"list",
                        "header":{"type":"text","text":"Enviar Documento"},
                        "body":{"text":"Selecione o tipo do documento."},
                        "footer":{"text":"TechSupport TM"},
                        "action":{
                          "sections":[
                            {
                              "title":"Documentos Pessoais",
                              "rows":[
                                {"id":"rg","title":"Identidade","description":"Documento de Identidade com foto"},
                                {"id":"cpf","title":"CPF","description":"Cartão do CPF emitido pelo portal da Receita Federal"}
                              ]
                            }
                          ],
                          "button":"Selecionar"
                        }}}