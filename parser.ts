import axios from 'axios';

export class Parser {
    private urlRegex: RegExp = /\b(https?:\/\/.*?\.[a-z]{2,4}\/[^\s]*\b)/g;
    private youtubeRegex: RegExp = /^(https?\:\/\/)?((www\.)?youtube\.com|youtu\.be)\/.+$/;
    private twitterRegex: RegExp = /http(?:s)?:\/\/(?:www)?twitter\.com\/([a-zA-Z0-9_]+)/;

    async parse(message: string) {
        var returnedMessage = [];
        returnedMessage.push(message);

        var hasUrl = this.urlRegex.test(message);
        if (hasUrl) {
            returnedMessage[0] = `<a href='${returnedMessage[0]}'>${returnedMessage[0]}</a>`
            var urls = this.getUrlsFromMessage(message);
            if (urls != null) {
                for await (const url of urls) {
                    var toParseUrl = url;
                    toParseUrl = this.parseYoutube(toParseUrl);
                    await this.parseTwitter(toParseUrl).then((html) => toParseUrl = html);
                    await this.parseImage(toParseUrl).then((html) => toParseUrl = html);
                    await this.parseVideo(toParseUrl).then((html) => toParseUrl = html);

                    returnedMessage.push(toParseUrl);
                }
            }
        }

        return returnedMessage;
    }

    private parseYoutube(message: string) {
        var isYoutube = this.youtubeRegex.test(message);

        if (isYoutube) {
            var videoUrl: string = message.replace('watch?v=', 'embed/');
            videoUrl = videoUrl.includes('&t') ? videoUrl.replace('&t', '?start') : videoUrl;

            var toReturnHtml: string = `<emded id="ytplayer" width="640" height="480" src="${videoUrl}"></embed>`

            return toReturnHtml;
        } else {
            return message;
        }
    }

    private async parseTwitter(message: string): Promise<string> {
        const isTwitter: boolean = this.twitterRegex.test(message);
        const url = 'https://publish.twitter.com/oembed?url=' + message;

        try {
            if (isTwitter) {
                const response = await axios.get(url);
                return response.data.html;
            } else {
                return message;
            }
        } catch (err) {
            return message;
        }
    }

    private async parseImage(message: string): Promise<string> {
        try {
            const response = await axios.head(message);
            const isImage = response.headers['content-type']?.startsWith('image');

            if (isImage) {
                return `<img src='${message}' height='480'></img>`
            } else {
                return message;
            }
        } catch(err) {
            return message;
        }
        
    }

    private async parseVideo(message: string): Promise<string> {
        try {
            const response = await axios.head(message);
            const isVideo = response.headers['content-type']?.startsWith('video');

            if (isVideo) {
                return `<video controls height='480'><source src='${message}' type='${response.headers['content-type']}'></video>`
            } else {
                return message;
            }
        } catch (err) {
            return message;
        }
    }

    private getUrlsFromMessage(message: string) {
        const arr = message.match(this.urlRegex);
        return arr;
    }
}