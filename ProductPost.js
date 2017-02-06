const Image = require("./Image");
const _ = require("underscore");

async function staticHashtags(db){
    return _(await db.collection("static_hashtags").find().toArray()).pluck("hashtag").join(" ");
}

async function randomMarketingMessage(db){
    return _(await db.collection("marketing_messages").find().toArray()).chain().pluck("message").shuffle().first().value();
}

function parseTags(tags) {
    return _.unique(tags.split(",").map(function (tag) {
        return "#" + tag.replace(/[\s\-#']/g, "").toLowerCase();
    })).join(" ");
}

function createProductLink(product) {
    return "https://worlds-colliding.myshopify.com/products/" + product.title.replace(/\s/g, "-").replace(/[\(\)]/g, "");
}

class ProductPost {
    constructor(caption, link, imgUrl, hashtags, image) {
        this.caption = caption;
        this.link = link;
        this.imgUrl = imgUrl;
        this.hashtags = hashtags;
        this.image = image;
    }

    static async fromProduct(db, product){
        const message = randomMarketingMessage(db);
        const tags = staticHashtags(db);
        const image = new Image(product.image.src);
        return new ProductPost(product.title + " \n" + await message, createProductLink(product), product.image.src, parseTags(product.tags) + " " + await tags, image);
    }

    async applyTemplate(template){
        this.image.applyTemplate(template);
    }

}


module.exports = ProductPost;