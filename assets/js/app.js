const remote = require('electron').remote;
const dialog = remote.dialog;
const fs = require('fs');
const session = remote.session;
const needle = require('needle');
const prompt = require('dialogs')(opts={});
const mkdirp = require('mkdirp');
const homedir  = require('os').homedir();
const sanitize = require("sanitize-filename");
const settings = require('electron-settings');
var Downloader = require('mt-files-downloader');
var Downloader = new Downloader();


$('.ui.dropdown')
  .dropdown()
;


$('.ui.login .form').submit((e)=>{
e.preventDefault();
var email = $(e.target).find('input[name="email"]').val();
var password = $(e.target).find('input[name=password]').val();

if(!email || !password){
   prompt.alert('Type Username/Password');
   return;
}
$.ajax({
   type: 'GET',
   url:'https://www.udemy.com/join/login-popup',
   beforeSend: function(){
     $(".ui.login .dimmer").addClass('active');
   },
   	success: function(data, status, xhr){
   	var token = $('input[name=csrfmiddlewaretoken]',data).val();
   	var cookie = '';
   	session.defaultSession.cookies.get({url: 'https://www.udemy.com'}, (error, cookies) => {		
	for (var key in cookies){
		cookie +=  cookies[key].name+'='+cookies[key].value+';';
	}

needle
   .post('https://www.udemy.com/join/login-popup/?ref=&display_type=popup&locale=en_US&response_type=json&next=https%3A%2F%2Fwww.udemy.com%2F&xref=', {email:email,password:password,csrfmiddlewaretoken:token,locale:'en_US'}, {headers: {'Cookie': cookie,'Referer': 'https://www.udemy.com/','Host': 'www.udemy.com','X-Requested-With': 'XMLHttpRequest','User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36'}})
   .on('readable', function() {
      $(".ui.login .dimmer").removeClass('active');
      if(this.request.res.cookies.access_token){
         $('.ui.login').slideUp('fast');
         $('.ui.dashboard').fadeIn('fast').css('display','flex');
      var access_token = this.request.res.cookies.access_token;
      var header = {"Authorization": `Bearer ${access_token}`};
      $.ajax({
               type: 'GET',
               url: "https://www.udemy.com/api-2.0/users/me/subscribed-courses",
               beforeSend: function(){
                   $(".ui.dashboard .courses.dimmer").addClass('active');
               },
               headers: header,
               success: function(response) { 
                  $(".ui.dashboard .courses.dimmer").removeClass('active');
                  if(response.results.length){
                     $.each(response.results,function(index,course){
                        $('.ui.dashboard .ui.courses.items').append(`
                                <div class="ui course item" course-id="${course.id}">
                                <div class="ui tiny label download-quality grey"></div>
                                <div class="ui tiny grey label download-speed"><span class="value">0</span> KB/s</div>
                                  <div class="ui tiny image">
                                    <img src="${course.image_240x135}">
                                  </div>
                                  <div class="content">
                                    <span class="coursename">${course.title}</span>
                                    <div class="extra">
                                      <div class="ui tiny indicating individual progress">
                                        <div class="bar"></div>
                                      </div>
                                    </div>
                                    <div class="extra">
                                       <button class="ui red download icon button"><i class="download icon"></i></button>
                                       <div class="ui small indicating combined progress">
                                            <div class="bar">
                                              <div class="progress"></div>
                                            </div>
                                            <div class="label">Building Course Data</div>
                                      </div>
                                    </div>

                                  </div>
                                </div>
                        `);
                     })
                  }else{
                     $('.ui.dashboard .courses').append('<div class="ui yellow message">You don\'t have any subscribed courses</div>')
                  }
               }
            });
      }else{
         prompt.alert('Incorrect Username/Password');
      }
$('body').on('click','.download.button', function(){
var $course = $(this).parents('.course');
var courseid = $course.attr('course-id');
      $.ajax({
               type: 'GET',
               url: `https://www.udemy.com/api-2.0/courses/${courseid}/cached-subscriber-curriculum-items?page_size=100000`,
               beforeSend: function(){
                   $(".ui.dashboard .course.dimmer").addClass('active');
               },
               headers: header,
               success: function(response) { 
                 $(".ui.dashboard .course.dimmer").removeClass('active');
                 $course.find('.download.button').hide();
                 $course.css('padding-bottom','25px');
                 $course.find('.ui.progress').show();
                 var coursedata = [];
                 coursedata['chapters'] = [];
                 coursedata['name'] = $course.find('.coursename').text();
                 var chapterindex = -1;
                 var lectureindex = -1;
                 var remaining = response.count;
                 coursedata['totallectures'] = 0;
                  $.each(response.results, function(i,v){
                    if(v._class=="chapter"){ 
                         chapterindex++;
                         lectureindex = 0;
                         coursedata['chapters'][chapterindex] = [];
                         coursedata['chapters'][chapterindex]['name'] = v.title;
                         coursedata['chapters'][chapterindex]['lectures'] = [];
                         remaining--;   
                    }else if(v._class=="lecture"&&v.asset.asset_type=="Video"){
                      function  getLecture(lecturename,chapterindex,lectureindex){
                          $.ajax({
                             type: 'GET',
                             url: `https://www.udemy.com/api-2.0/users/me/subscribed-courses/${courseid}/lectures/${v.id}?fields[lecture]=view_html,asset`,
                             headers: header,
                             success: function(response) { 

                                var lecture = JSON.parse($(response.view_html).find('react-video-player').attr('videojs-setup-data'));
                                var qualities = [];
                                var qualitySrcMap = {};
                                lecture.sources.forEach(function(val){
                                  if(val.label=="Auto")  return;                                  
                                  qualities.push(val.label);
                                  qualitySrcMap[val.label] = val.src;
                                });
                                  var lowest =  Math.min(...qualities);
                                  var highest = Math.max(...qualities);
                                  var videoQuality = settings.get('download.videoQuality');
                                  if(videoQuality){
                                    switch(videoQuality){
                                      case 'Highest':
                                        var src = qualitySrcMap[highest];
                                        videoQuality = highest;
                                        break;
                                      case 'Lowest':
                                         var src = qualitySrcMap[lowest];
                                         videoQuality = lowest;
                                         break;
                                      default:
                                         videoQuality = videoQuality.slice(0, -1);
                                         var src = qualitySrcMap[videoQuality] ? qualitySrcMap[videoQuality] : lecture.sources[0].src;
                                    }

                                  }else{
                                    var src = lecture.sources[0].src;
                                    videoQuality = lecture.sources[0].label;
                                  }         

                                coursedata['chapters'][chapterindex]['lectures'][lectureindex] = {src:src,name:lecturename,quality:videoQuality};
                                remaining--;
                                coursedata['totallectures']+=1;
                                if(!remaining){
                                  initDownload($course,coursedata);
                                }
                             }
                            });
                     }
                     getLecture(v.title,chapterindex,lectureindex);
                     lectureindex++;
                    }else{
                      remaining--;
                    }
                  });
               }
    });
});
});

});

}

});

});



