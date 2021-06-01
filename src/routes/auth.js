const express = require("express");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const User = require("../schemas/user");
const Bookmark = require("../schemas/bookmark_db");
const Folder = require("../schemas/folder_db");
const Note = require("../schemas/notes_db");
const Todolist = require("../schemas/todolist_db");
const Todo = require("../schemas/todo_db");

// Create a cookie

const router = express.Router();

//Sign Up
router.post("/signup", (req, res) => {
    User.findOne({ email: req.body.email }, async(err, doc) => {
        if (err) throw err;
        if (doc) res.send("user Already Exists");
        if (!doc) {
            const hashedPassword = await bcrypt.hash(req.body.password, 10);
            //make an initial bookmark
            const newBookmark = new Bookmark({
                title: "Command T Repository",
                url: "https://github.com/janarosmonaliev/project-416",
                color: "green",
                thumbnail: "https://github.githubassets.com/apple-touch-icon-180x180.png",
            });
            await newBookmark.save();
            //make initial todo
            const newTodo = new Todo({ title: "New Todo", isComplete: false });
            await newTodo.save();
            //make an initial folder
            const newFolder = new Folder({
                title: "New Folder",
                bookmarks: [newBookmark._id],
            });
            await newFolder.save();
            //make an initial todolist
            const newTodolist = new Todolist({
                title: "New Todolist",
                todos: [newTodo._id],
            });
            await newTodolist.save();
            //make an initial note
            const newNote = new Note({
                title: "New Note",
                content: "Welcome to Command T!",
            });
            await newNote.save();
            const newUser = new User({
                email: req.body.email,
                location: req.body.city,
                password: hashedPassword,
                notes: [newNote._id],
                todolists: [newTodolist._id],
                folders: [newFolder._id],
                backgroundImg: {
                    unsplashID: "pic1",
                    url: "https://images.unsplash.com/photo-1513735718075-2e2d37cb7cc1?crop=entropy&cs=srgb&fm=jpg&ixid=MnwyMzU0MzZ8MHwxfHNlYXJjaHwzfHxsaWdodGhvdXNlfGVufDB8fHx8MTYyMjU1MjkyNA&ixlib=rb-1.2.1&q=85",
                    author: "someone",
                },
                name: req.body.name,
                username: req.body.username,
                keepUnicorn: true,
                events: [],
            });
            await newUser.save();
            res.send("New user created");
        }
    });
});

//Login
router.post(
    "/login",
    passport.authenticate("local", {
        failureRedirect: "/loginFailure",
        successRedirect: "/loginSuccess",
    }),
    (err, req, res, next) => {
        if (err) next(err);
    }
);
router.get("/loginFailure", (req, res) => {
    return res.send("Invalid");
});
router.get("/loginSuccess", (req, res) => {
    return res.send("Successfully Authenticated");
});

// Login with Google 
router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', 
    passport.authenticate('google', { failureRedirect: '/loginFailure' }),
    function(req, res) {
      // Successful authentication, redirect home.
      return res.redirect('https://commandt.herokuapp.com/home');
    });


//Logout
router.get("/logout", function(req, res) {
    req.logout();
    res.send("Successful logout");
});
module.exports = router;