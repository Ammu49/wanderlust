const Listing = require("../models/listing.js");


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
    let url = req.file.path;
    let filename = req.file.filename;
    console.log(url, filename);
    
    const newListing =new Listing(req.body.listing);
    console.log(req.user);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };
    await newListing.save();
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
    res.render("./listings/edit.ejs", {listing});
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