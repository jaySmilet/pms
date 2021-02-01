var express = require('express');
var router = express.Router();
var userModule = require('../modules/user');
var passCatModel = require('../modules/password_category');
var passModel = require('../modules/add_password');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
var getPassCat = passCatModel.find({});
var getAllPass = passModel.find({});

function checkLoginUser(req, res, next) {
  var userToken = localStorage.getItem('userToken');
  try {
    var decoded = jwt.verify(userToken, 'loginTokenizer')
  } catch (error) {
    res.redirect('/');
  }
  next();
}

if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./scratch');
}

function checkEmail(req, res, next) {
  var email = req.body.email;
  var checkExistingEmail = userModule.findOne({ email: email });
  checkExistingEmail.exec((err, data) => {
    if (err) throw err;
    if (data) {
      return res.render('signup', { title: 'Password Management System', msg: 'Email already exists!!' });
    }
    next();
  });
}

function checkUsername(req, res, next) {
  var username = req.body.username;
  var checkExistingUsername = userModule.findOne({ username: username });
  checkExistingUsername.exec((err, data) => {
    if (err) throw err;
    if (data) {
      return res.render('signup', { title: 'Password Management System', msg: 'Username already exists!!' });
    }
    next();
  });
}

/* GET home page. */

router.get('/', function (req, res, next) {
  var loggedInUser = localStorage.getItem('userLogin');
  if (loggedInUser) {
    res.redirect('/dashboard')
  } else {
    res.render('index', { title: 'Password Management System', msg: '' });
  }
});

router.post('/', function (req, res, next) {
  var username = req.body.username;
  var pwd = req.body.pwd;
  var checkUsername = userModule.findOne({ username: username });
  checkUsername.exec((err, data) => {
    if (err) throw err;
    var getId = data._id;
    var getPassword = data.password;
    if (bcrypt.compareSync(pwd, getPassword)) {
      var token = jwt.sign({ userId: 'getId' }, 'loginTokenizer');
      localStorage.setItem('userToken', token);
      localStorage.setItem('userLogin', username);
      res.redirect('/dashboard');
    } else {
      res.render('index', { title: 'Password Management System', msg: 'Invalid Username / Password' });
    }

  })
});

router.get('/dashboard', checkLoginUser, function (req, res, next) {
  var loggedInUser = localStorage.getItem('userLogin');
  res.render('dashboard', { title: 'Password Management System', user: loggedInUser, msg: '' });
});

router.get('/signup', function (req, res, next) {
  var loggedInUser = localStorage.getItem('userLogin');
  if (loggedInUser) {
    res.redirect('/dashboard')
  } else {
    res.render('signup', { title: 'Password Management System', msg: '' });
  }
});

router.post('/signup', checkUsername, checkEmail, function (req, res, next) {
  var username = req.body.username;
  var email = req.body.email;
  var password = req.body.pwd;
  var cpassword = req.body.cpwd;
  if (password != cpassword) {
    res.render('signup', { title: 'Password Management System', msg: 'Password does not match' });
  } else {
    password = bcrypt.hashSync(req.body.pwd, 10);
    console.log(password)
    var userDetails = new userModule({
      username: username,
      email: email,
      password: password
    });
    userDetails.save((err, doc) => {
      if (err) throw err;
      res.render('signup', { title: 'Password Management System', msg: 'User Registered Successfully' });
    });
  }

});

router.get('/passwordCategory', checkLoginUser, function (req, res, next) {
  var loggedInUser = localStorage.getItem('userLogin');
  getPassCat.exec((err, data) => {
    if (err) throw err;
    res.render('password_category', { title: 'Password Management System', user: loggedInUser, records: data });
  });
});
router.get('/passwordCategory/delete/:id', checkLoginUser, function (req, res, next) {
  var loggedInUser = localStorage.getItem('userLogin');
  getPassCat.exec((err, data) => {
    var passcat_id = req.params.id;
    // console.log(passcat_id)
    var passDelete = passCatModel.findByIdAndDelete(passcat_id);
    passDelete.exec((err) => {
      if (err) throw err;
      res.redirect('/passwordCategory');
    })
  });
});
router.get('/passwordCategory/edit/:id', checkLoginUser, function (req, res, next) {
  var loggedInUser = localStorage.getItem('userLogin');
  getPassCat.exec((err, data) => {
    var passcat_id = req.params.id;
    // console.log(passcat_id)
    var getpassCategory = passCatModel.findById(passcat_id);
    getpassCategory.exec((err, data) => {
      if (err) throw err;
      res.render('edit_pass_category', { title: 'Password Management System', user: loggedInUser, errors: '', success: '', records: data, id: passcat_id });
    })
  });
});
router.post('/passwordCategory/edit/', checkLoginUser, function (req, res, next) {
  var loggedInUser = localStorage.getItem('userLogin');
  var passcat_id = req.body.id;
  var passwordCategory = req.body.passwordCategory;

  var update_passCat = passCatModel.findByIdAndUpdate(passcat_id, { password_category: passwordCategory });
  update_passCat.exec((err, data) => {
    if (err) throw err;
    res.redirect('/passwordCategory/');
  });
});