function initDownload($course,coursedata){
var lectureChaperMap = {};
var qualityColorMap = {'144':'red','240':'orange','360':'blue','480':'teal','720':'olive','1080':'green'};
var currentLecture = 0;
coursedata['chapters'].forEach(function(lecture,chapterindex){
lecture['lectures'].forEach(function(x,lectureindex){
currentLecture++;
lectureChaperMap[currentLecture] = {chapterindex:chapterindex,lectureindex:lectureindex};
});
});
  var course_name = sanitize(coursedata['name']);
  var totalchapters = coursedata['chapters'].length;
  var totallectures = coursedata['totallectures'];
  var $progressElemCombined = $course.find('.combined.progress');
  var $progressElemIndividual = $course.find('.individual.progress');
  var download_directory = settings.get('download.path') || homedir+'/Downloads';
  var $download_speed = $course.find('.download-speed');
  var $download_speed_value = $download_speed.find('.value');
  var $download_quality = $course.find('.download-quality');
  var downloaded = 0;
  var lectureStart = settings.get('download.lectureStart');
  var lectureEnd = settings.get('download.lectureEnd');
  var enableLectureSettings = settings.get('download.enableLectureSettings');
  $download_speed.show();
  $download_quality.show();
  $course.css('cssText','padding-top: 35px !important').css('padding-bottom','25px');

  if(enableLectureSettings){

    if(lectureStart>lectureEnd){
      lectureStart=lectureEnd;
    }

    if(lectureStart<1){
      lectureStart = 1;
    }else if(lectureStart>totallectures){
      lectureStart = totallectures;
    }

    if(lectureEnd<1){
      lectureEnd = 1;
    }else if(lectureEnd>totallectures){
      lectureEnd = totallectures;
    }
    var toDownload = (lectureEnd-lectureStart)+1;
    downloadChapter(lectureChaperMap[lectureStart].chapterindex,lectureChaperMap[lectureStart].lectureindex);
  }else{
    var toDownload = totallectures;
    downloadChapter(0,0);
  }

  $progressElemCombined.progress({
    total    : toDownload,
    text     : {
      active: 'Downloaded {value} out of {total} lectures'
    }
  });

$progressElemCombined.progress('reset');


function downloadChapter(chapterindex,lectureindex){

var num_lectures = coursedata['chapters'][chapterindex]['lectures'].length;
var chapter_name = sanitize((chapterindex+1)+'. '+coursedata['chapters'][chapterindex]['name']);
  mkdirp(download_directory+'/'+course_name+'/'+chapter_name, function(){
    downloadLecture(chapterindex,lectureindex,num_lectures,chapter_name);
  });
}

function downloadLecture(chapterindex,lectureindex,num_lectures,chapter_name){
  if(downloaded==toDownload){
      $progressElemIndividual.progress('complete');
      $progressElemIndividual.slideUp();
      $download_speed.hide();
      $download_quality.hide();
      $course.css('padding-top','1em').css('padding-bottom','1.5em');
      return;
  }else if(lectureindex==num_lectures){
      downloadChapter(++chapterindex,0);
      return;
    }

$progressElemIndividual.progress('reset');

    var lecture_name = sanitize((lectureindex+1)+'. '+coursedata['chapters'][chapterindex]['lectures'][lectureindex]['name']+'.mp4');
    var throttle = false;
    var lectureQuality = coursedata['chapters'][chapterindex]['lectures'][lectureindex]['quality'];
    var lastClass = $download_quality.attr('class').split(' ').pop();
    $download_quality.html(lectureQuality+'p').removeClass(lastClass).addClass(qualityColorMap[lectureQuality] || 'grey');
    var dl = Downloader.download(coursedata['chapters'][chapterindex]['lectures'][lectureindex]['src'], download_directory+'/'+course_name+'/'+chapter_name+'/'+lecture_name);

    dl.start();

    dl.on('start', function(dl) {
       $download_speed_value.html(0);
       var timer = setInterval(function() {
            switch(dl.status){
              case 1:
              case 2:
                  var stats = dl.getStats();
                  $download_speed_value.html(parseInt(stats.present.speed/1000));
                  $progressElemIndividual.progress('set percent',stats.total.completed);
                  break;
              case -1:
              case  3:
              case -3:
                  clearInterval(timer);
            }
        }, 1000);
    });


dl.on('error', function(dl) { 
  $download_speed.hide();
  $download_quality.hide();
  $course.css('padding-top','1em').css('padding-bottom','1.5em');
});

dl.on('end', function(dl) { 
  $progressElemCombined.progress('increment');
  downloaded++;
  downloadLecture(chapterindex,++lectureindex,num_lectures,chapter_name);
});


}

}

