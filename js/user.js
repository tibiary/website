class UserController extends Requests {
    constructor() {
        super();
    }

    doLogin = (data, cb)  => {
        let type = 'POST';
        let path = 'session/';
        return this.doRequest(type, path, data, (err, resp)=>{
            if(err || resp.error){
                return cb(err);
            }
            Cookies.set('NULLWOW-SESSION', resp.session, { expires: 1/24 });
            return cb(false, resp.user);
        });
    }

    doGetSession = (cb)  => {
        let type = 'GET';
        let path = 'session/';
        return this.doRequest(type, path, null, (err, resp) => {
            if(err){
                return cb(err, resp.responseJSON);
            }
            return cb(false, resp.user);
        });

    }

    doLogout = (cb) => {
        let path = 'session/logout';
        let type = 'GET'
        this.doRequest(type, path, null, (err, resp) => {
            if(err || resp.error) {
                return cb(err);
            }
            Cookies.remove('NULLWOW-SESSION');
            return cb()
        });
    }

    doGetCharacters = (accountId, cb)  => {
        let type = 'GET';
        let path = 'user/char/' + accountId;
        this.doRequest(type, path, null, cb);
    }

    doGetListOnline = (cb)  => {
        let type = 'GET';
        let path = 'listas/who';
        this.doRequest(type, path, null, cb);
    }

    doGetNumOnline = (cb)  => {
        let type = 'GET';
        let path = 'listas/who/number'
        this.doRequest(type, path, null, cb);
    }

    doGetAllPlayers = (cb)  => {
        let type = 'GET';
        let path = 'listas/rank';
        this.doRequest(type, path, null, cb);
    }

    doGetVoteList = (accountId, cb) => {
       let type = 'GET';
       let path = 'user/votes/' + accountId;
       this.doRequest(type, path, null, cb); 
    }

    doRegister = (data, cb) => {
        let type = 'POST';
        let path = 'user/register';
        this.doRequest(type, path, data, cb);
    }

    doChangePassword = (data, cb) => {
        let type = 'POST';
        let path = 'user/updatePassword';
        this.doRequest(type, path, data, cb);
    }

    doRecoverPassword = (email, cb) => {
        let type = 'get';
        let path = 'recover/password/' + email;
        this.doRequest(type, path, null, cb)
    }
}

class User extends UserController{
    constructor () {
        super()
    }

    login = function() {
        let data = $('#loginForm').serialize();
        this.doLogin(data, (err, obj)=> {
            if(err){
                return doToastr('warning', 'Login Failed' , 'Usuário ou senha inválidos');
            }
            this.instantiate(obj);
            $('#loginButton').load('components/login/loggedIn.html');
            return doToastr('success', 'Login Success' , 'Seja bem vindo: ' + this.username + '!');
        });
    };

    logout = function(){
        this.doLogout((err)=>{
            if(err){
                return doToastr('warning', 'Logout Failed' , 'Erro no logout, fale com um administrador!');
            }
    
            $('#loginButton').load('components/login/loggedOut.html');
            $('#content').load('components/content/index.html')
            return doToastr('success', 'Logout' , 'Você saiu com Sucesso!');
        });
    };

    getSession = function(){
        this.doGetSession((err, obj)=>{
            if(err){
                if(obj.error){
                    doToastr('warning', 'Login!' , 'Sessão expirou, faça login novamente!');
                }
                return $('#loginButton').load('components/login/loggedOut.html');
            }
            this.instantiate(obj); // instantiate the user
            $('#loginButton').load('components/login/loggedIn.html');
            doToastr('success', 'Login!' , 'Seja bem vindo: ' + this.username + '!');
        });
    };

    instantiate(obj) {
        this.username   = obj.username
        this.email      = obj.email
        this.id         = obj.id
        this.votes      = obj.votes
        this.recruiter  = obj.recruiter
        this.online     = obj.online
        this.store      = new Store();
    }

    isLoggedIn(){
        return Cookies.get('NULLWOW-SESSION') != null;
    }

    getStore(){
        return this.store ? this.store : doToastr('warning', 'Entre Primeiro', 'Você precisa estar logado para fazer esta operação.');
    }

    getUsername(){
        return this.isLoggedIn ? this.username : doToastr('warning', 'Entre Primeiro', 'Você precisa estar logado para fazer esta operação.');
    }

    isOnline(){
        return this.isLoggedIn ? this.online || false : doToastr('warning', 'Entre Primeiro', 'Você precisa estar logado para fazer esta operação.');
    }

    getRecruiter() {
        return this.isLoggedIn? this.recruiter : doToastr('warning', 'Entre Primeiro', 'Você precisa estar logado para fazer esta operação.');
    }

    isLocked(){
        return this.isLoggedIn ? this.locked || false : doToastr('warning', 'Entre Primeiro', 'Você precisa estar logado para fazer esta operação.');
    }

    getId() {
        return this.isLoggedIn? this.id : doToastr('warning', 'Entre Primeiro', 'Você precisa estar logado para fazer esta operação.');
    }

