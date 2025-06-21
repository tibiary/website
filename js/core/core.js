class Requests {
    constructor (){
        this.API_URI = 'https://api.wow.nullservers.com/';
    }

    /**
     * 
     * @param {Callback} cb Callback
     * @param {String} type POST | GET | DELETE | ...
     * @param {String} path Path to access API
     * @param {Object} data Json data
     */
    doRequest = (type, path, data, cb) => {
        if(!type)
            return console.error('Type not found', type);
        if(!path)
            return console.error('Path not found', path);

        let opt = {
            type: type,
            dataType: "json",
            url: this.API_URI + path,
            beforeSend: function(request) {
                if(Cookies.get(SESSION_COOKIE_NAME)){
                    request.setRequestHeader(SESSION_COOKIE_NAME, Cookies.get(SESSION_COOKIE_NAME));
                }
            },
            error: function(err) {
                console.error(err);
                return cb(err);
            },
            success: function (msg) {
                return cb(null, msg);
            }
        }
        if(type == "POST" && !data)
            return console.error('No data while type = POST');
        else if (type == "POST" && data)
            opt.data = data;
        
        $.ajax(opt);
    };
}