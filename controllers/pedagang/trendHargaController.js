//model atau collections laporanHargaModel
var laporanHarga		=			require('./../../models/laporanHargaModel');
//model komoditas
var komoditas			=			require('./../../models/komoditasModel');
//user
var user				=			require('./../../models/userModel');
//security, crypto, jwt, dan secretCodenya ada dalam config
var crypto 				= 			require('crypto');
var jwt 				=			require('jsonwebtoken');
var config				=			require('./../../config');
//time dan date format, fromNow,
var moment 				=			require('moment');
var tz 					= 			require('moment-timezone');
var now 				=			require("date-now");
var fromNow				= 			require('from-now');
var dateFormat	 		=		 	require('dateformat');
//each looping
var each 				= 			require('foreach');
//call fungsi matematika
var math 				= 			require('mathjs');
//get address dari latitude dan longitude google maps
var geocoder 			=			require('geocoder');


//dapat trend harga 5 hari sebelumnya

var getTrend = function(day,req){
	laporanHarga.find({},'-_id -__v',{sort:{datePost:-1}},function(err,all){
		if(all==null){
			res.json({status:204,message:err,data:"",token:req.token});
		}else{
			//tanggal sekarang
			var dateNow = new Date();				
			//tanggal sekarang di kurangi hari yang diinginkan, hari nya
			dateNow.setDate(dateNow.getDate() - day);
			//hari yang diinginkan dalam format, hari, tanggal, bulan, dan tahun
			var getDate = dateFormat(dateNow, "dddd , mmmm dS , yyyy");						
			//console.log(getDate);
			//buat variabel parsing yang akan menerima laporanHarga_id pada hari itu
			var parsing = [];
			var number = [];
			var counter = 0;

			for(var i=0;i<all.length;i++){
				if(dateFormat(all[i].datePost, "dddd , mmmm dS , yyyy")==getDate){
					number.push(all[i].laporanHarga_id);					
				};
			}
			//time out 65 miliseconds
			setTimeout(function () {
				console.log(number);
				for(var i=0;i<number.length;i++){
					laporanHarga.findOne({laporanHarga_id:number[i]},function(err,laporan){					
						parsing.push(laporan.harga);						
					})					
				}}, 70);

			setTimeout(function (){
				return parsing;
				
			},100);
		}
	});
}

var trendHarga = function(req,res){
	if(req.role==1 || req.role==5 || req.role==6){
		/*var rata_rata=[];
		for(var i=3; i>0 ;i--){
			var mean = getTrend(i,req);
			rata_rata.push(mean);
			console.log('rata-rata '+ i +'hari sebelumnya adalah: '+ rata_rata);
		}*/
	
	/*setTimeout(function (){
		console.log(rata_rata);
	})*/
		getTrend(0,req);
	}
};

module.exports = {
	trendHarga:trendHarga
}