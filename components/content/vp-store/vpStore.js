/**
 * 
 * @param {Array} services 
 * [id, nome, descricao, value]
 */
var populateServiceStore = (services) => {
    $('#storeContent').empty();
    services.forEach(element => {
        $('#storeContent')
        .append($('<div>')
            .addClass('col-md-3')
            .addClass('outerBox')
            .append($('<a>')
                .append($('<div>')
                    .addClass('col-md-12')
                    .addClass('storeItemName')
                    .append($('<span>')
                        .addClass('text-center')
                        .text(element[1])
                    )
                )
                .append($('<div>')
                    .addClass('row')
                    .addClass('storeButton')
                    .append($('<button>')
                        .addClass('btn')
                        .addClass('btn-secondary')
                        .addClass('btn-block')
                        .text('Adicionar ao character.')
                        .click(function() { doModalServices(element) })
                    )
                )
                .append($('<div>')
                    .addClass('row')
                    .addClass('storeContentBottom')
                    .append($('<div>')
                        .addClass('col-md-8')
                        .text(element[2])
                    )
                    .append($('<div>')
                        .addClass('col-md-4')
                        .text(element[3] + ' VPs')
                    )
                )
            )
        )
    });
}

var doBuyServices = (service, character) => {
    $.ajax({
        type: 'POST',
        data: {character: character},
        url: API_URI + 'store/services/'+ service[0],
        beforeSend: function(request) {
            if(Cookies.get('NULLWOW-SESSION')){
                request.setRequestHeader("NULLWOW-SESSION", Cookies.get('NULLWOW-SESSION'));
            }
        },
        error: function(err){
            $('#modalDefault').modal('hide');
            switch(err.status){
                case 200:
                    doToastr('success', 'Store', 'Serviço efetuado com sucesso!');
                    break;
                case 403:
                    doToastr('info', 'Store', 'Seu personagem já está lvl 80!');
                    break;
                case 400:
                case 401:
                case 500:
                    doToastr('warning', 'Store', 'Falha ao efetuar serviço! ' + resp.message);
                    break;
                case 402:
                    doToastr('warning', 'Store', 'Falha ao efetuar serviço! VP Insuficiente!');
                    break;
                default:
                    doToastr('warning', 'Store', 'Falha ao efetuar serviço! Contate um administrador');
                    break;
            }
        },
        success: function(err, success, resp){
            doToastr('success', 'Store', 'Serviço efetuado com sucesso!');
            
        }
    });
}

var doModalServices = (service) => {
    let selectedChar = $('select[name=storeCharacterSelect]').val();
    $('#modalDefault').modal();
    $('#modalDefaultContent').load('components/content/vp-store/modalStore.html',() => {
        $('#storeModalMessage').text('Tem certeza que deseja adicionar 10 lvl ao personagem ' + selectedChar + '?');
        $('#storeModalForm').submit(()=> {
            doBuyServices(service, selectedChar);
            return false;
        })
    });
}

//# sourceURL=vpStore.js