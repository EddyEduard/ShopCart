
// Index page.
exports.index_page = function (req, res) {
    res.render("index", {
        title: "Welcome"
    });
}