import * as fs from 'fs';
var data
// Synchronous read (blocks execution until file is read)
try {
  const jsondata = fs.readFileSync('app.config', 'utf8');
  try{
        data = JSON.parse(jsondata);
    
    } catch (parseError){
        console.error('Arquivo de configuração não esta no formato JSON.', parseError);
        data={}
    }
} catch (err) {
  console.error('Arquivo de configuração (app.config) não encontrado', err);
  data={}
}


const authConfig = data.authConfig || {}
const pixConfig = data.pixConfig || {}
const wappConfig = data.wappConfig || {}


export {authConfig, pixConfig, wappConfig}