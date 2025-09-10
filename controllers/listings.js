const Listing = require("../models/listing.js");
const { config, Map, geocoding } = require("@maptiler/client");
config.apiKey = process.env.MAP_TOKEN;



module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("./listings/index.ejs", {allListings});
};

module.exports.renderNewForm = (req, res) => {
    res.render("./listings/new.ejs");
};

module.exports.showListings = async(req, res)=> {
    let { id } = req.params;
    let listing = await Listing.findById(id)
  .populate({
    path: 'reviews',
    populate: {
      path: 'author',
      model: 'User'
    }
  })
  .populate('owner');

    if(!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        res.redirect("/listings");
    }
    res.render("./listings/show.ejs", {listing});
};

module.exports.createListing = async ( req, res, next) => {
    
        let result = await geocoding.forward(
            req.body.listing.location,{
            limit: 1,
        });

    let url = req.file.path;
    let filename = req.file.filename;
    
    const newListing =new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };
    if (result.features.length) {
        newListing.geometry = {
        type: "Point",
        coordinates: result.features[0].geometry.coordinates
        };
    }else {
    // fallback if geocoding fails
    newListing.geometry = {
      type: "Point",
      coordinates: [0, 0], // dummy coordinates
    };
  }
    let savedListing = await newListing.save();
    console.log(savedListing);
    req.flash("success", "New Listing Created");
    res.redirect("/listings");
};

module.exports.editListing = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if(!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        res.redirect("/listings");
    }
    
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_300,w_250");
    
    res.render("./listings/edit.ejs", {listing, originalImageUrl});
};

module.exports.updateListing = async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});

    if (req.file) {
        listing.image = {
            url: req.file.path,
            filename: req.file.filename
        };
    }
      await listing.save();

    req.flash("success", "Listing Updated");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing  deleted");
    console.log(deletedListing);
    res.redirect("/listings")
};