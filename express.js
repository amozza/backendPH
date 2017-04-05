var express				=	require('express');
var app					=	express();
var User            	=	require('./models/userModel');
var daganganRouter		=	require('./routes/daganganRouter.js');
var userRouter			=	require('./routes/userRouter.js');
var authRouter			=	require('./routes/auth.js');
var registerRouter		=	require('./routes/registerRouter.js');
var aspirasiRouter		=	require('./routes/aspirasiRouter.js');
var produksiRouter		=	require('./routes/produksiRouter.js');
var komoditasRouter 	= 	require('./routes/komoditasRouter');
var laporanHargaRouter 	= 	require('./routes/laporanHargaRouter');
var multer	 			= 	require('multer');
var mongoose			=	require('mongoose');
var bodyParser			=	require('body-parser');
var morgan 				= 	require('morgan');
var fs 					=	require('fs');
var jwt    				= 	require('jsonwebtoken');
var config 				= 	require('./config');
var moment 				=	require('moment');
var tz 					=	require('moment-timezone');
var now 				=	require("date-now")
var fromNow				= 	require('from-now');
var dateFormat 			= 	require('dateformat');

//geocoder
var geocoder = require('geocoder');
var NodeGeocoder = require('node-geocoder');
var geocoder_2 = NodeGeocoder(options);

var options = {
  provider: 'google',
 
  // Optional depending on the providers 
  httpAdapter: 'https', // Default 
  apiKey: 'AIzaSyA6RjQPiwHVVV38o3XoOvFOhksNbDyHI7I', // for Mapquest, OpenCage, Google Premier 
  formatter: null         // 'gpx', 'string', ... 
};

var port = process.env.PORT || 5000; // used to create, sign, and verify tokens
var secureRoutes 	=	express.Router();

mongoose.connect(config.connect);


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  if('OPTIONS'==req.method) {
	  res.send(200);
  }else{
	  next();
  }
});
app.use(morgan('dev'));
app.listen(port);
console.log('Server start at http://localhost:' + port);

// User Login Router
app.use('/user/auth',authRouter);

// For registering new user
app.use('/user/add',registerRouter);


app.get('/gg',function(req,res){
	/*//var ts = now()
	var ts2 = Date.now();
	var day = fromNow(1444140297141); //1 year
	var days = fromNow(1491145721834);
	var time=moment();
	var gg = Date.parse(moment(time).tz('Asia/Jakarta'));
	
	
	var oneWeekAgo = new Date();
	oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
	var seminggu = dateFormat(oneWeekAgo, "dddd , mmmm dS , yyyy");
	//kelar yang dapet hari ini
	var tanggal = dateFormat(ts2, "dddd , mmmm dS , yyyy");
	console.log(oneWeekAgo);
	//console.log(new Date(ts2));
	console.log(seminggu);
*/
	//bogor
	//geocoder.reverseGeocode(-6.5635228, 106.7308386, function ( err, data ) {
	
	//GG kelar
	//pasar anyar
	var wepe = null;
	geocoder.reverseGeocode(-6.5592227,106.7322101, function ( err, data ){
		var gg = data.results[0].formatted_address;
		console.log(gg);
	}) ;
									   
	/*geocoder.reverseGeocode(-7.4215321,111.0333929, function ( err, data ) {
	//sragen
	//geocoder.reverseGeocode(-7.4299729, 111.0182713, function ( err, data ) {
		// do something with data
		
		
		//ini sudah sukses dapat alamat lengkap
		var gg = data.results[0].formatted_address;
		
		//sukses dapat kabupatennya saja
		//var wp = data.results[0].address_components[3].long_name;
		
		var wepe = gg;
		res.send(wepe);
		console.log(gg);
	}, { sensor: true });*/
	
	/*geocoder_2.reverse({lat:-7.4215321, lon:111.0333929}, function(err, hasil) {
		res.send(hasil[0].formattedAddress);
});*/
})


//coba
app.post('/cors',function(req,res,next){
	if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
		var asli = req.headers.authorization
        var c = req.headers.authorization.split(' ')[1];
	
		
		jwt.verify(c, config.secret, function(err,decode)
		{
			if(err){
				console.log("failed");
			}else{
				console.log("sukses");
				var username = decode.username;
				var role = decode.role;
				
				res.json({
					tokenAsli:asli,
					tokenHarusnya:c,
					username:username,
					role:role
				});
			}
		})
	}		
});


app.use('/wtf',function(req,res){
	if(req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer'){
		var token = req.headers.authorization.split(' ')[1];
		jwt.verify(token, config.secret, function(err, decoded){
			var role = decoded.role;
			if(role==1 || role==2 || role==5){
				console.log('GOOD');
			}
			
		});
	}
});




// --- JWT Validaltion ---
app.use(function(req,res,next){
	if(req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer')
	{	
		var token = req.headers.authorization.split(' ')[1];
		jwt.verify(token, config.secret, function(err, decoded)
		{
			    if (err)
			    {
	    			return res.json({ success: false, message: 'Failed to authenticate token.' });
		  		}
		  		else
		  		{
		  			// for website login
		  			if(decoded.login_type==0)
		  			{
		  				req.user_id=decoded.user_id;
			  			req.role = decoded.role;
	      	  			req.token=jwt.sign({

	      	  									user_id:decoded.user_id,
	                                            username:decoded.username,
	                                            time:decoded.last_login,
	                                            role:decoded.role,

	      	  									user_id:user.user_id,
	                                            username:user.username,
	                                            time:user.last_login,
	                                            role:user.role,

	                                            login_type:decoded.login_type
	                                        }
	                                        ,config.secret, {
						                    expiresIn : 60*60// expires in 24 hours
						                    });
			  			next();
		  			}
		  			//for mobile login
		  			else if(decoded.login_type==1)
		  			{
		  				console.log(decoded.user_id);
		  				req.user_id=decoded.user_id;
		  				req.token='-';
					    req.role = decoded.role;
	    	  			next();
		  			}
		  		}
		})
	}
	else
    {
    	return res.status(400).json({ status:400, message: 'Please send token' });
    }
});


app.use('/user',userRouter);
app.use('/produksi',produksiRouter);
app.use('/dagangan',daganganRouter);
app.use('/aspirasi',aspirasiRouter);

//Cek ROLE

/*
1 = admin
2 = pemerintah
3 = penyuluh
4 = petani
5 = masyarakat
6 = pedagang
*/

app.use('/komoditas',komoditasRouter);
app.use('/laporanHarga',laporanHargaRouter);



app.post('/role',function(req,res){
	res.send("role 5")
});
