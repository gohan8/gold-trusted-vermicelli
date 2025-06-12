import qs from 'qs';
import axios from "axios";


export class TAccessToken{
  constructor(token='',type='',expires=0){
    this["expires_in"]=expires
    this["access_token"]=token
    this["token_type"]= type
    this["scope"] =  ""
  }
}

class TAxiosConfig  {
  constructor(baseurl,autheticator) {
  this.baseURL=baseurl;// g:`https://api-pix.hm.bb.com.br/pix/v${PIXAPI_VERSION}/`,
  this.headers={}

  this.responseType= 'json', //axios default
  this.responseEncoding='utf8', //axios  default
  this.decompress=true; // axios default
  }
  setBearer(token){
    this.headers.Authorization =`Bearer ${token}`
  }
  setBasicAuth(token){
    this.headers.Authorization = `Basic ${token}`
  }
  setContentType(ct) {
    this.headers["Content-Type"]=ct
  }
};

// Base class: TAuthenticator
class TAuthenticator {
  constructor(options = {}) {
    this.authConfig = options
    this.authConfig.bodyData = ''
    this.accessToken=new TAccessToken()
    this.refreshToken=new TAccessToken()
    this.configData= new TAxiosConfig(options.apiUrl)
    this.setup(this.configData.headers, this.authConfig)
    
  }
  
  setup(httpHeaders, httpBody) {
    throw new Error('Method setup() must be implemented by subclasses.');
  }
  
  async authenticate(endPoint) {
    throw new Error('Method authenticate() must be implemented by subclasses.');
  }
  
  validade(response){
    throw new Error('Method validade() must be implemented by subclasses.');
  }

  getOptions() {
    return this.options;
  }

  setOptions(options) {
    this.options = options;
  }
  

}


// Subclass: TBasicAuthenticator
class TBasicAuthenticator extends TAuthenticator {
  constructor(options = {}) {
    super(options);
  }
  
  setup(httpHeaders, httpBody) {
    httpHeaders.Authorization = 'Basic '+this.authConfig.AUTH_API_BASIC
    httpHeaders['Content-Type'] = 'application/x-www-form-urlencoded'
    httpBody.bodyData = qs.stringify(this.authConfig.authData)
    
  }
  
  async authenticate(endPoint='') {
    endPoint = endPoint || this.authConfig.endPoints[0]
    var res = await axios.post(endPoint,this.authConfig.bodyData,this.configData)
    
    try { var d = await res.json() } catch {console.error(res)}
    return d;
  }
  
  validade(response) {
    var d=response.json()
    console.log(d)
    this.accessToken["access_token"]=d["access_token"]
    this.accessToken["expires_in"]=d["expires_in"]
    this.accessToken["token_type"]=d["token_type"]
    this.accessToken["scope"] = d["scope"]
  }

}

class TBearerAuthenticator extends TBasicAuthenticator {
  constructor(options = {}) {
    super(options);
  }
  
  setup(httpHeaders, httpBody) {
    httpHeaders.Authorization = 'Bearer '+this.authConfig.PIXAPI_TOKEN
    httpHeaders['Content-Type'] = 'application/json'
    httpBody.bodyData = this.authConfig.authData
  }
  
  validade(response){
    var d=response.json
    console.info('Bearer authentication response:\n',d)
  }
}

class TNoAuthenticator extends TAuthenticator {
  constructor(options={}){
    super(options)
  }
  
  setup(httpHeaders, httpBody) {
    httpHeaders.Authorization = undefined
    httpHeaders['Content-Type'] = 'application/json'
    httpBody.bodyData = this.authConfig.authData
  }
  
  async authenticate(endPoint) {
    endPoint = endPoint || this.authConfig.endPoints[0]
    var res = await axios.post(endPoint,this.authConfig.bodyData,this.configData)
    var d
    if (res.ok) {
      var d = res.data
      d.expires=new Date()
      d.expires.setMinutes(d.expires.getMinutes()+d.expires_in)
    }
    return d;
  }
  
}

export {TBasicAuthenticator}
export {TBearerAuthenticator, TNoAuthenticator}
export {TAxiosConfig}