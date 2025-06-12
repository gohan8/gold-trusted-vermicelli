import axios from "axios";
import crc16 from "crc/crc16";
import crc16ccitt from "crc/crc16ccitt";
import {TAxiosConfig,TBearerAuthenticator} from "../util/authentication.js"
import crypto from "node:crypto"


/*try {crypto=import("node:crypto")} 
catch (err) { console.error("Suporte a criptografia desabilitado!")};*/

const {PIXAPI_VERSION, PIXAPI_TOKEN, MERCHANT_CITY, MERCHANT_NAME} = process.env


const f={
  url: '',
  baseURL: `https://api-pix.hm.bb.com.br/pix/v${PIXAPI_VERSION}`,
  headers: {
    Authorization: `Bearer ${PIXAPI_TOKEN}`,
    "Content-Type": "application/json"
  },
  responseType: 'json', // default
  responseEncoding: 'utf8', // default
  decompress: true // default
};

const BRCODE={
  PAYLOAD_IND:'000201', INIT_METHOD:'010212', REFERENCE_LABEL:'05', ACOUNT_KEY:'01', ACOUNT_URL:'25', ACCOUNT_INFO:'26', MERCHANT_CATEGORY_UNUSED:'52040000',
  TRANSACTION_CURRENCY:'53', TRANSACTION_CURRENCY_REAL:'5303986', TRANSACTION_AMOUNT:'54', COUNTRY_CODE:'5802', COUNTRY_BR:'5802BR',
   MERCHANT_NAME:'59', MERCHANT_CITY:'60', ADICIONAL_DATA:'62', CRC16CCITT:'6304', REF_LABEL:'05', REF_LABEL_UNUSED:'0503***'
}
const pixGUI='0014br.gov.bcb.pix'
const chaves=['testqrcode01@bb.com.br','28779295827','7f6844d0-de89-47e5-9ef7-e0a35a681615',
'3d94a38b-f344-460e-b6c9-489469b2fb03','d14d32de-b3b9-4c31-9f89-8df2cec92c50']

function pad2(n,len=2,pad='0'){
  return n.toString().padStart(len,pad);
}

class CobInfoAdicional {
	constructor(nome,val){
		this.nome=nome;
		this.val=val;
	}
}

class CobCalendario{
	constructor(exp,criacao){
		this.expriracao=exp;
		if (criacao) this.criacao=criacao;
	}
}
CobCalendario.prototype.criacao=undefined;

class CobValor {
	constructor(original,modAlt,exp){
		this.original=original;
		this.modalidadeAlteracao=modAlt;
		this.calendario = new CobCalendario(exp)
		this.chave=undefined
		this.solicitacaoPagador=undefined
		this.infoAdicionais=[]
	}
}
CobValor.prototype.retirada=undefined

class PixApi {
	constructor(config){
		this.endpoints = 	config.endPoints
    this.pixGUI= 'br.gov.bcb.pix'
    this.auth = new TBearerAuthenticator(config)
	}
  
	async cobranca(chave,valor,solicitaPagador="",exp=3600) {
	  let payload=new CobValor(valor,0,exp)
	  payload.chave=chave;
	  payload.solicitacaoPagador=solicitaPagador;
	  let pixid=crypto.randomUUID()
    console.info(`${this.endpoints.cob}/${pixid}`)
     console.info(payload)
    console.info(this.auth.configData)
	  /*var res = await axios.put(`${this.endpoints.cob}/${pixid}`,payload,this.this.auth.configData
      ).then(res=>{this.checkPix(res)}
      ).catch((err)=>console.error("Geracao da cobrança falhou.",err)
      )*/
	}
	
	checkPix(res){
		let data;
    res.json().then(data=>{
		console.info(`Cobrança ${data.status}:\nData:${data.calendario.criacao} txid:${data.txid}`);
		console.info(`URL: ${data.loc.location} Solicitação ao pagador: ${data.solicitacaoPagador}`);
		console.info(this.getPixCode(data,MERCHANT_NAME,MERCHANT_CITY));
    })	
	}
	
	getStaticPixCode(chave,valor,name,city){
		let accountInfo=`${pixGUI}${BRCODE.ACOUNT_KEY}${chave.length}${chave}`
		let str=valor.toPrecision(2)
		str=`${BRCODE.TRANSACTION_AMOUNT}${str.length}${str}`
		let pixStr=`${BRCODE.PAYLOAD_IND}${BRCODE.ACCOUNT_INFO}${accountInfo.length}${accountInfo}`
		pixStr=`${pixStr}${BRCODE.MERCHANT_CATEGORY_UNUSED}`
    pixStr=`${pixStr}${BRCODE.TRANSACTION_CURRENCY_REAL}${str}${BRCODE.COUNTRY_BR}`
		pixStr=`${pixStr}${BRCODE.MERCHANT_NAME}${name.length}${name}`
    pixStr=`${pixStr}${BRCODE.MERCHANT_CITY}${city.length}${city}`
    var txid = crypto.randomUUID()
		str=`${BRCODE.REF_LABEL}${txid.length}${txid}`
		str=`'${BRCODE.ADICIONAL_DATA}${str.length}${str}${BRCODE.CRC16CCITT}`
    pixStr.concat(str)
   
    return {
      id:txid,
      pixcode: pixStr.concat(crc16ccitt(Buffer.from(pixStr)).toString(16).padStart(4,'0'))
    }
	}	
		
	getPixCode(cobImediata,merchantName,merchantCity){
		let pixStr=BRCODE.PAYLOAD_IND+BRCODE.INIT_METHOD+BRCODE.ACCOUNT_INFO;
		let accountInfo=`${pixGUI}${BRCODE.ACOUNT_URL}${cobImediata.loc.location.length}${cobImediata.loc.location}`
		pixStr=`${pixStr}${accountInfo.length}${accountInfo}${BRCODE.MERCHANT_CATEGORY_UNUSED}${BRCODE.COUNTRY_BR}`
		pixStr=`${pixStr}${BRCODE.MERCHANT_NAME}11TechSupport${BRCODE.MERCHANT_CITY}${merchantCity.length}${merchantCity}`
		pixStr=`${BRCODE.ADICIONAL_DATA}${BRCODE.REF_LABEL_UNUSED.length}${BRCODE.REF_LABEL_UNUSED}${BRCODE.CRC16CCITT}`
		let crcStr = crc16ccitt(Buffer.from(pixStr)).toString(16);
		return pixStr.concat(crcStr.padStart(4,'0'))
	}
}

export {PixApi}






