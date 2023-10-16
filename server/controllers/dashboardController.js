const User = require('../models/User');
const Note = require('../models/Note');
const { default: mongoose } = require('mongoose');

exports.dashboard = async (req, res) => {
    let perPage = 12;
    let page = req.query.page || 1;
    try {
        const notes = await Note.aggregate([
            { $sort: { updatedAt: -1 } },
            { $match: { user: new mongoose.Types.ObjectId(req.user.id) } },
            {
                $project: {
                    title: { $substr: ["$title", 0, 30] },
                    body: { $substr: ["$body", 0, 100] },

                }
            }
        ]).skip(perPage * page - perPage)
            .limit(perPage)
            .exec();
        const count = await Note.count();
        res.render('dashboard', { notes, title: 'Dashboard', current: page, pages: Math.ceil(count / perPage) });
    }
    catch (error) {
        console.log(error);
    }

};
// add-note (GET)
exports.addNote = (req, res) => {
    res.render('add-note', { title: 'add-note' });
}
// add-note (POST)
exports.addNotePost = async (req, res) => {
    try {
        req.body.user = req.user.id;
        await Note.create(req.body);
        res.redirect('/dashboard');
    }
    catch (error) {
        console.log(error);
    }
}
// view-note (GET)
exports.viewNote = async (req, res) => {
    try {
        const note = await Note.findById({ _id: req.params.id })
            .where({ user: req.user.id })
            // Tells Mongoose to return plain JavaScript objects instead of Mongoose Documents
            .lean();
        if (note)
            res.render('view-note', { note, noteID: req.params.id, title: 'view-note' });
        else
            res.send("Something went wrong.");
    }
    catch (error) { console.log(error); }
}
// update-note (PUT)
exports.updateNote = async (req, res) => {
    try {
        await Note.findByIdAndUpdate({ _id: req.params.id }, { title: req.body.title, body: req.body.body, updatedAt: Date.now() }).
            where({ user: req.user.id });
        res.redirect('/dashboard');
    }
    catch (error) {
        console.log(error);
    }
}
// delete-note (DELETE)
exports.deleteNote = async (req, res) => {
    try {
        await Note.deleteOne({ _id: req.params.id }).where({ user: req.user.id });
        res.redirect('/dashboard');
    }
    catch (error) {
        console.log(error);
    }
}
// search-note (GET)
exports.searchNote = async (req, res) => {
    try {
        res.render('search-note', { searchResults: "", title: 'Search' });
    } catch (error) {
        console.log(error);

    }
}
// search-note (POST)
exports.searchNotePost = async (req, res) => {
    try {
        let searchTerm = req.body.searchTerm;
        searchTerm = searchTerm.replace(/[^a-zA-Z0-9]/g, "");
        const searchResults = await Note.find({
            $or: [{ title: { $regex: new RegExp(searchTerm, "i") } },
            { body: { $regex: new RegExp(searchTerm, "i") } },],

        }).where({ user: req.user.id });
        res.render('search-note', { searchResults, title: 'Search' });
    } catch (error) {
        console.log(error);

    }
}