const ByogObject = require("./byogObjects");

class Blob extends ByogObject{
    constructor(content){
        super('Blob',content);
    }
   get_content(){
    return this.content;
   }
}

module.exports = Blob;