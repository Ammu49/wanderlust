const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const {isLoggedIn, isOwner, validateListing} = require("../middleware.js");
const listingController = require("../controllers/listings.js");

const multer = require('multer');
const {storage} = require("../cloudConfig.js");
const upload = multer({ storage });

router
.route("/")
.get(wrapAsync(listingController.index))//Index route
.post(
    isLoggedIn, 
    upload.single('listing[image]'),
    validateListing,
    wrapAsync(listingController.createListing));//Create route


//Search route
router
.get(
    "/search",
    wrapAsync(listingController.search)
);


//New route
router.get("/new", isLoggedIn, listingController.renderNewForm);



router
.route("/:id")
.put(
    isLoggedIn, 
    isOwner, 
    upload.single('listing[image]'),
    validateListing,
    wrapAsync(listingController.updateListing))//Update route
    .delete(isLoggedIn, 
    isOwner, 
    wrapAsync(listingController.destroyListing))//Delete route

    .get(wrapAsync(listingController.showListings));//Show route

//Edit route
router.get("/:id/edit", 
    isLoggedIn, 
    isOwner, 

    wrapAsync(listingController.editListing));



router.get("/listings", async (req, res) => {
    try {
        const { q } = req.query;
        let allListings;

        if (q) {
            // Search only by title and location
            const searchRegex = new RegExp(q, 'i');
            const searchQuery = {
                     title: searchRegex 
            };
            allListings = await Listing.find(searchQuery);
        } else {
            // Show all listings if no search query
            allListings = await Listing.find({});
        }

        res.render("listings/index", { 
            allListings: allListings
        });

    } catch (error) {
        console.error("Error:", error);
        res.render("listings/index", { allListings: [] });
    }
});
    

module.exports = router;