$('.settings-sidebar').click(function(){
  $('.content .ui.courses').hide();
  $('.content .ui.settings').show();
  $(this).parent('.sidebar').find('.active').removeClass('active red');
  $(this).addClass('active red');
  loadSettings();
});

$('.courses-sidebar').click(function(){
  $('.content .ui.settings').hide();
  $('.content .ui.courses').show();
  $(this).parent('.sidebar').find('.active').removeClass('active red');
  $(this).addClass('active red');
});


$('.ui.settings .form').submit((e)=>{
  e.preventDefault();
  var enableLectureSettings = $(e.target).find('input[name=enablelecturesettings]')[0].checked;
  var lectureStart = $(e.target).find('input[name=lecturestart]').val();
  var lectureEnd = $(e.target).find('input[name=lectureend]').val();
  var videoQuality = $(e.target).find('input[name=videoquality]').val();
  var downloadPath = $(e.target).find('input[name=downloadpath]').val();

  settings.set('download', {
    enableLectureSettings: enableLectureSettings,
    lectureStart: parseInt(lectureStart),
    lectureEnd: parseInt(lectureEnd),
    videoQuality: videoQuality,
    path: downloadPath
  });

 prompt.alert('Settings Saved');

});

var settingsForm = $('.ui.settings .form');

function loadSettings(){

  if(settings.get('download.enableLectureSettings')){
  settingsForm.find('input[name="enablelecturesettings"]').prop('checked', true);
  }else{
  settingsForm.find('input[name="enablelecturesettings"]').prop('checked', false);
  settingsForm.find('input[name="lecturestart"], input[name="lectureend"]').prop('readonly',true);
  }

  settingsForm.find('input[name="downloadpath"]').val(settings.get('download.path') || homedir+'/Downloads');
  settingsForm.find('input[name="lecturestart"]').val(settings.get('download.lectureStart'));
  settingsForm.find('input[name="lectureend"]').val(settings.get('download.lectureEnd'));
  settingsForm.find('input[name="videoquality"]').val(settings.get('download.videoQuality'));
  settingsForm.find('input[name="videoquality"]').parent('.dropdown').find('.default.text').html(settings.get('download.videoQuality') || 'Select Quality');
}

settingsForm.find('input[name="enablelecturesettings"]').change(function() {
   if(this.checked) {
    settingsForm.find('input[name="lecturestart"], input[name="lectureend"]').prop('readonly',false);
   }else{
    settingsForm.find('input[name="lecturestart"], input[name="lectureend"]').prop('readonly',true);
   }     
});

function selectDownloadPath () {
  dialog.showOpenDialog({properties: ['openDirectory']},function (path) {
    if(path){
      fs.access(path[0], fs.R_OK&&fs.W_OK, function(err) {
          if(err){
            prompt.alert('Cannot select this folder!');
          }else{
            settingsForm.find('input[name="downloadpath"]').val(path[0]);
          }
        });
    }
  }); 
}