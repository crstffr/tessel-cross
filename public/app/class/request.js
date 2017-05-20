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

    get() {
        this.req.open('GET', this.url, true);
        this.req.send();
        return new Promise((resolve, reject) => {
            this.req.onload = () => {
                if (this.req.status >= 200 && this.req.status < 400) {
                    let contents = this.req.responseText;
                    try {
                        contents = JSON.parse(this.req.responseText);
                    } catch(e) {}
                    resolve(contents);
                } else {
                    reject(this.req.status);
                }
            };
            this.req.onerror = reject;
        });
    }

    post(data) {
        this.req.open('POST', this.url, true);
        this.req.setRequestHeader("Content-Type", "application/json");
        this.req.send(JSON.stringify(data));

        return new Promise((resolve, reject) => {
            this.req.onload = () => {
                if (this.req.status >= 200 && this.req.status < 400) {
                    resolve(this.req.responseText);
                } else {
                    reject(this.req.status);
                }
            };
            this.req.onerror = reject;
        });
    }

}