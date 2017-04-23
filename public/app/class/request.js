export class Request {

    constructor (url) {
        this.req = new XMLHttpRequest();
        this.url = url;
    }

    static param(data) {
        return Object.keys(data).map(function(key) {
            return encodeURIComponent(key) + "=" + encodeURIComponent(data[key]);
        }).join('&');
    }

    post(data) {
        this.req.open('POST', this.url, true);
        this.req.setRequestHeader("Content-Type", "application/json");
        this.req.send(JSON.stringify(data));

        return new Promise((res, rej) => {
            this.req.onload = () => {
                if (this.req.status >= 200 && this.req.status < 400) {
                    res(this.req.responseText);
                } else {
                    rej(this.req.status);
                }
            };
            this.req.onerror = rej;
        });
    }

}