router.get('/addNewCategory', checkLoginUser, function (req, res, next) {
  var loggedInUser = localStorage.getItem('userLogin');
  res.render('addNewCategory', { title: 'Password Management System', user: loggedInUser, errors: '', success: '' });
});

router.post('/addNewCategory', checkLoginUser, [body('passwordCategory', 'Enter Password Category Name').isLength({ min: 1 })], function (req, res, next) {
  var loggedInUser = localStorage.getItem('userLogin');
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.render('addNewCategory', { title: 'Password Management System', user: loggedInUser, errors: errors.mapped(), success: '' });
  } else {
    var passCatName = req.body.passwordCategory;
    var passCatDetails = new passCatModel({
      password_category: passCatName
    });
    passCatDetails.save((err, doc) => {
      if (err) throw err;
      res.render('addNewCategory', { title: 'Password Management System', user: loggedInUser, errors: '', success: 'Categeory Added' });
    });

  }

});



router.get('/addNewPassword', checkLoginUser, function (req, res, next) {
  var loggedInUser = localStorage.getItem('userLogin');
  getPassCat.exec((err, data) => {
    if (err) throw err;
    res.render('addNewPassword', { title: 'Password Management System', user: loggedInUser, records: data, success: '' });
  });
});

router.post('/addNewPassword', checkLoginUser, function (req, res, next) {
  var loggedInUser = localStorage.getItem('userLogin');
  var pass_cat = req.body.pass_cat;
  var project_name = req.body.project_name;
  var pass_details = req.body.pass_details;
  var password_details = new passModel({
    password_category: pass_cat,
    project_name: project_name,
    password_detail: pass_details
  });
  password_details.save((err, data) => {
    getPassCat.exec((err, data) => {
      if (err) throw err;
      res.render('addNewPassword', { title: 'Password Management System', user: loggedInUser, records: data, success: 'Password Details Inserted!!' });
    });
  });
});

router.get('/viewAllPassword', checkLoginUser, function (req, res, next) {
  var loggedInUser = localStorage.getItem('userLogin');
  var perPage = 3;
  var page =  1;
  getAllPass.skip((perPage * page) - perPage)
    .limit(perPage).exec((err, data) => {
      if (err) throw err;
      passModel.countDocuments({}).exec((err, count) => {
        res.render('viewAllPassword', { title: 'Password Management System', user: loggedInUser, records: data, current: page, pages: Math.ceil(count / perPage) });
      });
    });
});
router.get('/viewAllPassword/:page', checkLoginUser, function (req, res, next) {
  var loggedInUser = localStorage.getItem('userLogin');
  var perPage = 3;
  var page = req.params.page || 1;
  getAllPass.skip((perPage * page) - perPage)
    .limit(perPage).exec((err, data) => {
      if (err) throw err;
      passModel.countDocuments({}).exec((err, count) => {
        res.render('viewAllPassword', { title: 'Password Management System', user: loggedInUser, records: data, current: page, pages: Math.ceil(count / perPage) });
      });
    });
});
router.get('/password_detail/', checkLoginUser, function (req, res, next) {
  var loggedInUser = localStorage.getItem('userLogin');
  res.redirect('/dashboard');
});
router.post('/password_detail/edit/:id', checkLoginUser, function (req, res, next) {
  var loggedInUser = localStorage.getItem('userLogin');
  var id = req.params.id;
  var pass_cat = req.body.pass_cat;
  var project_name = req.body.project_name;
  var pass_details = req.body.pass_details;
  passModel.findByIdAndUpdate(id, { password_category: pass_cat, project_name: project_name, password_detail: pass_details }).exec((err) => {
    if (err) throw err;
    var getPasDetail = passModel.findById({ _id: id });
    getPasDetail.exec((err, data) => {
      if (err) throw err;
      getPassCat.exec((err, data1) => {
        res.render('edit_password_detail', { title: 'Password Management System', user: loggedInUser, records: data1, record: data, success: 'Password Updated' });
      });
    });
  });
});
router.get('/password_detail/edit/:id', checkLoginUser, function (req, res, next) {
  var loggedInUser = localStorage.getItem('userLogin');
  var id = req.params.id;
  var getPasDetail = passModel.findById({ _id: id });
  getPasDetail.exec((err, data) => {
    if (err) throw err;
    getPassCat.exec((err, data1) => {
      res.render('edit_password_detail', { title: 'Password Management System', user: loggedInUser, records: data1, record: data, success: '' });
    });
  });
});

router.get('/password_detail/delete/:id', checkLoginUser, function (req, res, next) {
  var loggedInUser = localStorage.getItem('userLogin');
  var id = req.params.id;
  var passDelete = passModel.findByIdAndDelete(id);
  passDelete.exec((err) => {
    if (err) throw err;
    res.redirect('/viewAllPassword');
  })
});

router.get('/logout', function (req, res, next) {
  localStorage.removeItem('userToken');
  localStorage.removeItem('userLogin');
  res.redirect('/');
});

module.exports = router;
