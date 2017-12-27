const remote = require('electron').remote;
const dialog = remote.dialog;
const fs = require('fs');
const session = remote.session;
const needle = require('needle');
const prompt = require('dialogs')(opts={});
const mkdirp = require('mkdirp');
const homedir  = require('os').homedir();
const sanitize = require("sanitize-filename");
var Downloader = require('mt-files-downloader');
$('.ui.dropdown')
  .dropdown()
;


var downloadTemplate = `
<div class="ui tiny icon action buttons">
  <button class="ui basic blue download button"><i class="download icon"></i></button>
  <button class="ui disabled basic red pause button"><i class="pause icon"></i></button>
  <button class="ui disabled basic green resume button"><i class="play icon"></i></button>
</div>
<div class="ui horizontal divider"></div>
<div class="ui tiny indicating individual progress">
   <div class="bar"></div>
</div>
<div class="ui horizontal divider"></div>
<div class="ui small indicating combined progress">
  <div class="bar">
    <div class="progress"></div>
  </div>
<div class="label">${translate("Building Course Data")}</div>
</div>
`;


$('.ui.login .form').submit((e)=>{
e.preventDefault();
var email = $(e.target).find('input[name="email"]').val();
var password = $(e.target).find('input[name=password]').val();

if(!email || !password){
   prompt.alert(translate("Type Username/Password"));
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
               url: "https://www.udemy.com/api-2.0/users/me/subscribed-courses?page_size=100000",
               beforeSend: function(){
                   $(".ui.dashboard .courses.dimmer").addClass('active');
               },
               headers: header,
               success: function(response) { 
                  $(".ui.dashboard .courses.dimmer").removeClass('active');
                  if(response.results.length){
                     $.each(response.results,function(index,course){
                        $('.ui.dashboard .ui.courses.items').append(`
                                <div class="ui course item" course-id="${course.id}" course-url="${course.url}">
                                <div class="ui tiny label download-quality grey"></div>
                                <div class="ui tiny grey label download-speed"><span class="value">0</span> KB/s</div>
                                  <div class="ui tiny image">
                                    <img src="${course.image_240x135}">
                                  </div>
                                  <div class="content">
                                    <span class="coursename">${course.title}</span>

                                  <div class="ui tiny icon green download-success message">
                                         <i class="check icon"></i>
                                          <div class="content">
                                            <div class="header">
                                               ${translate("Download Completed")}
                                             </div>
                                             <p>${translate("Click this message to hide it")}</p>
                                           </div>
                                    </div>

                                  <div class="ui tiny icon  red download-error message">
                                         <i class="power icon"></i>
                                          <div class="content">
                                            <div class="header">
                                               ${translate("Download Failed")}
                                             </div>
                                             <p>${translate("Click this message to retry")}</p>
                                           </div>
                                    </div>

                                    <div class="extra download-status">
                                      ${downloadTemplate}
                                    </div>

                                  </div>
                                </div>
                        `);
                     })
                  }else{
                     $('.ui.dashboard .courses').append(`<div class="ui yellow message">${translate("You have not enrolled in any course")}</div>`)
                  }
               }
            });
      }else{
         prompt.alert(translate('Incorrect Username/Password'));
      }


$('body').on('click','.download-success', function(){
$(this).hide();
$(this).parents('.course').find('.download-status').show();
});