    getVotes() {
        return this.isLoggedIn? this.votes : doToastr('warning', 'Entre Primeiro', 'Você precisa estar logado para fazer esta operação.');
    }

    getVoteList(cb) {
        if(!this.isLoggedIn){
            return doToastr('warning', 'Entre Primeiro', 'Você precisa estar logado para fazer qualquer compra na store!');
        }
        this.doGetVoteList(this.getId(), (err, resp) => {
            if(err){
                return doToastr('error', 'API Error', 'Erro em retornar a informação da API. Tente novamente mais tarde ou contate um administrador!')
            }
            let elements = resp.votes;
            // Populate votes
            for(var i = 0; i < elements.length; i++){
                $('#tableVote-content')
                .append($('<tr>')
                    .append($('<th>').attr('scope', "row").append($('<p>').text(i)))
                    .append($('<td>').text(elements[i][1]))
                    .append($('<td>').text(GLOBAL_Provider[elements[i][0]]))
                    .append($('<td>').text(elements[i][2]))
                )
            }
        });
    }

    getCharacters = (cb) => {
        if(!this.isLoggedIn) {
            return doToastr('warning', 'Entre Primeiro', 'Você precisa estar logado para fazer qualquer compra na store!');
        }
        this.doGetCharacters(this.getId(), cb)
    }
    
    /**
     * Função chamada pelo google captcha após validar!
     * @param {Object} response Resposta dada pelo google captcha
     */
    register = (response) => {
        $('#gResponse').val(response);
        $('#buttonRegister').addClass('hide');
        $('#loaderRegister').removeClass('hide');
        let data = $('#registerForm').serialize();
        this.doRegister(data, (err, resp) => {
            $('#content').load('components/content/register.html');
            if(err) {
                return doToastr('error', 'Registro', 'Erro no cadastro, ' + err.responseJSON.response);
            }
            doToastr('success', 'Registro', 'Registro efetuado com sucesso! Enviamos um e-mail de boas vindas!');
        })
    }

    changePassword = () => {
        if(!this.isLoggedIn()) {
            return doToastr('warning', 'Você não está Logado', 'Você precisa estar logado para trocar sua senha!');
        }
        let data = $('#updatePasswordForm').serialize();
        this.doChangePassword(data, (err, resp) => {
            $('#updatePasswordForm').trigger('reset');
            if(err) {
                doToastr('warning', 'Error', 'Credenciais Inválidas! Tente novamente ou entre em contato com o administrador pelo <b>Discord</b> ou Facebook!', 5000);
                return console.error(err);
            }
            doToastr('success', 'Sucesso!', 'Senha trocada com sucesso!');
        });
    }

    createVoteLinks = () => {
        if(!this.isLoggedIn){
            return doToastr('warning', 'Entre Primeiro', 'Você precisa estar logado para votar');            
        }
        $('#voteStore')
            .after($('<a>')
                .addClass('dropdown-item')
                .addClass('white')
                .prop('href','http://www.top100arena.com/in.asp?id=93676&incentive=' + this.getId())
                .prop('target', '_blank')
                .text('Top100Arena')
                .append($('<img>')
                    .addClass('float-right')
                    .prop('src','https://www.top100arena.com/hit.asp?id=93676&c=WoW&t=1')
                    .prop('width',55)
                    .prop('height', 30)
                    .prop('border', 0)
                )
            )
            .after($('<a>')
                    .addClass('dropdown-item')
                    .addClass('white')
                    .prop('href','https://topg.org/wow-private-servers/in-488461-' + this.getId())
                    .prop('target', '_blank')
                    .text('TopG Vote')
                    .append($('<img>')
                        .addClass('float-right')
                        .prop('src','img/topg.gif')
                        .prop('width',55)
                        .prop('height', 30)
                        .prop('border', 0)
                    )
            )
    }

    getCharacters = (cb) => {
        if(!this.isLoggedIn()){
            return doToastr('warning', 'Error', 'Você precisa estar logado para fazer qualquer compra na store!');
        }
        this.doGetCharacters(this.getId(), (err, resp)=> {
            if(err){
                return;
            }
            return cb(resp.characters);
        });
    }

    getListOnline = () => {
        this.doGetListOnline((err, resp)=>{
            if(err) {
                return doToastr('error', 'Lista Players', "Erro ao verificar players online.");
            }
            let players = resp.players;
            if (players.length > 0) {
                calculateFaction(players, generateFactionGraph);
                calculateClasses(players, generateClassesGraph);
                populateOnline(players);
              }
        })
    }

    recoverPassword = () => {
        let email = $('#emailRecoverPassword').val();
        this.doRecoverPassword(email, (err, res) => {
            $('#recoverPasswordForm').trigger('reset');
            $('#recoverPasswordButton').prop('disabled', false);
            if(err){
                return doToastr('warning', 'Erro Recuperar Senha' , 'Email não existe!');  
            }
            return doToastr('success', 'Recuperar Senha' , 'Foi enviado um e-mail de recuperação, por favor, siga os passos nele descrito!');
        })
    }
}