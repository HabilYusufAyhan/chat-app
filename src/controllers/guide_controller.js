const guide = require("../model/guide_model.js");

const addnewPerson = async (req, res, next) => {
  const newUser = new guide({
    person: req.body.person,
    contact: req.body.contact,
    degree: req.body.degree,
    datapersonid: req.user.id,
  });
  await newUser.save();
  res.redirect("/");
};
const openpersonpage = async (req, res, next) => {
  console.log(req.user.id);
  const guides = await guide.find({ datapersonid: req.user.id });

  res.render("index.ejs", { guide: guides });
};
const deletePerson = async (req, res, next) => {
  const id = req.query.id;
  await guide.findByIdAndRemove({ _id: id });

  res.redirect("/");
};
const editPerson = async (req, res, next) => {
  const id = req.query.id;
  console.log(id);
  var data = await guide.findOne({ _id: id });
  const guides = await guide.find({ datapersonid: req.user.id });
  res.render("edit.ejs", { data: data, guide: guides, query: id });
};
const posteditPerson = async (req, res, next) => {
  const id = req.query.id;
  console.log(id);
  await guide.findByIdAndUpdate(id, {
    contact: req.body.contact,
    person: req.body.person,
    degree: req.body.degree,
  });
  res.redirect("/");
};
module.exports = {
  addnewPerson,
  openpersonpage,
  deletePerson,
  editPerson,
  posteditPerson,
};