$('body').on('click','.download.button, .download-error', function(){
var $course = $(this).parents('.course');
var courseid = $course.attr('course-id');
$course.find('.download-error').hide();
$course.find('.download-status').show();
      $.ajax({
               type: 'GET',
               url: `https://www.udemy.com/api-2.0/courses/${courseid}/cached-subscriber-curriculum-items?page_size=100000`,
               beforeSend: function(){
                   $(".ui.dashboard .course.dimmer").addClass('active');
               },
               headers: header,
               success: function(response) { 
                 $(".ui.dashboard .course.dimmer").removeClass('active');
                 $course.find('.download.button').addClass('disabled');
                 $course.css('padding-bottom','25px');
                 $course.find('.ui.progress').show();
                 var downloadVideosOnly = settings.get('download.downloadVideosOnly');
                 var coursedata = [];
                 coursedata['chapters'] = [];
                 coursedata['name'] = $course.find('.coursename').text();
                 var chapterindex = -1;
                 var lectureindex = -1;
                 var remaining = response.count;
                 coursedata['totallectures'] = 0;

                 if(response.results[0]._class=="lecture"){
                         chapterindex++;
                         lectureindex = 0;
                         coursedata['chapters'][chapterindex] = [];
                         coursedata['chapters'][chapterindex]['name'] = 'Chapter 1';
                         coursedata['chapters'][chapterindex]['lectures'] = [];
                         remaining--; 
                 }

                  $.each(response.results, function(i,v){
                    if(v._class=="chapter"){ 
                         chapterindex++;
                         lectureindex = 0;
                         coursedata['chapters'][chapterindex] = [];
                         coursedata['chapters'][chapterindex]['name'] = v.title;
                         coursedata['chapters'][chapterindex]['lectures'] = [];
                         remaining--;   
                    }else if(v._class=="lecture"&& (v.asset.asset_type=="Video"||v.asset.asset_type=="Article"||v.asset.asset_type=="File"||v.asset.asset_type=="E-Book")){
                      function  getLecture(lecturename,chapterindex,lectureindex){
                          $.ajax({
                             type: 'GET',
                             url: `https://www.udemy.com/api-2.0/users/me/subscribed-courses/${courseid}/lectures/${v.id}?fields[lecture]=view_html,asset,supplementary_assets`,
                             headers: header,
                             success: function(response) {
                                if(v.asset.asset_type=="Article"&&!downloadVideosOnly){
                                  var src = response.view_html;
                                  var videoQuality = v.asset.asset_type;
                                  var type = 'Article';
                                }else if((v.asset.asset_type=="File"||v.asset.asset_type=="E-Book")&&!downloadVideosOnly){
                                  var src = $(response.view_html).find('a').attr('href');
                                  var videoQuality = v.asset.asset_type;
                                  var type = 'File';
                                }else if(v.asset.asset_type=="Video"){
                                var type = 'Video';  
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
                                  if(!videoQuality || videoQuality=="Auto"){
                                    var src = lecture.sources[0].src;
                                    videoQuality = lecture.sources[0].label;
                                  }else{
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
                                  }
                                }else{
                                    remaining--;
                                    coursedata['totallectures']+=1;
                                    if(!remaining){
                                      initDownload($course,coursedata);
                                    }
                                }

                                coursedata['chapters'][chapterindex]['lectures'][lectureindex] = {src:src,name:lecturename,quality:videoQuality,type:type};


                                if(response.supplementary_assets.length&&!downloadVideosOnly){
                                  coursedata['chapters'][chapterindex]['lectures'][lectureindex]['supplementary_assets'] = [];
                                  var supplementary_assets_remaining = response.supplementary_assets.length;
                                  $.each(response.supplementary_assets, function(a,b){
                                      $.ajax({
                                        type: 'GET',
                                        url: `https://www.udemy.com/api-2.0/users/me/subscribed-courses/${courseid}/lectures/${v.id}/supplementary-assets/${b.id}?fields[asset]=download_urls,external_url,asset_type`,
                                        headers: header,
                                        success: function(response) { 
                                          if(response.asset_type=="File"){
                                            coursedata['chapters'][chapterindex]['lectures'][lectureindex]['supplementary_assets'].push({src:response.download_urls.File[0].file,name:b.title,quality:'Attachment',type:'File'});
                                          }else if(response.asset_type=="ExternalLink"){
                                            coursedata['chapters'][chapterindex]['lectures'][lectureindex]['supplementary_assets'].push({src:`<script type="text/javascript">window.location = "${response.external_url}";</script>`,name:b.title,quality:'Attachment',type:'Url'});
                                          }
                                            supplementary_assets_remaining--;
                                            if(!supplementary_assets_remaining){
                                                remaining--;
                                                coursedata['totallectures']+=1;
                                                if(!remaining){
                                                  initDownload($course,coursedata);
                                                }
                                            }
                                        }
                                      });
                                  });
                                }else{
                                  remaining--;
                                  coursedata['totallectures']+=1;
                                  if(!remaining){
                                    initDownload($course,coursedata);
                                  }
                                }

                             }
                            });
                     }
                     getLecture(v.title,chapterindex,lectureindex);
                     lectureindex++;
                    }else if(!downloadVideosOnly){
                       coursedata['chapters'][chapterindex]['lectures'][lectureindex] = {src:`<script type="text/javascript">window.location = "https://www.udemy.com${$course.attr('course-url')}t/${v._class}/${v.id}";</script>`,name:v.title,quality:'Attachment',type:'Url'};
                       remaining--;
                       coursedata['totallectures']+=1;
                       if(!remaining){
                          initDownload($course,coursedata);
                        }
                      lectureindex++;
                    }else{
                      remaining--;
                      if(!remaining){
                        initDownload($course,coursedata);
                      }
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
  var timer;
  var downloader = new Downloader();
  var $downloadStatus = $course.find('.download-status');
  var $actionButtons = $course.find('.action.buttons');
  var $downloadButton = $actionButtons.find('.download.button');
  var $pauseButton = $actionButtons.find('.pause.button');
  var $resumeButton = $actionButtons.find('.resume.button');
  var lectureChaperMap = {};
  var qualityColorMap = {'144':'red','240':'orange','360':'blue','480':'teal','720':'olive','1080':'green','Attachment':'pink'};
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
  var downloadStart = settings.get('download.downloadStart');
  var downloadEnd = settings.get('download.downloadEnd');
  var enableLectureSettings = settings.get('download.enableLectureSettings');
  $download_speed.show();
  $download_quality.show();
  $course.css('cssText','padding-top: 35px !important').css('padding-bottom','25px');


$pauseButton.click(function(){
downloader._downloads[downloader._downloads.length-1].stop();
$pauseButton.addClass('disabled');
$resumeButton.removeClass('disabled');
});

$resumeButton.click(function(){
downloader._downloads[downloader._downloads.length-1].resume();
$resumeButton.addClass('disabled');
$pauseButton.removeClass('disabled');
});


  if(enableLectureSettings){

    if(downloadStart>downloadEnd){
      downloadStart=downloadEnd;
    }

    if(downloadStart<1){
      downloadStart = 1;
    }else if(downloadStart>totallectures){
      downloadStart = totallectures;
    }

    if(downloadEnd<1){
      downloadEnd = 1;
    }else if(downloadEnd>totallectures){
      downloadEnd = totallectures;
    }
    var toDownload = (downloadEnd-downloadStart)+1;
    downloadChapter(lectureChaperMap[downloadStart].chapterindex,lectureChaperMap[downloadStart].lectureindex);
  }else{
    var toDownload = totallectures;
    downloadChapter(0,0);
  }

  $progressElemCombined.progress({
    total    : toDownload,
    text     : {
      active: `${translate("Downloaded")} {value} ${translate("out of")} {total} ${translate("items")}`
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
      resetCourse($course.find('.download-success'));
      return;
  }else if(lectureindex==num_lectures){
      downloadChapter(++chapterindex,0);
      return;
    }

    function downloadAttachments(index,total_assets){
        $progressElemIndividual.progress('reset');
        var lectureQuality = coursedata['chapters'][chapterindex]['lectures'][lectureindex]['supplementary_assets'][index]['quality'];
        var lastClass = $download_quality.attr('class').split(' ').pop();
        $download_quality.html(lectureQuality).removeClass(lastClass).addClass(qualityColorMap[lectureQuality] || 'grey');

        if(coursedata['chapters'][chapterindex]['lectures'][lectureindex]['supplementary_assets'][index]['type']=='Article'||coursedata['chapters'][chapterindex]['lectures'][lectureindex]['supplementary_assets'][index]['type']=='Url'){
        fs.writeFile(download_directory+'/'+course_name+'/'+chapter_name+'/'+sanitize((lectureindex+1)+'.'+(index+1)+' '+coursedata['chapters'][chapterindex]['lectures'][lectureindex]['supplementary_assets'][index]['name']+'.html'), coursedata['chapters'][chapterindex]['lectures'][lectureindex]['supplementary_assets'][index]['src'], function() {
          index++;
          if(index==total_assets){
            $progressElemCombined.progress('increment');
            downloaded++;
            downloadLecture(chapterindex,++lectureindex,num_lectures,chapter_name);
          }else{
            downloadAttachments(index,total_assets);
          }
        }); 
      }else{
          var lecture_name = sanitize((lectureindex+1)+'.'+(index+1)+' '+coursedata['chapters'][chapterindex]['lectures'][lectureindex]['supplementary_assets'][index]['name']+'.'+coursedata['chapters'][chapterindex]['lectures'][lectureindex]['supplementary_assets'][index]['name']);
          var dl = downloader.download(coursedata['chapters'][chapterindex]['lectures'][lectureindex]['supplementary_assets'][index]['src'], download_directory+'/'+course_name+'/'+chapter_name+'/'+lecture_name);
          dl.start();
          timer = setInterval(function() {
              switch(dl.status){
                case 0:
                  $download_speed_value.html(0);
                  break;
                case 1:
                    var stats = dl.getStats();
                    $download_speed_value.html(parseInt(stats.present.speed/1000) || 0);
                    $progressElemIndividual.progress('set percent',stats.total.completed);    
                    break;
                case -1:
                    clearInterval(timer);
                    resetCourse($course.find('.download-error'));
                    break;
                default:
                  $download_speed_value.html(0);
              }
          }, 1000);

          dl.on('error', function() { 
            // Prevent throwing uncaught error
          });

          dl.on('start', function(){
            $pauseButton.removeClass('disabled');
          });

          dl.on('end', function() { 
              index++;
              $pauseButton.addClass('disabled');
              clearInterval(timer);
              if(index==total_assets){
              $progressElemCombined.progress('increment');
              downloaded++;
              downloadLecture(chapterindex,++lectureindex,num_lectures,chapter_name);
            }else{
              downloadAttachments(index);
            }
          });

      }
    }

$progressElemIndividual.progress('reset');

    var lectureQuality = coursedata['chapters'][chapterindex]['lectures'][lectureindex]['quality'];
    var lastClass = $download_quality.attr('class').split(' ').pop();
    $download_quality.html(lectureQuality+(coursedata['chapters'][chapterindex]['lectures'][lectureindex]['type']=='Video' ? 'p' : '')).removeClass(lastClass).addClass(qualityColorMap[lectureQuality] || 'grey');
    
    if(coursedata['chapters'][chapterindex]['lectures'][lectureindex]['type']=='Article'||coursedata['chapters'][chapterindex]['lectures'][lectureindex]['type']=='Url'){
      
      fs.writeFile(download_directory+'/'+course_name+'/'+chapter_name+'/'+sanitize((lectureindex+1)+'. '+coursedata['chapters'][chapterindex]['lectures'][lectureindex]['name']+'.html'), coursedata['chapters'][chapterindex]['lectures'][lectureindex]['src'], function() {
        
          if(coursedata['chapters'][chapterindex]['lectures'][lectureindex]['supplementary_assets']){
            var total_assets = coursedata['chapters'][chapterindex]['lectures'][lectureindex]['supplementary_assets'].length;
            var index = 0;
            downloadAttachments(index,total_assets);
          }else{
            $progressElemCombined.progress('increment');
            downloaded++;
            downloadLecture(chapterindex,++lectureindex,num_lectures,chapter_name);
          }

      }); 

    }else{


    var lecture_name = sanitize((lectureindex+1)+'. '+coursedata['chapters'][chapterindex]['lectures'][lectureindex]['name']+'.'+(coursedata['chapters'][chapterindex]['lectures'][lectureindex]['type']=='File' ? new URL(coursedata['chapters'][chapterindex]['lectures'][lectureindex]['src']).searchParams.get('filename').split('.').pop() : 'mp4'));
    var dl = downloader.download(coursedata['chapters'][chapterindex]['lectures'][lectureindex]['src'], download_directory+'/'+course_name+'/'+chapter_name+'/'+lecture_name);
    dl.start();

       timer = setInterval(function() {
            switch(dl.status){
              case 0:
                $download_speed_value.html(0);
                break;
              case 1:
                  var stats = dl.getStats();
                  $download_speed_value.html(parseInt(stats.present.speed/1000) || 0);
                  $progressElemIndividual.progress('set percent',stats.total.completed);    
                  break;
              case -1:
                  clearInterval(timer);
                  resetCourse($course.find('.download-error'));
                  break;
              default:
                $download_speed_value.html(0);
            }
        }, 1000);

dl.on('error', function() { 
  // Prevent throwing uncaught error
});

dl.on('start', function(){
  $pauseButton.removeClass('disabled');
});

dl.on('end', function() { 
  $pauseButton.addClass('disabled');
  clearInterval(timer);
  if(coursedata['chapters'][chapterindex]['lectures'][lectureindex]['supplementary_assets']){
    var total_assets = coursedata['chapters'][chapterindex]['lectures'][lectureindex]['supplementary_assets'].length;
    var index = 0;
    downloadAttachments(index,total_assets);
  }else{
    $progressElemCombined.progress('increment');
    downloaded++;
    downloadLecture(chapterindex,++lectureindex,num_lectures,chapter_name);
  } 

});

}

}


function resetCourse(Selem){
  $download_speed.hide();
  $download_quality.hide();
  $download_speed_value.html(0);
  $downloadStatus.hide().html(downloadTemplate);
  Selem.css('display','flex');
  $course.css('padding','14px 0px');
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
  var downloadVideosOnly = $(e.target).find('input[name=downloadvideosonly]')[0].checked;
  var downloadStart = $(e.target).find('input[name=downloadstart]').val();
  var downloadEnd = $(e.target).find('input[name=downloadend]').val();
  var videoQuality = $(e.target).find('input[name=videoquality]').val();
  var downloadPath = $(e.target).find('input[name=downloadpath]').val();
  var language = $(e.target).find('input[name=language]').val();
  
  settings.set('download', {
    enableLectureSettings: enableLectureSettings,
    downloadVideosOnly: downloadVideosOnly,
    downloadStart: parseInt(downloadStart),
    downloadEnd: parseInt(downloadEnd),
    videoQuality: videoQuality,
    path: downloadPath
  });

  settings.set('general',{
    language: language
  });

 prompt.alert(translate('Settings Saved'));

});

var settingsForm = $('.ui.settings .form');

function loadSettings(){
  if(settings.get('download.enableLectureSettings')){
  settingsForm.find('input[name="enablelecturesettings"]').prop('checked', true);
  }else{
  settingsForm.find('input[name="enablelecturesettings"]').prop('checked', false);
  settingsForm.find('input[name="downloadstart"], input[name="downloadend"]').prop('readonly',true);
  }

  if(settings.get('download.downloadVideosOnly')){
  settingsForm.find('input[name="downloadvideosonly"]').prop('checked', true);
  }else{
  settingsForm.find('input[name="downloadvideosonly"]').prop('checked', false);
  }

  settingsForm.find('input[name="downloadpath"]').val(settings.get('download.path') || homedir+'/Downloads');
  settingsForm.find('input[name="downloadstart"]').val(settings.get('download.downloadStart'));
  settingsForm.find('input[name="downloadend"]').val(settings.get('download.downloadEnd'));
  var videoQuality = settings.get('download.videoQuality');
  settingsForm.find('input[name="videoquality"]').val(videoQuality);
  settingsForm.find('input[name="videoquality"]').parent('.dropdown').find('.default.text').html(videoQuality || translate('Auto'));
  var language = settings.get('general.language');
  settingsForm.find('input[name="language"]').val(language);
  settingsForm.find('input[name="language"]').parent('.dropdown').find('.default.text').html(language || 'English');
}

settingsForm.find('input[name="enablelecturesettings"]').change(function() {
   if(this.checked) {
    settingsForm.find('input[name="downloadstart"], input[name="downloadend"]').prop('readonly',false);
   }else{
    settingsForm.find('input[name="downloadstart"], input[name="downloadend"]').prop('readonly',true);
   }     
});

function selectDownloadPath () {
  dialog.showOpenDialog({properties: ['openDirectory']},function (path) {
    if(path){
      fs.access(path[0], fs.R_OK&&fs.W_OK, function(err) {
          if(err){
            prompt.alert(translate('Cannot select this folder'));
          }else{
            settingsForm.find('input[name="downloadpath"]').val(path[0]);
          }
        });
    }
  }); 
}