class EventsController extends Requests {

    constructor() {
        super()
    }

    doGetEvents = (cb) => {
        let type = 'GET';
        let path = 'events/';
        this.doRequest(type, path, null, cb)
    }
}

class Events extends EventsController {
    constructor() {
        super()
        // Initiate Events
        this.initiateEvents();
    }

    initiateEvents = () => {
        this.doGetEvents((err, evt) => {
            if (err) {
                return doToastr('warning', 'API Error', 'Error load Eventos');
            }
        })
    }
}