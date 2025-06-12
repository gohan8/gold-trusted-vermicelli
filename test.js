
import {authConfig,pixConfig,wappConfig} from "./appConfig.js"

import {TNoAuthenticator,TBasicAuthenticator, TBearerAuthenticator,TAccessToken} from "./util/authentication.js"
import  {PixApi} from "./pay/pixApi.js"
import {echo} from "./util/tools.js"

authConfig.authData= {
      grant_type: 'client_credentials',
      scope: 'pix.write pix.read cob.write cob.read webhook.read webhook.write'
    }

authConfig.apiUrl='https://crypto-wallet-server.mock.beeceptor.com'
authConfig.endPoints=['']
authConfig.authData={
  "username": "user123",
  "password": "securepassword"
}
var f=new TNoAuthenticator(authConfig)
console.info(f.configData)
f.authenticate('/api/v1/login').then((d)=>{console.info(d)})

var t=()=>{
var bbAuth=new TBasicAuthenticator(authConfig)

bbAuth.authenticate().then((d)=>{
  pixConfig.PIX_API_TOKEN = d.access_token
  var p=new PixApi(pixConfig)
  echo(p.auth.configData)
  p.cobranca('cahve','88.08')
})



echo(bbAuth.configData)
}





