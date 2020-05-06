const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect('mongodb://localhost:27017/wikiDB', { useNewUrlParser: true ,  useUnifiedTopology: true });

const articleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    }
});
const Article = mongoose.model("Article", articleSchema);

app.route("/articles")
    .get(function(req, res) {

        Article.find(function(err, foundArticles) {
            if (!err) {
                res.send(foundArticles);
            } else {
                res.send(err);
            }
        });
    })
    .post(function(req, res) {

        const newArticle = new Article ({
            title: req.body.title,
            content: req.body.content
        });
        newArticle.save(function(err) {
            if (!err) {
                res.send("New article successfully added.");
            } else {
                res.send(err);
            }
        });
    })
    .delete(function(req, res) {
        Article.deleteMany(function(err) {
            if (!err) {
                res.send("All articles successfully deleted.")
            } else {
                res.send(err);
            }
        });
    });

app.route("/articles/:requestedArticle")
    .get(function(req, res) {
        const requestedArticle = _.startCase(req.params.requestedArticle);

        Article.findOne({title: requestedArticle}, function(err, foundArticle) {
            if (foundArticle) {
                res.send(foundArticle);
            } else {
                res.send("No article matching this title was found.");
            }
        });
    })
    .put(function(req, res) { // updates the entire article, must include all fields you want in the article
        const requestedArticle = _.startCase(req.params.requestedArticle);
        Article.update(
            {title: requestedArticle},
            {title: req.body.title, content: req.body.content},
            {overwrite: true},
            function(err) {
                if (!err) {
                    res.send("Article has been successfully updated.");
                } else {
                    res.send("Could not update the article.");
                }
        });
    })
    .patch(function(req, res) { // updates a specific field, leaves everything else unchanged
        const requestedArticle = _.startCase(req.params.requestedArticle);
        Article.update(
            {title: requestedArticle},
            {$set: req.body}, // update only the fields for which new content has been provided
            function(err) {
                if (!err) {
                    res.send("Article has been successfully updated.");
                } else {
                    res.send("Could not update the article.");
                }
            }
        );
    })
    .delete(function(req, res) {
        const requestedArticle = _.startCase(req.params.requestedArticle);
        Article.deleteOne(
            {title: requestedArticle},
            function(err) {
                if (!err) {
                    res.send("Article has been successfully deleted.");
                } else {
                    res.send(err);
                }
            }
        );
    });

app.listen(3000, function() {
    console.log("Server started on port 3000.");
});