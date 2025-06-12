function echo(s1,s2='') {console.info(s1,s2)}
function log(s1,s2='') {console.log(s1,s2)}
function error(s1,s2='') {console.error(s1,s2)}

class TConfigFile{
  constructor(name="",enc='utf8'){
    this.name=name
    this.encodeType=enc
  }
  
  save(name,enc='utf8'){
    name=name||'config.json'
    try {
        fs.writeFileSync(name, JSON.stringify(this.obj, null, 2), this.encodeType);
    }catch(err) {
        console.error('Arquivo de configuração não foi salvo.', error);
    }
  }
  
  read(name){
    var o
    try {
	  const data = readFileSync(name,{ encoding: this.encodeType});
	  try {
	    o = JSON.parse(data);	
	  }catch(err){
		  console.error("Arquivo de configuração não está no format JSON;",err)
      o={}
	  }
	}catch(err){
    console.error(this.name,": Erro ao ler arquivo.",err)
    o={}
  }
  return o
}
  
export {echo}
export {error}
export default {echo,log,error}
